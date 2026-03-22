from flask import Blueprint, request, jsonify
from auth.utils import login_required, get_current_user_from_token, role_required
from .services import analyze_and_recommend
from .services import fetch_customer_retention
from .services import fetch_trending_hairstyles


ai_bp = Blueprint("ai", __name__, url_prefix="/ai")


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


# =============================================================================
# PUBLIC ENDPOINTS (no authentication required)
# =============================================================================

@ai_bp.route("/hairstyle/trending", methods=["GET"])
def get_trending_hairstyles():
    """GET /ai/hairstyle/trending - Get trending hairstyles (public)."""
    data = fetch_trending_hairstyles()
    return _ok(data)


# =============================================================================
# PROTECTED ENDPOINTS (authentication required)
# =============================================================================

@ai_bp.route("/hairstyle", methods=["POST"])
def get_hairstyle_recommendation():
    """POST /ai/hairstyle - Get hairstyle recommendation (client or barber only)."""
    if "image" not in request.files:
        return _err("bad_request", "Missing image")

    image = request.files["image"]

    try:
        result = analyze_and_recommend(image)

        return _ok({
            "faceShape": result["faceShape"],
            "recommendedStyles": result["recommendedStyles"],
            "note": "Recommendations are suggestions only"
        })
    except Exception as e:
        return _err("ai_error", f"Failed to generate recommendation: {str(e)}", 500)


@ai_bp.route("/barber/<barber_id>/retention", methods=["GET"])
@login_required
@role_required(["barber"])
def get_customer_retention(barber_id):
    """GET /ai/barber/{barber_id}/retention - Get customer retention stats (barber only)."""
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    # Verify the barber is accessing their own data
    from models.base import SessionLocal
    from models.barber import Barber
    
    session = SessionLocal()
    try:
        barber = session.query(Barber).filter(Barber.user_id == current_user.id).first()
        if not barber or str(barber.id) != str(barber_id):
            return _err("forbidden", "You can only view your own statistics", 403)
        
        data = fetch_customer_retention(barber_id)
        return _ok(data)
    finally:
        session.close()

