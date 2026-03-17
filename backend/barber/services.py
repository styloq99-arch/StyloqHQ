from datetime import datetime

from backend.models.base import SessionLocal
from backend.models.barber import Barber
from backend.models.booking import Booking, Availability
from backend.models.social import Post
from backend.models.barber_portfolio import BarberPortfolio
from backend.models.salon import SalonBarberAssociation, SalonAvailability


# =============================================================================
# CONSTANTS
# =============================================================================

VALID_STATUSES    = {"Pending", "Accepted", "Rejected", "Rescheduled", "Completed"}
BLOCKING_STATUSES = ["Pending", "Accepted"]
MAX_POST_LENGTH   = 2000


# =============================================================================
# PRIVATE HELPERS
# =============================================================================

def _time_in_window(appt_time, start_time, end_time):
    """Return True if appt_time falls in [start_time, end_time)."""
    return start_time <= appt_time < end_time


def _check_availability_windows(windows, appt_time, label):
    """
    Check whether appt_time falls inside any availability window.
    Returns (True, None) or (False, error_message).
    """
    if not windows:
        return False, f"{label} has no availability set for that day."

    for w in windows:
        if _time_in_window(appt_time, w.start_time, w.end_time):
            return True, None

    readable = ", ".join(
        f"{w.start_time.strftime('%H:%M')}–{w.end_time.strftime('%H:%M')}"
        for w in windows
    )
    return False, f"{label} is not available at that time. Available: {readable}."


def _resolve_availability(db, barber_id, appt_dt):
    """
    UC-003: If barber has an active salon association, the slot must fall
    within BOTH salon hours AND barber hours. Otherwise barber hours only.
    Returns (True, None) or (False, error_message).
    """
    day       = appt_dt.weekday()   # 0 = Monday … 6 = Sunday
    appt_time = appt_dt.time()

    assoc = db.query(SalonBarberAssociation).filter_by(
        barber_id=barber_id,
        invitation_status="Accepted",
        salon_rules_active=1
    ).first()

    if assoc:
        salon_windows = db.query(SalonAvailability).filter(
            SalonAvailability.salon_id == assoc.salon_id,
            SalonAvailability.day_of_week == day,
            SalonAvailability.is_active == 1
        ).all()
        ok, err = _check_availability_windows(salon_windows, appt_time, "The salon")
        if not ok:
            return False, err

    barber_windows = db.query(Availability).filter(
        Availability.barber_id == barber_id,
        Availability.day_of_week == day
    ).all()
    return _check_availability_windows(barber_windows, appt_time, "The barber")


def _slot_is_taken(db, barber_id, appt_dt, exclude_id=None):
    """Return True if a blocking-status booking exists at this exact datetime."""
    query = db.query(Booking).filter(
        Booking.barber_id == barber_id,
        Booking.appointment_datetime == appt_dt,
        Booking.status.in_(BLOCKING_STATUSES)
    )
    if exclude_id:
        query = query.filter(Booking.id != exclude_id)
    return query.first() is not None


def _validate_slots(slots):
    """Validate an availability slot list. Returns error string or None."""
    if not isinstance(slots, list):
        return "availability must be a list."

    for i, slot in enumerate(slots):
        day = slot.get("day_of_week")
        if not isinstance(day, int) or not (0 <= day <= 6):
            return f"Slot {i}: day_of_week must be an integer 0 (Mon)–6 (Sun)."
        try:
            datetime.strptime(slot.get("start_time", ""), "%H:%M")
            datetime.strptime(slot.get("end_time",   ""), "%H:%M")
        except ValueError:
            return f"Slot {i}: start_time and end_time must be HH:MM."
        if slot["start_time"] >= slot["end_time"]:
            return f"Slot {i}: end_time must be after start_time."

    # Intra-day overlap detection
    by_day = {}
    for s in slots:
        by_day.setdefault(s["day_of_week"], []).append(
            (s["start_time"], s["end_time"])
        )
    for day, ranges in by_day.items():
        ranges.sort()
        for i in range(len(ranges) - 1):
            if ranges[i + 1][0] < ranges[i][1]:
                return (
                    f"Overlapping slots on day {day}: "
                    f"{ranges[i][0]}–{ranges[i][1]} overlaps "
                    f"{ranges[i+1][0]}–{ranges[i+1][1]}."
                )
    return None


# =============================================================================
# PROFILE SERVICES
# =============================================================================

def get_barber_profile(barber_id):
    db = SessionLocal()
    try:
        barber = db.query(Barber).filter(Barber.id == barber_id).first()
        if not barber:
            return None

        user = barber.user
        return {
            "id":                    barber.id,
            "user_id":               barber.user_id,
            "name":                  user.full_name if user else "Unknown",
            "bio":                   barber.bio,
            "years_experience":      barber.years_experience,
            "is_verified":           barber.is_verified,
            "instagram_handle":      barber.instagram_handle,
            "current_location_name": barber.current_location_name,
        }
    finally:
        db.close()


def update_barber_profile(barber_id, data):
    db = SessionLocal()
    try:
        barber = db.query(Barber).filter(Barber.id == barber_id).first()
        if not barber:
            return None

        if "bio" in data:
            barber.bio = (data["bio"] or "").strip() or None
        if "years_experience" in data:
            try:
                barber.years_experience = int(data["years_experience"])
            except (TypeError, ValueError):
                return {"error": "years_experience must be an integer."}
        if "instagram_handle" in data:
            barber.instagram_handle = (data["instagram_handle"] or "").strip() or None

        db.commit()
        return {
            "id":               barber.id,
            "bio":              barber.bio,
            "years_experience": barber.years_experience,
            "instagram_handle": barber.instagram_handle,
        }
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()


def update_location(barber_id, data):
    db = SessionLocal()
    try:
        barber = db.query(Barber).filter(Barber.id == barber_id).first()
        if not barber:
            return None

        location = (data.get("current_location_name") or "").strip()
        if not location:
            return {"error": "current_location_name is required."}

        barber.current_location_name = location
        db.commit()
        return {
            "id":                    barber.id,
            "current_location_name": barber.current_location_name,
        }
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()


# =============================================================================
# AVAILABILITY SERVICES
# =============================================================================

def manage_availability(barber_id, slots):
    """Replace the barber's full availability schedule atomically."""
    error = _validate_slots(slots)
    if error:
        return {"error": error}

    db = SessionLocal()
    try:
        if not db.query(Barber).filter(Barber.id == barber_id).first():
            return None

        db.query(Availability).filter(
            Availability.barber_id == barber_id
        ).delete(synchronize_session="fetch")

        for slot in slots:
            start = datetime.strptime(slot["start_time"], "%H:%M").time()
            end   = datetime.strptime(slot["end_time"],   "%H:%M").time()
            db.add(Availability(
                barber_id   = barber_id,
                day_of_week = int(slot["day_of_week"]),
                start_time  = start,
                end_time    = end,
            ))

        db.commit()

        rows = db.query(Availability).filter(
            Availability.barber_id == barber_id
        ).order_by(Availability.day_of_week, Availability.start_time).all()

        return [
            {
                "id":          a.id,
                "day_of_week": a.day_of_week,
                "start_time":  a.start_time.strftime("%H:%M"),
                "end_time":    a.end_time.strftime("%H:%M"),
            }
            for a in rows
        ]
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()


def update_availability(barber_id, slots):
    return manage_availability(barber_id, slots)


def get_availability(barber_id):
    db = SessionLocal()
    try:
        if not db.query(Barber).filter(Barber.id == barber_id).first():
            return None

        rows = db.query(Availability).filter(
            Availability.barber_id == barber_id
        ).order_by(Availability.day_of_week, Availability.start_time).all()

        return [
            {
                "id":          a.id,
                "day_of_week": a.day_of_week,
                "start_time":  a.start_time.strftime("%H:%M"),
                "end_time":    a.end_time.strftime("%H:%M"),
            }
            for a in rows
        ]
    finally:
        db.close()


# =============================================================================
# PORTFOLIO SERVICES
# =============================================================================

def add_portfolio_item(barber_id, image_url, description):
    if not image_url or not image_url.strip():
        return {"error": "image_url is required."}

    image_url = image_url.strip()
    if not (image_url.startswith("http://") or image_url.startswith("https://")):
        return {"error": "image_url must start with http:// or https://."}

    db = SessionLocal()
    try:
        if not db.query(Barber).filter(Barber.id == barber_id).first():
            return None

        item = BarberPortfolio(
            barber_id   = barber_id,
            image_url   = image_url,
            description = description.strip() if description else None,
        )
        db.add(item)
        db.commit()
        db.refresh(item)

        return {
            "id":          item.id,
            "barber_id":   item.barber_id,
            "image_url":   item.image_url,
            "description": item.description,
            "created_at":  item.created_at.isoformat(),
        }
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()


def delete_portfolio_item(barber_id, portfolio_id):
    db = SessionLocal()
    try:
        item = db.query(BarberPortfolio).filter(
            BarberPortfolio.id == portfolio_id
        ).first()
        if not item:
            return None
        if item.barber_id != barber_id:
            return {"error": "Unauthorized"}

        db.delete(item)
        db.commit()
        return {"message": "Portfolio item deleted"}
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()


def get_portfolio(barber_id):
    db = SessionLocal()
    try:
        if not db.query(Barber).filter(Barber.id == barber_id).first():
            return None

        items = db.query(BarberPortfolio).filter(
            BarberPortfolio.barber_id == barber_id
        ).order_by(BarberPortfolio.created_at.desc()).all()

        return [
            {
                "id":          i.id,
                "image_url":   i.image_url,
                "description": i.description,
                "created_at":  i.created_at.isoformat(),
            }
            for i in items
        ]
    finally:
        db.close()


# =============================================================================
# SOCIAL SERVICES
# =============================================================================

def create_post(barber_id, caption, image_url):
    """Both caption and image_url required — Post.image_url is NOT NULL."""
    if not caption or not caption.strip():
        return {"error": "caption is required."}
    if not image_url or not image_url.strip():
        return {"error": "image_url is required."}

    caption   = caption.strip()
    image_url = image_url.strip()

    if len(caption) > MAX_POST_LENGTH:
        return {"error": f"caption exceeds {MAX_POST_LENGTH} characters."}

    db = SessionLocal()
    try:
        if not db.query(Barber).filter(Barber.id == barber_id).first():
            return None

        post = Post(barber_id=barber_id, caption=caption, image_url=image_url)
        db.add(post)
        db.commit()
        db.refresh(post)

        return {
            "id":         post.id,
            "barber_id":  post.barber_id,
            "caption":    post.caption,
            "image_url":  post.image_url,
            "created_at": post.created_at.isoformat(),
        }
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()


def get_my_posts(barber_id):
    db = SessionLocal()
    try:
        if not db.query(Barber).filter(Barber.id == barber_id).first():
            return None

        posts = db.query(Post).filter(
            Post.barber_id == barber_id
        ).order_by(Post.created_at.desc()).all()

        return [
            {
                "id":         p.id,
                "caption":    p.caption,
                "image_url":  p.image_url,
                "created_at": p.created_at.isoformat(),
            }
            for p in posts
        ]
    finally:
        db.close()


# =============================================================================
# APPOINTMENT SERVICES
# =============================================================================

def view_barber_appointments(barber_id):
    db = SessionLocal()
    try:
        if not db.query(Barber).filter(Barber.id == barber_id).first():
            return None

        bookings = db.query(Booking).filter(
            Booking.barber_id == barber_id
        ).order_by(Booking.appointment_datetime.asc()).all()

        grouped = {s: [] for s in VALID_STATUSES}
        for b in bookings:
            grouped.setdefault(b.status, []).append({
                "id":                   b.id,
                "client_id":            b.client_id,
                "service_id":           b.service_id,
                "appointment_datetime": b.appointment_datetime.isoformat(),
                "status":               b.status,
            })
        return grouped
    finally:
        db.close()


def change_booking_status(booking_id, new_status):
    db = SessionLocal()
    try:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            return None

        if booking.status != "Pending":
            return {
                "error": (
                    f"Booking is '{booking.status}'. "
                    "Only Pending bookings can be accepted or rejected."
                )
            }

        if new_status == "Accepted":
            if _slot_is_taken(db, booking.barber_id, booking.appointment_datetime,
                               exclude_id=booking.id):
                return {"error": "Another Pending or Accepted booking already exists at that time."}

        booking.status = new_status
        db.commit()

        return {
            "id":                   booking.id,
            "status":               booking.status,
            "appointment_datetime": booking.appointment_datetime.isoformat(),
        }
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()


def accept_appointment(booking_id):
    return change_booking_status(booking_id, "Accepted")


def reject_appointment(booking_id):
    return change_booking_status(booking_id, "Rejected")


def reschedule_appointment(booking_id, new_datetime):
    db = SessionLocal()
    try:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            return None

        try:
            appt_dt = datetime.fromisoformat(new_datetime)
        except (ValueError, TypeError):
            return {"error": "new_datetime must be ISO-8601 (e.g. 2026-03-01T10:00:00)."}

        if appt_dt < datetime.now():
            return {"error": "new_datetime cannot be in the past."}

        if _slot_is_taken(db, booking.barber_id, appt_dt, exclude_id=booking.id):
            return {"error": "Another Pending or Accepted booking already exists at that time."}

        booking.appointment_datetime = appt_dt
        booking.status = "Rescheduled"
        db.commit()

        return {
            "id":                   booking.id,
            "status":               booking.status,
            "appointment_datetime": booking.appointment_datetime.isoformat(),
        }
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()


def handle_booking_request(barber_id, client_id, service_id, appointment_datetime):
    """
    UC-003-aware booking. Checks salon hours (if associated) intersected with
    barber hours, then double-booking, then inserts with status Pending.
    service_id is required — Booking.service_id is NOT NULL.
    """
    try:
        appt_dt = datetime.fromisoformat(str(appointment_datetime))
    except (ValueError, TypeError):
        return {"error": "appointment_datetime must be ISO-8601."}

    if appt_dt < datetime.now():
        return {"error": "appointment_datetime cannot be in the past."}

    db = SessionLocal()
    try:
        if not db.query(Barber).filter(Barber.id == barber_id).first():
            return None

        available, avail_err = _resolve_availability(db, barber_id, appt_dt)
        if not available:
            return {"error": avail_err, "reason": "unavailable"}

        if _slot_is_taken(db, barber_id, appt_dt):
            return {
                "error":  "A Pending or Accepted booking already exists at that time.",
                "reason": "conflict",
            }

        booking = Booking(
            barber_id            = barber_id,
            client_id            = client_id,
            service_id           = service_id,
            appointment_datetime = appt_dt,
            status               = "Pending",
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)

        return {
            "id":                   booking.id,
            "barber_id":            booking.barber_id,
            "client_id":            booking.client_id,
            "service_id":           booking.service_id,
            "appointment_datetime": booking.appointment_datetime.isoformat(),
            "status":               booking.status,
        }
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()