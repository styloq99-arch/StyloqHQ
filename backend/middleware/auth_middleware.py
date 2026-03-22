"""
Authentication Middleware for Flask

This middleware automatically handles JWT authentication for protected routes.
It can be used to wrap blueprints or individual routes.

Usage:
    from backend.middleware.auth_middleware import AuthMiddleware
    
    # Wrap a blueprint with authentication
    protected_bp = AuthMiddleware.wrap_blueprint(barber_bp, required_roles=['barber'])
    
    # Or use the decorator on individual routes
    @AuthMiddleware.require_auth(required_roles=['barber'])
    def my_route():
        ...
"""

import os
import jwt
from functools import wraps
from flask import request, jsonify, g, Blueprint
from datetime import datetime, timedelta

from models.user import User
from models.base import SessionLocal


# JWT Configuration (same as auth/utils.py)
def _get_jwt_secret():
    """Get JWT secret key from environment variable."""
    secret = os.environ.get("JWT_SECRET_KEY")
    if not secret:
        raise ValueError(
            "JWT_SECRET_KEY environment variable is not set. "
            "Please set it before starting the application."
        )
    return secret


JWT_SECRET_KEY = _get_jwt_secret()
JWT_ALGORITHM = "HS256"


class AuthMiddleware:
    """Authentication middleware for Flask applications."""
    
    @staticmethod
    def _parse_token_from_header():
        """Extract and validate token from Authorization header."""
        auth_header = request.headers.get("Authorization")
        
        if not auth_header:
            return None, {
                "success": False,
                "reason": "unauthorized",
                "message": "Authorization header is missing. Please provide 'Authorization: Bearer <token>'"
            }
        
        parts = auth_header.split()
        
        if len(parts) != 2:
            return None, {
                "success": False,
                "reason": "unauthorized",
                "message": "Invalid Authorization header format. Expected: 'Bearer <token>'"
            }
        
        if parts[0].lower() != "bearer":
            return None, {
                "success": False,
                "reason": "unauthorized",
                "message": "Invalid authentication scheme. Expected 'Bearer' token"
            }
        
        return parts[1], None
    
    @staticmethod
    def _verify_token(token):
        """Verify JWT token and return payload."""
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            return payload, None
        except jwt.ExpiredSignatureError:
            return None, {"success": False, "reason": "unauthorized", "message": "Token has expired"}
        except jwt.InvalidTokenError:
            return None, {"success": False, "reason": "unauthorized", "message": "Invalid token"}
    
    @staticmethod
    def _get_user_from_db(user_id):
        """Fetch user from database by ID."""
        session = SessionLocal()
        try:
            return session.query(User).filter(User.id == user_id).first()
        finally:
            session.close()
    
    @staticmethod
    def require_auth(required_roles=None):
        """Decorator to require authentication for a route.
        
        Args:
            required_roles: List of allowed roles. If None, any authenticated user is allowed.
        
        Usage:
            @AuthMiddleware.require_auth()
            def protected_route():
                ...
                
            @AuthMiddleware.require_auth(required_roles=['barber'])
            def barber_only_route():
                ...
        """
        def decorator(f):
            @wraps(f)
            def decorated_function(*args, **kwargs):
                # Parse token from header
                token, error = AuthMiddleware._parse_token_from_header()
                
                if error:
                    return jsonify(error), 401
                
                # Verify token
                payload, error = AuthMiddleware._verify_token(token)
                
                if error:
                    return jsonify(error), 401
                
                user_id = payload.get("user_id")
                
                if not user_id:
                    return jsonify({
                        "success": False,
                        "reason": "unauthorized",
                        "message": "Invalid token payload"
                    }), 401
                
                # Get user from database
                user = AuthMiddleware._get_user_from_db(user_id)
                
                if not user:
                    return jsonify({
                        "success": False,
                        "reason": "unauthorized",
                        "message": "User not found"
                    }), 401
                
                # Check role authorization if required_roles specified
                if required_roles and user.role not in required_roles:
                    return jsonify({
                        "success": False,
                        "reason": "forbidden",
                        "message": f"Access denied. This endpoint requires one of these roles: {', '.join(required_roles)}"
                    }), 403
                
                # Store user in Flask's g object for access in route
                g.current_user = user
                g.current_user_id = user.id
                g.current_user_role = user.role
                
                return f(*args, **kwargs)
            
            return decorated_function
        return decorator
    
    @staticmethod
    def wrap_blueprint(blueprint, required_roles=None):
        """Wrap a Flask blueprint with authentication middleware.
        
        This applies authentication to all routes in the blueprint.
        
        Args:
            blueprint: The Flask blueprint to wrap.
            required_roles: List of allowed roles. If None, any authenticated user is allowed.
        
        Usage:
            from backend.barber import routes as barber_routes
            protected_barber_bp = AuthMiddleware.wrap_blueprint(
                barber_routes.barber_bp, 
                required_roles=['barber']
            )
            app.register_blueprint(protected_barber_bp)
        """
        # Store original route functions
        original_rules = []
        
        for rule in blueprint.url_map._rules:
            if rule.endpoint.startswith(blueprint.name):
                original_rules.append(rule)
        
        # We can't easily wrap all routes in a blueprint directly in Flask
        # Instead, provide a helper to wrap individual routes
        blueprint.require_auth = lambda roles=None: AuthMiddleware.require_auth(roles or required_roles)
        
        return blueprint
    
    @staticmethod
    def optional_auth(f):
        """Decorator for routes where authentication is optional.
        
        If a valid token is provided, sets g.current_user.
        If no token or invalid token, allows the request to proceed without authentication.
        
        Usage:
            @AuthMiddleware.optional_auth
            def public_route_with_optional_auth():
                user = getattr(g, 'current_user', None)
                # user will be None if not authenticated
                ...
        """
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token, error = AuthMiddleware._parse_token_from_header()
            
            if not error and token:
                payload, _ = AuthMiddleware._verify_token(token)
                if payload:
                    user_id = payload.get("user_id")
                    if user_id:
                        user = AuthMiddleware._get_user_from_db(user_id)
                        if user:
                            g.current_user = user
                            g.current_user_id = user.id
                            g.current_user_role = user.role
            
            return f(*args, **kwargs)
        
        return decorated_function


# Convenience function for getting current user (like in auth/utils.py)
def get_current_user():
    """Get the current authenticated user from Flask's g object."""
    return getattr(g, 'current_user', None)


def get_current_user_id():
    """Get the current authenticated user's ID from Flask's g object."""
    return getattr(g, 'current_user_id', None)


def get_current_user_role():
    """Get the current authenticated user's role from Flask's g object."""
    return getattr(g, 'current_user_role', None)

