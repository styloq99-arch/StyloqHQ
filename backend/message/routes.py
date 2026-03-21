from flask import Blueprint, request, jsonify
from backend.auth.utils import login_required, get_current_user_from_token
from backend.models.base import SessionLocal
from backend.models.social import Message
from backend.models.user import User
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

@message_bp.route("", methods=["GET"])
@login_required
def get_conversations():
    """Fetch distinct users the current user has chatted with, along with the latest message."""
    user = get_current_user_from_token()
    if not user:
        return _err("unauthorized", "User not logged in", 401)
        
    session = SessionLocal()
    try:
        # Get all messages where current user is sender or receiver, ordered by most recent first
        query = session.query(Message).filter(
            or_(Message.sender_id == user.id, Message.receiver_id == user.id)
        ).order_by(desc(Message.timestamp)).all()
        
        # Track unique conversation partners
        partners = {}
        for msg in query:
            partner_id = msg.receiver_id if msg.sender_id == user.id else msg.sender_id
            
            # If we haven't seen this partner yet, this is the most recent message with them
            if partner_id not in partners:
                # Fetch user details securely
                partner_user = session.query(User).filter(User.id == partner_id).first()
                if not partner_user:
                    continue
                    
                partners[partner_id] = {
                    "id": partner_user.id,
                    "name": partner_user.full_name,
                    "role": partner_user.role,
                    "last_message": {
                        "content": msg.content,
                        "timestamp": msg.timestamp.isoformat(),
                        "is_read": msg.is_read,
                        "is_mine": msg.sender_id == user.id
                    }
                }
                
        # Return as a list sorted by the latest message timestamp
        results = list(partners.values())
        results.sort(key=lambda x: x["last_message"]["timestamp"], reverse=True)
        
        return _ok(results)
    except Exception as e:
        return _err("fetch_error", str(e), 500)
    finally:
        session.close()

@message_bp.route("/<int:target_user_id>", methods=["GET"])
@login_required
def get_chat_history(target_user_id):
    """Fetch the full ordered history between the current user and the target user."""
    user = get_current_user_from_token()
    if not user:
        return _err("unauthorized", "User not logged in", 401)
        
    session = SessionLocal()
    try:
        # Before fetching all, mark unread messages as read (if we are the receiver)
        unread_msgs = session.query(Message).filter(
            and_(Message.sender_id == target_user_id, Message.receiver_id == user.id, Message.is_read == False)
        ).all()
        
        for msg in unread_msgs:
            msg.is_read = True
            
        if unread_msgs:
            session.commit()
            
        # Fetch the entire history
        history = session.query(Message).filter(
            or_(
                and_(Message.sender_id == user.id, Message.receiver_id == target_user_id),
                and_(Message.sender_id == target_user_id, Message.receiver_id == user.id)
            )
        ).order_by(Message.timestamp.asc()).all()
        
        # Format response
        result = [
            {
                "id": msg.id,
                "sender_id": msg.sender_id,
                "receiver_id": msg.receiver_id,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat(),
                "is_read": msg.is_read,
                "is_mine": msg.sender_id == user.id
            }
            for msg in history
        ]
        
        return _ok(result)
    except Exception as e:
        return _err("fetch_error", str(e), 500)
    finally:
        session.close()

@message_bp.route("/<int:target_user_id>", methods=["POST"])
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
        
        # Optionally create a notification here? (Can skip for now to keep simple)
        
        return _ok({
            "id": new_msg.id,
            "sender_id": new_msg.sender_id,
            "receiver_id": new_msg.receiver_id,
            "content": new_msg.content,
            "timestamp": new_msg.timestamp.isoformat(),
            "is_read": new_msg.is_read,
            "is_mine": True
        })
    except Exception as e:
        session.rollback()
        return _err("send_error", str(e), 500)
    finally:
        session.close()
