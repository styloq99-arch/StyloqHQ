import os
import jwt
from functools import wraps
from flask import request, jsonify, g
from datetime import datetime, timedelta

from backend.models.user import User
from backend.models.base import SessionLocal


# JWT Configuration
# For production: Set JWT_SECRET_KEY environment variable
# For development: Uses a default key with warning

def _get_jwt_secret():
    """Get JWT secret key from environment variable or use development fallback."""
    import warnings
    
    secret = os.environ.get("JWT_SECRET_KEY")
    
    if not secret:
        # Development fallback - show warning
        warnings.warn(
            "JWT_SECRET_KEY not set! Using insecure default key for DEVELOPMENT only. "
            "Set JWT_SECRET_KEY environment variable for production.",
            UserWarning
        )
        return "dev-secret-key-change-in-production"
    
    return secret


# Initialize JWT secret key
JWT_SECRET_KEY = _get_jwt_secret()

JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24


def generate_token(user_id: int, role: str) -> str:
    """Generate a JWT token for a user.
    
    Args:
        user_id: The user's ID.
        role: The user's role (barber, client, or salon).
    
    Returns:
        JWT token string.
    """
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.utcnow()
    }
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token


def verify_token(token: str) -> dict:
    """Verify a JWT token and return the payload.
    
    Args:
        token: The JWT token string.
    
    Returns:
        Dictionary containing the token payload.
    
    Raises:
        ValueError: If token is expired or invalid.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")


def _parse_authorization_header():
    """Parse the Authorization header to extract the token.
    
    Expected format: "Bearer <token>"
    
    Returns:
        Tuple of (token, error_response). 
        error_response is None if parsing is successful.
    """
    auth_header = request.headers.get("Authorization")
    
    # Check if Authorization header exists
    if not auth_header:
        return None, {
            "success": False,
            "reason": "unauthorized",
            "message": "Authorization header is missing. Please provide 'Authorization: Bearer <token>'"
        }
    
    # Split the header
    parts = auth_header.split()
    
    # Check format: must be exactly 2 parts
    if len(parts) != 2:
        return None, {
            "success": False,
            "reason": "unauthorized",
            "message": "Invalid Authorization header format. Expected: 'Bearer <token>'"
        }
    
    # Check that first part is "Bearer" (case-insensitive)
    scheme = parts[0].lower()
    if scheme != "bearer":
        return None, {
            "success": False,
            "reason": "unauthorized",
            "message": "Invalid authentication scheme. Expected 'Bearer' token"
        }
    
    return parts[1], None


def get_current_user_from_token():
    """Get the current user from the JWT token in the request header.
    
    Returns:
        User object if token is valid and user exists, None otherwise.
    """
    # Parse the Authorization header
    token, error = _parse_authorization_header()
    
    if error:
        # Return None silently - caller will handle the error
        return None
    
    # Verify the token
    try:
        payload = verify_token(token)
    except ValueError:
        return None
    
    user_id = payload.get("user_id")
    
    if not user_id:
        return None
    
    # Fetch user from database
    session = SessionLocal()
    try:
        user = session.query(User).filter(User.id == user_id).first()
        return user
    finally:
        session.close()


def login_required(f):
    """Decorator to require authentication for an endpoint.
    
    This decorator checks for a valid JWT token in the Authorization header.
    If valid, sets g.current_user with the authenticated user.
    
    Usage:
        @login_required
        def protected_route():
            user = get_current_user()
            ...
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user_from_token()
        
        if not user:
            # Parse header again to get specific error message
            _, error = _parse_authorization_header()
            if error:
                return jsonify(error), 401
            
            # Generic unauthorized response
            return jsonify({
                "success": False,
                "reason": "unauthorized",
                "message": "Authentication required. Please login."
            }), 401
        
        g.current_user = user
        return f(*args, **kwargs)
    
    return decorated_function


def role_required(allowed_roles: list):
    """Decorator to require a specific role for an endpoint.
    
    This decorator checks both authentication and role authorization.
    
    Args:
        allowed_roles: List of allowed roles (e.g., ['barber', 'client', 'salon']).
    
    Usage:
        @role_required(['barber'])
        def barber_only_route():
            ...
            
        @role_required(['barber', 'salon'])
        def staff_route():
            ...
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # First check authentication
            user = get_current_user_from_token()
            
            if not user:
                _, error = _parse_authorization_header()
                if error:
                    return jsonify(error), 401
                
                return jsonify({
                    "success": False,
                    "reason": "unauthorized",
                    "message": "Authentication required. Please login."
                }), 401
            
            # Then check authorization
            if user.role not in allowed_roles:
                return jsonify({
                    "success": False,
                    "reason": "forbidden",
                    "message": f"Access denied. This endpoint requires one of these roles: {', '.join(allowed_roles)}"
                }), 403
            
            g.current_user = user
            return f(*args, **kwargs)
        
        return decorated_function
    
    return decorator


def get_current_user():
    """Get the current user from Flask's g object.
    
    This should be used within a route that has @login_required or @role_required decorator.
    
    Returns:
        User object if authenticated, None otherwise.
    """
    return getattr(g, 'current_user', None)

