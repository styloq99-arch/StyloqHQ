from sqlalchemy import func
from extensions import db
from models.social import Post, Comment, PostLike, SavedPost
from models.user import User


# -------------------------------------------------
# FETCH FEED POSTS (PAGINATED)
# -------------------------------------------------

def fetch_feed_posts_paginated(page=1, limit=5, current_user_id=None):

    query = Post.query.order_by(Post.created_at.desc())
    posts = query.offset((page - 1) * limit).limit(limit).all()

    result = []

    for post in posts:

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


# -------------------------------------------------
# FETCH SINGLE POST
# -------------------------------------------------

def fetch_single_post(post_id, current_user_id=None):

    post = Post.query.get(post_id)
    if not post:
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


# -------------------------------------------------
# CREATE POST
# -------------------------------------------------

def create_post(barber_id, caption, image_url):

    post = Post(
        barber_id=barber_id,
        caption=caption,
        image_url=image_url
    )

    db.session.add(post)
    db.session.commit()

    return {"message": "Post created", "post_id": post.id}


# -------------------------------------------------
# DELETE POST (BARBER OR ADMIN)
# -------------------------------------------------

def delete_post(post_id, current_user):

    post = Post.query.get(post_id)
    if not post:
        return None

    if current_user.role == "admin" or (
        current_user.barber_profile and
        post.barber_id == current_user.barber_profile.id
    ):
        db.session.delete(post)
        db.session.commit()
        return {"message": "Post deleted"}

    return {"error": "Unauthorized"}


# -------------------------------------------------
# TOGGLE LIKE
# -------------------------------------------------

def toggle_like(post_id, user_id):

    existing = PostLike.query.filter_by(
        post_id=post_id,
        user_id=user_id
    ).first()

    if existing:
        db.session.delete(existing)
        db.session.commit()
        return {"message": "Like removed"}

    new_like = PostLike(post_id=post_id, user_id=user_id)
    db.session.add(new_like)
    db.session.commit()

    return {"message": "Post liked"}


# -------------------------------------------------
# VIEW LIKES
# -------------------------------------------------

def fetch_post_likes(post_id):

    likes = PostLike.query.filter_by(post_id=post_id).all()

    return [{
        "user_id": like.user.id,
        "username": like.user.full_name
    } for like in likes]


# -------------------------------------------------
# ADD COMMENT
# -------------------------------------------------

def add_comment(post_id, user_id, text):

    if not text:
        return None

    comment = Comment(
        post_id=post_id,
        user_id=user_id,
        content=text
    )

    db.session.add(comment)
    db.session.commit()

    return {
        "id": comment.id,
        "content": comment.content,
        "username": comment.user.full_name,
        "createdAt": comment.created_at.isoformat()
    }


# -------------------------------------------------
# DELETE COMMENT (ONLY AUTHOR)
# -------------------------------------------------

def delete_comment(comment_id, current_user_id):

    comment = Comment.query.get(comment_id)
    if not comment:
        return None

    if comment.user_id != current_user_id:
        return {"error": "Unauthorized"}

    db.session.delete(comment)
    db.session.commit()

    return {"message": "Comment deleted"}


# -------------------------------------------------
# VIEW COMMENTS
# -------------------------------------------------

def fetch_post_comments(post_id):

    comments = Comment.query.filter_by(post_id=post_id) \
        .order_by(Comment.created_at.desc()).all()

    return [{
        "id": c.id,
        "content": c.content,
        "username": c.user.full_name,
        "createdAt": c.created_at.isoformat()
    } for c in comments]


# -------------------------------------------------
# TOGGLE SAVE POST
# -------------------------------------------------

def toggle_save(post_id, user_id):

    existing = SavedPost.query.filter_by(
        post_id=post_id,
        user_id=user_id
    ).first()

    if existing:
        db.session.delete(existing)
        db.session.commit()
        return {"message": "Post unsaved"}

    saved = SavedPost(post_id=post_id, user_id=user_id)
    db.session.add(saved)
    db.session.commit()

    return {"message": "Post saved"}


# -------------------------------------------------
# VIEW SAVED POSTS
# -------------------------------------------------

def fetch_saved_posts(user_id):

    saved = SavedPost.query.filter_by(user_id=user_id).all()
    posts = [s.post for s in saved]

    return [{
        "id": post.id,
        "imageUrl": post.image_url,
        "caption": post.caption,
        "likes": len(post.likes),
        "commentsCount": len(post.comments),
        "createdAt": post.created_at.isoformat()
    } for post in posts]