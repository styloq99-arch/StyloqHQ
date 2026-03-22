import os
import json
import base64
import google.genai as genai
from google.genai import types

from sqlalchemy import func
from backend.models.base import SessionLocal
from backend.models.booking import Booking
from backend.models.booking import Hairstyle

# -------------------------------------------------
# GEMINI CONFIG
# -------------------------------------------------

# Use Gemini 2.5 Flash model
MODEL_NAME = "gemini-2.5-flash"

# Get API key from environment variable for security
# You can also set it directly here for testing, but use env var in production
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyCtq9kUERwjvfJ6w2GaSV1JvawwenZcf5E")
print("API KEY LOADED:", GEMINI_API_KEY is not None)

client = None
if GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        print(f"Gemini client initialized with model: {MODEL_NAME}")
    except Exception as e:
        print(f"Failed to initialize Gemini client: {e}")


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
    """Generate a preview image with the selected hairstyle using Gemini 3.0 Flash Preview."""
    image_bytes = image_file.read()

    image_part = types.Part.from_bytes(
        data=image_bytes,
        mime_type=image_file.mimetype
    )

    # Enhanced prompt for better identity preservation with Gemini 3.0
    edit_prompt = f"""You are an expert portrait photographer and hairstylist.

Edit this portrait by applying a {style_name} hairstyle.

CRITICAL REQUIREMENTS:
- EXACTLY preserve the person's facial identity (face shape, features)
- Do NOT change facial structure, skin tone, eye color, or expression
- Do NOT add or remove wrinkles, moles, or facial marks
- Only modify the hair/hairline area
- Maintain natural-looking hair growth edges

Style: {style_name}
Output: Photorealistic image with professional studio lighting"""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[edit_prompt, image_part],
            config={
                'response_modalities': ['image', 'text']
            }
        )
        
        # Handle Gemini 3.0 response format
        if hasattr(response, 'candidates') and response.candidates:
            for candidate in response.candidates:
                if hasattr(candidate, 'content') and candidate.content:
                    for part in candidate.content.parts:
                        # Check for inline image data
                        if hasattr(part, 'inline_data') and part.inline_data:
                            return base64.b64encode(part.inline_data.data).decode("utf-8")
                        # Check for image URL in text response
                        if hasattr(part, 'text') and part.text:
                            # Could be a URL or base64 in text form
                            text = part.text
                            if 'base64' in text.lower():
                                # Extract base64 from text if present
                                import re
                                base64_match = re.search(r'data:image/\w+;base64,([A-Za-z0-9+/=]+)', text)
                                if base64_match:
                                    return base64_match.group(1)
        
        # If no image in response, raise error
        print("RESPONSE TEXT:", response.text if hasattr(response, 'text') else "No text")
        raise ValueError("No image returned from Gemini")
        
    except Exception as e:
        print(f"Image generation error: {str(e)}")
        raise ValueError(f"Failed to generate preview image: {str(e)}")


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
        print("CLIENT NOT INITIALIZED - API key may be missing or invalid")
        return fallback

    try:
        image_bytes = image_file.read()
        print(f"Image size: {len(image_bytes)} bytes")

        image_part = types.Part.from_bytes(
            data=image_bytes,
            mime_type=image_file.mimetype
        )

        analysis_prompt = """You are a professional barber and stylist.

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

        print(f"Sending request to Gemini model: {MODEL_NAME}")
        
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
            "note": "AI-generated hairstyle transformation using Gemini."
        }

    except Exception as e:
        print("AI ERROR:", str(e))
        import traceback
        traceback.print_exc()
        fallback["note"] = f"AI Error: {str(e)}"
        return fallback


def fetch_customer_retention(barber_id):
    db = SessionLocal()
    try:
        results = (
            db.query(
                Booking.client_id,
                func.count(Booking.id).label("visit_count")
            )
            .filter(Booking.barber_id == barber_id)
            .group_by(Booking.client_id)
            .all()
        )

        returning_customers = 0
        new_customers = 0

        for r in results:
            if r.visit_count == 1:
                new_customers += 1
            else:
                returning_customers += 1

        total = returning_customers + new_customers

        returning_percentage = 0
        new_percentage = 0

        if total > 0:
            returning_percentage = round((returning_customers / total) * 100)
            new_percentage = round((new_customers / total) * 100)

        return {
            "returningCustomers": returning_percentage,
            "newCustomers": new_percentage
        }

    finally:
        db.close()



def fetch_trending_hairstyles(limit=5):
    db = SessionLocal()
    try:
        results = (
            db.query(
                Hairstyle.id,
                Hairstyle.name,
                Hairstyle.image_url,
                func.count(Booking.id).label("bookings")
            )
            .join(Booking, Booking.hairstyle_id == Hairstyle.id)
            .group_by(Hairstyle.id)
            .order_by(func.count(Booking.id).desc())
            .limit(limit)
            .all()
        )

        trends = []

        for r in results:
            trends.append({
                "id": r.id,
                "name": r.name,
                "imageUrl": r.image_url,
                "popularity": r.bookings
            })

        return trends

    finally:
        db.close()
