from flask import Blueprint, request, jsonify
from auth.utils import login_required, get_current_user_from_token, role_required
from salon import services

salon_bp = Blueprint("salon", __name__, url_prefix="/salon")


def _ok(data, message: str = "", status: int = 200):
    """Uniform success envelope."""
    body = {"success": True, "data": data}
    if message:
        body["message"] = message
    return jsonify(body), status


def _err(reason: str, message: str, status: int = 400):
    """Uniform error envelope."""
    return jsonify({
        "success": False,
        "reason": reason,
        "message": message
    }), status


def _get_salon_id_from_user():
    """Get salon_id from current authenticated user."""
    current_user = get_current_user_from_token()
    if not current_user:
        return None
    if current_user.role != "salon":
        return None
    # Get salon profile from user
    session = None
    try:
        from backend.models.base import SessionLocal
        session = SessionLocal()
        from backend.models.user import Salon
        salon = session.query(Salon).filter(Salon.user_id == current_user.id).first()
        return salon.id if salon else None
    finally:
        if session:
            session.close()


# =============================================================================
# PUBLIC ENDPOINTS (no authentication required)
# =============================================================================

@salon_bp.route("/profile", methods=["GET"])
def get_profile():
    """GET /salon/profile - Fetch salon identity and configuration."""
    # For dummy data, we'll use query parameter or default
    owner_id = request.args.get('owner_id', 1, type=int)

    data = services.get_salon_profile(owner_id)
    if not data:
        return _err("not_found", "Salon profile not found", 404)

    salon = data['salon']
    payment_policy = data['payment_policy']
    working_hours = data['working_hours']

    response = {
        "salon_name": salon["name"],
        "address": salon["address"],
        "contact_phone": salon.get("contact_phone"),
        "contact_email": salon.get("contact_email"),
        "description": salon.get("description"),
        "active_payment_policy": None,
        "working_hours_rules": []
    }

    if payment_policy and not payment_policy.get("is_default"):
        response["active_payment_policy"] = {
            "type": payment_policy["policy_type"],
            "commission_percentage": payment_policy["commission_percentage"]
        }

    for hours in working_hours:
        response["working_hours_rules"].append({
            "day": hours["day_of_week"],
            "day_name": hours["day_name"],
            "opening": hours["opening_time"],
            "closing": hours["closing_time"],
            "is_active": hours["is_active"]
        })

    return _ok(response)


@salon_bp.route("/working-hours", methods=["GET"])
def get_working_hours():
    """GET /salon/working-hours - Return the salon's operating hours."""
    salon_id = request.args.get('salon_id', 1, type=int)

    hours = services.get_salon_working_hours(salon_id)

    if not hours:
        return _err("not_found", "No working hours found", 404)

    return _ok({
        "salon_id": salon_id,
        "opening_time": hours[0]["opening_time"] if hours else "09:00",
        "closing_time": hours[0]["closing_time"] if hours else "19:00",
        "days_of_operation": [h["day_name"] for h in hours if h["is_active"]],
        "detailed_hours": hours
    })


@salon_bp.route("/location-context", methods=["GET"])
def get_location_context():
    """GET /salon/location-context - Return location information used for bookings."""
    salon_id = request.args.get('salon_id', 1, type=int)

    location = services.get_salon_location_context(salon_id)
    if not location:
        return _err("not_found", "Salon not found", 404)

    return _ok({
        "salon_name": location['salon_name'],
        "address": location['address'],
        "city": location.get('city', ''),
        "display_text": f"At {location['salon_name']} Salon"
    })


@salon_bp.route("/barbers", methods=["GET"])
def list_barbers():
    """GET /salon/barbers - List barbers associated with salon."""
    salon_id = request.args.get('salon_id', 1, type=int)
    active_only = request.args.get('active_only', 'true').lower() == 'true'

    barbers = services.get_salon_barbers(salon_id, active_only)

    return _ok({
        "salon_id": salon_id,
        "barbers": barbers,
        "count": len(barbers),
        "active_only": active_only,
        "note": "This is collaboration control, not employment management"
    })


@salon_bp.route("/check-context", methods=["POST"])
def check_salon_context():
    """POST /salon/check-context - Check if a specific booking should use salon context."""
    data = request.get_json()

    if 'barber_id' not in data or 'appointment_datetime' not in data:
        return _err("bad_request", "barber_id and appointment_datetime required")

    is_salon_context = services.is_in_salon_context(data['barber_id'], data['appointment_datetime'])

    return _ok({
        "is_salon_context": is_salon_context,
        "barber_id": data['barber_id'],
        "appointment_datetime": data['appointment_datetime'],
        "implication": "Salon payment policy and location context apply" if is_salon_context else "Freelance rules apply"
    })


# =============================================================================
# PROTECTED ENDPOINTS (authentication + salon role required)
# =============================================================================

@salon_bp.route("/profile", methods=["PATCH"])
@login_required
@role_required(["salon"])
def update_profile():
    """PATCH /salon/profile - Update salon metadata only."""
    # Get salon for current user
    salon_id = _get_salon_id_from_user()
    if not salon_id:
        return _err("not_found", "Salon profile not found for this user", 404)
    
    data = request.get_json()

    updated = services.update_salon_profile_by_id(salon_id, data)
    if not updated:
        return _err("not_found", "Salon not found", 404)

    return _ok({
        "message": "Salon profile updated successfully",
        "salon": {
            "id": updated["id"],
            "name": updated["name"]
        }
    })


@salon_bp.route("/working-hours", methods=["PUT"])
@login_required
@role_required(["salon"])
def update_working_hours():
    """PUT /salon/working-hours - Set or update salon working hours."""
    # Get salon for current user
    salon_id = _get_salon_id_from_user()
    if not salon_id:
        return _err("not_found", "Salon profile not found for this user", 404)
    
    data = request.get_json()

    if not data or 'hours' not in data:
        return _err("bad_request", "Hours data required")

    # Validate hours data
    for hour in data['hours']:
        if 'day_of_week' not in hour or 'opening_time' not in hour or 'closing_time' not in hour:
            return _err("bad_request", "Each hour entry needs day_of_week, opening_time, closing_time")

    result = services.update_salon_working_hours(salon_id, data['hours'])
    if not result:
        return _err("bad_request", "Failed to update working hours")

    return _ok({
        "message": "Working hours updated successfully",
        "effect": "Barber availability overlapping these hours is now treated as salon context",
        "updated_hours": len(data['hours'])
    })


@salon_bp.route("/location-context", methods=["PUT"])
@login_required
@role_required(["salon"])
def update_location_context():
    """PUT /salon/location-context - Update how salon location is shown on barber bookings."""
    # Get salon for current user
    salon_id = _get_salon_id_from_user()
    if not salon_id:
        return _err("not_found", "Salon profile not found for this user", 404)
    
    data = request.get_json()

    updated = services.update_salon_location_context(salon_id, data)
    if not updated:
        return _err("not_found", "Salon not found", 404)

    return _ok({
        "message": "Location context updated successfully",
        "frontend_effect": f"Will show 'At {updated['name']} Salon' instead of freelance",
        "location": {
            "name": updated["name"],
            "address": updated["address"]
        }
    })


@salon_bp.route("/payment-policy", methods=["GET"])
@login_required
@role_required(["salon"])
def get_payment_policy():
    """GET /salon/payment-policy - Return the active payment policy."""
    # Get salon for current user
    salon_id = _get_salon_id_from_user()
    if not salon_id:
        return _err("not_found", "Salon profile not found for this user", 404)

    policy = services.get_payment_policy(salon_id)

    return _ok({
        "salon_id": salon_id,
        "policy_type": policy['policy_type'],
        "commission_percentage": policy['commission_percentage'],
        "is_default": policy.get('is_default', False),
        "note": "All bookings during salon context use this policy. Barbers do not override this."
    })


@salon_bp.route("/payment-policy", methods=["PUT"])
@login_required
@role_required(["salon"])
def update_payment_policy():
    """PUT /salon/payment-policy - Set or change the salon's payment rule."""
    # Get salon for current user
    salon_id = _get_salon_id_from_user()
    if not salon_id:
        return _err("not_found", "Salon profile not found for this user", 404)
    
    data = request.get_json()

    # Validate policy type
    valid_types = ['SALARY', 'COMMISSION', 'HYBRID']
    if 'policy_type' not in data or data['policy_type'] not in valid_types:
        return _err("bad_request", f"Valid policy_type required: {valid_types}")

    # Validate commission if provided
    if 'commission_percentage' in data:
        try:
            commission = float(data['commission_percentage'])
            if not 0 <= commission <= 100:
                return _err("bad_request", "Commission percentage must be between 0 and 100")
        except ValueError:
            return _err("bad_request", "Invalid commission percentage")

    policy = services.update_payment_policy(salon_id, data)
    if not policy:
        return _err("bad_request", "Failed to update payment policy")

    return _ok({
        "message": "Payment policy updated successfully",
        "effect": "All future bookings during salon context will use this policy",
        "policy": {
            "type": policy["policy_type"],
            "commission_percentage": policy["commission_percentage"]
        }
    })


@salon_bp.route("/barbers/invite", methods=["POST"])
@login_required
@role_required(["salon"])
def invite_barber():
    """POST /salon/barbers/invite - Invite a barber to work under salon rules."""
    # Get salon for current user
    salon_id = _get_salon_id_from_user()
    if not salon_id:
        return _err("not_found", "Salon profile not found for this user", 404)
    
    data = request.get_json()

    if 'barber_id' not in data:
        return _err("bad_request", "barber_id required")

    result = services.invite_barber_to_salon(salon_id, data['barber_id'])

    if 'error' in result:
        status_code = 409 if 'already' in result['error'] else 404
        return _err("conflict" if 'already' in result['error'] else "not_found", result['error'], status_code)

    return _ok(result, "Barber invited", 201)


@salon_bp.route("/barbers/accept", methods=["POST"])
@login_required
@role_required(["barber"])
def accept_collaboration():
    """POST /salon/barbers/accept - Barber accepts the salon's rules."""
    data = request.get_json()

    if 'salon_id' not in data or 'barber_id' not in data:
        return _err("bad_request", "salon_id and barber_id required")

    result = services.accept_barber_collaboration(data['barber_id'], data['salon_id'])

    if 'error' in result:
        return _err("not_found", result['error'], 404)

    return _ok(result)


@salon_bp.route("/barbers/remove", methods=["POST"])
@login_required
@role_required(["salon"])
def remove_barber():
    """POST /salon/barbers/remove - Stop applying salon rules to that barber."""
    # Get salon for current user
    salon_id = _get_salon_id_from_user()
    if not salon_id:
        return _err("not_found", "Salon profile not found for this user", 404)
    
    data = request.get_json()

    if 'barber_id' not in data:
        return _err("bad_request", "barber_id required")

    result = services.remove_barber_from_salon(salon_id, data['barber_id'])

    if 'error' in result:
        return _err("not_found", result['error'], 404)

    return _ok(result)


@salon_bp.route("/my-salon", methods=["GET"])
@login_required
@role_required(["salon"])
def get_my_salon():
    """GET /salon/my-salon - Get salon for currently authenticated user (owner)."""
    salon_id = _get_salon_id_from_user()
    if not salon_id:
        return _err("not_found", "You don't own a salon", 404)

    salon = services.get_salon_by_id(salon_id)
    if not salon:
        return _err("not_found", "Salon not found", 404)

    return _ok({
        "salon_id": salon["id"],
        "name": salon["name"],
        "address": salon["address"]
    })

