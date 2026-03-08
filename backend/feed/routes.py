from flask import Blueprint, request, jsonify
from backend.feed.services import (
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

from backend.models.user import User
from backend.models.base import SessionLocal

feed_bp = Blueprint("feed", __name__)


# TEMP USER
def get_current_user():
    session = SessionLocal()

    user = session.query(User).filter(User.id == 1).first()

    session.close()

    return user


@feed_bp.route("/", methods=["GET"])
def get_feed():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 5))
    current_user = get_current_user()

    posts = fetch_feed_posts_paginated(page, limit, current_user.id)
    return jsonify({"posts": posts})


@feed_bp.route("/<int:post_id>", methods=["GET"])
def get_post(post_id):
    current_user = get_current_user()
    post = fetch_single_post(post_id, current_user.id)
    return jsonify(post)


@feed_bp.route("/create", methods=["POST"])
def create_new_post():
    data = request.get_json()
    caption = data.get("caption")
    image_url = data.get("image_url")
    barber_id = data.get("barber_id")

    result = create_post(barber_id, caption, image_url)
    return jsonify(result)


@feed_bp.route("/<int:post_id>", methods=["DELETE"])
def remove_post(post_id):
    current_user = get_current_user()
    result = delete_post(post_id, current_user)
    return jsonify(result)


@feed_bp.route("/<int:post_id>/like", methods=["POST"])
def like_post(post_id):
    current_user = get_current_user()
    result = toggle_like(post_id, current_user.id)
    return jsonify(result)


@feed_bp.route("/<int:post_id>/likes", methods=["GET"])
def view_likes(post_id):
    likes = fetch_post_likes(post_id)
    return jsonify({"likes": likes})


@feed_bp.route("/<int:post_id>/comment", methods=["POST"])
def comment_post(post_id):
    data = request.get_json()
    current_user = get_current_user()
    comment = data.get("comment")
    result = add_comment(post_id, current_user.id, comment)
    return jsonify(result)


@feed_bp.route("/comment/<int:comment_id>", methods=["DELETE"])
def remove_comment(comment_id):
    current_user = get_current_user()
    result = delete_comment(comment_id, current_user.id)
    return jsonify(result)


@feed_bp.route("/<int:post_id>/comments", methods=["GET"])
def view_comments(post_id):
    comments = fetch_post_comments(post_id)
    return jsonify({"comments": comments})


@feed_bp.route("/<int:post_id>/save", methods=["POST"])
def save_post(post_id):
    current_user = get_current_user()
    result = toggle_save(post_id, current_user.id)
    return jsonify(result)


@feed_bp.route("/saved", methods=["GET"])
def view_saved_posts():
    current_user = get_current_user()
    posts = fetch_saved_posts(current_user.id)
    return jsonify({"posts": posts})








