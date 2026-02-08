from flask import Blueprint, request, jsonify
from .services import analyze_and_recommend

ai_bp = Blueprint("ai", __name__, url_prefix="/ai")


@ai_bp.route("/hairstyle", methods=["POST"])
def get_hairstyle_recommendation():
    if "image" not in request.files:
        return jsonify({"error": "Missing image"}), 400

    image = request.files["image"]

    result = analyze_and_recommend(image)

    return jsonify({
        "faceShape": result["faceShape"],
        "recommendedStyles": result["recommendedStyles"],
        "note": "Recommendations are suggestions only"
    }), 200


@ai_bp.route("/chat", methods=["POST"])
def ai_chat_response():
    data = request.get_json(silent=True) or {}
    message = data.get("message", "")

    reply = ai_chat_reply(message)

    return jsonify({"reply": reply}), 200
