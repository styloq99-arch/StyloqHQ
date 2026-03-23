from flask import Blueprint, request, jsonify
from auth.utils import login_required, get_current_user_from_token, role_required
from feed.services import (
    fetch_feed_posts_paginated,
    fetch_single_post,
    create_post,
    delete_post,
    toggle_like,
    fetch_post_likes,
    add_comment,
    delete_comment,
    fetch_post_comments,
    toggle_save,
    fetch_saved_posts
)

feed_bp = Blueprint("feed", __name__)


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

@feed_bp.route("/", methods=["GET"], strict_slashes=False)
def get_feed():
    """GET /feed - Get posts for the main feed."""
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 5))
    barber_id = request.args.get("barber_id", type=int)
    current_user = get_current_user_from_token()
    user_id = current_user.id if current_user else None

    posts = fetch_feed_posts_paginated(page, limit, user_id, barber_id=barber_id)
    return _ok(posts)


@feed_bp.route("/<int:post_id>", methods=["GET"], strict_slashes=False)
def get_post(post_id):
    """GET /feed/{post_id} - Get a single post."""
    current_user = get_current_user_from_token()
    user_id = current_user.id if current_user else None
    post = fetch_single_post(post_id, user_id)
    return _ok(post)


@feed_bp.route("/<int:post_id>/likes", methods=["GET"], strict_slashes=False)
def view_likes(post_id):
    """GET /feed/{post_id}/likes - Get likes for a post."""
    likes = fetch_post_likes(post_id)
    return _ok({"likes": likes})


@feed_bp.route("/<int:post_id>/comments", methods=["GET"], strict_slashes=False)
def view_comments(post_id):
    """GET /feed/{post_id}/comments - Get comments for a post."""
    comments = fetch_post_comments(post_id)
    return _ok({"comments": comments})


# =============================================================================
# PROTECTED ENDPOINTS (authentication required)
# =============================================================================

@feed_bp.route("/create", methods=["POST"], strict_slashes=False)
@login_required
@role_required(["barber"])
def create_new_post():
    """POST /feed/create - Create a new post (barber only)."""
    from models.base import SessionLocal
    from models.barber import Barber
    
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    # Verify user is a barber
    if current_user.role != "barber":
        return _err("forbidden", "Only barbers can create posts", 403)
    
    # Resolve user.id to barber.id
    db = SessionLocal()
    try:
        barber = db.query(Barber).filter(Barber.user_id == current_user.id).first()
        if not barber:
            return _err("not_found", "Barber profile not found for this user", 404)
        barber_id = barber.id
    finally:
        db.close()
    
    data = request.get_json()
    caption = data.get("caption")
    image_url = data.get("image_url")

    result = create_post(barber_id, caption, image_url)
    return _ok(result, "Post created", 201)


@feed_bp.route("/<int:post_id>", methods=["DELETE"], strict_slashes=False)
@login_required
def remove_post(post_id):
    """DELETE /feed/{post_id} - Delete a post (owner only)."""
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    result = delete_post(post_id, current_user)
    if result.get("error"):
        return _err(result.get("reason", "error"), result.get("message", "Error deleting post"), 404)
    
    return _ok(result, "Post deleted")


@feed_bp.route("/<int:post_id>/like", methods=["POST"], strict_slashes=False)
@login_required
def like_post(post_id):
    """POST /feed/{post_id}/like - Like a post."""
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    result = toggle_like(post_id, current_user.id)
    if result.get("error"):
        return _err(result.get("reason", "error"), result.get("message", "Error liking post"), 400)
    
    return _ok(result)


@feed_bp.route("/<int:post_id>/comment", methods=["POST"], strict_slashes=False)
@login_required
def comment_post(post_id):
    """POST /feed/{post_id}/comment - Comment on a post."""
    data = request.get_json()
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    comment = data.get("comment")
    if not comment:
        return _err("bad_request", "Comment text is required")
    
    result = add_comment(post_id, current_user.id, comment)
    if result.get("error"):
        return _err(result.get("reason", "error"), result.get("message", "Error adding comment"), 400)
    
    return _ok(result, "Comment added", 201)


@feed_bp.route("/comment/<int:comment_id>", methods=["DELETE"], strict_slashes=False)
@login_required
def remove_comment(comment_id):
    """DELETE /feed/comment/{comment_id} - Delete a comment."""
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    result = delete_comment(comment_id, current_user.id)
    if result.get("error"):
        return _err(result.get("reason", "error"), result.get("message", "Error deleting comment"), 400)
    
    return _ok(result, "Comment deleted")


@feed_bp.route("/<int:post_id>/save", methods=["POST"], strict_slashes=False)
@login_required
def save_post(post_id):
    """POST /feed/{post_id}/save - Save a post."""
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    result = toggle_save(post_id, current_user.id)
    if result.get("error"):
        return _err(result.get("reason", "error"), result.get("message", "Error saving post"), 400)
    
    return _ok(result)


@feed_bp.route("/saved", methods=["GET"], strict_slashes=False)
@login_required
def view_saved_posts():
    """GET /feed/saved - Get saved posts for current user."""
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    posts = fetch_saved_posts(current_user.id)
    return _ok({"posts": posts})

