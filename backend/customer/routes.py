from flask import Blueprint, request, jsonify
from backend.auth.utils import login_required, get_current_user_from_token
from backend.customer import services

customer_bp = Blueprint("customer", __name__, url_prefix="/customers")


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
# PUBLIC ENDPOINTS (no authentication required)
# =============================================================================
@customer_bp.get("/barbers")
def get_barbers():
    """GET /customers/barbers - Return all barbers available in the system."""
    barbers = services.get_all_barbers()
    return _ok(barbers)


@customer_bp.get("/barbers/<int:barber_id>")
def get_barber_profile(barber_id):
    """GET /customers/barbers/{barber_id} - Return full barber profile."""
    barber = services.get_barber_profile(barber_id)
    if barber is None:
        return _err("not_found", "Barber not found", 404)
    return _ok(barber)


@customer_bp.get("/barbers/<int:barber_id>/services")
def get_barber_services(barber_id):
    """GET /customers/barbers/{barber_id}/services - Return all services offered by that barber."""
    barber_services = services.get_barber_services(barber_id)
    if barber_services is None:
        return _err("not_found", "Barber not found", 404)
    return _ok(barber_services)


@customer_bp.get("/barbers/<int:barber_id>/reviews")
def get_barber_reviews(barber_id):
    """GET /customers/barbers/{barber_id}/reviews - Return reviews written for that barber."""
    reviews = services.get_barber_reviews(barber_id)
    if reviews is None:
        return _err("not_found", "Barber not found", 404)
    return _ok(reviews)


# =============================================================================
# PROTECTED ENDPOINTS (authentication required)
# =============================================================================

@customer_bp.post("/bookings")
@login_required
def create_booking():
    """POST /customers/bookings - Create a booking."""
    data = request.get_json(silent=True) or {}
    
    barber_id = data.get("barber_id")
    service_id = data.get("service_id")
    hairstyle_id = data.get("hairstyle_id")
    appointment_datetime = data.get("appointment_datetime")
    
    if not barber_id:
        return _err("bad_request", "barber_id is required")
    if not service_id:
        return _err("bad_request", "service_id is required")
    if not appointment_datetime:
        return _err("bad_request", "appointment_datetime is required")
    
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    # Get client profile
    client = services.get_client_from_user(current_user.id)
    if not client:
        return _err("not_found", "Client profile not found")
    
    result, reason, error = services.create_booking(
        client_id=client.id,
        barber_id=barber_id,
        service_id=service_id,
        hairstyle_id=hairstyle_id,
        appointment_datetime=appointment_datetime
    )
    
    if error:
        return _err(reason, error)
    
    return _ok(result, "Booking created", 201)


@customer_bp.get("/bookings")
@login_required
def get_bookings():
    """GET /customers/bookings - Return bookings for the current client."""
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    client = services.get_client_from_user(current_user.id)
    if not client:
        return _err("not_found", "Client profile not found")
    
    bookings = services.get_client_bookings(client.id)
    return _ok(bookings)


@customer_bp.get("/bookings/<int:booking_id>")
@login_required
def get_booking_details(booking_id):
    """GET /customers/bookings/{booking_id} - Return details of a specific booking."""
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    client = services.get_client_from_user(current_user.id)
    if not client:
        return _err("not_found", "Client profile not found")
    
    booking, reason, error = services.get_booking_details(booking_id, client.id)
    
    if error:
        return _err(reason, error, 404)
    
    return _ok(booking)


@customer_bp.patch("/bookings/<int:booking_id>/cancel")
@login_required
def cancel_booking(booking_id):
    """PATCH /customers/bookings/{booking_id}/cancel - Cancel a booking."""
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    client = services.get_client_from_user(current_user.id)
    if not client:
        return _err("not_found", "Client profile not found")
    
    result, reason, error = services.cancel_booking(booking_id, client.id)
    
    if error:
        return _err(reason, error)
    
    return _ok(result, "Booking cancelled")


@customer_bp.patch("/bookings/<int:booking_id>/reschedule")
@login_required
def reschedule_booking(booking_id):
    """PATCH /customers/bookings/{booking_id}/reschedule - Change appointment time."""
    data = request.get_json(silent=True) or {}
    new_datetime = data.get("appointment_datetime")
    
    if not new_datetime:
        return _err("bad_request", "appointment_datetime is required")
    
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    client = services.get_client_from_user(current_user.id)
    if not client:
        return _err("not_found", "Client profile not found")
    
    result, reason, error = services.reschedule_booking(booking_id, client.id, new_datetime)
    
    if error:
        return _err(reason, error)
    
    return _ok(result, "Booking rescheduled")


# =============================================================================
# REVIEW ENDPOINTS
# =============================================================================

@customer_bp.post("/reviews")
@login_required
def create_review():
    """POST /customers/reviews - Create a review after a booking."""
    data = request.get_json(silent=True) or {}
    
    booking_id = data.get("booking_id")
    rating = data.get("rating")
    comment = data.get("comment")
    
    if not booking_id:
        return _err("bad_request", "booking_id is required")
    if rating is None:
        return _err("bad_request", "rating is required")
    
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    result, reason, error = services.create_review(
        client_id=current_user.id,
        booking_id=booking_id,
        rating=rating,
        comment=comment
    )
    
    if error:
        return _err(reason, error)
    
    return _ok(result, "Review created", 201)


@customer_bp.get("/reviews")
@login_required
def get_reviews():
    """GET /customers/reviews - Return reviews written by the current client."""
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    reviews = services.get_client_reviews(current_user.id)
    return _ok(reviews)


# =============================================================================
# SAVED POSTS ENDPOINT
# =============================================================================

@customer_bp.get("/saved-posts")
@login_required
def get_saved_posts():
    """GET /customers/saved-posts - Return posts saved by the client."""
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    posts = services.get_saved_posts(current_user.id)
    return _ok(posts)


# =============================================================================
# DASHBOARD ENDPOINT
# =============================================================================

@customer_bp.get("/dashboard")
@login_required
def get_dashboard():
    """GET /customers/dashboard - Return summary data."""
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    dashboard = services.get_client_dashboard(current_user.id)
    return _ok(dashboard)


# =============================================================================
# NOTIFICATIONS ENDPOINT
# =============================================================================

@customer_bp.get("/notifications")
@login_required
def get_notifications():
    """GET /customers/notifications - Return booking confirmations and reminders."""
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    notifications = services.get_notifications(current_user.id)
    return _ok(notifications)


# =============================================================================
# PROFILE ENDPOINTS
# =============================================================================

@customer_bp.get("/profile")
@login_required
def get_profile():
    """GET /customers/profile - Return current client profile."""
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    profile, reason, error = services.get_client_profile(current_user.id)
    
    if error:
        return _err(reason, error, 404)
    
    return _ok(profile)


@customer_bp.patch("/profile")
@login_required
def update_profile():
    """PATCH /customers/profile - Update profile details."""
    data = request.get_json(silent=True) or {}
    
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    profile, reason, error = services.update_client_profile(current_user.id, data)
    
    if error:
        return _err(reason, error)
    
    return _ok(profile, "Profile updated")


# =============================================================================
# CUSTOMER FEED ENDPOINTS
# =============================================================================

customer_feed_bp = Blueprint("customer_feed", __name__, url_prefix="/feed")


@customer_feed_bp.route("/", methods=["GET"])
def get_feed():
    """GET /feed - Get posts for the main feed."""
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    
    # Get user_id if authenticated
    user_id = None
    current_user = get_current_user_from_token()
    if current_user:
        user_id = current_user.id
    
    posts = services.get_feed_posts(page, limit, user_id)
    return _ok(posts)


@customer_feed_bp.route("/<int:post_id>", methods=["GET"])
def get_post(post_id):
    """GET /feed/{post_id} - Get a single post."""
    user_id = None
    current_user = get_current_user_from_token()
    if current_user:
        user_id = current_user.id
    
    post, reason, error = services.get_single_post(post_id, user_id)
    
    if error:
        return _err(reason, "Post not found", 404)
    
    return _ok(post)


@customer_feed_bp.route("/<int:post_id>/like", methods=["POST"])
@login_required
def like_post(post_id):
    """POST /feed/{post_id}/like - Like or unlike a post."""
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    result, reason, error = services.toggle_post_like(post_id, current_user.id)
    
    if error:
        return _err(reason, error)
    
    return _ok(result)


@customer_feed_bp.route("/<int:post_id>/save", methods=["POST"])
@login_required
def save_post(post_id):
    """POST /feed/{post_id}/save - Save or unsave a post."""
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    result, reason, error = services.toggle_post_save(post_id, current_user.id)
    
    if error:
        return _err(reason, error)
    
    return _ok(result)


@customer_feed_bp.route("/<int:post_id>/comments", methods=["GET"])
def get_comments(post_id):
    """GET /feed/{post_id}/comments - Get comments for a post."""
    comments = services.get_post_comments(post_id)
    
    if comments is None:
        return _err("not_found", "Post not found", 404)
    
    return _ok(comments)


@customer_feed_bp.route("/<int:post_id>/comments", methods=["POST"])
@login_required
def add_comment(post_id):
    """POST /feed/{post_id}/comments - Add a comment."""
    data = request.get_json(silent=True) or {}
    content = data.get("content")
    
    if not content:
        return _err("bad_request", "Comment content is required")
    
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    comment, reason, error = services.add_post_comment(post_id, current_user.id, content)
    
    if error:
        return _err(reason, error)
    
    return _ok(comment, "Comment added", 201)


@customer_feed_bp.route("/comments/<int:comment_id>", methods=["DELETE"])
@login_required
def delete_comment(comment_id):
    """DELETE /feed/comments/{comment_id} - Delete a comment."""
    current_user = get_current_user_from_token()
    if not current_user:
        return _err("unauthorized", "User not authenticated")
    
    result, reason, error = services.delete_comment(comment_id, current_user.id)
    
    if error:
        return _err(reason, error)
    
    return _ok(result, "Comment deleted")

