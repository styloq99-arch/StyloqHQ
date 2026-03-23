from sqlalchemy import func
from models.base import SessionLocal
from models.social import Post, Comment, PostLike, SavedPost
from models.user import User


def fetch_feed_posts_paginated(page=1, limit=5, current_user_id=None, barber_id=None):
    db = SessionLocal()
    try:
        query = db.query(Post)
        if barber_id:
            query = query.filter(Post.barber_id == barber_id)
        
        query = query.order_by(Post.created_at.desc())
        posts = query.offset((page - 1) * limit).limit(limit).all()

        result = []

        for post in posts:
            # Skip posts with broken barber relationships
            if not post.barber or not post.barber.user:
                continue
                
            like_count = len(post.likes)
            comment_count = len(post.comments)

            liked = False
            saved = False

            if current_user_id:
                liked = any(l.user_id == current_user_id for l in post.likes)
                saved = any(s.user_id == current_user_id for s in post.saved_by)

            result.append({
                "id": post.id,
                "barber_id": post.barber_id,
                "barberName": post.barber.user.full_name,
                "imageUrl": post.image_url,
                "caption": post.caption,
                "likes": like_count,
                "commentsCount": comment_count,
                "liked": liked,
                "saved": saved,
                "createdAt": post.created_at.isoformat()
            })

        return result
    finally:
        db.close()


def fetch_single_post(post_id, current_user_id=None):
    db = SessionLocal()
    try:
        post = db.get(Post, post_id)
        if not post:
            return None
        
        # Check for broken relationships
        if not post.barber or not post.barber.user:
            return None

        liked = False
        saved = False

        if current_user_id:
            liked = any(l.user_id == current_user_id for l in post.likes)
            saved = any(s.user_id == current_user_id for s in post.saved_by)

        return {
            "id": post.id,
            "barber_id": post.barber_id,
            "barberName": post.barber.user.full_name,
            "imageUrl": post.image_url,
            "caption": post.caption,
            "likes": len(post.likes),
            "commentsCount": len(post.comments),
            "liked": liked,
            "saved": saved,
            "createdAt": post.created_at.isoformat()
        }
    finally:
        db.close()


def create_post(barber_id, caption, image_url):
    db = SessionLocal()
    try:
        post = Post(
            barber_id=barber_id,
            caption=caption,
            image_url=image_url
        )

        db.add(post)
        db.commit()
        db.refresh(post)

        return {"message": "Post created", "post_id": post.id}
    finally:
        db.close()


def delete_post(post_id, current_user):
    db = SessionLocal()
    try:
        post = db.get(Post, post_id)
        if not post:
            return None

        if current_user.role == "admin" or (
            current_user.barber_profile and
            post.barber_id == current_user.barber_profile.id
        ):
            db.delete(post)
            db.commit()
            return {"message": "Post deleted"}

        return {"error": "Unauthorized"}
    finally:
        db.close()


def toggle_like(post_id, user_id):
    db = SessionLocal()
    try:
        existing = db.query(PostLike).filter_by(
            post_id=post_id,
            user_id=user_id
        ).first()

        if existing:
            db.delete(existing)
            db.commit()
            return {"message": "Like removed"}

        new_like = PostLike(post_id=post_id, user_id=user_id)
        db.add(new_like)
        db.commit()

        return {"message": "Post liked"}
    finally:
        db.close()


def fetch_post_likes(post_id):
    db = SessionLocal()
    try:
        likes = db.query(PostLike).filter_by(post_id=post_id).all()

        return [{
            "user_id": like.user.id,
            "username": like.user.full_name
        } for like in likes]
    finally:
        db.close()


def add_comment(post_id, user_id, text):
    if not text:
        return None

    db = SessionLocal()
    try:
        comment = Comment(
            post_id=post_id,
            user_id=user_id,
            content=text
        )

        db.add(comment)
        db.commit()
        db.refresh(comment)

        return {
            "id": comment.id,
            "content": comment.content,
            "username": comment.user.full_name,
            "createdAt": comment.created_at.isoformat()
        }
    finally:
        db.close()


def delete_comment(comment_id, current_user_id):
    db = SessionLocal()
    try:
        comment = db.get(Comment, comment_id)
        if not comment:
            return None

        if comment.user_id != current_user_id:
            return {"error": "Unauthorized"}

        db.delete(comment)
        db.commit()

        return {"message": "Comment deleted"}
    finally:
        db.close()


def fetch_post_comments(post_id):
    db = SessionLocal()
    try:
        comments = db.query(Comment) \
            .filter_by(post_id=post_id) \
            .order_by(Comment.created_at.desc()) \
            .all()

        return [{
            "id": c.id,
            "content": c.content,
            "username": c.user.full_name,
            "createdAt": c.created_at.isoformat()
        } for c in comments]
    finally:
        db.close()


def toggle_save(post_id, user_id):
    db = SessionLocal()
    try:
        existing = db.query(SavedPost).filter_by(
            post_id=post_id,
            user_id=user_id
        ).first()

        if existing:
            db.delete(existing)
            db.commit()
            return {"message": "Post unsaved"}

        saved = SavedPost(post_id=post_id, user_id=user_id)
        db.add(saved)
        db.commit()

        return {"message": "Post saved"}
    finally:
        db.close()


def fetch_saved_posts(user_id):
    db = SessionLocal()
    try:
        saved = db.query(SavedPost).filter_by(user_id=user_id).all()
        posts = [s.post for s in saved]

        return [{
            "id": post.id,
            "imageUrl": post.image_url,
            "caption": post.caption,
            "likes": len(post.likes),
            "commentsCount": len(post.comments),
            "createdAt": post.created_at.isoformat()
        } for post in posts]
    finally:
        db.close()