from flask import Blueprint, jsonify, request
from backend.auth.utils import login_required, get_current_user_from_token, role_required
from backend.barber import services

barber_bp = Blueprint("barber", __name__, url_prefix="/barber")


# =============================================================================
# HELPERS
# =============================================================================

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


def _err(reason: str, message: str, status: int = None):
    """Uniform error envelope."""
    if status is None:
        status = _STATUS_MAP.get(reason, 400)
    return jsonify({
        "success": False,
        "reason":  reason,
        "message": message,
    }), status


def _svc(result):
    """Unpack a service 3-tuple (data, reason, error) and return a Flask response."""
    data, reason, error = result
    if error:
        return _err(reason, error)
    return _ok(data)


def _get_barber_id_from_user():
    """Get barber_id from current authenticated user."""
    current_user = get_current_user_from_token()
    if not current_user:
        return None
    if current_user.role != "barber":
        return None
    # Get barber profile from user
    session = None
    try:
        from backend.models.base import SessionLocal
        session = SessionLocal()
        from backend.models.barber import Barber
        barber = session.query(Barber).filter(Barber.user_id == current_user.id).first()
        return barber.id if barber else None
    finally:
        if session:
            session.close()


# =============================================================================
# PUBLIC ENDPOINTS (no authentication required)
# =============================================================================

@barber_bp.get("/<int:barber_id>/profile")
def get_profile(barber_id: int):
    """GET /barber/{barber_id}/profile - Get barber profile (public)."""
    data, reason, error = services.get_barber_profile(barber_id)
    if error:
        return _err(reason, error)
    return _ok(data)


@barber_bp.get("/<int:barber_id>/availability")
def get_availability(barber_id: int):
    """GET /barber/{barber_id}/availability - Get barber availability (public)."""
    data, reason, error = services.get_availability(barber_id)
    if error:
        return _err(reason, error)
    return _ok(data)


@barber_bp.get("/<int:barber_id>/portfolio")
def get_portfolio(barber_id: int):
    """GET /barber/{barber_id}/portfolio - Get barber portfolio (public)."""
    data, reason, error = services.get_portfolio(barber_id)
    if error:
        return _err(reason, error)
    return _ok(data)


@barber_bp.get("/<int:barber_id>/posts")
def get_posts(barber_id: int):
    """GET /barber/{barber_id}/posts - Get barber posts (public)."""
    data, reason, error = services.get_my_posts(barber_id)
    if error:
        return _err(reason, error)
    return _ok(data)


# =============================================================================
# PROTECTED ENDPOINTS (authentication + barber role required)
# =============================================================================

@barber_bp.put("/<int:barber_id>/profile")
@login_required
@role_required(["barber"])
def update_profile(barber_id: int):
    """PUT /barber/{barber_id}/profile - Update barber profile."""
    # Verify the barber owns this profile
    barber_id_from_user = _get_barber_id_from_user()
    if barber_id_from_user != barber_id:
        return _err("forbidden", "You can only update your own profile", 403)
    
    body = request.get_json(silent=True) or {}
    data, reason, error = services.update_barber_profile(barber_id, body)
    if error:
        return _err(reason, error)
    return _ok(data, "Profile updated successfully.")


@barber_bp.put("/<int:barber_id>/location")
@login_required
@role_required(["barber"])
def update_location(barber_id: int):
    """PUT /barber/{barber_id}/location - Update barber location."""
    # Verify the barber owns this profile
    barber_id_from_user = _get_barber_id_from_user()
    if barber_id_from_user != barber_id:
        return _err("forbidden", "You can only update your own location", 403)
    
    body = request.get_json(silent=True) or {}
    data, reason, error = services.update_location(barber_id, body)
    if error:
        return _err(reason, error)
    return _ok(data, "Location updated successfully.")


@barber_bp.put("/<int:barber_id>/availability")
@login_required
@role_required(["barber"])
def update_availability(barber_id: int):
    """PUT /barber/{barber_id}/availability - Replace the barber's full availability schedule."""
    # Verify the barber owns this profile
    barber_id_from_user = _get_barber_id_from_user()
    if barber_id_from_user != barber_id:
        return _err("forbidden", "You can only update your own availability", 403)
    
    body  = request.get_json(silent=True) or {}
    slots = body.get("availability")

    if slots is None:
        return _err("bad_request", "Request body must include an 'availability' array.")

    data, reason, error = services.update_availability(barber_id, slots)
    if error:
        return _err(reason, error)
    return _ok(data, "Availability updated successfully.")


@barber_bp.post("/<int:barber_id>/portfolio")
@login_required
@role_required(["barber"])
def add_portfolio_item(barber_id: int):
    """POST /barber/{barber_id}/portfolio - Add portfolio item."""
    # Verify the barber owns this profile
    barber_id_from_user = _get_barber_id_from_user()
    if barber_id_from_user != barber_id:
        return _err("forbidden", "You can only add to your own portfolio", 403)
    
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
@login_required
@role_required(["barber"])
def delete_portfolio_item(barber_id: int, portfolio_id: int):
    """DELETE /barber/{barber_id}/portfolio/{portfolio_id} - Delete portfolio item."""
    # Verify the barber owns this profile
    barber_id_from_user = _get_barber_id_from_user()
    if barber_id_from_user != barber_id:
        return _err("forbidden", "You can only delete from your own portfolio", 403)
    
    data, reason, error = services.delete_portfolio_item(barber_id, portfolio_id)
    if error:
        return _err(reason, error)
    return _ok(data, f"Portfolio item {portfolio_id} deleted.")


@barber_bp.post("/<int:barber_id>/posts")
@login_required
@role_required(["barber"])
def create_post(barber_id: int):
    """POST /barber/{barber_id}/posts - Create a post."""
    # Verify the barber owns this profile
    barber_id_from_user = _get_barber_id_from_user()
    if barber_id_from_user != barber_id:
        return _err("forbidden", "You can only create posts for your own profile", 403)
    
    body    = request.get_json(silent=True) or {}
    content = body.get("content")

    if not content:
        return _err("bad_request", "content is required.")

    data, reason, error = services.create_post(barber_id, content)
    if error:
        return _err(reason, error)
    return _ok(data, "Post created."), 201


@barber_bp.get("/<int:barber_id>/appointments")
@login_required
@role_required(["barber"])
def get_appointments(barber_id: int):
    """GET /barber/{barber_id}/appointments - Returns appointments grouped by status."""
    # Verify the barber owns this profile
    barber_id_from_user = _get_barber_id_from_user()
    if barber_id_from_user != barber_id:
        return _err("forbidden", "You can only view your own appointments", 403)
    
    data, reason, error = services.view_barber_appointments(barber_id)
    if error:
        return _err(reason, error)
    return _ok(data)


@barber_bp.patch("/appointments/<int:appointment_id>/accept")
@login_required
@role_required(["barber"])
def accept_appointment(appointment_id: int):
    """PATCH /barber/appointments/{appointment_id}/accept - Accept an appointment."""
    data, reason, error = services.accept_appointment(appointment_id)
    if error:
        return _err(reason, error)
    return _ok(data, f"Appointment {appointment_id} accepted.")


@barber_bp.patch("/appointments/<int:appointment_id>/reject")
@login_required
@role_required(["barber"])
def reject_appointment(appointment_id: int):
    """PATCH /barber/appointments/{appointment_id}/reject - Reject an appointment."""
    data, reason, error = services.reject_appointment(appointment_id)
    if error:
        return _err(reason, error)
    return _ok(data, f"Appointment {appointment_id} rejected.")


@barber_bp.patch("/appointments/<int:appointment_id>/reschedule")
@login_required
@role_required(["barber"])
def reschedule_appointment(appointment_id: int):
    """PATCH /barber/appointments/{appointment_id}/reschedule - Reschedule an appointment."""
    body         = request.get_json(silent=True) or {}
    new_datetime = body.get("new_datetime")

    if not new_datetime:
        return _err("bad_request", "new_datetime is required (format: YYYY-MM-DDTHH:MM:SS).")

    data, reason, error = services.reschedule_appointment(appointment_id, new_datetime)
    if error:
        return _err(reason, error)
    return _ok(data, f"Appointment {appointment_id} rescheduled to {new_datetime}.")


@barber_bp.post("/<int:barber_id>/book")
@login_required
@role_required(["barber"])
def book_appointment(barber_id: int):
    """POST /barber/{barber_id}/book - Book an appointment (barber books for client)."""
    # Verify the barber owns this profile
    barber_id_from_user = _get_barber_id_from_user()
    if barber_id_from_user != barber_id:
        return _err("forbidden", "You can only book appointments for your own profile", 403)
    
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

