import os
import json
import base64
import google.generativeai as genai

# -------------------------------------------------
# GEMINI CONFIG
# -------------------------------------------------

GEMINI_API_KEY = "AIzaSyAALz8RXo63a1j0lLbXcDEPzylSV3uNL08"

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# -------------------------------------------------
# HELPERS
# -------------------------------------------------

def extract_json(text):
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON found in Gemini response")
    return text[start:end + 1]

# -------------------------------------------------
# IMAGE GENERATION (ONE IMAGE PER STYLE)
# -------------------------------------------------

def generate_preview_image(image_file, style_name):
    """
    Generates ONE hairstyle preview image using the uploaded image
    as a reference. Returns base64 string.
    """

    image_bytes = image_file.read()

    image_part = {
        "mime_type": image_file.mimetype,
        "data": image_bytes
    }

    model = genai.GenerativeModel("models/gemini-3-flash-preview")

    prompt = f"""
    Generate a realistic studio portrait of the SAME PERSON
    shown in the reference image.

    Maintain facial consistency as much as possible.
    Only change the hairstyle.

    Hairstyle: {style_name}

    Neutral background.
    Photorealistic.
    """

    response = model.generate_content([
        prompt,
        image_part
    ])

    # Gemini returns image bytes inside candidates
    image_bytes = response.candidates[0].content.parts[0].inline_data.data

    return base64.b64encode(image_bytes).decode("utf-8")

# -------------------------------------------------
# CORE AI PIPELINE
# -------------------------------------------------

def analyze_and_recommend(image_file):
    fallback = {
        "faceShape": "oval",
        "recommendedStyles": [
            {
                "id": "classic_cut",
                "name": "Classic Cut",
                "description": "A versatile and balanced hairstyle",
                "previewImage": None
            }
        ]
    }

    if not GEMINI_API_KEY:
        print("GEMINI API KEY MISSING")
        return fallback

    try:
        # Read image bytes ONCE for analysis
        image_bytes = image_file.read()

        image_part = {
            "mime_type": image_file.mimetype,
            "data": image_bytes
        }

        model = genai.GenerativeModel("models/gemini-3-flash-preview")

        prompt = """
You are a professional barber and stylist.

Analyze the human face in the provided image.

Step 1:
Determine the face shape.
Choose ONLY one from:
oval, round, square, heart, diamond

Step 2:
Recommend 2 or 3 suitable men's hairstyles for that face shape.

Return STRICT JSON in this format:

{
  "faceShape": "oval",
  "recommendedStyles": [
    {
      "id": "low_fade",
      "name": "Low Fade",
      "description": "Enhances balanced facial proportions"
    }
  ]
}

Rules:
- No markdown
- No explanations
- Lowercase ids
"""

        response = model.generate_content([
            prompt,
            image_part
        ])

        print("=== GEMINI RAW RESPONSE ===")
        print(response.text)

        raw_text = response.text.strip()
        data = json.loads(extract_json(raw_text))

        face_shape = data.get("faceShape", "oval").lower()
        styles = data.get("recommendedStyles", [])

        final_styles = []

        for style in styles[:3]:
            # IMPORTANT: reset file pointer for reuse
            image_file.seek(0)

            try:
                preview_image = generate_preview_image(
                    image_file,
                    style.get("name", "Haircut")
                )
            except Exception as e:
                print("=== PREVIEW IMAGE ERROR ===")
                print(type(e))
                print(e)
                preview_image = ""

            final_styles.append({
                "id": style.get("id", "style"),
                "name": style.get("name", "Style"),
                "description": style.get("description", ""),
                "previewImage": preview_image
            })

        return {
            "faceShape": face_shape,
            "recommendedStyles": final_styles,
            "note": "AI-generated hairstyle preview based on the uploaded photo. Results may vary."
        }

    except Exception as e:
        print("=== AI ERROR ===")
        print(type(e))
        print(e)
        return fallback

# -------------------------------------------------
# AI CHAT
# -------------------------------------------------

def ai_chat_reply(message):
    if not message:
        return "Ask me about hairstyles or face shapes."

    if not GEMINI_API_KEY:
        return "I can help suggest hairstyles based on face shape."

    try:
        model = genai.GenerativeModel("models/gemini-1.5-flash")

        prompt = f"""
You are a helpful barber assistant.
Answer briefly and clearly.

Question:
{message}
"""

        response = model.generate_content(prompt)
        return response.text.strip()

    except Exception as e:
        print("=== AI CHAT ERROR ===")
        print(e)
        return "I can help suggest hairstyles based on face shape."
