# feed/routes.py

from flask import Blueprint, request, jsonify
from feed.services import (
    fetch_feed_posts,
    fetch_feed_posts_paginated,
    fetch_posts_by_barber,
    add_like,
    add_comment,
    save_post_for_user
)

feed_bp = Blueprint("feed", __name__)


@feed_bp.route("/", methods=["GET"])
def get_feed_posts():
    posts = fetch_feed_posts()
    return jsonify({"posts": posts})


@feed_bp.route("/paginated", methods=["GET"])
def get_feed_posts_paginated():
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 5))
    except ValueError:
        return {"error": "Invalid pagination parameters"}, 400

    posts = fetch_feed_posts_paginated(page, limit)
    return {"posts": posts, "page": page, "limit": limit}



@feed_bp.route("/feed/barber/<int:barber_id>", methods=["GET"])
def get_posts_by_barber(barber_id):
    posts = fetch_posts_by_barber(barber_id)
    return jsonify({"posts": posts})


@feed_bp.route("/feed/<int:post_id>/like", methods=["POST"])
def like_post(post_id):
    post = add_like(post_id)
    if not post:
        return {"error": "Post not found"}, 404
    return jsonify(post)


@feed_bp.route("/feed/<int:post_id>/comment", methods=["POST"])
def comment_on_post(post_id):
    data = request.get_json()
    comment = data.get("comment")
    post = add_comment(post_id, comment)
    if not post:
        return {"error": "Post not found"}, 404
    return jsonify(post)


@feed_bp.route("/feed/<int:post_id>/save", methods=["POST"])
def save_post(post_id):
    # user_id will come from JWT later
    result = save_post_for_user(post_id, user_id=1)
    return jsonify(result)
