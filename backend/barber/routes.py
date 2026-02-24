from flask import Blueprint, jsonify, request

from barber import services

barber_bp = Blueprint("barber", __name__, url_prefix="/barber")


# =============================================================================
# HELPERS
# =============================================================================

# Typed reason → HTTP status. Services never decide HTTP codes.
_STATUS_MAP = {
    "bad_request":  400,
    "not_found":    404,
    "unavailable":  400,
    "conflict":     409,
    "db_error":     500,
}


def _ok(data, message: str = "", status: int = 200):
    """Uniform success envelope."""
    body = {"success": True, "data": data}
    if message:
        body["message"] = message
    return jsonify(body), status


def _err(reason: str, message: str):
    """Uniform error envelope."""
    return jsonify({
        "success": False,
        "reason":  reason,
        "message": message,
    }), _STATUS_MAP.get(reason, 400)


def _svc(result):
    """
    Unpack a service 3-tuple (data, reason, error) and return a Flask response.
    Pass the result of _ok / _err directly to the caller.
    Usage:
        return _svc(services.some_fn(...))
    """
    data, reason, error = result
    if error:
        return _err(reason, error)
    return data, reason   # caller wraps in _ok


# =============================================================================
# PROFILE ROUTES
# =============================================================================

@barber_bp.get("/<int:barber_id>/profile")
def get_profile(barber_id: int):
    data, reason, error = services.get_barber_profile(barber_id)
    if error:
        return _err(reason, error)
    return _ok(data)


@barber_bp.put("/<int:barber_id>/profile")
def update_profile(barber_id: int):
    body = request.get_json(silent=True) or {}
    data, reason, error = services.update_barber_profile(barber_id, body)
    if error:
        return _err(reason, error)
    return _ok(data, "Profile updated successfully.")


@barber_bp.put("/<int:barber_id>/location")
def update_location(barber_id: int):
    body = request.get_json(silent=True) or {}
    data, reason, error = services.update_location(barber_id, body)
    if error:
        return _err(reason, error)
    return _ok(data, "Location updated successfully.")


# =============================================================================
# AVAILABILITY ROUTES
# =============================================================================

@barber_bp.put("/<int:barber_id>/availability")
def update_availability(barber_id: int):
    """
    Replace the barber's full availability schedule.
    Body: { "availability": [ { "day_of_week": 0, "start_time": "09:00", "end_time": "17:00" } ] }
    Send an empty array to clear all slots.
    """
    body  = request.get_json(silent=True) or {}
    slots = body.get("availability")

    if slots is None:
        return _err("bad_request", "Request body must include an 'availability' array.")

    data, reason, error = services.update_availability(barber_id, slots)
    if error:
        return _err(reason, error)
    return _ok(data, "Availability updated successfully.")


@barber_bp.get("/<int:barber_id>/availability")
def get_availability(barber_id: int):
    data, reason, error = services.get_availability(barber_id)
    if error:
        return _err(reason, error)
    return _ok(data)


# =============================================================================
# PORTFOLIO ROUTES
# =============================================================================

@barber_bp.post("/<int:barber_id>/portfolio")
def add_portfolio_item(barber_id: int):
    """
    Body: { "image_url": "https://...", "description": "..." }
    """
    body        = request.get_json(silent=True) or {}
    image_url   = body.get("image_url")
    description = body.get("description")

    if not image_url:
        return _err("bad_request", "image_url is required.")

    data, reason, error = services.add_portfolio_item(barber_id, image_url, description)
    if error:
        return _err(reason, error)
    return _ok(data, "Portfolio item added."), 201


@barber_bp.delete("/<int:barber_id>/portfolio/<int:portfolio_id>")
def delete_portfolio_item(barber_id: int, portfolio_id: int):
    data, reason, error = services.delete_portfolio_item(barber_id, portfolio_id)
    if error:
        return _err(reason, error)
    return _ok(data, f"Portfolio item {portfolio_id} deleted.")


@barber_bp.get("/<int:barber_id>/portfolio")
def get_portfolio(barber_id: int):
    data, reason, error = services.get_portfolio(barber_id)
    if error:
        return _err(reason, error)
    return _ok(data)


# =============================================================================
# SOCIAL ROUTES
# =============================================================================

@barber_bp.post("/<int:barber_id>/posts")
def create_post(barber_id: int):
    """
    Body: { "content": "..." }
    """
    body    = request.get_json(silent=True) or {}
    content = body.get("content")

    if not content:
        return _err("bad_request", "content is required.")

    data, reason, error = services.create_post(barber_id, content)
    if error:
        return _err(reason, error)
    return _ok(data, "Post created."), 201


@barber_bp.get("/<int:barber_id>/posts")
def get_posts(barber_id: int):
    data, reason, error = services.get_my_posts(barber_id)
    if error:
        return _err(reason, error)
    return _ok(data)


# =============================================================================
# APPOINTMENT ROUTES
# =============================================================================

@barber_bp.get("/<int:barber_id>/appointments")
def get_appointments(barber_id: int):
    """Returns appointments grouped by status."""
    data, reason, error = services.view_barber_appointments(barber_id)
    if error:
        return _err(reason, error)
    return _ok(data)


@barber_bp.patch("/appointments/<int:appointment_id>/accept")
def accept_appointment(appointment_id: int):
    data, reason, error = services.accept_appointment(appointment_id)
    if error:
        return _err(reason, error)
    return _ok(data, f"Appointment {appointment_id} accepted.")


@barber_bp.patch("/appointments/<int:appointment_id>/reject")
def reject_appointment(appointment_id: int):
    data, reason, error = services.reject_appointment(appointment_id)
    if error:
        return _err(reason, error)
    return _ok(data, f"Appointment {appointment_id} rejected.")


@barber_bp.patch("/appointments/<int:appointment_id>/reschedule")
def reschedule_appointment(appointment_id: int):
    """
    Body: { "new_datetime": "2026-03-01T10:00:00" }
    """
    body         = request.get_json(silent=True) or {}
    new_datetime = body.get("new_datetime")

    if not new_datetime:
        return _err("bad_request",
                    "new_datetime is required (format: YYYY-MM-DDTHH:MM:SS).")

    data, reason, error = services.reschedule_appointment(appointment_id, new_datetime)
    if error:
        return _err(reason, error)
    return _ok(data, f"Appointment {appointment_id} rescheduled to {new_datetime}.")


@barber_bp.post("/<int:barber_id>/book")
def book_appointment(barber_id: int):
    """
    Body: { "customer_id": 1, "appointment_datetime": "2026-02-25T15:00:00", "notes": "..." }
    UC-003: availability check is salon-aware.
    """
    body        = request.get_json(silent=True) or {}
    customer_id = body.get("customer_id")
    appt_dt     = body.get("appointment_datetime")
    notes       = body.get("notes")

    if not customer_id:
        return _err("bad_request", "customer_id is required.")
    if not appt_dt:
        return _err("bad_request", "appointment_datetime is required.")

    data, reason, error = services.handle_booking_request(
        barber_id=barber_id,
        customer_id=customer_id,
        appointment_datetime=appt_dt,
        notes=notes,
    )
    if error:
        return _err(reason, error)
    return _ok(data, "Appointment request submitted."), 201
