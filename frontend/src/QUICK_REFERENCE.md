// ═══════════════════════════════════════════════════════════════════════════════
// QUICK REFERENCE - BARBER API INTEGRATION CHECKLIST
// ═══════════════════════════════════════════════════════════════════════════════

// PROJECT SETUP
// ────────────────────────────────────────────────────────────────────────────

✓ STEP 1: Create .env file in frontend directory (if not exists)
   File: d:\IIT 2nd Year\SDGP\StyloqHQ\frontend\.env
   Content:
   VITE_API_BASE_URL=http://localhost:5000

✓ STEP 2: Ensure barberApi.js is created
   File created: d:\IIT 2nd Year\SDGP\StyloqHQ\frontend\src\services\barberApi.js

✓ STEP 3: Install required packages (should already be installed)
   npm install (all React Router and axios/fetch should be available)


// API ENDPOINTS SUMMARY
// ────────────────────────────────────────────────────────────────────────────

PUBLIC ENDPOINTS (No token required):
┌─ GET /barber/{id}/profile
├─ GET /barber/{id}/availability
├─ GET /barber/{id}/portfolio
└─ GET /barber/{id}/posts

PROTECTED ENDPOINTS (Token required):
┌─ PUT /barber/{id}/profile
├─ PUT /barber/{id}/location
├─ PUT /barber/{id}/availability
├─ POST /barber/{id}/portfolio
├─ DELETE /barber/{id}/portfolio/{portfolioId}
├─ POST /barber/{id}/posts
├─ GET /barber/{id}/appointments
├─ PATCH /barber/appointments/{id}/accept
├─ PATCH /barber/appointments/{id}/reject
├─ PATCH /barber/appointments/{id}/reschedule
└─ POST /barber/{id}/book


// IMPLEMENTATION BY PAGE
// ────────────────────────────────────────────────────────────────────────────

PAGE: BarberProfileView.jsx
─────────────────────────
Imports needed:
  - import { getBarberProfile, getBarberPortfolio, getBarberPosts } from '../services/barberApi';
  - import { useParams } from 'react-router-dom';

State to add:
  - const [profileData, setProfileData] = useState(null);
  - const [portfolioItems, setPortfolioItems] = useState([]);
  - const [posts, setPosts] = useState([]);
  - const [loading, setLoading] = useState(true);
  - const [error, setError] = useState(null);

Effect to add:
  - useEffect hook to fetch all three endpoints on component mount

Data to replace:
  - BARBER_DATA → profileData (name, bio, avatar, etc.)
  - SERVICES → portfolioItems
  - (optional) Add posts section with posts data

Status: [ ] To Do  [ ] In Progress  [ ] Completed


PAGE: BookingPage.jsx
─────────────────
Imports needed:
  - import { getBarberAvailability, bookAppointment } from '../services/barberApi';
  - import { useParams } from 'react-router-dom';

State to add:
  - const [availability, setAvailability] = useState([]);
  - const [loadingAvailability, setLoadingAvailability] = useState(true);

Effect to add:
  - useEffect hook to fetch availability on mount

Handler to add:
  - handleBookingSubmit → call bookAppointment() API

Data/Logic to enhance:
  - Time slots: disable unavailable slots based on availability data
  - Submit: use bookAppointment() instead of mock submission

Status: [ ] To Do  [ ] In Progress  [ ] Completed


PAGE: BarberDashboard.jsx
──────────────────────
Imports needed:
  - import { getAppointments, acceptAppointment, rejectAppointment, rescheduleAppointment } from '../services/barberApi';

State to add:
  - const [appointments, setAppointments] = useState([]);
  - const [loadingAppointments, setLoadingAppointments] = useState(true);
  - const [error, setError] = useState(null);

Effect to add:
  - useEffect hook to fetch appointments on mount

Handlers to add:
  - handleAcceptAppointment(appointmentId)
  - handleRejectAppointment(appointmentId, reason)
  - handleRescheduleAppointment(appointmentId, newDateTime)

UI to add/replace:
  - Replace mock appointments with API data
  - Add buttons for Accept/Reject/Reschedule actions
  - Call handlers on button clicks

Status: [ ] To Do  [ ] In Progress  [ ] Completed


PAGE: Profile Edit (CustomerProfile.jsx / BarberProfileEdit.jsx)
────────────────────────────────────────────────────────────────
Imports needed:
  - import { updateProfile, updateLocation } from '../services/barberApi';

State to add:
  - const [formData, setFormData] = useState({ fullName, bio, email, phone, ... });
  - const [locationData, setLocationData] = useState({ latitude, longitude, address });
  - const [submitting, setSubmitting] = useState(false);

Handlers to add:
  - handleProfileChange(e) → update formData
  - handleLocationChange(e) → update locationData
  - handleSaveProfile(e) → call updateProfile() API
  - handleSaveLocation(e) → call updateLocation() API

Forms to add/replace:
  - Profile form with fields for name, bio, email, phone
  - Location form with fields for address, latitude, longitude
  - Success/Error messages

Status: [ ] To Do  [ ] In Progress  [ ] Completed


PAGE: Portfolio Management (Separate page or component)
──────────────────────────────────────────────────────
Imports needed:
  - import { getBarberPortfolio, addPortfolioItem, deletePortfolioItem } from '../services/barberApi';

State to add:
  - const [portfolioItems, setPortfolioItems] = useState([]);
  - const [loading, setLoading] = useState(true);
  - const [uploading, setUploading] = useState(false);
  - const [selectedFile, setSelectedFile] = useState(null);
  - const [portfolioForm, setPortfolioForm] = useState({ title, description });

Effect to add:
  - useEffect hook to fetch portfolio items on mount

Handlers to add:
  - handleFileSelect(e) → store selected file
  - handleFormChange(e) → update form fields
  - handleAddPortfolioItem(e) → call addPortfolioItem() with FormData
  - handleDeletePortfolioItem(id) → call deletePortfolioItem()

UI to add:
  - Upload form with file input, title, description fields
  - Portfolio grid displaying all items
  - Delete button for each item

Status: [ ] To Do  [ ] In Progress  [ ] Completed


// COMMON PATTERNS
// ────────────────────────────────────────────────────────────────────────────

Pattern 1: Fetch single resource
─────────────────────────────────
useEffect(() => {
  const fetch = async () => {
    try {
      setLoading(true);
      const result = await getBarberProfile(barberId);
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (barberId) fetch();
}, [barberId]);


Pattern 2: Fetch multiple resources in parallel
────────────────────────────────────────────────
useEffect(() => {
  const fetch = async () => {
    try {
      setLoading(true);
      const [res1, res2, res3] = await Promise.all([
        getBarberProfile(id),
        getBarberPortfolio(id),
        getBarberPosts(id)
      ]);
      
      if (res1.success) setData1(res1.data);
      if (res2.success) setData2(res2.data);
      if (res3.success) setData3(res3.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (id) fetch();
}, [id]);


Pattern 3: Submit form with API call
─────────────────────────────────────
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setSubmitting(true);
    const result = await updateProfile(barberId, formData);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.message);
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setSubmitting(false);
  }
};


Pattern 4: File upload with FormData
─────────────────────────────────────
const handleUpload = async (file, metadata) => {
  try {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', metadata.title);
    
    const result = await addPortfolioItem(barberId, formData);
    
    if (result.success) {
      setItems([...items, result.data]);
    } else {
      setError(result.message);
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setUploading(false);
  }
};


Pattern 5: Delete with confirmation
────────────────────────────────────
const handleDelete = async (id) => {
  if (!window.confirm('Are you sure?')) return;
  
  try {
    const result = await deletePortfolioItem(barberId, id);
    
    if (result.success) {
      setItems(prev => prev.filter(item => item.id !== id));
    } else {
      setError(result.message);
    }
  } catch (err) {
    setError(err.message);
  }
};


// AUTHENTICATION
// ────────────────────────────────────────────────────────────────────────────

After Login:
  1. Store token: localStorage.setItem('token', jwtToken)
  2. Store user ID: localStorage.setItem('userId', userId)
  3. barberApi.js will auto-include token in headers

Before Protected API Call:
  1. Check token: const token = localStorage.getItem('token');
  2. If missing or 401 response: redirect to /signin
  3. barberApi.js handles 401 auto-logout

Get Current User ID:
  const userId = localStorage.getItem('userId');
  // Use this as barberId for API calls


// ERROR HANDLING
// ────────────────────────────────────────────────────────────────────────────

Backend Response Format:
{
  "success": false,
  "reason": "UNAUTHORIZED | FORBIDDEN | VALIDATION_ERROR | ...",
  "message": "User-friendly error message",
  "data": null
}

In Frontend:
  - Check result.success first
  - Show result.message to user
  - Log result.reason for debugging
  - Handle 401 → redirect to login
  - Handle 403 → show "access denied"


// ENVIRONMENT SETUP
// ────────────────────────────────────────────────────────────────────────────

Create .env file:
VITE_API_BASE_URL=http://localhost:5000

Or for production:
VITE_API_BASE_URL=https://api.styloq.com

The barberApi.js will use:
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";


// TESTING CHECKLIST
// ────────────────────────────────────────────────────────────────────────────

✓ Public endpoints work without token
✓ Protected endpoints fail without token (401)
✓ Protected endpoints work with valid token
✓ Invalid token triggers logout
✓ Error messages display correctly
✓ Loading states show during fetch
✓ Data displays after successful fetch
✓ Form submissions update data
✓ File uploads work correctly
✓ Delete operations show confirmation
✓ All buttons are wired to handlers
✓ No console errors
✓ Network tab shows correct requests
✓ API Base URL is correct in requests
✓ All imports are present


// REFERENCE FILES
// ────────────────────────────────────────────────────────────────────────────

Created files:
- d:\IIT 2nd Year\SDGP\StyloqHQ\frontend\src\services\barberApi.js
- d:\IIT 2nd Year\SDGP\StyloqHQ\frontend\src\BARBER_API_INTEGRATION_GUIDE.md
- d:\IIT 2nd Year\SDGP\StyloqHQ\frontend\src\QUICK_REFERENCE.md (this file)

Documentation:
- Read BARBER_API_INTEGRATION_GUIDE.md for detailed integration steps per page
- Refer to this file for quick API reference and patterns

API Service:
- All functions are in barberApi.js
- Import only what you need
- All error handling is centralized

