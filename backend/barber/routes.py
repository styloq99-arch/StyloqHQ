from flask import Blueprint, request, jsonify

from barber.services import (
    get_barber_profile,
    update_barber_profile,
    update_location,
    manage_availability,
    update_availability,
    get_availability,
    add_portfolio_item,
    delete_portfolio_item,
    get_portfolio,
    create_post,
    get_my_posts,
    view_barber_appointments,
    handle_booking_request,
    accept_appointment,
    reject_appointment,
    reschedule_appointment,
    change_booking_status,
)

barber_bp = Blueprint("barber", __name__)


# =============================================================================
# HELPERS
# =============================================================================

def _respond(result, created=False):
    """
    Unified response helper matching project convention.
    - None         → 404
    - {"error":..} → 400 or 409 depending on "reason" key
    - anything else → 200 / 201
    """
    if result is None:
        return jsonify({"error": "Not found"}), 404

    if isinstance(result, dict) and "error" in result:
        reason = result.get("reason")
        status = 409 if reason == "conflict" else \
                 400 if reason == "unavailable" else 400
        return jsonify(result), status

    return jsonify(result), 201 if created else 200


# =============================================================================
# PROFILE ROUTES
# =============================================================================

@barber_bp.route("/<int:barber_id>/profile", methods=["GET"])
def get_profile(barber_id):
    result = get_barber_profile(barber_id)
    return _respond(result)


@barber_bp.route("/<int:barber_id>/profile", methods=["PUT"])
def update_profile(barber_id):
    data   = request.get_json() or {}
    result = update_barber_profile(barber_id, data)
    return _respond(result)


@barber_bp.route("/<int:barber_id>/location", methods=["PUT"])
def update_barber_location(barber_id):
    data   = request.get_json() or {}
    result = update_location(barber_id, data)
    return _respond(result)


# =============================================================================
# AVAILABILITY ROUTES
# =============================================================================

@barber_bp.route("/<int:barber_id>/availability", methods=["PUT"])
def set_availability(barber_id):
    """
    Body: { "availability": [ { "day_of_week": 0, "start_time": "09:00", "end_time": "17:00" } ] }
    Replaces all existing slots. Send [] to clear.
    """
    data   = request.get_json() or {}
    slots  = data.get("availability")

    if slots is None:
        return jsonify({"error": "availability array is required."}), 400

    result = update_availability(barber_id, slots)
    return _respond(result)


@barber_bp.route("/<int:barber_id>/availability", methods=["GET"])
def get_barber_availability(barber_id):
    result = get_availability(barber_id)
    return _respond(result)


# =============================================================================
# PORTFOLIO ROUTES
# =============================================================================

@barber_bp.route("/<int:barber_id>/portfolio", methods=["POST"])
def create_portfolio_item(barber_id):
    """Body: { "image_url": "https://...", "description": "..." }"""
    data        = request.get_json() or {}
    image_url   = data.get("image_url")
    description = data.get("description")

    if not image_url:
        return jsonify({"error": "image_url is required."}), 400

    result = add_portfolio_item(barber_id, image_url, description)
    return _respond(result, created=True)


@barber_bp.route("/<int:barber_id>/portfolio/<int:portfolio_id>", methods=["DELETE"])
def remove_portfolio_item(barber_id, portfolio_id):
    result = delete_portfolio_item(barber_id, portfolio_id)
    return _respond(result)


@barber_bp.route("/<int:barber_id>/portfolio", methods=["GET"])
def list_portfolio(barber_id):
    result = get_portfolio(barber_id)
    return _respond(result)


# =============================================================================
# SOCIAL ROUTES
# =============================================================================

@barber_bp.route("/<int:barber_id>/posts", methods=["POST"])
def new_post(barber_id):
    """Body: { "content": "..." }"""
    data    = request.get_json() or {}
    content = data.get("content")

    if not content:
        return jsonify({"error": "content is required."}), 400

    result = create_post(barber_id, content)
    return _respond(result, created=True)


@barber_bp.route("/<int:barber_id>/posts", methods=["GET"])
def list_posts(barber_id):
    result = get_my_posts(barber_id)
    return _respond(result)


# =============================================================================
# APPOINTMENT ROUTES
# =============================================================================

@barber_bp.route("/<int:barber_id>/appointments", methods=["GET"])
def list_appointments(barber_id):
    result = view_barber_appointments(barber_id)
    return _respond(result)


@barber_bp.route("/appointments/<int:booking_id>/accept", methods=["PATCH"])
def accept_booking(booking_id):
    result = accept_appointment(booking_id)
    return _respond(result)


@barber_bp.route("/appointments/<int:booking_id>/reject", methods=["PATCH"])
def reject_booking(booking_id):
    result = reject_appointment(booking_id)
    return _respond(result)


@barber_bp.route("/appointments/<int:booking_id>/reschedule", methods=["PATCH"])
def reschedule_booking(booking_id):
    """Body: { "new_datetime": "2026-03-01T10:00:00" }"""
    data         = request.get_json() or {}
    new_datetime = data.get("new_datetime")

    if not new_datetime:
        return jsonify({"error": "new_datetime is required."}), 400

    result = reschedule_appointment(booking_id, new_datetime)
    return _respond(result)


@barber_bp.route("/<int:barber_id>/book", methods=["POST"])
def book_appointment(barber_id):
    """
    Body: { "client_id": 1, "appointment_datetime": "2026-02-25T15:00:00" }
    UC-003: availability check is salon-aware.
    """
    data    = request.get_json() or {}
    client_id = data.get("client_id")
    appt_dt   = data.get("appointment_datetime")

    if not client_id:
        return jsonify({"error": "client_id is required."}), 400
    if not appt_dt:
        return jsonify({"error": "appointment_datetime is required."}), 400

    result = handle_booking_request(barber_id, client_id, appt_dt)
    return _respond(result, created=True)