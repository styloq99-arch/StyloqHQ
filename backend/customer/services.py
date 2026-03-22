from sqlalchemy import func
from datetime import datetime
from models.base import SessionLocal
from models.user import User, Client
from models.barber import Barber
from models.booking import Booking, Service, Hairstyle
from models.social import Post, PostLike, SavedPost, Comment, Review


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def get_client_from_user(user_id):
    """Get client profile from user_id"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        client = db.query(Client).filter(Client.user_id == user_id).first()
        return client
    finally:
        db.close()


def get_barber_with_details(barber_id):
    """Get barber with services, posts, ratings"""
    db = SessionLocal()
    try:
        barber = db.query(Barber).filter(Barber.id == barber_id).first()
        if not barber:
            return None
        
        # Get services
        services = db.query(Service).filter(Service.barber_id == barber_id).all()
        
        # Get posts (portfolio)
        posts = db.query(Post).filter(Post.barber_id == barber_id).order_by(Post.created_at.desc()).all()
        
        # Get average rating
        reviews = db.query(Review).join(Booking).filter(Booking.barber_id == barber_id).all()
        avg_rating = 0
        total_reviews = len(reviews)
        if total_reviews > 0:
            avg_rating = sum(r.rating for r in reviews) / total_reviews
        
        # Get barber user info
        barber_user = db.query(User).filter(User.id == barber.user_id).first()
        
        return {
            "id": barber.id,
            "user_id": barber.user_id,
            "name": barber_user.full_name if barber_user else "Unknown",
            "bio": barber.bio,
            "years_experience": barber.years_experience,
            "is_verified": barber.is_verified,
            "instagram_handle": barber.instagram_handle,
            "current_location_name": barber.current_location_name,
            "services": [{
                "id": s.id,
                "name": s.name,
                "price": s.price,
                "duration_minutes": s.duration_minutes
            } for s in services],
            "portfolio_posts": [{
                "id": p.id,
                "image_url": p.image_url,
                "caption": p.caption,
                "created_at": p.created_at.isoformat()
            } for p in posts[:10]],
            "average_rating": round(avg_rating, 1),
            "total_reviews": total_reviews
        }
    finally:
        db.close()


# =============================================================================
# BARBER SERVICES
# =============================================================================

def get_all_barbers():
    """Return all barbers available in the system"""
    db = SessionLocal()
    try:
        barbers = db.query(Barber).all()
        result = []
        for barber in barbers:
            user = db.query(User).filter(User.id == barber.user_id).first()
            result.append({
                "id": barber.id,
                "user_id": barber.user_id,
                "name": user.full_name if user else "Unknown",
                "bio": barber.bio,
                "is_verified": barber.is_verified,
                "current_location_name": barber.current_location_name,
                "instagram_handle": barber.instagram_handle
            })
        return result
    finally:
        db.close()


def get_barber_profile(barber_id):
    """Return full barber profile with services, portfolio, ratings"""
    return get_barber_with_details(barber_id)


def get_barber_services(barber_id):
    """Return all services offered by a barber"""
    db = SessionLocal()
    try:
        barber = db.query(Barber).filter(Barber.id == barber_id).first()
        if not barber:
            return None
        
        services = db.query(Service).filter(Service.barber_id == barber_id).all()
        return [{
            "id": s.id,
            "name": s.name,
            "price": s.price,
            "duration_minutes": s.duration_minutes
        } for s in services]
    finally:
        db.close()


def get_barber_reviews(barber_id):
    """Return reviews written for a barber"""
    db = SessionLocal()
    try:
        barber = db.query(Barber).filter(Barber.id == barber_id).first()
        if not barber:
            return None
        
        reviews = db.query(Review).join(Booking).filter(Booking.barber_id == barber_id).all()
        result = []
        for review in reviews:
            booking = db.query(Booking).filter(Booking.id == review.booking_id).first()
            client = db.query(Client).filter(Client.id == booking.client_id).first()
            if client:
                user = db.query(User).filter(User.id == client.user_id).first()
                result.append({
                    "id": review.id,
                    "booking_id": review.booking_id,
                    "rating": review.rating,
                    "comment": review.comment,
                    "client_name": user.full_name if user else "Anonymous",
                    "created_at": review.booking.created_at.isoformat() if review.booking else None
                })
        return result
    finally:
        db.close()


# =============================================================================
# BOOKING SERVICES
# =============================================================================

def create_booking(client_id, barber_id, service_id, hairstyle_id, appointment_datetime):
    """Create a new booking"""
    db = SessionLocal()
    try:
        # Validate barber exists
        barber = db.query(Barber).filter(Barber.id == barber_id).first()
        if not barber:
            return None, "not_found", "Barber not found"
        
        # Validate service exists
        service = db.query(Service).filter(Service.id == service_id, Service.barber_id == barber_id).first()
        if not service:
            return None, "not_found", "Service not found"
        
        # Validate hairstyle if provided
        if hairstyle_id:
            hairstyle = db.query(Hairstyle).filter(Hairstyle.id == hairstyle_id).first()
            if not hairstyle:
                return None, "not_found", "Hairstyle not found"
        
        # Parse datetime
        try:
            appt_dt = datetime.fromisoformat(appointment_datetime)
        except ValueError:
            return None, "bad_request", "Invalid datetime format. Use ISO 8601"
        
        # Check for existing booking at same time
        existing = db.query(Booking).filter(
            Booking.barber_id == barber_id,
            Booking.appointment_datetime == appt_dt,
            Booking.status.in_(["Pending", "Accepted"])
        ).first()
        
        if existing:
            return None, "conflict", "Time slot already booked"
        
        # Create booking
        booking = Booking(
            client_id=client_id,
            barber_id=barber_id,
            service_id=service_id,
            hairstyle_id=hairstyle_id,
            appointment_datetime=appt_dt,
            status="Pending"
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)
        
        return {"booking_id": booking.id, "message": "Booking created"}, None, None
    except Exception as e:
        db.rollback()
        return None, "db_error", str(e)
    finally:
        db.close()


def get_client_bookings(client_id):
    """Return all bookings for a client"""
    db = SessionLocal()
    try:
        bookings = db.query(Booking).filter(Booking.client_id == client_id).order_by(Booking.appointment_datetime.desc()).all()
        result = []
        for booking in bookings:
            barber = db.query(Barber).filter(Barber.id == booking.barber_id).first()
            barber_user = db.query(User).filter(User.id == barber.user_id).first() if barber else None
            service = db.query(Service).filter(Service.id == booking.service_id).first()
            
            result.append({
                "id": booking.id,
                "barber_id": booking.barber_id,
                "barber_name": barber_user.full_name if barber_user else "Unknown",
                "service_id": booking.service_id,
                "service_name": service.name if service else "Unknown",
                "hairstyle_id": booking.hairstyle_id,
                "appointment_datetime": booking.appointment_datetime.isoformat(),
                "status": booking.status
            })
        return result
    finally:
        db.close()


def get_booking_details(booking_id, client_id):
    """Return details of a specific booking"""
    db = SessionLocal()
    try:
        booking = db.query(Booking).filter(Booking.id == booking_id, Booking.client_id == client_id).first()
        if not booking:
            return None, "not_found", "Booking not found"
        
        barber = db.query(Barber).filter(Barber.id == booking.barber_id).first()
        barber_user = db.query(User).filter(User.id == barber.user_id).first() if barber else None
        service = db.query(Service).filter(Service.id == booking.service_id).first()
        
        return {
            "id": booking.id,
            "barber_id": booking.barber_id,
            "barber_name": barber_user.full_name if barber_user else "Unknown",
            "service_id": booking.service_id,
            "service_name": service.name if service else "Unknown",
            "service_price": service.price if service else 0,
            "hairstyle_id": booking.hairstyle_id,
            "appointment_datetime": booking.appointment_datetime.isoformat(),
            "status": booking.status
        }, None, None
    finally:
        db.close()


def cancel_booking(booking_id, client_id):
    """Cancel a booking"""
    db = SessionLocal()
    try:
        booking = db.query(Booking).filter(Booking.id == booking_id, Booking.client_id == client_id).first()
        if not booking:
            return None, "not_found", "Booking not found"
        
        if booking.status in ["Cancelled", "Completed"]:
            return None, "bad_request", f"Cannot cancel booking with status: {booking.status}"
        
        booking.status = "Cancelled"
        db.commit()
        
        return {"message": "Booking cancelled"}, None, None
    except Exception as e:
        db.rollback()
        return None, "db_error", str(e)
    finally:
        db.close()


def reschedule_booking(booking_id, client_id, new_datetime):
    """Reschedule a booking"""
    db = SessionLocal()
    try:
        booking = db.query(Booking).filter(Booking.id == booking_id, Booking.client_id == client_id).first()
        if not booking:
            return None, "not_found", "Booking not found"
        
        if booking.status in ["Cancelled", "Completed"]:
            return None, "bad_request", f"Cannot reschedule booking with status: {booking.status}"
        
        # Parse new datetime
        try:
            new_dt = datetime.fromisoformat(new_datetime)
        except ValueError:
            return None, "bad_request", "Invalid datetime format"
        
        # Check for conflicts
        existing = db.query(Booking).filter(
            Booking.barber_id == booking.barber_id,
            Booking.appointment_datetime == new_dt,
            Booking.id != booking_id,
            Booking.status.in_(["Pending", "Accepted"])
        ).first()
        
        if existing:
            return None, "conflict", "Time slot already booked"
        
        booking.appointment_datetime = new_dt
        booking.status = "Rescheduled"
        db.commit()
        
        return {"message": "Booking rescheduled", "new_datetime": new_dt.isoformat()}, None, None
    except Exception as e:
        db.rollback()
        return None, "db_error", str(e)
    finally:
        db.close()


# =============================================================================
# REVIEW SERVICES
# =============================================================================

def create_review(client_id, booking_id, rating, comment):
    """Create a review after a booking"""
    db = SessionLocal()
    try:
        # Find client
        client = db.query(Client).filter(Client.user_id == client_id).first()
        if not client:
            return None, "not_found", "Client profile not found"
        
        # Validate booking
        booking = db.query(Booking).filter(Booking.id == booking_id, Booking.client_id == client.id).first()
        if not booking:
            return None, "not_found", "Booking not found"
        
        if booking.status != "Completed":
            return None, "bad_request", "Can only review completed bookings"
        
        # Check if review already exists
        existing = db.query(Review).filter(Review.booking_id == booking_id).first()
        if existing:
            return None, "conflict", "Review already exists for this booking"
        
        # Validate rating
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return None, "bad_request", "Rating must be between 1 and 5"
        
        # Create review
        review = Review(
            booking_id=booking_id,
            rating=rating,
            comment=comment
        )
        db.add(review)
        db.commit()
        db.refresh(review)
        
        return {"message": "Review created", "review_id": review.id}, None, None
    except Exception as e:
        db.rollback()
        return None, "db_error", str(e)
    finally:
        db.close()


def get_client_reviews(client_id):
    """Return reviews written by the current client"""
    db = SessionLocal()
    try:
        client = db.query(Client).filter(Client.user_id == client_id).first()
        if not client:
            return []
        
        reviews = db.query(Review).join(Booking).filter(Booking.client_id == client.id).all()
        result = []
        for review in reviews:
            booking = db.query(Booking).filter(Booking.id == review.booking_id).first()
            barber = db.query(Barber).filter(Barber.id == booking.barber_id).first()
            barber_user = db.query(User).filter(User.id == barber.user_id).first() if barber else None
            service = db.query(Service).filter(Service.id == booking.service_id).first()
            
            result.append({
                "id": review.id,
                "booking_id": review.booking_id,
                "barber_name": barber_user.full_name if barber_user else "Unknown",
                "service_name": service.name if service else "Unknown",
                "rating": review.rating,
                "comment": review.comment,
                "created_at": booking.appointment_datetime.isoformat()
            })
        return result
    finally:
        db.close()


# =============================================================================
# SOCIAL FEED SERVICES
# =============================================================================

def get_feed_posts(page=1, limit=10, user_id=None):
    """Get posts for the main feed"""
    db = SessionLocal()
    try:
        posts = db.query(Post).order_by(Post.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
        result = []
        for post in posts:
            barber = db.query(Barber).filter(Barber.id == post.barber_id).first()
            barber_user = db.query(User).filter(User.id == barber.user_id).first() if barber else None
            
            liked = False
            saved = False
            if user_id:
                try:
                    liked = db.query(PostLike).filter(PostLike.post_id == post.id, PostLike.user_id == user_id).first() is not None
                except Exception:
                    db.rollback()
                    liked = False
                try:
                    saved = db.query(SavedPost).filter(SavedPost.post_id == post.id, SavedPost.user_id == user_id).first() is not None
                except Exception:
                    db.rollback()
                    saved = False
            
            # Use explicit COUNT queries for reliable counts
            try:
                likes_count = db.query(PostLike).filter(PostLike.post_id == post.id).count()
            except Exception:
                db.rollback()
                likes_count = 0
            try:
                comments_count = db.query(Comment).filter(Comment.post_id == post.id).count()
            except Exception:
                db.rollback()
                comments_count = 0

            result.append({
                "id": post.id,
                "barber_id": post.barber_id,
                "barber_name": barber_user.full_name if barber_user else "Unknown",
                "image_url": post.image_url,
                "caption": post.caption,
                "likes": likes_count,
                "comments_count": comments_count,
                "liked": liked,
                "saved": saved,
                "created_at": post.created_at.isoformat()
            })
        return result
    finally:
        db.close()


def get_single_post(post_id, user_id=None):
    """Get a single post"""
    db = SessionLocal()
    try:
        post = db.query(Post).filter(Post.id == post_id).first()
        if not post:
            return None, "not_found", "Post not found"
        
        barber = db.query(Barber).filter(Barber.id == post.barber_id).first()
        barber_user = db.query(User).filter(User.id == barber.user_id).first() if barber else None
        
        liked = False
        saved = False
        if user_id:
            try:
                liked = db.query(PostLike).filter(PostLike.post_id == post.id, PostLike.user_id == user_id).first() is not None
            except Exception:
                db.rollback()
                liked = False
            try:
                saved = db.query(SavedPost).filter(SavedPost.post_id == post.id, SavedPost.user_id == user_id).first() is not None
            except Exception:
                db.rollback()
                saved = False
        
        try:
            likes_count = len(post.likes)
        except Exception:
            db.rollback()
            likes_count = 0
        try:
            comments_count = len(post.comments)
        except Exception:
            db.rollback()
            comments_count = 0

        return {
            "id": post.id,
            "barber_id": post.barber_id,
            "barber_name": barber_user.full_name if barber_user else "Unknown",
            "image_url": post.image_url,
            "caption": post.caption,
            "likes": likes_count,
            "comments_count": comments_count,
            "liked": liked,
            "saved": saved,
            "created_at": post.created_at.isoformat()
        }, None, None
    finally:
        db.close()


def create_post(barber_id, caption, image_url):
    """Create a new post for a barber"""
    db = SessionLocal()
    try:
        post = Post(
            barber_id=barber_id,
            caption=caption,
            image_url=image_url or ""
        )
        db.add(post)
        db.commit()
        db.refresh(post)
        return {"post_id": post.id, "message": "Post created"}, None, None
    except Exception as e:
        db.rollback()
        return None, "db_error", str(e)
    finally:
        db.close()


def toggle_post_like(post_id, user_id):
    """Like or unlike a post"""
    db = SessionLocal()
    try:
        post = db.query(Post).filter(Post.id == post_id).first()
        if not post:
            return None, "not_found", "Post not found"
        
        existing = db.query(PostLike).filter(PostLike.post_id == post_id, PostLike.user_id == user_id).first()
        
        if existing:
            db.delete(existing)
            db.commit()
            return {"message": "Post unliked"}, None, None
        
        new_like = PostLike(post_id=post_id, user_id=user_id)
        db.add(new_like)
        db.commit()
        
        return {"message": "Post liked"}, None, None
    except Exception as e:
        db.rollback()
        return None, "db_error", str(e)
    finally:
        db.close()


def toggle_post_save(post_id, user_id):
    """Save or unsave a post"""
    db = SessionLocal()
    try:
        post = db.query(Post).filter(Post.id == post_id).first()
        if not post:
            return None, "not_found", "Post not found"
        
        existing = db.query(SavedPost).filter(SavedPost.post_id == post_id, SavedPost.user_id == user_id).first()
        
        if existing:
            db.delete(existing)
            db.commit()
            return {"message": "Post unsaved"}, None, None
        
        saved = SavedPost(post_id=post_id, user_id=user_id)
        db.add(saved)
        db.commit()
        
        return {"message": "Post saved"}, None, None
    except Exception as e:
        db.rollback()
        return None, "db_error", str(e)
    finally:
        db.close()


def get_post_comments(post_id):
    """Get comments for a post"""
    db = SessionLocal()
    try:
        post = db.query(Post).filter(Post.id == post_id).first()
        if not post:
            return None, "not_found", "Post not found"
        
        comments = db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.desc()).all()
        result = []
        for comment in comments:
            user = db.query(User).filter(User.id == comment.user_id).first()
            result.append({
                "id": comment.id,
                "user_id": comment.user_id,
                "username": user.full_name if user else "Unknown",
                "content": comment.content,
                "created_at": comment.created_at.isoformat()
            })
        return result
    finally:
        db.close()


def add_post_comment(post_id, user_id, content):
    """Add a comment to a post"""
    db = SessionLocal()
    try:
        post = db.query(Post).filter(Post.id == post_id).first()
        if not post:
            return None, "not_found", "Post not found"
        
        if not content or not content.strip():
            return None, "bad_request", "Comment content is required"
        
        comment = Comment(post_id=post_id, user_id=user_id, content=content.strip())
        db.add(comment)
        db.commit()
        db.refresh(comment)
        
        user = db.query(User).filter(User.id == user_id).first()
        return {
            "id": comment.id,
            "user_id": comment.user_id,
            "username": user.full_name if user else "Unknown",
            "content": comment.content,
            "created_at": comment.created_at.isoformat()
        }, None, None
    except Exception as e:
        db.rollback()
        return None, "db_error", str(e)
    finally:
        db.close()


def delete_comment(comment_id, user_id):
    """Delete a comment"""
    db = SessionLocal()
    try:
        comment = db.query(Comment).filter(Comment.id == comment_id, Comment.user_id == user_id).first()
        if not comment:
            return None, "not_found", "Comment not found or unauthorized"
        
        db.delete(comment)
        db.commit()
        
        return {"message": "Comment deleted"}, None, None
    except Exception as e:
        db.rollback()
        return None, "db_error", str(e)
    finally:
        db.close()


# =============================================================================
# SAVED POSTS SERVICES
# =============================================================================

def get_saved_posts(user_id):
    """Return posts saved by the client"""
    db = SessionLocal()
    try:
        saved = db.query(SavedPost).filter(SavedPost.user_id == user_id).order_by(SavedPost.created_at.desc()).all()
        result = []
        for s in saved:
            post = db.query(Post).filter(Post.id == s.post_id).first()
            if post:
                barber = db.query(Barber).filter(Barber.id == post.barber_id).first()
                barber_user = db.query(User).filter(User.id == barber.user_id).first() if barber else None
                
                result.append({
                    "id": post.id,
                    "barber_id": post.barber_id,
                    "barber_name": barber_user.full_name if barber_user else "Unknown",
                    "image_url": post.image_url,
                    "caption": post.caption,
                    "likes": len(post.likes),
                    "comments_count": len(post.comments),
                    "saved_at": s.created_at.isoformat()
                })
        return result
    finally:
        db.close()


# =============================================================================
# DASHBOARD SERVICES
# =============================================================================

def get_client_dashboard(user_id):
    """Return summary data for client dashboard"""
    db = SessionLocal()
    try:
        client = db.query(Client).filter(Client.user_id == user_id).first()
        if not client:
            return {"upcoming_bookings": [], "saved_styles": [], "recent_posts": []}
        
        # Upcoming bookings
        upcoming = db.query(Booking).filter(
            Booking.client_id == client.id,
            Booking.appointment_datetime >= datetime.now(),
            Booking.status.in_(["Pending", "Accepted"])
        ).order_by(Booking.appointment_datetime).limit(5).all()
        
        upcoming_result = []
        for booking in upcoming:
            barber = db.query(Barber).filter(Barber.id == booking.barber_id).first()
            barber_user = db.query(User).filter(User.id == barber.user_id).first() if barber else None
            service = db.query(Service).filter(Service.id == booking.service_id).first()
            
            upcoming_result.append({
                "id": booking.id,
                "barber_name": barber_user.full_name if barber_user else "Unknown",
                "service_name": service.name if service else "Unknown",
                "appointment_datetime": booking.appointment_datetime.isoformat()
            })
        
        # Saved posts (as saved styles)
        saved = db.query(SavedPost).filter(SavedPost.user_id == user_id).order_by(SavedPost.created_at.desc()).limit(10).all()
        saved_result = []
        for s in saved:
            post = db.query(Post).filter(Post.id == s.post_id).first()
            if post:
                saved_result.append({
                    "id": post.id,
                    "image_url": post.image_url,
                    "caption": post.caption
                })
        
        # Recent posts from feed
        recent = db.query(Post).order_by(Post.created_at.desc()).limit(10).all()
        recent_result = []
        for post in recent:
            barber = db.query(Barber).filter(Barber.id == post.barber_id).first()
            barber_user = db.query(User).filter(User.id == barber.user_id).first() if barber else None
            
            recent_result.append({
                "id": post.id,
                "barber_id": post.barber_id,
                "barber_name": barber_user.full_name if barber_user else "Unknown",
                "image_url": post.image_url,
                "caption": post.caption
            })
        
        return {
            "upcoming_bookings": upcoming_result,
            "saved_styles": saved_result,
            "recent_posts": recent_result
        }
    finally:
        db.close()


# =============================================================================
# NOTIFICATION SERVICES
# =============================================================================

def get_notifications(user_id):
    """Return booking confirmations and reminders"""
    db = SessionLocal()
    try:
        from backend.models.social import Notification
        notifications = db.query(Notification).filter(
            Notification.user_id == user_id
        ).order_by(Notification.id.desc()).limit(50).all()
        
        result = []
        for notif in notifications:
            result.append({
                "id": notif.id,
                "message": notif.message,
                "is_read": notif.is_read,
                "created_at": notif.created_at.isoformat() if hasattr(notif, 'created_at') else None
            })
        return result
    finally:
        db.close()


# =============================================================================
# PROFILE SERVICES
# =============================================================================

def get_client_profile(user_id):
    """Return current client profile"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None, "not_found", "User not found"
        
        client = db.query(Client).filter(Client.user_id == user_id).first()
        
        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "phone_number": user.phone_number,
            "hair_type": client.hair_type if client else None,
            "face_shape": client.face_shape if client else None
        }, None, None
    finally:
        db.close()


def update_client_profile(user_id, data):
    """Update client profile details"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None, "not_found", "User not found"
        
        # Update user fields
        if "full_name" in data:
            user.full_name = data["full_name"]
        if "phone_number" in data:
            user.phone_number = data["phone_number"]
        
        # Update or create client profile
        client = db.query(Client).filter(Client.user_id == user_id).first()
        if not client:
            client = Client(user_id=user_id)
            db.add(client)
        
        if "hair_type" in data:
            client.hair_type = data["hair_type"]
        if "face_shape" in data:
            client.face_shape = data["face_shape"]
        
        db.commit()
        db.refresh(user)
        
        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "phone_number": user.phone_number,
            "hair_type": client.hair_type,
            "face_shape": client.face_shape
        }, None, None
    except Exception as e:
        db.rollback()
        return None, "db_error", str(e)
    finally:
        db.close()

