import os
import json
import base64
from google import genai
from google.genai import types

# -------------------------------------------------
# GEMINI CONFIG
# -------------------------------------------------

GEMINI_API_KEY = "AIzaSyDPcCVMs-CmNPEDwBmqw7mH_7qw65IzfLg"
print("API KEY LOADED:", GEMINI_API_KEY is not None)

client = None
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)

MODEL_NAME = "gemini-3-flash-preview"  # Gemini 3 model

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
# IMAGE EDIT GENERATION
# -------------------------------------------------

def generate_preview_image(image_file, style_name):
    image_bytes = image_file.read()

    image_part = types.Part.from_bytes(
        data=image_bytes,
        mime_type=image_file.mimetype
    )

    edit_prompt = f"""
Apply a {style_name} haircut to this person.

Preserve facial identity exactly.
Do not modify facial structure.
Do not change skin tone.
Do not change expression.
Do not change age.

Only modify the hairstyle.

Photorealistic.
Professional studio lighting.
Neutral background.
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=[edit_prompt, image_part]
    )

    for part in response.candidates[0].content.parts:
        if part.inline_data:
            return base64.b64encode(part.inline_data.data).decode("utf-8")

    raise ValueError("No image returned from Gemini 3")

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
        ],
        "note": "Recommendations are suggestions only"
    }

    if not client:
        print("CLIENT NOT INITIALIZED")
        return fallback

    try:
        image_bytes = image_file.read()

        image_part = types.Part.from_bytes(
            data=image_bytes,
            mime_type=image_file.mimetype
        )

        analysis_prompt = """
You are a professional barber and stylist.

Analyze the face shape from the image.

Choose exactly one:
oval, round, square, heart, diamond

Recommend 2 or 3 professional men's hairstyles
suitable for that face shape.

Return STRICT JSON only:

{
  "faceShape": "oval",
  "recommendedStyles": [
    {
      "id": "low_fade",
      "name": "Low Fade",
      "description": "Balances facial proportions"
    }
  ]
}

No markdown.
No explanations.
Lowercase ids.
"""

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[analysis_prompt, image_part]
        )

        text_response = response.text.strip()
        print("RAW RESPONSE:")
        print(text_response)

        data = json.loads(extract_json(text_response))

        face_shape = data.get("faceShape", "oval").lower()
        styles = data.get("recommendedStyles", [])

        final_styles = []

        for style in styles[:3]:
            image_file.seek(0)

            try:
                preview_image = generate_preview_image(
                    image_file,
                    style.get("name", "Haircut")
                )
            except Exception as e:
                print("IMAGE ERROR:", e)
                preview_image = None

            final_styles.append({
                "id": style.get("id", "style"),
                "name": style.get("name", "Style"),
                "description": style.get("description", ""),
                "previewImage": preview_image
            })

        return {
            "faceShape": face_shape,
            "recommendedStyles": final_styles,
            "note": "AI-generated hairstyle transformation using Gemini 3."
        }

    except Exception as e:
        print("AI ERROR:", e)
        return fallback
