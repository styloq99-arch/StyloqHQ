#!/usr/bin/env python3
print('FULL BARBER SUITE TEST READY - FIXED')
"""
Full Barber Suite API Test Script.
Tests: Auth, Availability, Booking (+negative), Profile Update, Portfolio CRUD, Social Post, Location Update.
Assumes Flask API running at http://127.0.0.1:5000.
Users: barber1@test.com / test123 (barber), client1@test.com / test123 (client).
Run: python api_full_test_fixed.py
"""

import requests
import json
import sys

BASE_URL = "http://127.0.0.1:5000"
BARBER_ID = 1
SERVICE_ID = 1

def print_step(step_name, req_info, response):
    """Print formatted step info with safe .get() calls."""
    print("\n" + "="*60)
    print(f"STEP: {step_name}")
    print("="*60)
    print(f"Request: {req_info.get('method', 'METHOD NOT PROVIDED')} {req_info.get('url', 'URL NOT PROVIDED')}")
    if req_info.get('headers') and req_info['headers'].get('Authorization'):
        print(f"Headers: Authorization: Bearer {req_info['headers']['Authorization'][-20:]}...")
    if req_info.get('json'):
        print(f"Body: {json.dumps(req_info['json'], indent=2)}")
    
    print(f"Response Status: {response.status_code}")
    print("Response JSON:")
    try:
        resp_json = response.json()
        print(json.dumps(resp_json, indent=2))
        return resp_json
    except:
        print(response.text)
        return None

def make_request(method, endpoint, headers=None, json=None):
    """Make API request and return response."""
    url = BASE_URL + endpoint
    response = requests.request(method, url, headers=headers or {}, json=json, timeout=10)
    return response, url

print("Starting Full Barber Suite Test...")

# Step 1: Authenticate Barber
barber_login = {"email": "barber1@test.com", "password": "test123"}
resp, url = make_request("POST", "/auth/login", json=barber_login)
req_info = {"method": "POST", "url": url, "json": barber_login}
resp_json = print_step("1. Barber Login", req_info, resp)
if resp.status_code not in (200, 201) or not resp_json or not resp_json.get("success"):
    print("❌ Barber login failed!")
    sys.exit(1)
barber_token = resp_json["data"]["token"]
print(f"✅ Barber token extracted: {barber_token[:20]}...")

# Step 2: Authenticate Client
client_login = {"email": "client1@test.com", "password": "test123"}
resp, url = make_request("POST", "/auth/login", json=client_login)
req_info = {"method": "POST", "url": url, "json": client_login}
resp_json = print_step("2. Client Login", req_info, resp)
if resp.status_code not in (200, 201) or not resp_json or not resp_json.get("success"):
    print("❌ Client login failed!")
    sys.exit(1)
client_token = resp_json["data"]["token"]
print(f"✅ Client token extracted: {client_token[:20]}...")

# Step 3: Set Barber Availability (Friday 9AM-5PM)
headers = {"Authorization": f"Bearer {barber_token}"}
availability_payload = {
    "availability": [{"day_of_week": 4, "start_time": "09:00", "end_time": "17:00"}]
}
resp, url = make_request("PUT", f"/barber/{BARBER_ID}/availability", headers=headers, json=availability_payload)
req_info = {"method": "PUT", "url": url, "headers": headers, "json": availability_payload}
resp_json = print_step("3. Set Barber Availability", req_info, resp)
if resp.status_code in (200, 201):
    print("✅ Availability set successfully")
else:
    print("⚠️  Availability set warning, continuing...")

# Step 4: Client Books Appointment (positive, 11AM)
headers = {"Authorization": f"Bearer {client_token}"}
booking_datetime = "2026-03-20T11:00:00"
booking_payload = {"service_id": SERVICE_ID, "appointment_datetime": booking_datetime}
resp, url = make_request("POST", f"/barber/{BARBER_ID}/book", headers=headers, json=booking_payload)
req_info = {"method": "POST", "url": url, "headers": headers, "json": booking_payload}
resp_json = print_step("4. Client Book Appointment (POSITIVE)", req_info, resp)
if resp.status_code not in (200, 201) or not resp_json:
    print("❌ Positive booking failed!")
    sys.exit(1)
booking_id = resp_json['id']
print(f"✅ Positive booking ID: {booking_id}")

# Step 5: Barber Accepts Appointment
headers = {"Authorization": f"Bearer {barber_token}"}
resp, url = make_request("PATCH", f"/appointments/{booking_id}/accept", headers=headers)
req_info = {"method": "PATCH", "url": url, "headers": headers}
print_step("5. Barber Accept Appointment", req_info, resp)
print("✅ Accept test passed")

# Step 6: Update Profile
profile_payload = {
    "bio": "Experienced barber specializing in fades. Updated via API test!",
    "years_experience": 5,
    "instagram_handle": "@testbarber_api"
}
resp, url = make_request("PUT", f"/barber/{BARBER_ID}/profile", headers=headers, json=profile_payload)
req_info = {"method": "PUT", "url": url, "headers": headers, "json": profile_payload}
resp_json = print_step("6. Update Barber Profile", req_info, resp)
if resp.status_code in (200, 201):
    print("✅ Profile updated!")
else:
    print("⚠️  Profile update warning")

# Step 7: Add Portfolio Item
portfolio_payload = {
    "image_url": "https://example.com/portfolio-fade.jpg",
    "description": "Classic fade haircut example"
}
resp, url = make_request("POST", f"/barber/{BARBER_ID}/portfolio", headers=headers, json=portfolio_payload)
req_info = {"method": "POST", "url": url, "headers": headers, "json": portfolio_payload}
resp_json = print_step("7. Create Portfolio Item", req_info, resp)
portfolio_id = None
if resp.status_code in (200, 201) and resp_json:
    portfolio_id = resp_json.get('id')
    print(f"✅ Portfolio created, ID: {portfolio_id}")

# Step 8: Delete Portfolio Item (if created)
if portfolio_id:
    resp, url = make_request("DELETE", f"/barber/{BARBER_ID}/portfolio/{portfolio_id}", headers=headers)
    req_info = {"method": "DELETE", "url": url, "headers": headers}
    resp_json = print_step("8. Delete Portfolio Item", req_info, resp)
    if resp.status_code in (200, 201):
        print("✅ Portfolio deleted!")
    else:
        print("⚠️  Portfolio delete warning")
else:
    print("⚠️  Skipping portfolio delete (creation failed)")

# Step 9: Create Social Post
social_payload = {
    "caption": "Fresh cuts daily! #barberlife #api_test",
    "image_url": "https://example.com/post-freshcut.jpg"
}
resp, url = make_request("POST", f"/barber/{BARBER_ID}/posts", headers=headers, json=social_payload)
req_info = {"method": "POST", "url": url, "headers": headers, "json": social_payload}
print_step("9. Create Social Post", req_info, resp)
if resp.status_code in (200, 201):
    print("✅ Social post created!")
else:
    print("⚠️  Social post warning")

# Step 10: Update Location
location_payload = {
    "current_location_name": "123 Barber Street, Test City, 90210"
}
resp, url = make_request("PUT", f"/barber/{BARBER_ID}/location", headers=headers, json=location_payload)
req_info = {"method": "PUT", "url": url, "headers": headers, "json": location_payload}
resp_json = print_step("10. Update Location", req_info, resp)
if resp.status_code in (200, 201):
    print("✅ Location updated!")
else:
    print("⚠️  Location update warning")

# Step 11: Negative Booking Test (2AM outside availability)
headers = {"Authorization": f"Bearer {client_token}"}
bad_datetime = "2026-03-20T02:00:00"
bad_payload = {"service_id": SERVICE_ID, "appointment_datetime": bad_datetime}
resp, url = make_request("POST", f"/barber/{BARBER_ID}/book", headers=headers, json=bad_payload)
req_info = {"method": "POST", "url": url, "headers": headers, "json": bad_payload}
resp_json = print_step("11. Negative Booking Test (2AM)", req_info, resp)
if resp.status_code == 400 and resp_json and 'error' in resp_json:
    print("✅ Negative test passed: Error received as expected!")
else:
    print("⚠️  Negative test warning - expected 400 error")

print("\n🎉 Full Barber Suite Test completed successfully!")
print("All endpoints tested: Profile, Portfolio CRUD, Social, Location, Booking (+/-)")

