from datetime import datetime

from extensions import db
from models.barber import Barber, Availability
from models.booking import Booking
from models.social import Post
from models.barber_portfolio import BarberPortfolio
from models.salon import SalonBarberAssociation, SalonAvailability


# =============================================================================
# CONSTANTS
# =============================================================================

VALID_STATUSES   = {"Pending", "Accepted", "Rejected", "Rescheduled", "Completed"}
BLOCKING_STATUSES = ["Pending", "Accepted"]
MAX_POST_LENGTH  = 2000


# =============================================================================
# PRIVATE HELPERS
# =============================================================================

def _time_in_window(appt_time, start_time, end_time):
    """Return True if appt_time falls in [start_time, end_time)."""
    return start_time <= appt_time < end_time


def _get_salon_association(barber_id):
    """Return active salon association for barber, or None if independent."""
    return SalonBarberAssociation.query.filter_by(
        barber_id=barber_id,
        invitation_status="Accepted",
        salon_rules_active=1
    ).first()


def _check_availability_windows(windows, appt_time, label):
    """
    Check whether appt_time falls inside any of the given availability rows.
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


def _resolve_availability(barber_id, appt_dt):
    """
    UC-003: route availability check to salon+barber intersection or barber-only.
    Returns (True, None) or (False, error_message).
    """
    day        = appt_dt.weekday()   # 0=Monday … 6=Sunday
    appt_time  = appt_dt.time()

    assoc = _get_salon_association(barber_id)

    if assoc:
        # Gate 1: salon operating hours
        salon_windows = SalonAvailability.query.filter_by(
            salon_id=assoc.salon_id,
            day_of_week=day,
            is_active=1
        ).all()
        ok, err = _check_availability_windows(salon_windows, appt_time, "The salon")
        if not ok:
            return False, err

    # Gate 2 (always): barber's own schedule
    barber_windows = Availability.query.filter_by(
        barber_id=barber_id,
        day_of_week=day
    ).all()
    return _check_availability_windows(barber_windows, appt_time, "The barber")


def _slot_is_taken(barber_id, appt_dt, exclude_id=None):
    """Return True if a blocking appointment already exists at this exact datetime."""
    query = Booking.query.filter(
        Booking.barber_id == barber_id,
        Booking.appointment_datetime == appt_dt,
        Booking.status.in_(BLOCKING_STATUSES)
    )
    if exclude_id:
        query = query.filter(Booking.id != exclude_id)
    return query.first() is not None


def _validate_slots(slots):
    """Validate availability slot list. Returns error string or None."""
    if not isinstance(slots, list):
        return "availability must be a list."

    for i, slot in enumerate(slots):
        day = slot.get("day_of_week")
        if not isinstance(day, int) or not (0 <= day <= 6):
            return f"Slot {i}: day_of_week must be an integer 0–6."
        try:
            datetime.strptime(slot.get("start_time", ""), "%H:%M")
            datetime.strptime(slot.get("end_time",   ""), "%H:%M")
        except ValueError:
            return f"Slot {i}: start_time and end_time must be HH:MM."
        if slot["start_time"] >= slot["end_time"]:
            return f"Slot {i}: end_time must be after start_time."

    # Overlap detection per day
    by_day = {}
    for s in slots:
        by_day.setdefault(s["day_of_week"], []).append(
            (s["start_time"], s["end_time"])
        )
    for day, ranges in by_day.items():
        ranges.sort()
        for i in range(len(ranges) - 1):
            if ranges[i + 1][0] < ranges[i][1]:
                return (f"Overlapping slots on day {day}: "
                        f"{ranges[i][0]}–{ranges[i][1]} and "
                        f"{ranges[i+1][0]}–{ranges[i+1][1]}.")
    return None


# =============================================================================
# PROFILE SERVICES
# =============================================================================

def get_barber_profile(barber_id):
    barber = Barber.query.get(barber_id)
    if not barber:
        return None

    return {
        "id":                   barber.id,
        "user_id":              barber.user_id,
        "name":                 barber.user.full_name,
        "bio":                  barber.bio,
        "years_experience":     barber.years_experience,
        "is_verified":          barber.is_verified,
        "instagram_handle":     barber.instagram_handle,
        "current_location_name": barber.current_location_name,
    }


def update_barber_profile(barber_id, data):
    barber = Barber.query.get(barber_id)
    if not barber:
        return None

    if "bio" in data:
        barber.bio = data["bio"].strip() or None
    if "years_experience" in data:
        try:
            barber.years_experience = int(data["years_experience"])
        except (TypeError, ValueError):
            return {"error": "years_experience must be an integer."}
    if "instagram_handle" in data:
        barber.instagram_handle = data["instagram_handle"].strip() or None

    db.session.commit()

    return {
        "id":               barber.id,
        "bio":              barber.bio,
        "years_experience": barber.years_experience,
        "instagram_handle": barber.instagram_handle,
    }


def update_location(barber_id, data):
    barber = Barber.query.get(barber_id)
    if not barber:
        return None

    location = data.get("current_location_name", "").strip()
    if not location:
        return {"error": "current_location_name is required."}

    barber.current_location_name = location
    db.session.commit()

    return {
        "id":                    barber.id,
        "current_location_name": barber.current_location_name,
    }


# =============================================================================
# AVAILABILITY SERVICES
# =============================================================================

def manage_availability(barber_id, slots):
    barber = Barber.query.get(barber_id)
    if not barber:
        return None

    error = _validate_slots(slots)
    if error:
        return {"error": error}

    # Atomic replace: delete all existing, insert new
    Availability.query.filter_by(barber_id=barber_id).delete(
        synchronize_session="fetch"
    )

    for slot in slots:
        start = datetime.strptime(slot["start_time"], "%H:%M").time()
        end   = datetime.strptime(slot["end_time"],   "%H:%M").time()
        db.session.add(Availability(
            barber_id   = barber_id,
            day_of_week = int(slot["day_of_week"]),
            start_time  = start,
            end_time    = end,
        ))

    db.session.commit()

    return [
        {
            "id":          a.id,
            "day_of_week": a.day_of_week,
            "start_time":  a.start_time.strftime("%H:%M"),
            "end_time":    a.end_time.strftime("%H:%M"),
        }
        for a in Availability.query.filter_by(barber_id=barber_id)
                                   .order_by(Availability.day_of_week,
                                             Availability.start_time).all()
    ]


def update_availability(barber_id, slots):
    return manage_availability(barber_id, slots)


def get_availability(barber_id):
    barber = Barber.query.get(barber_id)
    if not barber:
        return None

    rows = Availability.query.filter_by(barber_id=barber_id) \
                             .order_by(Availability.day_of_week,
                                       Availability.start_time).all()
    return [
        {
            "id":          a.id,
            "day_of_week": a.day_of_week,
            "start_time":  a.start_time.strftime("%H:%M"),
            "end_time":    a.end_time.strftime("%H:%M"),
        }
        for a in rows
    ]


# =============================================================================
# PORTFOLIO SERVICES
# =============================================================================

def add_portfolio_item(barber_id, image_url, description):
    barber = Barber.query.get(barber_id)
    if not barber:
        return None

    if not image_url or not image_url.strip():
        return {"error": "image_url is required."}

    image_url = image_url.strip()
    if not (image_url.startswith("http://") or image_url.startswith("https://")):
        return {"error": "image_url must be a valid URL (http:// or https://)."}

    item = BarberPortfolio(
        barber_id   = barber_id,
        image_url   = image_url,
        description = description.strip() if description else None,
    )
    db.session.add(item)
    db.session.commit()

    return {
        "id":          item.id,
        "barber_id":   item.barber_id,
        "image_url":   item.image_url,
        "description": item.description,
        "created_at":  item.created_at.isoformat(),
    }


def delete_portfolio_item(barber_id, portfolio_id):
    item = BarberPortfolio.query.get(portfolio_id)
    if not item:
        return None

    if item.barber_id != barber_id:
        return {"error": "Unauthorized"}

    db.session.delete(item)
    db.session.commit()
    return {"message": "Portfolio item deleted"}


def get_portfolio(barber_id):
    barber = Barber.query.get(barber_id)
    if not barber:
        return None

    items = BarberPortfolio.query.filter_by(barber_id=barber_id) \
                                 .order_by(BarberPortfolio.created_at.desc()).all()
    return [
        {
            "id":          i.id,
            "image_url":   i.image_url,
            "description": i.description,
            "created_at":  i.created_at.isoformat(),
        }
        for i in items
    ]


# =============================================================================
# SOCIAL SERVICES
# =============================================================================

def create_post(barber_id, content):
    barber = Barber.query.get(barber_id)
    if not barber:
        return None

    if not content or not content.strip():
        return {"error": "content is required."}

    content = content.strip()
    if len(content) > MAX_POST_LENGTH:
        return {"error": f"content exceeds {MAX_POST_LENGTH} characters."}

    # Post.caption maps to the barber's text content; image_url is optional
    post = Post(barber_id=barber_id, caption=content, image_url=None)
    db.session.add(post)
    db.session.commit()

    return {
        "id":         post.id,
        "barber_id":  post.barber_id,
        "content":    post.caption,
        "created_at": post.created_at.isoformat(),
    }


def get_my_posts(barber_id):
    barber = Barber.query.get(barber_id)
    if not barber:
        return None

    posts = Post.query.filter_by(barber_id=barber_id) \
                      .order_by(Post.created_at.desc()).all()
    return [
        {
            "id":         p.id,
            "content":    p.caption,
            "image_url":  p.image_url,
            "created_at": p.created_at.isoformat(),
        }
        for p in posts
    ]


# =============================================================================
# APPOINTMENT SERVICES
# =============================================================================

def view_barber_appointments(barber_id):
    barber = Barber.query.get(barber_id)
    if not barber:
        return None

    bookings = Booking.query.filter_by(barber_id=barber_id) \
                            .order_by(Booking.appointment_datetime.asc()).all()

    grouped = {s: [] for s in VALID_STATUSES}
    for b in bookings:
        entry = {
            "id":                   b.id,
            "client_id":            b.client_id,
            "service_id":           b.service_id,
            "appointment_datetime": b.appointment_datetime.isoformat(),
            "status":               b.status,
        }
        grouped.setdefault(b.status, []).append(entry)

    return grouped


def change_booking_status(booking_id, new_status):
    booking = Booking.query.get(booking_id)
    if not booking:
        return None

    if booking.status != "Pending":
        return {
            "error": (f"Booking is '{booking.status}'. "
                      f"Only Pending bookings can be accepted or rejected.")
        }

    if new_status == "Accepted":
        if _slot_is_taken(booking.barber_id, booking.appointment_datetime,
                          exclude_id=booking.id):
            return {"error": "Another Pending or Accepted booking already exists at that time."}

    booking.status = new_status
    db.session.commit()

    return {
        "id":                   booking.id,
        "status":               booking.status,
        "appointment_datetime": booking.appointment_datetime.isoformat(),
    }


def accept_appointment(booking_id):
    return change_booking_status(booking_id, "Accepted")


def reject_appointment(booking_id):
    return change_booking_status(booking_id, "Rejected")


def reschedule_appointment(booking_id, new_datetime):
    booking = Booking.query.get(booking_id)
    if not booking:
        return None

    if not new_datetime:
        return {"error": "new_datetime is required."}

    try:
        appt_dt = datetime.fromisoformat(new_datetime)
    except (ValueError, TypeError):
        return {"error": "new_datetime must be ISO-8601 (e.g. 2026-03-01T10:00:00)."}

    if appt_dt < datetime.now():
        return {"error": "new_datetime cannot be in the past."}

    if _slot_is_taken(booking.barber_id, appt_dt, exclude_id=booking.id):
        return {"error": "Another Pending or Accepted booking already exists at that time."}

    booking.appointment_datetime = appt_dt
    booking.status = "Rescheduled"
    db.session.commit()

    return {
        "id":                   booking.id,
        "status":               booking.status,
        "appointment_datetime": booking.appointment_datetime.isoformat(),
    }


def handle_booking_request(barber_id, client_id, appointment_datetime, notes=None):
    """
    UC-003-aware booking. Checks salon hours (if associated) then barber hours,
    then double-booking, then inserts with status Pending.
    """
    barber = Barber.query.get(barber_id)
    if not barber:
        return None

    if not appointment_datetime:
        return {"error": "appointment_datetime is required."}

    try:
        appt_dt = datetime.fromisoformat(str(appointment_datetime))
    except (ValueError, TypeError):
        return {"error": "appointment_datetime must be ISO-8601."}

    if appt_dt < datetime.now():
        return {"error": "appointment_datetime cannot be in the past."}

    # UC-003: availability check (salon-aware)
    available, avail_err = _resolve_availability(barber_id, appt_dt)
    if not available:
        return {"error": avail_err, "reason": "unavailable"}

    # Double-booking guard
    if _slot_is_taken(barber_id, appt_dt):
        return {
            "error":  "A Pending or Accepted booking already exists at that time.",
            "reason": "conflict",
        }

    booking = Booking(
        barber_id            = barber_id,
        client_id            = client_id,
        appointment_datetime = appt_dt,
        status               = "Pending",
    )
    db.session.add(booking)
    db.session.commit()

    return {
        "id":                   booking.id,
        "barber_id":            booking.barber_id,
        "client_id":            booking.client_id,
        "appointment_datetime": booking.appointment_datetime.isoformat(),
        "status":               booking.status,
    }