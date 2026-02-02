# Temporary in-memory storage
import random
from datetime import datetime

_POSTS = []


def _seed_posts():
    barber_names = [
        "Fade Master",
        "Clipper King",
        "Urban Cuts",
        "Sharp Edge",
        "Blade Studio"
    ]

    captions = [
        "Clean fade 🔥",
        "Fresh taper 💯",
        "Skin fade done right",
        "Low fade + texture",
        "Client wanted sharp 👌",
        "Before / After 😮",
        "Classic cut never fails",
        "Modern look 💇‍♂️"
    ]

    for i in range(1, 101):  # 👈 100 posts
        barber_id = random.randint(1, 5)

        _POSTS.append({
            "id": i,
            "barber_id": barber_id,
            "barberName": barber_names[barber_id - 1],
            "caption": random.choice(captions),
            "imageUrl": "https://via.placeholder.com/300",
            "likes": random.randint(0, 250),
            "comments": [],
            "createdAt": datetime.utcnow().isoformat()
        })


# Seed once when module loads
_seed_posts()


def fetch_feed_posts():
    return _POSTS


def fetch_feed_posts_paginated(page, limit):
    sorted_posts = sorted(
        _POSTS,
        key=lambda post: post["createdAt"],
        reverse=True
    )

    start = (page - 1) * limit
    end = start + limit

    return sorted_posts[start:end]



def fetch_posts_by_barber(barber_id):
    return [p for p in _POSTS if p["barber_id"] == barber_id]


def create_post(barber_id, caption, image_url):
    post = {
        "id": len(_POSTS) + 1,
        "barber_id": barber_id,
        "barberName": f"Barber {barber_id}",
        "caption": caption,
        "imageUrl": image_url,
        "likes": 0,
        "comments": []
    }
    _POSTS.append(post)
    return post


def add_like(post_id):
    for post in _POSTS:
        if post["id"] == post_id:
            post["likes"] += 1
            return post
    return None


def add_comment(post_id, text):
    for post in _POSTS:
        if post["id"] == post_id:
            post["comments"].append(text)
            return post
    return None


def save_post_for_user(post_id, user_id):
    # Stubbed (DB later)
    return {
        "message": f"Post {post_id} saved for user {user_id}"
    }