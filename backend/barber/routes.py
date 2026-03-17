from flask import Blueprint, request, jsonify, g

from auth.utils import role_required, get_current_user
from barber.services import (
    get_barber_profile,
    update_barber_profile,
    update_location,
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

# url_prefix is set in app.py: app.register_blueprint(barber_bp, url_prefix='/barber')
barber_bp = Blueprint("barber", __name__)


# =============================================================================
# HELPERS
# =============================================================================

def _get_barber_id_from_user():
    """
    Resolve the barber_id from the JWT-authenticated user.
    Queries Barber directly rather than accessing user.barber_profile —
    auth/utils.py closes its session before this runs, so lazy-loading
    the relationship would raise DetachedInstanceError.
    """
    from backend.models.base import SessionLocal
    from backend.models.barber import Barber

    user = get_current_user()
    if not user:
        return None

    db = SessionLocal()
    try:
        barber = db.query(Barber).filter(Barber.user_id == user.id).first()
        return barber.id if barber else None
    finally:
        db.close()


def _get_client_id_from_user():
    """
    Resolve the client_id from the JWT-authenticated user.
    Queries Client directly rather than accessing user.client_profile to
    prevent DetachedInstanceError.
    """
    from backend.models.base import SessionLocal
    from backend.models.user import Client

    user = get_current_user()
    if not user:
        return None

    db = SessionLocal()
    try:
        client = db.query(Client).filter(Client.user_id == user.id).first()
        return client.id if client else None
    finally:
        db.close()


def _owns_barber(barber_id):
    """Return True if the logged-in barber owns this barber_id."""
    return _get_barber_id_from_user() == barber_id


def _owns_booking(booking_id):
    """Return True if the logged-in barber owns this booking."""
    from backend.models.base import SessionLocal
    from backend.models.booking import Booking

    db = SessionLocal()
    try:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            return False
        return booking.barber_id == _get_barber_id_from_user()
    finally:
        db.close()


def _respond(result, created=False):
    """
    Uniform response envelope matching project convention.
      None          → 404
      {"error":...} → 409 (conflict) | 400 (all other errors)
      anything else → 200 or 201
    """
    if result is None:
        return jsonify({"error": "Not found"}), 404

    if isinstance(result, dict) and "error" in result:
        code = 409 if result.get("reason") == "conflict" else 400
        return jsonify(result), code

    return jsonify(result), 201 if created else 200


def _forbidden():
    return jsonify({
        "success": False,
        "reason":  "forbidden",
        "message": "You can only manage your own barber account.",
    }), 403


# =============================================================================
# PUBLIC ROUTES  (no auth required)
# =============================================================================

@barber_bp.route("/<int:barber_id>/profile", methods=["GET"])
def get_profile(barber_id):
    return _respond(get_barber_profile(barber_id))


@barber_bp.route("/<int:barber_id>/availability", methods=["GET"])
def get_barber_availability(barber_id):
    return _respond(get_availability(barber_id))


@barber_bp.route("/<int:barber_id>/portfolio", methods=["GET"])
def list_portfolio(barber_id):
    return _respond(get_portfolio(barber_id))


@barber_bp.route("/<int:barber_id>/posts", methods=["GET"])
def list_posts(barber_id):
    return _respond(get_my_posts(barber_id))


# =============================================================================
# PROFILE ROUTES  (barber role + ownership)
# =============================================================================

@barber_bp.route("/<int:barber_id>/profile", methods=["PUT"])
@role_required(["barber"])
def update_profile(barber_id):
    if not _owns_barber(barber_id):
        return _forbidden()
    return _respond(update_barber_profile(barber_id, request.get_json() or {}))


@barber_bp.route("/<int:barber_id>/location", methods=["PUT"])
@role_required(["barber"])
def update_barber_location(barber_id):
    if not _owns_barber(barber_id):
        return _forbidden()
    return _respond(update_location(barber_id, request.get_json() or {}))


# =============================================================================
# AVAILABILITY ROUTES  (barber role + ownership)
# =============================================================================

@barber_bp.route("/<int:barber_id>/availability", methods=["PUT"])
@role_required(["barber"])
def set_availability(barber_id):
    """
    Body: { "availability": [{ "day_of_week": 0, "start_time": "09:00", "end_time": "17:00" }] }
    Replaces all existing slots. Send [] to clear.
    """
    if not _owns_barber(barber_id):
        return _forbidden()

    data  = request.get_json() or {}
    slots = data.get("availability")
    if slots is None:
        return jsonify({"error": "availability array is required."}), 400

    return _respond(update_availability(barber_id, slots))


# =============================================================================
# PORTFOLIO ROUTES  (barber role + ownership)
# =============================================================================

@barber_bp.route("/<int:barber_id>/portfolio", methods=["POST"])
@role_required(["barber"])
def create_portfolio_item(barber_id):
    """Body: { "image_url": "https://...", "description": "..." }"""
    if not _owns_barber(barber_id):
        return _forbidden()

    data = request.get_json() or {}
    if not data.get("image_url"):
        return jsonify({"error": "image_url is required."}), 400

    return _respond(
        add_portfolio_item(barber_id, data.get("image_url"), data.get("description")),
        created=True
    )


@barber_bp.route("/<int:barber_id>/portfolio/<int:portfolio_id>", methods=["DELETE"])
@role_required(["barber"])
def remove_portfolio_item(barber_id, portfolio_id):
    if not _owns_barber(barber_id):
        return _forbidden()
    return _respond(delete_portfolio_item(barber_id, portfolio_id))


# =============================================================================
# SOCIAL ROUTES  (barber role + ownership)
# =============================================================================

@barber_bp.route("/<int:barber_id>/posts", methods=["POST"])
@role_required(["barber"])
def new_post(barber_id):
    """
    Body: { "caption": "...", "image_url": "https://..." }
    image_url is required — Post.image_url is NOT NULL in the schema.
    """
    if not _owns_barber(barber_id):
        return _forbidden()

    data = request.get_json() or {}
    if not data.get("caption"):
        return jsonify({"error": "caption is required."}), 400
    if not data.get("image_url"):
        return jsonify({"error": "image_url is required."}), 400

    return _respond(
        create_post(barber_id, data.get("caption"), data.get("image_url")),
        created=True
    )


# =============================================================================
# APPOINTMENT ROUTES
# =============================================================================

@barber_bp.route("/<int:barber_id>/appointments", methods=["GET"])
@role_required(["barber"])
def list_appointments(barber_id):
    if not _owns_barber(barber_id):
        return _forbidden()
    return _respond(view_barber_appointments(barber_id))


@barber_bp.route("/appointments/<int:booking_id>/accept", methods=["PATCH"])
@role_required(["barber"])
def accept_booking(booking_id):
    if not _owns_booking(booking_id):
        return _forbidden()
    return _respond(accept_appointment(booking_id))


@barber_bp.route("/appointments/<int:booking_id>/reject", methods=["PATCH"])
@role_required(["barber"])
def reject_booking(booking_id):
    if not _owns_booking(booking_id):
        return _forbidden()
    return _respond(reject_appointment(booking_id))


@barber_bp.route("/appointments/<int:booking_id>/reschedule", methods=["PATCH"])
@role_required(["barber"])
def reschedule_booking(booking_id):
    """Body: { "new_datetime": "2026-03-01T10:00:00" }"""
    if not _owns_booking(booking_id):
        return _forbidden()

    data = request.get_json() or {}
    if not data.get("new_datetime"):
        return jsonify({"error": "new_datetime is required."}), 400

    return _respond(reschedule_appointment(booking_id, data.get("new_datetime")))


# =============================================================================
# BOOKING ROUTE  (client role — customer books a barber)
# =============================================================================

@barber_bp.route("/<int:barber_id>/book", methods=["POST"])
@role_required(["client"])
def book_appointment(barber_id):
    """
    A client books an appointment with a barber.
    Body: { "service_id": 1, "appointment_datetime": "2026-02-25T15:00:00" }

    client_id is resolved from the JWT token — not accepted from the body
    to prevent a client booking on behalf of another client.
    """
    client_id = _get_client_id_from_user()
    if not client_id:
        return jsonify({"error": "Client profile not found."}), 403

    data = request.get_json() or {}
    if not data.get("service_id"):
        return jsonify({"error": "service_id is required."}), 400
    if not data.get("appointment_datetime"):
        return jsonify({"error": "appointment_datetime is required."}), 400

    return _respond(
        handle_booking_request(
            barber_id  = barber_id,
            client_id  = client_id,
            service_id = data.get("service_id"),
            appointment_datetime = data.get("appointment_datetime"),
        ),
        created=True
    )