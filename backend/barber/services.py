"""
Barber Services — SQLAlchemy / Supabase PostgreSQL
Rewritten from raw SQLite to use the shared SessionLocal + ORM models.
"""

from datetime import datetime, timezone
from sqlalchemy import text
from models.base import SessionLocal
from models.barber import Barber
from models.user import User


# =============================================================================
# CONSTANTS
# =============================================================================

MAX_BIO_LENGTH = 1000


# =============================================================================
# HELPER
# =============================================================================

def _now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()


# =============================================================================
# PROFILE SERVICES
# =============================================================================

def get_barber_profile(barber_id):
    """Return the barber row as a dict with all related data."""
    session = SessionLocal()
    try:
        barber = session.query(Barber).filter(Barber.id == barber_id).first()
        if not barber:
            return None, "not_found", f"Barber {barber_id} not found."

        user = session.query(User).filter(User.id == barber.user_id).first()

        # ── Services ──
        from models.booking import Service
        services_rows = (
            session.query(Service)
            .filter(Service.barber_id == barber_id)
            .all()
        )
        services_list = [
            {
                "id": s.id,
                "name": s.name,
                "price": s.price,
                "duration_minutes": s.duration_minutes,
            }
            for s in services_rows
        ]

        # ── Certifications ──
        from models.barber import Certification
        cert_rows = (
            session.query(Certification)
            .filter(Certification.barber_id == barber_id)
            .all()
        )
        certifications_list = [
            {
                "id": c.id,
                "name": c.name,
                "issuing_body": c.issuing_body,
                "image_url": c.image_url,
            }
            for c in cert_rows
        ]

        # ── Availability ──
        from models.booking import Availability
        avail_rows = (
            session.query(Availability)
            .filter(Availability.barber_id == barber_id)
            .order_by(Availability.day_of_week, Availability.start_time)
            .all()
        )
        availability_list = [
            {
                "id": a.id,
                "day_of_week": a.day_of_week,
                "start_time": str(a.start_time) if a.start_time else None,
                "end_time": str(a.end_time) if a.end_time else None,
            }
            for a in avail_rows
        ]

        # ── Skills / Specialties ──
        from models.barber import Skill
        skills_list = [skill.name for skill in barber.skills] if barber.skills else []

        # ── Posts count ──
        from models.social import Post
        posts_count = session.query(Post).filter(Post.barber_id == barber_id).count()

        # ── Review stats ──
        review_stats = _get_review_stats(session, barber_id)

        data = {
            "id": str(barber.id),
            "user_id": str(barber.user_id),
            "bio": barber.bio,
            "years_experience": barber.years_experience,
            "is_verified": barber.is_verified,
            "instagram_handle": barber.instagram_handle,
            "current_location_name": barber.current_location_name,
            "name": user.full_name if user else None,
            "email": user.email if user else None,
            "phone": user.phone_number if user else None,
            "services": services_list,
            "certifications": certifications_list,
            "availability": availability_list,
            "specialties": skills_list,
            "posts_count": posts_count,
            "avg_rating": review_stats["avg_rating"],
            "review_count": review_stats["review_count"],
            "profile_image": barber.profile_image,
            "cover_image": barber.cover_image,
        }
        return data, None, None
    finally:
        session.close()


def _get_review_stats(session, barber_id):
    """Get average rating and review count for a barber."""
    try:
        row = session.execute(
            text("""
                SELECT COALESCE(AVG(r.rating), 0) AS avg_rating,
                       COUNT(r.id) AS review_count
                FROM reviews r
                JOIN bookings b ON r.booking_id = b.id
                WHERE b.barber_id = :bid
            """),
            {"bid": barber_id},
        ).first()
        return {
            "avg_rating": round(float(row[0]), 1) if row else 0,
            "review_count": int(row[1]) if row else 0,
        }
    except Exception:
        return {"avg_rating": 0, "review_count": 0}


def get_barber_reviews(barber_id):
    """Return all reviews for a barber with reviewer info."""
    session = SessionLocal()
    try:
        barber = session.query(Barber).filter(Barber.id == barber_id).first()
        if not barber:
            return None, "not_found", f"Barber {barber_id} not found."

        rows = session.execute(
            text("""
                SELECT r.id, r.rating, r.comment, r.booking_id,
                       u.full_name AS author,
                       b.appointment_datetime
                FROM reviews r
                JOIN bookings b ON r.booking_id = b.id
                JOIN clients c ON b.client_id = c.id
                JOIN users u ON c.user_id = u.id
                WHERE b.barber_id = :bid
                ORDER BY b.appointment_datetime DESC
            """),
            {"bid": barber_id},
        ).mappings().all()

        reviews = []
        for r in rows:
            reviews.append({
                "id": r["id"],
                "rating": r["rating"],
                "text": r["comment"],
                "author": r["author"],
                "date": r["appointment_datetime"].strftime("%Y-%m-%d") if r["appointment_datetime"] else None,
            })
        return reviews, None, None
    finally:
        session.close()


def update_barber_profile(barber_id, data: dict):
    """Update barber profile fields. Returns (data, reason, error)."""
    session = SessionLocal()
    try:
        barber = session.query(Barber).filter(Barber.id == barber_id).first()
        if not barber:
            return None, "not_found", f"Barber {barber_id} not found."

        # Update barber-specific fields
        if "bio" in data:
            bio = (data["bio"] or "").strip() or None
            if bio and len(bio) > MAX_BIO_LENGTH:
                return None, "bad_request", f"bio exceeds {MAX_BIO_LENGTH} character limit."
            barber.bio = bio

        if "years_experience" in data:
            barber.years_experience = data["years_experience"]

        if "instagram_handle" in data:
            barber.instagram_handle = (data["instagram_handle"] or "").strip() or None

        if "current_location_name" in data:
            barber.current_location_name = (data["current_location_name"] or "").strip() or None

        if "profile_image" in data:
            barber.profile_image = (data["profile_image"] or "").strip() or None

        if "cover_image" in data:
            barber.cover_image = (data["cover_image"] or "").strip() or None

        # Update user-level fields (name, email, phone)
        user = session.query(User).filter(User.id == barber.user_id).first()
        if user:
            if "name" in data and data["name"]:
                user.full_name = data["name"].strip()
            if "email" in data and data["email"]:
                user.email = data["email"].strip().lower()
            if "phone" in data:
                user.phone_number = (data["phone"] or "").strip() or None

        session.commit()

        return get_barber_profile(barber_id)[0], None, None

    except Exception as e:
        session.rollback()
        if "unique" in str(e).lower():
            return None, "conflict", "That email is already in use by another barber."
        raise
    finally:
        session.close()


def update_location(barber_id, data: dict):
    """Update barber location name. Returns (data, reason, error)."""
    session = SessionLocal()
    try:
        barber = session.query(Barber).filter(Barber.id == barber_id).first()
        if not barber:
            return None, "not_found", f"Barber {barber_id} not found."

        location = (data.get("address") or data.get("current_location_name") or "").strip() or None
        barber.current_location_name = location
        session.commit()

        return {
            "id": str(barber.id),
            "current_location_name": barber.current_location_name,
        }, None, None
    finally:
        session.close()


# =============================================================================
# AVAILABILITY SERVICES
# =============================================================================

def get_availability(barber_id):
    """Return barber availability slots from the availability table."""
    session = SessionLocal()
    try:
        barber = session.query(Barber).filter(Barber.id == barber_id).first()
        if not barber:
            return None, "not_found", f"Barber {barber_id} not found."

        from models.booking import Availability
        slots = (
            session.query(Availability)
            .filter(Availability.barber_id == barber_id)
            .order_by(Availability.day_of_week, Availability.start_time)
            .all()
        )

        result = []
        for s in slots:
            result.append({
                "id": s.id,
                "barber_id": str(s.barber_id),
                "day_of_week": s.day_of_week,
                "start_time": str(s.start_time) if s.start_time else None,
                "end_time": str(s.end_time) if s.end_time else None,
            })
        return result, None, None
    finally:
        session.close()


def update_availability(barber_id, slots: list):
    """Replace a barber's entire availability schedule."""
    return manage_availability(barber_id, slots)


def manage_availability(barber_id, slots: list):
    """Fully replace a barber's availability schedule."""
    if not isinstance(slots, list):
        return None, "bad_request", "availability must be a JSON array."

    session = SessionLocal()
    try:
        barber = session.query(Barber).filter(Barber.id == barber_id).first()
        if not barber:
            return None, "not_found", f"Barber {barber_id} not found."

        from models.booking import Availability
        from datetime import time

        # Delete existing availability
        session.query(Availability).filter(Availability.barber_id == barber_id).delete()

        # Insert new slots
        for slot in slots:
            day = slot.get("day_of_week")
            start = slot.get("start_time", "")
            end = slot.get("end_time", "")

            try:
                sh, sm = map(int, start.strip().split(":"))
                eh, em = map(int, end.strip().split(":"))
            except (ValueError, AttributeError):
                return None, "bad_request", "start_time and end_time must be HH:MM format."

            new_slot = Availability(
                barber_id=barber_id,
                day_of_week=int(day),
                start_time=time(sh, sm),
                end_time=time(eh, em),
            )
            session.add(new_slot)

        session.commit()
        return get_availability(barber_id)[0], None, None

    except Exception as e:
        session.rollback()
        return None, "db_error", f"Database error: {e}"
    finally:
        session.close()


# =============================================================================
# PORTFOLIO SERVICES (using raw SQL for tables not in ORM)
# =============================================================================

def add_portfolio_item(barber_id, image_url: str, description: str | None):
    """Add a portfolio item. Uses raw SQL since barber_portfolio isn't in ORM models."""
    if not image_url or not image_url.strip():
        return None, "bad_request", "image_url is required."

    image_url = image_url.strip()
    if not (image_url.startswith("http://") or image_url.startswith("https://")):
        return None, "bad_request", "image_url must be a valid URL starting with http:// or https://."

    description = description.strip() if description and description.strip() else None

    session = SessionLocal()
    try:
        barber = session.query(Barber).filter(Barber.id == barber_id).first()
        if not barber:
            return None, "not_found", f"Barber {barber_id} not found."

        result = session.execute(
            text("""
                INSERT INTO barber_portfolio (barber_id, image_url, description, created_at)
                VALUES (:barber_id, :image_url, :description, :created_at)
                RETURNING id, barber_id, image_url, description, created_at
            """),
            {
                "barber_id": barber_id,
                "image_url": image_url,
                "description": description,
                "created_at": _now_utc(),
            },
        )
        session.commit()
        row = result.mappings().first()
        return dict(row) if row else None, None, None
    finally:
        session.close()


def delete_portfolio_item(barber_id, portfolio_id: int):
    session = SessionLocal()
    try:
        row = session.execute(
            text("SELECT id FROM barber_portfolio WHERE id = :pid AND barber_id = :bid"),
            {"pid": portfolio_id, "bid": barber_id},
        ).fetchone()

        if not row:
            return None, "not_found", (
                f"Portfolio item {portfolio_id} not found "
                f"or does not belong to barber {barber_id}."
            )

        session.execute(
            text("DELETE FROM barber_portfolio WHERE id = :pid"),
            {"pid": portfolio_id},
        )
        session.commit()
        return {"deleted_id": portfolio_id}, None, None
    finally:
        session.close()


def get_portfolio(barber_id):
    session = SessionLocal()
    try:
        barber = session.query(Barber).filter(Barber.id == barber_id).first()
        if not barber:
            return None, "not_found", f"Barber {barber_id} not found."

        rows = session.execute(
            text("""
                SELECT * FROM barber_portfolio
                WHERE barber_id = :bid
                ORDER BY created_at DESC
            """),
            {"bid": barber_id},
        ).mappings().all()
        return [dict(r) for r in rows], None, None
    finally:
        session.close()


# =============================================================================
# SOCIAL / POSTS SERVICES
# =============================================================================

def create_post(barber_id, content: str):
    """Create a barber post using raw SQL (barber_posts table)."""
    if not content or not content.strip():
        return None, "bad_request", "content is required and cannot be blank."

    content = content.strip()

    session = SessionLocal()
    try:
        barber = session.query(Barber).filter(Barber.id == barber_id).first()
        if not barber:
            return None, "not_found", f"Barber {barber_id} not found."

        result = session.execute(
            text("""
                INSERT INTO barber_posts (barber_id, content, created_at)
                VALUES (:barber_id, :content, :created_at)
                RETURNING id, barber_id, content, created_at
            """),
            {"barber_id": barber_id, "content": content, "created_at": _now_utc()},
        )
        session.commit()
        row = result.mappings().first()
        return dict(row) if row else None, None, None
    finally:
        session.close()


def get_my_posts(barber_id):
    session = SessionLocal()
    try:
        barber = session.query(Barber).filter(Barber.id == barber_id).first()
        if not barber:
            return None, "not_found", f"Barber {barber_id} not found."

        rows = session.execute(
            text("""
                SELECT * FROM barber_posts
                WHERE barber_id = :bid
                ORDER BY created_at DESC
            """),
            {"bid": barber_id},
        ).mappings().all()
        return [dict(r) for r in rows], None, None
    finally:
        session.close()


# =============================================================================
# APPOINTMENT SERVICES
# =============================================================================

def view_barber_appointments(barber_id):
    """Return all appointments for a barber as a flat list with customer & service info."""
    session = SessionLocal()
    try:
        barber = session.query(Barber).filter(Barber.id == barber_id).first()
        if not barber:
            return None, "not_found", f"Barber {barber_id} not found."

        rows = session.execute(
            text("""
                SELECT b.id,
                       b.appointment_datetime,
                       b.status,
                       u.full_name   AS customer_name,
                       s.name        AS service_name,
                       s.price       AS price,
                       s.duration_minutes
                FROM bookings b
                JOIN clients c  ON b.client_id  = c.id
                JOIN users   u  ON c.user_id    = u.id
                LEFT JOIN services s ON b.service_id = s.id
                WHERE b.barber_id = :bid
                ORDER BY b.appointment_datetime DESC
            """),
            {"bid": barber_id},
        ).mappings().all()

        result = []
        for r in rows:
            result.append({
                "id": r["id"],
                "appointment_datetime": r["appointment_datetime"].isoformat() if r["appointment_datetime"] else None,
                "status": r["status"],
                "customer_name": r["customer_name"],
                "service_name": r["service_name"],
                "price": float(r["price"]) if r["price"] else None,
                "duration_minutes": r["duration_minutes"],
            })
        return result, None, None
    except Exception as e:
        return None, "db_error", f"Database error: {e}"
    finally:
        session.close()


def get_appointment_overview(barber_id):
    """Return overview stats, weekly chart, monthly chart, peak hours from real bookings."""
    from datetime import datetime, timedelta
    session = SessionLocal()
    try:
        barber = session.query(Barber).filter(Barber.id == barber_id).first()
        if not barber:
            return None, "not_found", f"Barber {barber_id} not found."

        today = datetime.utcnow().date()

        # ── Stats ──────────────────────────────────────────────
        stats_rows = session.execute(
            text("""
                SELECT
                    COUNT(*) AS total,
                    COUNT(*) FILTER (WHERE DATE(appointment_datetime) = :today) AS today_count,
                    COUNT(*) FILTER (WHERE status = 'Cancelled') AS cancelled,
                    COUNT(*) FILTER (WHERE status IN ('Completed', 'Confirmed')) AS paid
                FROM bookings
                WHERE barber_id = :bid
            """),
            {"bid": barber_id, "today": today},
        ).mappings().first()

        stats = {
            "today": stats_rows["today_count"],
            "total": stats_rows["total"],
            "cancelled": stats_rows["cancelled"],
            "paid": stats_rows["paid"],
        }

        # ── Weekly chart (current week, Sun-Sat) ───────────────
        # Find the start of the current week (Sunday)
        days_since_sunday = (today.weekday() + 1) % 7
        week_start = today - timedelta(days=days_since_sunday)

        week_rows = session.execute(
            text("""
                SELECT EXTRACT(DOW FROM appointment_datetime)::int AS dow,
                       COUNT(*) AS cnt
                FROM bookings
                WHERE barber_id = :bid
                  AND DATE(appointment_datetime) >= :ws
                  AND DATE(appointment_datetime) < :we
                GROUP BY dow
                ORDER BY dow
            """),
            {"bid": barber_id, "ws": week_start, "we": week_start + timedelta(days=7)},
        ).mappings().all()

        dow_map = {int(r["dow"]): int(r["cnt"]) for r in week_rows}
        day_labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
        week_data = [{"day": day_labels[d], "value": dow_map.get(d, 0)} for d in range(7)]

        # ── Monthly chart (current month, by week) ─────────────
        first_of_month = today.replace(day=1)
        month_rows = session.execute(
            text("""
                SELECT EXTRACT(DAY FROM appointment_datetime)::int AS d,
                       COUNT(*) AS cnt
                FROM bookings
                WHERE barber_id = :bid
                  AND DATE(appointment_datetime) >= :ms
                  AND EXTRACT(MONTH FROM appointment_datetime) = :m
                  AND EXTRACT(YEAR FROM appointment_datetime)  = :y
                GROUP BY d
            """),
            {"bid": barber_id, "ms": first_of_month, "m": today.month, "y": today.year},
        ).mappings().all()

        # Aggregate into 4 weeks
        week_buckets = [0, 0, 0, 0]
        for r in month_rows:
            day_num = int(r["d"])
            week_idx = min((day_num - 1) // 7, 3)
            week_buckets[week_idx] += int(r["cnt"])
        month_data = [{"day": f"W{i+1}", "value": week_buckets[i]} for i in range(4)]

        # ── Peak hours ─────────────────────────────────────────
        peak_rows = session.execute(
            text("""
                SELECT EXTRACT(HOUR FROM appointment_datetime)::int AS hr,
                       COUNT(*) AS cnt
                FROM bookings
                WHERE barber_id = :bid
                GROUP BY hr
                ORDER BY hr
            """),
            {"bid": barber_id},
        ).mappings().all()

        peak_hours = {int(r["hr"]): int(r["cnt"]) for r in peak_rows}

        # ── Working hours (from availability table) ────────────
        avail_rows = session.execute(
            text("""
                SELECT MIN(start_time) AS earliest, MAX(end_time) AS latest
                FROM availability
                WHERE barber_id = :bid
            """),
            {"bid": barber_id},
        ).mappings().first()

        if avail_rows and avail_rows["earliest"] and avail_rows["latest"]:
            working_hours = {
                "start": avail_rows["earliest"].hour,
                "end": avail_rows["latest"].hour,
            }
        else:
            working_hours = {"start": 9, "end": 19}  # sensible default

        # Expand range to include any hours that actually have bookings
        if peak_hours:
            min_hr = min(peak_hours.keys())
            max_hr = max(peak_hours.keys())
            working_hours["start"] = min(working_hours["start"], min_hr)
            working_hours["end"] = max(working_hours["end"], max_hr + 1)

        return {
            "stats": stats,
            "week_data": week_data,
            "month_data": month_data,
            "peak_hours": peak_hours,
            "working_hours": working_hours,
        }, None, None

    except Exception as e:
        return None, "db_error", f"Database error: {e}"
    finally:
        session.close()


def accept_appointment(appointment_id: int):
    return _change_booking_status(appointment_id, "Accepted")


def reject_appointment(appointment_id: int):
    return _change_booking_status(appointment_id, "Rejected")


def _change_booking_status(appointment_id: int, new_status: str):
    session = SessionLocal()
    try:
        from models.booking import Booking
        booking = session.query(Booking).filter(Booking.id == appointment_id).first()
        if not booking:
            return None, "not_found", f"Appointment {appointment_id} not found."

        if booking.status not in ("Pending", "PENDING"):
            return None, "conflict", (
                f"Appointment {appointment_id} is '{booking.status}'. "
                f"Only PENDING appointments can be accepted or rejected."
            )

        booking.status = new_status
        session.commit()

        return {
            "id": booking.id,
            "status": booking.status,
            "barber_id": str(booking.barber_id),
            "appointment_datetime": booking.appointment_datetime.isoformat() if booking.appointment_datetime else None,
        }, None, None
    finally:
        session.close()


def reschedule_appointment(appointment_id: int, new_datetime: str):
    if not new_datetime or not str(new_datetime).strip():
        return None, "bad_request", "new_datetime is required."

    try:
        appt_dt = datetime.fromisoformat(str(new_datetime).strip())
    except ValueError:
        return None, "bad_request", "new_datetime must be ISO-8601 format."

    if appt_dt < datetime.now():
        return None, "bad_request", f"new_datetime '{new_datetime}' is in the past."

    session = SessionLocal()
    try:
        from models.booking import Booking
        booking = session.query(Booking).filter(Booking.id == appointment_id).first()
        if not booking:
            return None, "not_found", f"Appointment {appointment_id} not found."

        booking.appointment_datetime = appt_dt
        booking.status = "Rescheduled"
        session.commit()

        return {
            "id": booking.id,
            "status": booking.status,
            "barber_id": str(booking.barber_id),
            "appointment_datetime": booking.appointment_datetime.isoformat(),
        }, None, None
    finally:
        session.close()


def handle_booking_request(barber_id, customer_id, appointment_datetime: str, notes=None):
    """Create a new booking request."""
    if not appointment_datetime:
        return None, "bad_request", "appointment_datetime is required."

    try:
        appt_dt = datetime.fromisoformat(str(appointment_datetime).strip())
    except ValueError:
        return None, "bad_request", "appointment_datetime must be ISO-8601 format."

    if appt_dt < datetime.now():
        return None, "bad_request", f"appointment_datetime is in the past."

    session = SessionLocal()
    try:
        barber = session.query(Barber).filter(Barber.id == barber_id).first()
        if not barber:
            return None, "not_found", f"Barber {barber_id} not found."

        from models.booking import Booking
        new_booking = Booking(
            client_id=customer_id,
            barber_id=barber_id,
            service_id=1,  # Default service — should be passed from frontend
            appointment_datetime=appt_dt,
            status="Pending",
        )
        session.add(new_booking)
        session.commit()

        return {
            "id": new_booking.id,
            "barber_id": str(new_booking.barber_id),
            "client_id": str(new_booking.client_id),
            "appointment_datetime": new_booking.appointment_datetime.isoformat(),
            "status": new_booking.status,
        }, None, None

    except Exception as e:
        session.rollback()
        return None, "db_error", f"Database error: {e}"
    finally:
        session.close()
