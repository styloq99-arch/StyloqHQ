import sqlite3
from datetime import datetime, timezone


# =============================================================================
# DB HELPER
# =============================================================================

def get_db_connection():
    conn = sqlite3.connect("styloq.db")
    conn.row_factory = sqlite3.Row
    return conn


# =============================================================================
# SCHEMA BOOTSTRAP
# =============================================================================

def init_tables():
    """Create all module tables. Safe to call on every startup."""
    conn = get_db_connection()
    with conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS barbers (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                name       TEXT    NOT NULL,
                email      TEXT    NOT NULL UNIQUE,
                phone      TEXT,
                bio        TEXT,
                latitude   REAL,
                longitude  REAL,
                address    TEXT,
                is_active  INTEGER NOT NULL DEFAULT 1,
                created_at TEXT    NOT NULL
            );

            CREATE TABLE IF NOT EXISTS barber_availability (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                barber_id   INTEGER NOT NULL,
                day_of_week INTEGER NOT NULL,
                start_time  TEXT    NOT NULL,
                end_time    TEXT    NOT NULL,
                is_active   INTEGER NOT NULL DEFAULT 1
            );

            CREATE TABLE IF NOT EXISTS salon_availability (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                salon_id    INTEGER NOT NULL,
                day_of_week INTEGER NOT NULL,
                start_time  TEXT    NOT NULL,
                end_time    TEXT    NOT NULL,
                is_active   INTEGER NOT NULL DEFAULT 1
            );

            CREATE TABLE IF NOT EXISTS salon_barber_associations (
                id                 INTEGER PRIMARY KEY AUTOINCREMENT,
                salon_id           INTEGER NOT NULL,
                barber_id          INTEGER NOT NULL,
                invitation_status  TEXT    NOT NULL DEFAULT 'PENDING',
                salon_rules_active INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS barber_portfolio (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                barber_id   INTEGER NOT NULL,
                image_url   TEXT    NOT NULL,
                description TEXT,
                created_at  TEXT    NOT NULL
            );

            CREATE TABLE IF NOT EXISTS barber_posts (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                barber_id  INTEGER NOT NULL,
                content    TEXT    NOT NULL,
                created_at TEXT    NOT NULL
            );

            CREATE TABLE IF NOT EXISTS appointments (
                id                   INTEGER PRIMARY KEY AUTOINCREMENT,
                barber_id            INTEGER NOT NULL,
                customer_id          INTEGER NOT NULL,
                appointment_datetime TEXT    NOT NULL,
                status               TEXT    NOT NULL DEFAULT 'PENDING',
                notes                TEXT,
                created_at           TEXT    NOT NULL
            );
        """)
    conn.close()


# =============================================================================
# CONSTANTS
# =============================================================================

VALID_STATUSES       = {"PENDING", "ACCEPTED", "REJECTED", "RESCHEDULED", "COMPLETED"}
BLOCKING_STATUSES    = ("PENDING", "ACCEPTED")
MAX_CONTENT_LENGTH   = 2000
MAX_BIO_LENGTH       = 1000


# =============================================================================
# PRIVATE HELPERS
# =============================================================================

def _row_to_dict(row) -> dict:
    return dict(row)


def _now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()


# --- Validation helpers ------------------------------------------------------

def _require(data: dict, *fields) -> list[str]:
    """Return names of fields that are missing or blank."""
    missing = []
    for f in fields:
        val = data.get(f)
        if val is None or (isinstance(val, str) and not val.strip()):
            missing.append(f)
    return missing


def _parse_appointment_datetime(dt_str: str) -> datetime | None:
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M"):
        try:
            return datetime.strptime(dt_str.strip(), fmt)
        except (ValueError, AttributeError):
            continue
    return None


def _parse_hhmm(t: str) -> int:
    """Convert HH:MM → minutes since midnight. Returns -1 on failure."""
    try:
        h, m = t.strip().split(":")
        return int(h) * 60 + int(m)
    except (ValueError, AttributeError):
        return -1


def _valid_hhmm(t: str) -> bool:
    return _parse_hhmm(t) != -1


def _time_in_window(appt_minutes: int, start: str, end: str) -> bool:
    s = _parse_hhmm(start)
    e = _parse_hhmm(end)
    if s == -1 or e == -1:
        return False
    return s <= appt_minutes < e


def _validate_availability_slots(slots: list) -> str | None:
    """Validate each slot and detect intra-day overlaps. Returns error or None."""
    if not isinstance(slots, list):
        return "availability must be a JSON array."

    for i, slot in enumerate(slots):
        if not isinstance(slot, dict):
            return f"Slot {i}: must be an object."

        day = slot.get("day_of_week")
        if day is None or not isinstance(day, int) or not (0 <= day <= 6):
            return f"Slot {i}: day_of_week must be an integer 0 (Mon)–6 (Sun)."

        if not _valid_hhmm(slot.get("start_time", "")):
            return f"Slot {i}: start_time must be HH:MM."

        if not _valid_hhmm(slot.get("end_time", "")):
            return f"Slot {i}: end_time must be HH:MM."

        if _parse_hhmm(slot["start_time"]) >= _parse_hhmm(slot["end_time"]):
            return f"Slot {i}: end_time must be after start_time."

    # Overlap detection per day
    by_day: dict[int, list] = {}
    for s in slots:
        by_day.setdefault(s["day_of_week"], []).append(
            (_parse_hhmm(s["start_time"]), _parse_hhmm(s["end_time"]),
             s["start_time"], s["end_time"])
        )

    for day, ranges in by_day.items():
        ranges.sort(key=lambda x: x[0])
        for i in range(len(ranges) - 1):
            if ranges[i + 1][0] < ranges[i][1]:
                return (
                    f"Overlapping slots on day {day}: "
                    f"{ranges[i][2]}–{ranges[i][3]} overlaps "
                    f"{ranges[i+1][2]}–{ranges[i+1][3]}."
                )

    return None


# --- DB lookup helpers -------------------------------------------------------

def _barber_exists(conn, barber_id: int) -> bool:
    return conn.execute(
        "SELECT id FROM barbers WHERE id = ? AND is_active = 1", (barber_id,)
    ).fetchone() is not None


def _get_appointment(conn, appointment_id: int) -> dict | None:
    row = conn.execute(
        "SELECT * FROM appointments WHERE id = ?", (appointment_id,)
    ).fetchone()
    return _row_to_dict(row) if row else None


def _slot_is_taken(conn, barber_id: int, appt_datetime: str,
                   exclude_id: int | None = None) -> bool:
    query = """
        SELECT id FROM appointments
        WHERE  barber_id            = ?
          AND  appointment_datetime = ?
          AND  status               IN ('PENDING', 'ACCEPTED')
    """
    params: list = [barber_id, appt_datetime]
    if exclude_id is not None:
        query  += " AND id != ?"
        params.append(exclude_id)
    return conn.execute(query, params).fetchone() is not None


# --- UC-003 availability helpers ---------------------------------------------

def _get_salon_association(conn, barber_id: int) -> dict | None:
    row = conn.execute(
        """
        SELECT * FROM salon_barber_associations
        WHERE  barber_id          = ?
          AND  invitation_status  = 'ACCEPTED'
          AND  salon_rules_active = 1
        LIMIT 1
        """,
        (barber_id,),
    ).fetchone()
    return _row_to_dict(row) if row else None


def _check_availability_table(conn, table: str, id_col: str,
                               entity_id: int, appt_dt: datetime,
                               entity_label: str) -> tuple[bool, str | None]:
    """
    Generic window checker for both barber_availability and salon_availability.
    Keeps the two specific checkers DRY.
    """
    day_of_week  = appt_dt.weekday()
    appt_minutes = appt_dt.hour * 60 + appt_dt.minute

    rows = conn.execute(
        f"""
        SELECT start_time, end_time FROM {table}
        WHERE  {id_col}    = ?
          AND  day_of_week = ?
          AND  is_active   = 1
        """,
        (entity_id, day_of_week),
    ).fetchall()

    day_name = appt_dt.strftime("%A")

    if not rows:
        return False, f"{entity_label} has no availability on {day_name}."

    for row in rows:
        if _time_in_window(appt_minutes, row["start_time"], row["end_time"]):
            return True, None

    windows = ", ".join(f"{r['start_time']}–{r['end_time']}" for r in rows)
    return False, (
        f"{entity_label} is not available at {appt_dt.strftime('%H:%M')} "
        f"on {day_name}. Available windows: {windows}."
    )


def _resolve_availability(conn, barber_id: int,
                          salon_assoc: dict | None,
                          appt_dt: datetime) -> tuple[bool, str | None]:
    """UC-003: route to salon+barber intersection or barber-only check."""
    if salon_assoc:
        ok, err = _check_availability_table(
            conn, "salon_availability", "salon_id",
            salon_assoc["salon_id"], appt_dt, "The salon"
        )
        if not ok:
            return False, err

    return _check_availability_table(
        conn, "barber_availability", "barber_id",
        barber_id, appt_dt, f"Barber {barber_id}"
    )


# =============================================================================
# PROFILE SERVICES
# =============================================================================

def get_barber_profile(barber_id: int):
    conn = get_db_connection()
    try:
        row = conn.execute(
            "SELECT * FROM barbers WHERE id = ? AND is_active = 1", (barber_id,)
        ).fetchone()
        if not row:
            return None, "not_found", f"Barber {barber_id} not found."
        return _row_to_dict(row), None, None
    finally:
        conn.close()


def update_barber_profile(barber_id: int, data: dict):
    conn = get_db_connection()
    try:
        row = conn.execute(
            "SELECT * FROM barbers WHERE id = ? AND is_active = 1", (barber_id,)
        ).fetchone()
        if not row:
            return None, "not_found", f"Barber {barber_id} not found."

        current = _row_to_dict(row)
        name  = (data.get("name")  or current["name"]).strip()
        email = (data.get("email") or current["email"]).strip().lower()
        phone = (data.get("phone") or current.get("phone") or "").strip() or None
        bio   = (data.get("bio")   or current.get("bio")   or "").strip() or None

        if not name:
            return None, "bad_request", "name cannot be blank."

        if bio and len(bio) > MAX_BIO_LENGTH:
            return None, "bad_request", \
                f"bio exceeds {MAX_BIO_LENGTH} character limit."

        with conn:
            conn.execute(
                "UPDATE barbers SET name=?, email=?, phone=?, bio=? WHERE id=?",
                (name, email, phone, bio, barber_id),
            )

        updated = conn.execute(
            "SELECT * FROM barbers WHERE id = ?", (barber_id,)
        ).fetchone()
        return _row_to_dict(updated), None, None

    except sqlite3.IntegrityError:
        return None, "conflict", "That email is already in use by another barber."
    finally:
        conn.close()


def update_location(barber_id: int, data: dict):
    missing = _require(data, "latitude", "longitude")
    if missing:
        return None, "bad_request", f"Missing required fields: {', '.join(missing)}."

    try:
        lat = float(data["latitude"])
        lng = float(data["longitude"])
    except (ValueError, TypeError):
        return None, "bad_request", "latitude and longitude must be numbers."

    if not (-90 <= lat <= 90):
        return None, "bad_request", "latitude must be between -90 and 90."
    if not (-180 <= lng <= 180):
        return None, "bad_request", "longitude must be between -180 and 180."

    address = (data.get("address") or "").strip() or None

    conn = get_db_connection()
    try:
        if not _barber_exists(conn, barber_id):
            return None, "not_found", f"Barber {barber_id} not found."

        with conn:
            conn.execute(
                "UPDATE barbers SET latitude=?, longitude=?, address=? WHERE id=?",
                (lat, lng, address, barber_id),
            )

        row = conn.execute(
            "SELECT id, latitude, longitude, address FROM barbers WHERE id=?",
            (barber_id,),
        ).fetchone()
        return _row_to_dict(row), None, None
    finally:
        conn.close()


# =============================================================================
# AVAILABILITY SERVICES
# =============================================================================

def manage_availability(barber_id: int, slots: list):
    """
    Fully replace a barber's availability schedule.
    Accepts an empty list to clear all slots.
    """
    error = _validate_availability_slots(slots)
    if error:
        return None, "bad_request", error

    conn = get_db_connection()
    try:
        if not _barber_exists(conn, barber_id):
            return None, "not_found", f"Barber {barber_id} not found."

        with conn:
            conn.execute(
                "DELETE FROM barber_availability WHERE barber_id = ?", (barber_id,)
            )
            for slot in slots:
                conn.execute(
                    """
                    INSERT INTO barber_availability
                        (barber_id, day_of_week, start_time, end_time, is_active)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        barber_id,
                        int(slot["day_of_week"]),
                        slot["start_time"].strip(),
                        slot["end_time"].strip(),
                        int(slot.get("is_active", 1)),
                    ),
                )

        rows = conn.execute(
            """
            SELECT * FROM barber_availability
            WHERE  barber_id = ?
            ORDER  BY day_of_week, start_time
            """,
            (barber_id,),
        ).fetchall()
        return [_row_to_dict(r) for r in rows], None, None

    except sqlite3.Error as exc:
        return None, "db_error", f"Database error: {exc}"
    finally:
        conn.close()


# update_availability is the public alias used by the PUT route
def update_availability(barber_id: int, slots: list):
    return manage_availability(barber_id, slots)


def get_availability(barber_id: int):
    conn = get_db_connection()
    try:
        if not _barber_exists(conn, barber_id):
            return None, "not_found", f"Barber {barber_id} not found."

        rows = conn.execute(
            """
            SELECT * FROM barber_availability
            WHERE  barber_id = ? AND is_active = 1
            ORDER  BY day_of_week, start_time
            """,
            (barber_id,),
        ).fetchall()
        return [_row_to_dict(r) for r in rows], None, None
    finally:
        conn.close()


# =============================================================================
# PORTFOLIO SERVICES
# =============================================================================

def add_portfolio_item(barber_id: int, image_url: str, description: str | None):
    if not image_url or not image_url.strip():
        return None, "bad_request", "image_url is required."

    image_url = image_url.strip()
    if not (image_url.startswith("http://") or image_url.startswith("https://")):
        return None, "bad_request", \
            "image_url must be a valid URL starting with http:// or https://."

    description = description.strip() if description and description.strip() else None

    conn = get_db_connection()
    try:
        if not _barber_exists(conn, barber_id):
            return None, "not_found", f"Barber {barber_id} not found."

        with conn:
            cursor = conn.execute(
                """
                INSERT INTO barber_portfolio (barber_id, image_url, description, created_at)
                VALUES (?, ?, ?, ?)
                """,
                (barber_id, image_url, description, _now_utc()),
            )

        row = conn.execute(
            "SELECT * FROM barber_portfolio WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return _row_to_dict(row), None, None
    finally:
        conn.close()


def delete_portfolio_item(barber_id: int, portfolio_id: int):
    conn = get_db_connection()
    try:
        row = conn.execute(
            "SELECT id FROM barber_portfolio WHERE id = ? AND barber_id = ?",
            (portfolio_id, barber_id),
        ).fetchone()

        if not row:
            return None, "not_found", (
                f"Portfolio item {portfolio_id} not found "
                f"or does not belong to barber {barber_id}."
            )

        with conn:
            conn.execute(
                "DELETE FROM barber_portfolio WHERE id = ?", (portfolio_id,)
            )
        return {"deleted_id": portfolio_id}, None, None
    finally:
        conn.close()


def get_portfolio(barber_id: int):
    conn = get_db_connection()
    try:
        if not _barber_exists(conn, barber_id):
            return None, "not_found", f"Barber {barber_id} not found."

        rows = conn.execute(
            """
            SELECT * FROM barber_portfolio
            WHERE  barber_id = ?
            ORDER  BY created_at DESC
            """,
            (barber_id,),
        ).fetchall()
        return [_row_to_dict(r) for r in rows], None, None
    finally:
        conn.close()


# =============================================================================
# SOCIAL SERVICES
# =============================================================================

def create_post(barber_id: int, content: str):
    if not content or not content.strip():
        return None, "bad_request", "content is required and cannot be blank."

    content = content.strip()
    if len(content) > MAX_CONTENT_LENGTH:
        return None, "bad_request", \
            f"content exceeds the {MAX_CONTENT_LENGTH}-character limit."

    conn = get_db_connection()
    try:
        if not _barber_exists(conn, barber_id):
            return None, "not_found", f"Barber {barber_id} not found."

        with conn:
            cursor = conn.execute(
                "INSERT INTO barber_posts (barber_id, content, created_at) VALUES (?, ?, ?)",
                (barber_id, content, _now_utc()),
            )

        row = conn.execute(
            "SELECT * FROM barber_posts WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return _row_to_dict(row), None, None
    finally:
        conn.close()


def get_my_posts(barber_id: int):
    conn = get_db_connection()
    try:
        if not _barber_exists(conn, barber_id):
            return None, "not_found", f"Barber {barber_id} not found."

        rows = conn.execute(
            """
            SELECT * FROM barber_posts
            WHERE  barber_id = ?
            ORDER  BY created_at DESC
            """,
            (barber_id,),
        ).fetchall()
        return [_row_to_dict(r) for r in rows], None, None
    finally:
        conn.close()


# =============================================================================
# APPOINTMENT SERVICES
# =============================================================================

def view_barber_appointments(barber_id: int):
    conn = get_db_connection()
    try:
        if not _barber_exists(conn, barber_id):
            return None, "not_found", f"Barber {barber_id} not found."

        rows = conn.execute(
            """
            SELECT * FROM appointments
            WHERE  barber_id = ?
            ORDER  BY appointment_datetime ASC
            """,
            (barber_id,),
        ).fetchall()

        grouped: dict[str, list] = {s: [] for s in VALID_STATUSES}
        for row in rows:
            appt = _row_to_dict(row)
            grouped.setdefault(appt["status"], []).append(appt)

        return grouped, None, None
    finally:
        conn.close()


def change_booking_status(appointment_id: int, new_status: str):
    """
    Transition an appointment to ACCEPTED or REJECTED.
    Only PENDING appointments may be transitioned.
    ACCEPTED additionally triggers a double-booking check.
    """
    if new_status not in ("ACCEPTED", "REJECTED"):
        return None, "bad_request", \
            "change_booking_status only handles ACCEPTED or REJECTED."

    conn = get_db_connection()
    try:
        appt = _get_appointment(conn, appointment_id)
        if not appt:
            return None, "not_found", f"Appointment {appointment_id} not found."

        if appt["status"] != "PENDING":
            return None, "conflict", (
                f"Appointment {appointment_id} is '{appt['status']}'. "
                f"Only PENDING appointments can be accepted or rejected."
            )

        if new_status == "ACCEPTED":
            if _slot_is_taken(conn, appt["barber_id"],
                               appt["appointment_datetime"],
                               exclude_id=appointment_id):
                return None, "conflict", (
                    f"Cannot accept: another ACCEPTED or PENDING appointment "
                    f"already exists at {appt['appointment_datetime']}."
                )

        with conn:
            conn.execute(
                "UPDATE appointments SET status = ? WHERE id = ?",
                (new_status, appointment_id),
            )

        return _get_appointment(conn, appointment_id), None, None
    finally:
        conn.close()


def accept_appointment(appointment_id: int):
    return change_booking_status(appointment_id, "ACCEPTED")


def reject_appointment(appointment_id: int):
    return change_booking_status(appointment_id, "REJECTED")


def reschedule_appointment(appointment_id: int, new_datetime: str):
    if not new_datetime or not str(new_datetime).strip():
        return None, "bad_request", "new_datetime is required."

    appt_dt = _parse_appointment_datetime(str(new_datetime))
    if appt_dt is None:
        return None, "bad_request", \
            "new_datetime must be ISO-8601 (e.g. '2026-02-25T15:00:00')."

    if appt_dt < datetime.now():
        return None, "bad_request", f"new_datetime '{new_datetime}' is in the past."

    normalised = appt_dt.strftime("%Y-%m-%dT%H:%M:%S")

    conn = get_db_connection()
    try:
        appt = _get_appointment(conn, appointment_id)
        if not appt:
            return None, "not_found", f"Appointment {appointment_id} not found."

        if _slot_is_taken(conn, appt["barber_id"], normalised,
                           exclude_id=appointment_id):
            return None, "conflict", (
                f"Cannot reschedule to {normalised}: "
                f"another PENDING or ACCEPTED appointment already occupies that slot."
            )

        with conn:
            conn.execute(
                """
                UPDATE appointments
                SET    appointment_datetime = ?,
                       status              = 'RESCHEDULED'
                WHERE  id = ?
                """,
                (normalised, appointment_id),
            )

        return _get_appointment(conn, appointment_id), None, None
    finally:
        conn.close()


def handle_booking_request(barber_id: int, customer_id: int,
                            appointment_datetime: str, notes: str | None):
    """
    UC-003-aware booking: validates availability against salon hours (if
    salon-associated) intersected with barber hours, then checks conflicts.
    """
    # Input validation
    if not isinstance(customer_id, int) or customer_id < 1:
        return None, "bad_request", "customer_id must be a positive integer."

    if not appointment_datetime or not str(appointment_datetime).strip():
        return None, "bad_request", "appointment_datetime is required."

    appt_dt = _parse_appointment_datetime(str(appointment_datetime))
    if appt_dt is None:
        return None, "bad_request", (
            "appointment_datetime must be ISO-8601 "
            "(e.g. '2026-02-25T15:00:00' or '2026-02-25T15:00')."
        )

    if appt_dt < datetime.now():
        return None, "bad_request", \
            f"appointment_datetime '{appointment_datetime}' is in the past."

    normalised = appt_dt.strftime("%Y-%m-%dT%H:%M:%S")
    notes = notes.strip() if notes and notes.strip() else None

    conn = get_db_connection()
    try:
        if not _barber_exists(conn, barber_id):
            return None, "not_found", f"Barber {barber_id} not found."

        # UC-003: resolve availability mode
        salon_assoc = _get_salon_association(conn, barber_id)
        available, avail_err = _resolve_availability(
            conn, barber_id, salon_assoc, appt_dt
        )
        if not available:
            return None, "unavailable", avail_err

        # Double-booking guard
        if _slot_is_taken(conn, barber_id, normalised):
            return None, "conflict", (
                f"A PENDING or ACCEPTED appointment already exists at "
                f"{normalised} for barber {barber_id}."
            )

        created_at = _now_utc()
        with conn:
            cursor = conn.execute(
                """
                INSERT INTO appointments
                    (barber_id, customer_id, appointment_datetime,
                     status, notes, created_at)
                VALUES (?, ?, ?, 'PENDING', ?, ?)
                """,
                (barber_id, customer_id, normalised, notes, created_at),
            )

        row = conn.execute(
            "SELECT * FROM appointments WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return _row_to_dict(row), None, None

    except sqlite3.Error as exc:
        return None, "db_error", f"Database error: {exc}"
    finally:
        conn.close()
