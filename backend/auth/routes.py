from flask import Blueprint, request, jsonify

from auth.utils import login_required, get_current_user
from models.user import User, Client, Salon
from models.barber import Barber
from models.base import SessionLocal

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

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
# AUTHENTICATION ENDPOINTS
# =============================================================================

# NOTE: Local login and register endpoints were removed.
# The application now uses Supabase Authentication exclusively.
# Users authenticate on the frontend, and the backend verifies the Supabase token and auto-syncs the user profiles

@auth_bp.route("/me", methods=["GET"])
@login_required
def get_current_user_info():
    """GET /auth/me - Get current authenticated user info.
    
    Headers: Authorization: Bearer <Supabase JWT string>
    
    Returns user profile information for the currently authenticated user.
    """
    user = get_current_user()
    
    return _ok({
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "phone_number": user.phone_number
    })
