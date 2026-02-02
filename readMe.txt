🔐 auth/
Purpose

Authentication + role handling

auth/routes.py

register_user()

login_user()

logout_user()

refresh_token() (optional)

auth/services.py

create_user()

verify_credentials()

generate_jwt()

hash_password()

check_password()

Features covered

User registration & login (FR1)

Role-based access (customer / barber / salon)




🏠 feed/ (SHARED HOME PAGE)
Purpose

Social-media-style home feed
Same for all roles

feed/routes.py

get_feed_posts()

get_feed_posts_paginated()

get_posts_by_barber(barber_id)

like_post(post_id)

comment_on_post(post_id)

save_post(post_id)

feed/services.py

fetch_feed_posts()

create_post() ❗(called by barber module)

add_like()

add_comment()

save_post_for_user()

Features covered

Shared home page

Barber posts

Likes / comments / saves




👤 customer/
Purpose

Everything a customer can do

customer/routes.py

Discovery

search_barbers()

view_barber_profile(barber_id)

Appointments

create_appointment()

view_my_appointments()

cancel_appointment(appointment_id)

reschedule_appointment(appointment_id)

Reviews

create_review(appointment_id)

view_my_reviews()

Relationships

follow_barber(barber_id)

unfollow_barber(barber_id)

customer/services.py

book_appointment()

get_customer_appointments()

cancel_booking()

create_review_record()

follow_barber_logic()

Features covered

Booking appointments (UC-001)

Reviews & ratings (UC-004)

Following barbers

Customer history





💈 barber/
Purpose

Everything a barber can do

barber/routes.py

Profile

get_barber_profile()

update_barber_profile()

update_location()

update_availability()

Portfolio

add_portfolio_item()

delete_portfolio_item()

Social

create_post() (calls feed.services)

get_my_posts()

Appointments

view_barber_appointments()

accept_appointment(appointment_id)

reject_appointment(appointment_id)

reschedule_appointment(appointment_id)

barber/services.py

update_barber_details()

manage_availability()

handle_booking_request()

change_booking_status()

Features covered

Barber independence

Portfolio

Booking management

Migration & availability (UC-003)





🏢 salon/
Purpose

Salon-side features (can be partial)

salon/routes.py

get_salon_profile()

update_salon_profile()

search_barbers_for_recruitment()

create_job_post()

view_job_posts()

salon/services.py

fetch_available_barbers()

create_job_listing()

manage_collaboration()

Features covered

Salon recruitment

Job postings

Collaboration





🤖 ai/
Purpose

AI features (Python-native)

ai/routes.py

get_hairstyle_recommendation()

ai_chat_response()

ai/services.py

analyze_face_shape()

recommend_styles()

call_gemini_api()

Features covered

AI hairstyle recommendation (FR12)

AI chat assistant




💬 chat/ (Node.js or separate)
Purpose

Real-time chat

Features

Start chat

Send message

Receive message

Store chat history

