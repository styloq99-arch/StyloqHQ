from datetime import datetime, time
import json

# Using Dummy data bcz @SandaruKariya Told for now
_SALONS = []
_SALON_WORKING_HOURS = []
_SALON_PAYMENT_POLICIES = []
_SALON_BARBER_ASSOCIATIONS = []


def _seed_dummy_data():
    """Seed initial dummy data like feed module does"""
    if not _SALONS:
        # Creating a sample salon
        _SALONS.append({
            "id": 1,
            "owner_id": 1,
            "name": "Nethulz Cuts Salon",
            "address": "18, Suduwella Road, Panadura",
            "city": "Panadura",
            "contact_phone": "+94 75 882 1476",
            "contact_email": "nethuljayasuriya.com",
            "description": "Premium hair salon with 19+ years experience",
            "created_at": datetime.utcnow().isoformat()
        })

    if not _SALON_WORKING_HOURS:
        # Sample working hours (0=Monday, 6=Sunday)
        days = [
            {"day": 0, "name": "Monday", "open": "09:00", "close": "19:00"},
            {"day": 1, "name": "Tuesday", "open": "09:00", "close": "19:00"},
            {"day": 2, "name": "Wednesday", "open": "09:00", "close": "19:00"},
            {"day": 3, "name": "Thursday", "open": "09:00", "close": "19:00"},
            {"day": 4, "name": "Friday", "open": "09:00", "close": "20:00"},
            {"day": 5, "name": "Saturday", "open": "10:00", "close": "18:00"},
            {"day": 6, "name": "Sunday", "open": "11:00", "close": "16:00", "is_active": False}
        ]

        for day_info in days:
            _SALON_WORKING_HOURS.append({
                "id": len(_SALON_WORKING_HOURS) + 1,
                "salon_id": 1,
                "day_of_week": day_info["day"],
                "day_name": day_info["name"],
                "opening_time": day_info["open"],
                "closing_time": day_info["close"],
                "is_active": day_info.get("is_active", True)
            })

    if not _SALON_PAYMENT_POLICIES:
        _SALON_PAYMENT_POLICIES.append({
            "id": 1,
            "salon_id": 1,
            "policy_type": "COMMISSION",
            "commission_percentage": 30.0,
            "salary_amount": None,
            "salary_currency": "USD",
            "base_salary": None,
            "hybrid_commission": None,
            "is_active": True,
            "effective_from": datetime.utcnow().isoformat()
        })

    if not _SALON_BARBER_ASSOCIATIONS:
        # Sample barber associations
        _SALON_BARBER_ASSOCIATIONS.append({
            "id": 1,
            "salon_id": 1,
            "barber_id": 2,  # Assumption taken for Barber ID with 2
            "barber_name": "Fade Master",
            "invitation_status": "ACCEPTED",
            "salon_rules_active": True,
            "invitation_sent_at": datetime.utcnow().isoformat(),
            "invitation_accepted_at": datetime.utcnow().isoformat()
        })
        _SALON_BARBER_ASSOCIATIONS.append({
            "id": 2,
            "salon_id": 1,
            "barber_id": 3,  # Its another barber brooooo, IKR XD
            "barber_name": "Clipper King",
            "invitation_status": "PENDING",
            "salon_rules_active": False,
            "invitation_sent_at": datetime.utcnow().isoformat(),
            "invitation_accepted_at": None
        })


_seed_dummy_data()


# Service partfor the Salon

def get_salon_profile(owner_id):
    """Fetch salon identity and configuration"""
    for salon in _SALONS:
        if salon["owner_id"] == owner_id:
            # Find payment policy
            payment_policy = None
            for policy in _SALON_PAYMENT_POLICIES:
                if policy["salon_id"] == salon["id"] and policy["is_active"]:
                    payment_policy = policy
                    break

            # Find working hours
            working_hours = []
            for hours in _SALON_WORKING_HOURS:
                if hours["salon_id"] == salon["id"] and hours["is_active"]:
                    working_hours.append(hours)

            # Sort working hours by day
            working_hours.sort(key=lambda x: x["day_of_week"])

            return {
                "salon": salon,
                "payment_policy": payment_policy,
                "working_hours": working_hours
            }
    return None


def update_salon_profile(owner_id, update_data):
    """Update salon metadata only (does not affect bookings)"""
    for salon in _SALONS:
        if salon["owner_id"] == owner_id:
            # Update allowed fields
            if "name" in update_data:
                salon["name"] = update_data["name"]
            if "address" in update_data:
                salon["address"] = update_data["address"]
            if "description" in update_data:
                salon["description"] = update_data["description"]
            if "contact_phone" in update_data:
                salon["contact_phone"] = update_data["contact_phone"]
            if "contact_email" in update_data:
                salon["contact_email"] = update_data["contact_email"]
            if "city" in update_data:
                salon["city"] = update_data["city"]

            salon["updated_at"] = datetime.utcnow().isoformat()
            return salon
    return None


def get_salon_working_hours(salon_id):
    """Return the salon's operating hours"""
    hours = []
    for hour in _SALON_WORKING_HOURS:
        if hour["salon_id"] == salon_id and hour["is_active"]:
            hours.append(hour)

    # Sort by day
    hours.sort(key=lambda x: x["day_of_week"])
    return hours


def update_salon_working_hours(salon_id, hours_data):
    """Set or update salon working hours"""
    # Remove existing hours for this salon
    global _SALON_WORKING_HOURS
    _SALON_WORKING_HOURS = [h for h in _SALON_WORKING_HOURS if h["salon_id"] != salon_id]

    # Add new hours
    for hour_entry in hours_data:
        new_hour = {
            "id": len(_SALON_WORKING_HOURS) + 1,
            "salon_id": salon_id,
            "day_of_week": hour_entry["day_of_week"],
            "day_name": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][
                hour_entry["day_of_week"]],
            "opening_time": hour_entry["opening_time"],
            "closing_time": hour_entry["closing_time"],
            "is_active": hour_entry.get("is_active", True)
        }
        _SALON_WORKING_HOURS.append(new_hour)

    return True


def get_salon_location_context(salon_id):
    """Return location information used for bookings"""
    for salon in _SALONS:
        if salon["id"] == salon_id:
            return {
                "salon_name": salon["name"],
                "address": salon["address"],
                "city": salon.get("city", ""),
                "display_text": f"At {salon['name']}"
            }
    return None


def update_salon_location_context(salon_id, location_data):
    """Update how salon location is shown on barber bookings"""
    for salon in _SALONS:
        if salon["id"] == salon_id:
            if "name" in location_data:
                salon["name"] = location_data["name"]
            if "address" in location_data:
                salon["address"] = location_data["address"]
            if "city" in location_data:
                salon["city"] = location_data["city"]

            salon["updated_at"] = datetime.utcnow().isoformat()
            return salon
    return None


def get_payment_policy(salon_id):
    """Return the active payment policy"""
    for policy in _SALON_PAYMENT_POLICIES:
        if policy["salon_id"] == salon_id and policy["is_active"]:
            return policy

    # Return default if none exists
    return {
        "policy_type": "COMMISSION",
        "commission_percentage": 30.0,
        "is_default": True
    }


def update_payment_policy(salon_id, policy_data):
    """Set or change the salon's payment rule"""
    # Deactivate old policies
    for policy in _SALON_PAYMENT_POLICIES:
        if policy["salon_id"] == salon_id:
            policy["is_active"] = False

    # Create new policy
    new_policy = {
        "id": len(_SALON_PAYMENT_POLICIES) + 1,
        "salon_id": salon_id,
        "policy_type": policy_data["policy_type"],
        "commission_percentage": policy_data.get("commission_percentage", 0.0),
        "salary_amount": policy_data.get("salary_amount"),
        "salary_currency": policy_data.get("salary_currency", "USD"),
        "base_salary": policy_data.get("base_salary"),
        "hybrid_commission": policy_data.get("hybrid_commission"),
        "is_active": True,
        "effective_from": datetime.utcnow().isoformat()
    }

    _SALON_PAYMENT_POLICIES.append(new_policy)
    return new_policy


def invite_barber_to_salon(salon_id, barber_id):
    """Invite a barber to work under salon rules"""
    # Check for existing invitation
    for assoc in _SALON_BARBER_ASSOCIATIONS:
        if assoc["salon_id"] == salon_id and assoc["barber_id"] == barber_id:
            if assoc["invitation_status"] == "ACCEPTED":
                return {"error": "Barber already associated with salon"}
            elif assoc["invitation_status"] == "PENDING":
                return {"error": "Invitation already pending"}

    # Create new invitation
    # Dummy barber name - in real app, you'd fetch from user data
    barber_names = {2: "Fade Master", 3: "Clipper King", 4: "Sharp Edge", 5: "Blade Master"}

    new_invitation = {
        "id": len(_SALON_BARBER_ASSOCIATIONS) + 1,
        "salon_id": salon_id,
        "barber_id": barber_id,
        "barber_name": barber_names.get(barber_id, f"Barber {barber_id}"),
        "invitation_status": "PENDING",
        "salon_rules_active": False,
        "invitation_sent_at": datetime.utcnow().isoformat(),
        "invitation_accepted_at": None
    }

    _SALON_BARBER_ASSOCIATIONS.append(new_invitation)

    return {
        "message": "Invitation sent successfully",
        "invitation_id": new_invitation["id"],
        "barber_name": new_invitation["barber_name"],
        "status": "PENDING"
    }


def accept_barber_collaboration(barber_id, salon_id):
    """Barber accepts the salon's rules"""
    for assoc in _SALON_BARBER_ASSOCIATIONS:
        if assoc["salon_id"] == salon_id and assoc["barber_id"] == barber_id:
            if assoc["invitation_status"] == "PENDING":
                assoc["invitation_status"] = "ACCEPTED"
                assoc["salon_rules_active"] = True
                assoc["invitation_accepted_at"] = datetime.utcnow().isoformat()

                return {
                    "message": "Collaboration accepted successfully",
                    "salon_rules_active": True,
                    "accepted_at": assoc["invitation_accepted_at"]
                }

    return {"error": "No pending invitation found"}


def remove_barber_from_salon(salon_id, barber_id):
    """Stop applying salon rules to that barber"""
    for assoc in _SALON_BARBER_ASSOCIATIONS:
        if assoc["salon_id"] == salon_id and assoc["barber_id"] == barber_id:
            if assoc["invitation_status"] == "ACCEPTED":
                assoc["salon_rules_active"] = False
                return {
                    "message": "Barber removed from salon rules context",
                    "salon_rules_active": False,
                    "barber_id": barber_id
                }

    return {"error": "Barber not associated with salon"}


def get_salon_barbers(salon_id, active_only=True):
    """Get barbers associated with salon"""
    result = []
    for assoc in _SALON_BARBER_ASSOCIATIONS:
        if assoc["salon_id"] == salon_id:
            if active_only and not (assoc["invitation_status"] == "ACCEPTED" and assoc["salon_rules_active"]):
                continue

            result.append({
                "barber_id": assoc["barber_id"],
                "name": assoc["barber_name"],
                "invitation_status": assoc["invitation_status"],
                "salon_rules_active": assoc["salon_rules_active"],
                "invited_at": assoc["invitation_sent_at"],
                "accepted_at": assoc["invitation_accepted_at"]
            })

    return result


def get_salon_by_owner(owner_id):
    """Get salon by owner user ID"""
    for salon in _SALONS:
        if salon["owner_id"] == owner_id:
            return salon
    return None


def get_salon_by_id(salon_id):
    """Get salon by salon ID"""
    for salon in _SALONS:
        if salon["id"] == salon_id:
            return salon
    return None


def update_salon_profile_by_id(salon_id, update_data):
    """Update salon metadata by salon_id"""
    for salon in _SALONS:
        if salon["id"] == salon_id:
            # Update allowed fields
            if "name" in update_data:
                salon["name"] = update_data["name"]
            if "address" in update_data:
                salon["address"] = update_data["address"]
            if "description" in update_data:
                salon["description"] = update_data["description"]
            if "contact_phone" in update_data:
                salon["contact_phone"] = update_data["contact_phone"]
            if "contact_email" in update_data:
                salon["contact_email"] = update_data["contact_email"]
            if "city" in update_data:
                salon["city"] = update_data["city"]

            salon["updated_at"] = datetime.utcnow().isoformat()
            return salon
    return None


def is_in_salon_context(barber_id, appointment_datetime):
    """
    Determine if an appointment should use salon context
    Based on: barber association + working hours overlap
    """
    # Find active salon association for barber
    active_association = None
    for assoc in _SALON_BARBER_ASSOCIATIONS:
        if (assoc["barber_id"] == barber_id and
                assoc["invitation_status"] == "ACCEPTED" and
                assoc["salon_rules_active"]):
            active_association = assoc
            break

    if not active_association:
        return False

    # Parse appointment datetime
    try:
        if isinstance(appointment_datetime, str):
            dt = datetime.fromisoformat(appointment_datetime.replace('Z', '+00:00'))
        else:
            dt = appointment_datetime
    except:
        return False

    # Get day of week (0=Monday, 6=Sunday)
    appointment_weekday = dt.weekday()
    appointment_time_str = dt.strftime("%H:%M")

    # Check if appointment time overlaps with salon working hours
    for hours in _SALON_WORKING_HOURS:
        if (hours["salon_id"] == active_association["salon_id"] and
                hours["day_of_week"] == appointment_weekday and
                hours["is_active"]):
            # Simple string comparison for time
            return hours["opening_time"] <= appointment_time_str <= hours["closing_time"]

    return False