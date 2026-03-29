import os
import traceback
from functools import wraps
from flask import request, jsonify, g, request
import jwt
from jwt import PyJWKClient

from models.user import User, Client, Salon
from models.barber import Barber
from models.base import SessionLocal

# ---- Supabase JWKS Configuration ----
# PyJWKClient fetches and caches the public keys from Supabase's JWKS endpoint.
# This is the ONLY correct way to verify ES256 tokens — NOT with a shared secret.
SUPABASE_JWKS_URL = "https://sbtmqbfkcswsgkjimujf.supabase.co/auth/v1/.well-known/jwks.json"
jwks_client = PyJWKClient(SUPABASE_JWKS_URL)


def _parse_authorization_header():
    """Parse the Authorization header to extract the token."""
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None, {
            "success": False,
            "reason": "unauthorized",
            "message": "Authorization header is missing. Please provide 'Authorization: Bearer <token>'"
        }

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None, {
            "success": False,
            "reason": "unauthorized",
            "message": "Invalid Authorization header format. Expected: 'Bearer <token>'"
        }

    return parts[1], None


def get_current_user_from_token():
    """
    Get the current user from the Supabase JWT in the Authorization header.
    
    How it works:
    1. PyJWKClient reads the token header to find the 'kid' (key ID)
    2. It fetches the matching EC public key from Supabase's JWKS endpoint
    3. jwt.decode() cryptographically verifies the ES256 signature using that public key
    4. We extract the user UUID from the 'sub' claim
    5. We fetch or auto-create the user in our local database
    """
    token, error = _parse_authorization_header()
    if error:
        return None

    try:
        # Step 1: Fetch the correct public key using the token's 'kid' header
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # Step 2: Verify the token signature cryptographically
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256"],
            options={"verify_aud": False}  # Supabase audience handling
        )

        # Step 3: Extract user UUID from the 'sub' claim
        user_id = payload.get("sub")
        if not user_id:
            print("TOKEN ERROR: JWT missing 'sub' claim")
            return None

        # Step 4: Fetch or auto-create user in database
        session = SessionLocal()
        try:
            user = session.query(User).filter(User.id == user_id).first()

            # --- AUTO SYNC ---
            if not user:
                user_metadata = payload.get("user_metadata", {})
                email = payload.get("email") or user_metadata.get("email", "")
                role = user_metadata.get("role") or payload.get("role") or "client"

                valid_roles = ["barber", "client", "salon"]
                if role not in valid_roles:
                    role = "client"

                new_user = User(
                    id=user_id,
                    email=email,
                    password_hash="supabase_auth_placeholder",
                    full_name=user_metadata.get("full_name", email.split("@")[0] if email else "User"),
                    role=role,
                    phone_number=user_metadata.get("phone", "")
                )
                session.add(new_user)
                session.commit()

                if role == "client":
                    session.add(Client(user_id=new_user.id))
                elif role == "barber":
                    session.add(Barber(user_id=new_user.id))
                elif role == "salon":
                    session.add(Salon(user_id=new_user.id))

                session.commit()
                user = new_user

            return user
        except Exception as db_e:
            import traceback
            print("DATABASE ERROR:")
            traceback.print_exc()
            session.rollback()
            raise
        finally:
            session.close()

    except jwt.ExpiredSignatureError:
        print("TOKEN ERROR: Token has expired")
        return None
    except jwt.InvalidTokenError as e:
        print("TOKEN VERIFICATION ERROR:", e)
        return None
    except Exception as e:
        print("UNKNOWN TOKEN ERROR:", e)
        traceback.print_exc()
        return None


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user_from_token()

        if not user:
            _, error = _parse_authorization_header()
            if error:
                return jsonify(error), 401

            return jsonify({
                "success": False,
                "reason": "unauthorized",
                "message": "Authentication required or invalid token."
            }), 401

        g.current_user = user
        return f(*args, **kwargs)

    return decorated_function


def role_required(allowed_roles: list):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = get_current_user_from_token()

            if not user:
                _, error = _parse_authorization_header()
                if error:
                    return jsonify(error), 401

                return jsonify({
                    "success": False,
                    "reason": "unauthorized",
                    "message": "Authentication required or invalid token."
                }), 401

            if user.role not in allowed_roles:
                return jsonify({
                    "success": False,
                    "reason": "forbidden",
                    "message": f"Access denied. Required roles: {', '.join(allowed_roles)}"
                }), 403

            g.current_user = user
            return f(*args, **kwargs)

        return decorated_function

    return decorator


def get_current_user():
    return getattr(g, 'current_user', None)
