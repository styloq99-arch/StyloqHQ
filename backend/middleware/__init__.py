"""
Middleware Package

Contains authentication and other middleware utilities for the Flask application.
"""

from .auth_middleware import AuthMiddleware, get_current_user, get_current_user_id, get_current_user_role

__all__ = [
    'AuthMiddleware',
    'get_current_user', 
    'get_current_user_id', 
    'get_current_user_role'
]

