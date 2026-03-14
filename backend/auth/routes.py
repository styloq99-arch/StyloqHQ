from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

from backend.auth.utils import generate_token, login_required, get_current_user
from backend.models.user import User, Client, Salon
from backend.models.barber import Barber
from backend.models.base import SessionLocal

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

@auth_bp.route("/login", methods=["POST"])
def login():
    """POST /auth/login - Login with email and password.
    
    Request body:
    {
        "email": "user@example.com",
        "password": "password123"
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "token": "eyJ...",
            "user": {
                "id": 1,
                "email": "user@example.com",
                "full_name": "John Doe",
                "role": "barber|client|salon"
            }
        }
    }
    """
    data = request.get_json(silent=True) or {}
    
    email = data.get("email")
    password = data.get("password")
    
    # Validate required fields
    if not email:
        return _err("bad_request", "Email is required")
    if not password:
        return _err("bad_request", "Password is required")
    
    session = SessionLocal()
    try:
        # Look up user by email
        user = session.query(User).filter(User.email == email).first()
        
        if not user:
            return _err("not_found", "User not found with this email", 404)
        
        # Verify password using secure hash comparison
        if not user.password_hash:
            return _err("auth_error", "Password not set for this user")
        
        if not check_password_hash(user.password_hash, password):
            return _err("auth_error", "Invalid password")
        
        # Generate JWT token for authenticated user
        token = generate_token(user.id, user.role)
        
        return _ok({
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role
            }
        }, "Login successful")
    
    finally:
        session.close()


@auth_bp.route("/me", methods=["GET"])
@login_required
def get_current_user_info():
    """GET /auth/me - Get current authenticated user info.
    
    Headers: Authorization: Bearer <token>
    
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


@auth_bp.route("/register", methods=["POST"])
def register():
    """POST /auth/register - Register a new user.
    
    Request body:
    {
        "email": "user@example.com",
        "password": "password123",
        "full_name": "John Doe",
        "role": "barber|client|salon",
        "phone_number": "+1234567890"
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "token": "eyJ...",
            "user": {
                "id": 1,
                "email": "user@example.com",
                "full_name": "John Doe",
                "role": "barber|client|salon"
            }
        }
    }
    """
    data = request.get_json(silent=True) or {}
    
    email = data.get("email")
    password = data.get("password")
    full_name = data.get("full_name")
    role = data.get("role")
    phone_number = data.get("phone_number")
    
    # Validate required fields
    if not email:
        return _err("bad_request", "Email is required")
    if not password:
        return _err("bad_request", "Password is required")
    if not full_name:
        return _err("bad_request", "Full name is required")
    if not role:
        return _err("bad_request", "Role is required")
    
    # Validate role
    valid_roles = ["barber", "client", "salon"]
    if role not in valid_roles:
        return _err("bad_request", f"Role must be one of: {', '.join(valid_roles)}")
    
    session = SessionLocal()
    try:
        # Check if user with this email already exists
        existing_user = session.query(User).filter(User.email == email).first()
        if existing_user:
            return _err("conflict", "User with this email already exists", 409)
        
        # Create new user with securely hashed password
        password_hash = generate_password_hash(password)
        
        new_user = User(
            email=email,
            password_hash=password_hash,
            full_name=full_name,
            role=role,
            phone_number=phone_number
        )
        
        session.add(new_user)
        session.commit()
        
        # Create role-specific profile based on user role
        if role == "client":
            client = Client(user_id=new_user.id)
            session.add(client)
        elif role == "barber":
            barber = Barber(user_id=new_user.id)
            session.add(barber)
        elif role == "salon":
            salon = Salon(user_id=new_user.id)
            session.add(salon)
        
        session.commit()
        
        # Generate token for the newly registered user
        token = generate_token(new_user.id, new_user.role)
        
        return _ok({
            "token": token,
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "full_name": new_user.full_name,
                "role": new_user.role
            }
        }, "Registration successful", 201)
    
    except Exception as e:
        session.rollback()
        return _err("db_error", f"Failed to register user: {str(e)}", 500)
    finally:
        session.close()

