from flask import Blueprint, request, jsonify
from auth.utils import login_required, get_current_user_from_token
from models.base import SessionLocal
from models.social import Message
from models.user import User
from models.barber import Barber
from sqlalchemy import or_, and_, desc
import datetime

message_bp = Blueprint("message", __name__, url_prefix="/messages")

def _ok(data, message: str = "", status: int = 200):
    body = {"success": True, "data": data}
    if message:
        body["message"] = message
    return jsonify(body), status

def _err(reason: str, message: str, status: int = 400):
    return jsonify({
        "success": False,
        "reason": reason,
        "message": message
    }), status


# ─── List all conversations ───────────────────────────────────────────────
@message_bp.route("", methods=["GET"])
@login_required
def get_conversations():
    """Fetch distinct users the current user has chatted with, along with the latest message."""
    user = get_current_user_from_token()
    if not user:
        return _err("unauthorized", "User not logged in", 401)
        
    session = SessionLocal()
    try:
        query = session.query(Message).filter(
            or_(Message.sender_id == user.id, Message.receiver_id == user.id)
        ).order_by(desc(Message.timestamp)).all()
        
        partners = {}
        for msg in query:
            partner_id = msg.receiver_id if str(msg.sender_id) == str(user.id) else msg.sender_id
            partner_key = str(partner_id)
            
            if partner_key not in partners:
                partner_user = session.query(User).filter(User.id == partner_id).first()
                if not partner_user:
                    continue
                
                # Count unread messages from this partner
                unread_count = session.query(Message).filter(
                    and_(
                        Message.sender_id == partner_id,
                        Message.receiver_id == user.id,
                        Message.is_read == False
                    )
                ).count()
                    
                partners[partner_key] = {
                    "id": str(partner_user.id),
                    "name": partner_user.full_name,
                    "role": partner_user.role,
                    "unread_count": unread_count,
                    "last_message": {
                        "content": msg.content,
                        "timestamp": msg.timestamp.isoformat(),
                        "is_read": msg.is_read,
                        "is_mine": str(msg.sender_id) == str(user.id)
                    }
                }
                
        results = list(partners.values())
        results.sort(key=lambda x: x["last_message"]["timestamp"], reverse=True)
        
        return _ok(results)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return _err("fetch_error", str(e), 500)
    finally:
        session.close()


# ─── Get chat history with a specific user ────────────────────────────────
@message_bp.route("/<target_user_id>", methods=["GET"])
@login_required
def get_chat_history(target_user_id):
    """Fetch the full ordered history between the current user and the target user."""
    user = get_current_user_from_token()
    if not user:
        return _err("unauthorized", "User not logged in", 401)
        
    session = SessionLocal()
    try:
        # Mark unread messages as read
        unread_msgs = session.query(Message).filter(
            and_(
                Message.sender_id == target_user_id,
                Message.receiver_id == user.id,
                Message.is_read == False
            )
        ).all()
        
        for msg in unread_msgs:
            msg.is_read = True
            
        if unread_msgs:
            session.commit()
            
        # Fetch entire history
        history = session.query(Message).filter(
            or_(
                and_(Message.sender_id == user.id, Message.receiver_id == target_user_id),
                and_(Message.sender_id == target_user_id, Message.receiver_id == user.id)
            )
        ).order_by(Message.timestamp.asc()).all()
        
        result = [
            {
                "id": msg.id,
                "sender_id": str(msg.sender_id),
                "receiver_id": str(msg.receiver_id),
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat(),
                "is_read": msg.is_read,
                "is_mine": str(msg.sender_id) == str(user.id)
            }
            for msg in history
        ]
        
        return _ok(result)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return _err("fetch_error", str(e), 500)
    finally:
        session.close()


# ─── Send a message ──────────────────────────────────────────────────────
@message_bp.route("/<target_user_id>", methods=["POST"])
@login_required
def send_message(target_user_id):
    """Send a new message to the target user."""
    user = get_current_user_from_token()
    if not user:
        return _err("unauthorized", "User not logged in", 401)
        
    data = request.json
    content = data.get("content", "").strip()
    
    if not content:
        return _err("validation_error", "Message content cannot be empty")
        
    session = SessionLocal()
    try:
        # Verify target user exists
        target_user = session.query(User).filter(User.id == target_user_id).first()
        if not target_user:
            return _err("not_found", "Target user does not exist", 404)
            
        new_msg = Message(
            sender_id=user.id,
            receiver_id=target_user.id,
            content=content,
            timestamp=datetime.datetime.utcnow(),
            is_read=False
        )
        
        session.add(new_msg)
        session.commit()
        session.refresh(new_msg)
        
        return _ok({
            "id": new_msg.id,
            "sender_id": str(new_msg.sender_id),
            "receiver_id": str(new_msg.receiver_id),
            "content": new_msg.content,
            "timestamp": new_msg.timestamp.isoformat(),
            "is_read": new_msg.is_read,
            "is_mine": True
        })
    except Exception as e:
        session.rollback()
        import traceback
        traceback.print_exc()
        return _err("send_error", str(e), 500)
    finally:
        session.close()


# ─── List available users to chat with ───────────────────────────────────
@message_bp.route("/contacts", methods=["GET"])
@login_required
def get_available_contacts():
    """List barbers (for customers) or clients (for barbers) available to start a chat with."""
    user = get_current_user_from_token()
    if not user:
        return _err("unauthorized", "User not logged in", 401)
    
    session = SessionLocal()
    try:
        if user.role == "client":
            # Customer: show all barbers
            barbers = session.query(Barber).all()
            contacts = []
            for barber in barbers:
                barber_user = session.query(User).filter(User.id == barber.user_id).first()
                if barber_user and str(barber_user.id) != str(user.id):
                    contacts.append({
                        "id": str(barber_user.id),
                        "name": barber_user.full_name,
                        "role": "barber",
                        "profile_image": barber.profile_image,
                        "location": barber.current_location_name,
                    })
        else:
            # Barber/Salon: show users they've chatted with + all clients
            all_users = session.query(User).filter(
                User.id != user.id,
                User.role.in_(["client", "barber", "salon"])
            ).all()
            contacts = []
            for u in all_users:
                contacts.append({
                    "id": str(u.id),
                    "name": u.full_name,
                    "role": u.role,
                    "profile_image": None,
                    "location": None,
                })
        
        return _ok(contacts)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return _err("fetch_error", str(e), 500)
    finally:
        session.close()
