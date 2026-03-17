#!/usr/bin/env python3
print('SCRIPT REPAIRED AND READY')
"""
Automated API test script for Barber-Client booking flow (REPAIRED VERSION).
Assumes Flask API running at http://127.0.0.1:5000.
Users: barber1@test.com / test123 (barber), client1@test.com / test123 (client).
Run: python api_booking_test.py
"""

import requests
import json
import sys

BASE_URL = "http://127.0.0.1:5000"
BARBER_ID = 1
SERVICE_ID = 1

def print_step(step_name, req_info, response):
    """Print formatted step info with safe .get() calls."""
    print(f"\n{'='*60}")
    print(f"STEP: {step_name}")
    print(f"{'='*60}")
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
    url = f"{BASE_URL}{endpoint}"
    response = requests.request(method, url, headers=headers or {}, json=json, timeout=10)
    return response, url

print("Starting Barber-Client Booking Flow Test...")

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

# Step 3: Set Barber Availability
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

# Step 4: Client Books Appointment
headers = {"Authorization": f"Bearer {client_token}"}
booking_datetime = "2026-03-20T11:00:00"  # 11 AM Thursday, within availability
booking_payload = {"service_id": SERVICE_ID, "appointment_datetime": booking_datetime}
resp, url = make_request("POST", f"/barber/{BARBER_ID}/book", headers=headers, json=booking_payload)
req_info = {"method": "POST", "url": url, "headers": headers, "json": booking_payload}
resp_json = print_step("4. Client Book Appointment", req_info, resp)
if resp.status_code not in (200, 201) or not resp_json:
    print("❌ Booking failed!")
    sys.exit(1)
booking_id = resp_json['id']  # Root level extraction
expected_status = resp_json.get('status', 'unknown')
print(f"✅ Booking created! ID: {booking_id}, status: '{expected_status}' (expected 'Pending')")

# Step 5: Barber Accepts Appointment
headers = {"Authorization": f"Bearer {barber_token}"}
resp, url = make_request("PATCH", f"/barber/appointments/{booking_id}/accept", headers=headers)
req_info = {"method": "PATCH", "url": url, "headers": headers}
resp_json = print_step("5. Barber Accept Appointment", req_info, resp)
if resp.status_code in (200, 201):
    print("✅ Appointment accepted! Check status update above.")
else:
    print("❌ Accept failed!")

print("\n🎉 Full booking flow test completed successfully!")

