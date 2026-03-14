AUTH MODULE

Purpose
Authentication and role handling.

auth/routes.py

register_user()
POST /auth/register

login_user()
POST /auth/login

logout_user()
POST /auth/logout

get_current_user()
GET /auth/me

refresh_token() optional
POST /auth/refresh

auth/services.py

create_user()
verify_credentials()
generate_jwt()
hash_password()
check_password()

FEED MODULE (SHARED HOME)

Purpose
Social feed shared across all roles.

feed/routes.py

get_feed_posts()
GET /feed

get_feed_posts_paginated()
GET /feed/paginated

get_posts_by_barber(barber_id)
GET /feed/barber/{barber_id}

like_post(post_id)
POST /feed/{post_id}/like

unlike_post(post_id)
DELETE /feed/{post_id}/like

comment_on_post(post_id)
POST /feed/{post_id}/comment

save_post(post_id)
POST /feed/{post_id}/save

unsave_post(post_id)
DELETE /feed/{post_id}/save

get_saved_posts()
GET /feed/saved

feed/services.py

fetch_feed_posts()
fetch_feed_posts_paginated()
fetch_posts_by_barber()

add_like()
remove_like()

add_comment()

save_post_for_user()
remove_saved_post()

CUSTOMER MODULE

Purpose
Everything a customer can do.

customer/routes.py

Profile
get_customer_profile()
GET /customer/profile

update_customer_profile()
PATCH /customer/profile

Discovery
search_barbers()
GET /customer/search

view_barber_profile(barber_id)
GET /customer/barber/{barber_id}

Appointments
create_appointment()
POST /customer/appointments

view_my_appointments()
GET /customer/appointments

cancel_appointment(appointment_id)
DELETE /customer/appointments/{appointment_id}

reschedule_appointment(appointment_id)
PATCH /customer/appointments/{appointment_id}/reschedule

Reviews
create_review(appointment_id)
POST /customer/reviews/{appointment_id}

view_my_reviews()
GET /customer/reviews

Relationships
follow_barber(barber_id)
POST /customer/follow/{barber_id}

unfollow_barber(barber_id)
DELETE /customer/follow/{barber_id}

customer/services.py

get_customer_profile_data()
update_customer_profile_data()

search_barbers_logic()
fetch_barber_profile()

book_appointment()
get_customer_appointments()
cancel_booking()
reschedule_booking()

create_review_record()
get_customer_reviews()

follow_barber_logic()
unfollow_barber_logic()

BARBER MODULE

Purpose
Everything a barber controls.

barber/routes.py

Profile
get_barber_profile()
GET /barber/profile

update_barber_profile()
PATCH /barber/profile

Location and Availability
update_location()
PATCH /barber/location

update_availability()
PATCH /barber/availability

Portfolio and Social
create_post()
POST /barber/posts

get_my_posts()
GET /barber/posts

Appointments
view_barber_appointments()
GET /barber/appointments

accept_appointment(appointment_id)
PATCH /barber/appointments/{appointment_id}/accept

reject_appointment(appointment_id)
PATCH /barber/appointments/{appointment_id}/reject

reschedule_appointment(appointment_id)
PATCH /barber/appointments/{appointment_id}/reschedule

Dashboard
get_barber_dashboard()
GET /barber/dashboard

barber/services.py

get_barber_profile_data()
update_barber_details()

update_barber_location()
manage_availability()

create_feed_post()

fetch_barber_appointments()
handle_booking_request()
change_booking_status()

fetch_dashboard_summary()

SALON MODULE (RULE-BASED, NOT BOOKING-BASED)

Purpose
Define in-salon rules and recruitment.

salon/routes.py

Profile
get_salon_profile()
GET /salon/profile

update_salon_profile()
PATCH /salon/profile

Working Rules
get_salon_working_hours()
GET /salon/working-hours

update_salon_working_hours()
PATCH /salon/working-hours

Location Context
get_salon_location_context()
GET /salon/location-context

update_salon_location_context()
PATCH /salon/location-context

Payment Policy
get_payment_policy()
GET /salon/payment-policy

update_payment_policy()
PATCH /salon/payment-policy

Recruitment
search_barbers_for_recruitment()
GET /salon/search-barbers

create_job_post()
POST /salon/jobs

view_job_posts()
GET /salon/jobs

delete_job_post(job_id)
DELETE /salon/jobs/{job_id}

Collaboration
invite_barber_to_salon(barber_id)
POST /salon/collaborations/{barber_id}

remove_barber_from_salon(barber_id)
DELETE /salon/collaborations/{barber_id}

salon/services.py

get_salon_profile_data()
update_salon_profile_data()

get_working_hours()
set_working_hours()

get_location_context()
set_location_context()

get_payment_policy_data()
set_payment_policy()

fetch_available_barbers()

create_job_listing()
fetch_job_listings()
remove_job_listing()

add_barber_collaboration()
remove_barber_collaboration()

AI MODULE

Purpose
Image-based AI assistance.

ai/routes.py

get_hairstyle_recommendation()
POST /ai/hairstyle

ai_chat_response()
POST /ai/chat

ai/services.py

analyze_face_shape()
recommend_styles()
call_gemini_api()

CHAT MODULE (SEPARATE SERVICE)

Purpose
Real-time messaging.

Events
start_chat
send_message
receive_message
store_chat_history