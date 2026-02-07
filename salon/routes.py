from flask import Blueprint, request, jsonify
from salon import services

salon_bp = Blueprint("salon", __name__)


# Salon Profile
@salon_bp.route("/profile", methods=["GET"])
def get_profile():
    """Fetch salon identity and configuration"""
    # For dummy data, we'll use query parameter or default
    owner_id = request.args.get('owner_id', 1, type=int)

    data = services.get_salon_profile(owner_id)
    if not data:
        return jsonify({"error": "Salon profile not found"}), 404

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

    return jsonify(response)


@salon_bp.route("/profile", methods=["PATCH"])
def update_profile():
    """Update salon metadata only (does not affect bookings)"""
    owner_id = request.args.get('owner_id', 1, type=int)
    data = request.get_json()

    updated = services.update_salon_profile(owner_id, data)
    if not updated:
        return jsonify({"error": "Salon not found"}), 404

    return jsonify({
        "message": "Salon profile updated successfully",
        "salon": {
            "id": updated["id"],
            "name": updated["name"]
        }
    })


# Working Hours
@salon_bp.route("/working-hours", methods=["GET"])
def get_working_hours():
    """Return the salon's operating hours"""
    salon_id = request.args.get('salon_id', 1, type=int)

    hours = services.get_salon_working_hours(salon_id)

    if not hours:
        return jsonify({"error": "No working hours found"}), 404

    return jsonify({
        "salon_id": salon_id,
        "opening_time": hours[0]["opening_time"] if hours else "09:00",
        "closing_time": hours[0]["closing_time"] if hours else "19:00",
        "days_of_operation": [h["day_name"] for h in hours if h["is_active"]],
        "detailed_hours": hours
    })


@salon_bp.route("/working-hours", methods=["PUT"])
def update_working_hours():
    """Set or update salon working hours"""
    salon_id = request.args.get('salon_id', 1, type=int)
    data = request.get_json()

    if not data or 'hours' not in data:
        return jsonify({"error": "Hours data required"}), 400

    # Validate hours data
    for hour in data['hours']:
        if 'day_of_week' not in hour or 'opening_time' not in hour or 'closing_time' not in hour:
            return jsonify({"error": "Each hour entry needs day_of_week, opening_time, closing_time"}), 400

    result = services.update_salon_working_hours(salon_id, data['hours'])
    if not result:
        return jsonify({"error": "Failed to update working hours"}), 400

    return jsonify({
        "message": "Working hours updated successfully",
        "effect": "Barber availability overlapping these hours is now treated as salon context",
        "updated_hours": len(data['hours'])
    })


# Salon Location
@salon_bp.route("/location-context", methods=["GET"])
def get_location_context():
    """Return location information used for bookings"""
    salon_id = request.args.get('salon_id', 1, type=int)

    location = services.get_salon_location_context(salon_id)
    if not location:
        return jsonify({"error": "Salon not found"}), 404

    return jsonify({
        "salon_name": location['salon_name'],
        "address": location['address'],
        "city": location.get('city', ''),
        "display_text": f"At {location['salon_name']} Salon"
    })


@salon_bp.route("/location-context", methods=["PUT"])
def update_location_context():
    """Update how salon location is shown on barber bookings"""
    salon_id = request.args.get('salon_id', 1, type=int)
    data = request.get_json()

    updated = services.update_salon_location_context(salon_id, data)
    if not updated:
        return jsonify({"error": "Salon not found"}), 404

    return jsonify({
        "message": "Location context updated successfully",
        "frontend_effect": f"Will show 'At {updated['name']} Salon' instead of freelance",
        "location": {
            "name": updated["name"],
            "address": updated["address"]
        }
    })


# Salon Paymentt
@salon_bp.route("/payment-policy", methods=["GET"])
def get_payment_policy():
    """Return the active payment policy"""
    salon_id = request.args.get('salon_id', 1, type=int)

    policy = services.get_payment_policy(salon_id)

    return jsonify({
        "salon_id": salon_id,
        "policy_type": policy['policy_type'],
        "commission_percentage": policy['commission_percentage'],
        "is_default": policy.get('is_default', False),
        "note": "All bookings during salon context use this policy. Barbers do not override this."
    })


@salon_bp.route("/payment-policy", methods=["PUT"])
def update_payment_policy():
    """Set or change the salon's payment rule"""
    salon_id = request.args.get('salon_id', 1, type=int)
    data = request.get_json()

    # Validate policy type
    valid_types = ['SALARY', 'COMMISSION', 'HYBRID']
    if 'policy_type' not in data or data['policy_type'] not in valid_types:
        return jsonify({"error": f"Valid policy_type required: {valid_types}"}), 400

    # Validate commission if provided
    if 'commission_percentage' in data:
        try:
            commission = float(data['commission_percentage'])
            if not 0 <= commission <= 100:
                return jsonify({"error": "Commission percentage must be between 0 and 100"}), 400
        except ValueError:
            return jsonify({"error": "Invalid commission percentage"}), 400

    policy = services.update_payment_policy(salon_id, data)
    if not policy:
        return jsonify({"error": "Failed to update payment policy"}), 400

    return jsonify({
        "message": "Payment policy updated successfully",
        "effect": "All future bookings during salon context will use this policy",
        "policy": {
            "type": policy["policy_type"],
            "commission_percentage": policy["commission_percentage"]
        }
    })


# Salon - Barber association
@salon_bp.route("/barbers/invite", methods=["POST"])
def invite_barber():
    """Invite a barber to work under salon rules"""
    salon_id = request.args.get('salon_id', 1, type=int)
    data = request.get_json()

    if 'barber_id' not in data:
        return jsonify({"error": "barber_id required"}), 400

    result = services.invite_barber_to_salon(salon_id, data['barber_id'])

    if 'error' in result:
        status_code = 409 if 'already' in result['error'] else 404
        return jsonify(result), status_code

    return jsonify(result), 201


@salon_bp.route("/barbers/accept", methods=["POST"])
def accept_collaboration():
    """Barber accepts the salon's rules"""
    data = request.get_json()

    if 'salon_id' not in data or 'barber_id' not in data:
        return jsonify({"error": "salon_id and barber_id required"}), 400

    result = services.accept_barber_collaboration(data['barber_id'], data['salon_id'])

    if 'error' in result:
        return jsonify(result), 404

    return jsonify(result)


@salon_bp.route("/barbers/remove", methods=["POST"])
def remove_barber():
    """Stop applying salon rules to that barber"""
    salon_id = request.args.get('salon_id', 1, type=int)
    data = request.get_json()

    if 'barber_id' not in data:
        return jsonify({"error": "barber_id required"}), 400

    result = services.remove_barber_from_salon(salon_id, data['barber_id'])

    if 'error' in result:
        return jsonify(result), 404

    return jsonify(result)


@salon_bp.route("/barbers", methods=["GET"])
def list_barbers():
    """List barbers associated with salon"""
    salon_id = request.args.get('salon_id', 1, type=int)
    active_only = request.args.get('active_only', 'true').lower() == 'true'

    barbers = services.get_salon_barbers(salon_id, active_only)

    return jsonify({
        "salon_id": salon_id,
        "barbers": barbers,
        "count": len(barbers),
        "active_only": active_only,
        "note": "This is collaboration control, not employment management"
    })


# ========== UTILITY ENDPOINTS ==========
@salon_bp.route("/check-context", methods=["POST"])
def check_salon_context():
    """
    Check if a specific booking should use salon context
    Useful for frontend to determine display/booking rules
    """
    data = request.get_json()

    if 'barber_id' not in data or 'appointment_datetime' not in data:
        return jsonify({"error": "barber_id and appointment_datetime required"}), 400

    is_salon_context = services.is_in_salon_context(data['barber_id'], data['appointment_datetime'])

    return jsonify({
        "is_salon_context": is_salon_context,
        "barber_id": data['barber_id'],
        "appointment_datetime": data['appointment_datetime'],
        "implication": "Salon payment policy and location context apply" if is_salon_context else "Freelance rules apply"
    })


@salon_bp.route("/my-salon", methods=["GET"])
def get_my_salon():
    """Get salon for currently authenticated user (owner)"""
    owner_id = request.args.get('owner_id', 1, type=int)

    salon = services.get_salon_by_owner(owner_id)
    if not salon:
        return jsonify({"error": "You don't own a salon"}), 404

    return jsonify({
        "salon_id": salon["id"],
        "name": salon["name"],
        "address": salon["address"]
    })


# Testing
@salon_bp.route("/debug/data", methods=["GET"])
def debug_data():
    """Debug endpoint to see all dummy data (remove in production)"""
    return jsonify({
        "salons": services._SALONS if hasattr(services, '_SALONS') else [],
        "working_hours": services._SALON_WORKING_HOURS if hasattr(services, '_SALON_WORKING_HOURS') else [],
        "payment_policies": services._SALON_PAYMENT_POLICIES if hasattr(services, '_SALON_PAYMENT_POLICIES') else [],
        "barber_associations": services._SALON_BARBER_ASSOCIATIONS if hasattr(services,
                                                                              '_SALON_BARBER_ASSOCIATIONS') else [],
        "note": "This is for testing only with dummy data"
    })