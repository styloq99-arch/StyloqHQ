// ═══════════════════════════════════════════════════════════════════════════════
// BARBER API INTEGRATION - COMPLETE SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

PROJECT OVERVIEW
────────────────
This integration provides a complete, centralized API service for all barber-related
endpoints in the StyloQ application. All endpoints are behind JWT authentication,
with automatic header injection and error handling.

Backend Base URL: /barber
Authentication: Bearer <token> (stored in localStorage as "token")
Response Format: { success: boolean, data: any, message?: string, reason?: string }


FILES CREATED
─────────────────────────────────────────────────────────────────────────────────

1. barberApi.js
   Location: d:\IIT 2nd Year\SDGP\StyloqHQ\frontend\src\services\barberApi.js
   Purpose: Centralized API service with all barber endpoint functions
   Size: ~400 lines
   
   Key Functions:
   - getBarberProfile(barberId) - PUBLIC
   - getBarberAvailability(barberId) - PUBLIC
   - getBarberPortfolio(barberId) - PUBLIC
   - getBarberPosts(barberId) - PUBLIC
   - updateProfile(barberId, data) - PROTECTED
   - updateLocation(barberId, data) - PROTECTED
   - updateAvailability(barberId, data) - PROTECTED
   - addPortfolioItem(barberId, formData) - PROTECTED
   - deletePortfolioItem(barberId, portfolioId) - PROTECTED
   - createPost(barberId, formData) - PROTECTED
   - getAppointments(barberId) - PROTECTED
   - acceptAppointment(appointmentId) - PROTECTED
   - rejectAppointment(appointmentId, reason) - PROTECTED
   - rescheduleAppointment(appointmentId, dateTime) - PROTECTED
   - bookAppointment(barberId, data) - PROTECTED (or PUBLIC for clients)
   

2. BARBER_API_INTEGRATION_GUIDE.md
   Location: d:\IIT 2nd Year\SDGP\StyloqHQ\frontend\src\BARBER_API_INTEGRATION_GUIDE.md
   Purpose: Detailed integration guide with code snippets for each page
   Contents:
   - BarberProfileView.jsx - Load and display barber data
   - BookingPage.jsx - Fetch availability and submit booking
   - BarberDashboard.jsx - Manage appointments
   - Profile Edit Page - Update profile and location
   - Portfolio Management - Add/delete portfolio items
   

3. QUICK_REFERENCE.md
   Location: d:\IIT 2nd Year\SDGP\StyloqHQ\frontend\src\QUICK_REFERENCE.md
   Purpose: Quick lookup reference and checklist
   Contents:
   - API endpoints summary
   - Implementation checklist per page
   - Common patterns with code examples
   - Error handling guide
   - Testing checklist
   

4. COMPLETE_EXAMPLE.jsx
   Location: d:\IIT 2nd Year\SDGP\StyloqHQ\frontend\src\COMPLETE_EXAMPLE.jsx
   Purpose: Full working example of BarberProfileView.jsx with API integration
   Contents:
   - Complete component code with all API calls
   - Detailed comments explaining each change
   - Error handling and loading states
   - Fallback to mock data if API fails
   - Can be used as reference when implementing other pages


QUICK START
─────────────────────────────────────────────────────────────────────────────────

Step 1: Add API service to your component
────────────────────────────────────────
import { getBarberProfile, getBarberPortfolio } from '../services/barberApi';

Step 2: Add state for API data
──────────────────────────────
const [profileData, setProfileData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

Step 3: Fetch data on mount
───────────────────────────
useEffect(() => {
  const fetch = async () => {
    try {
      const result = await getBarberProfile(barberId);
      if (result.success) {
        setProfileData(result.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  if (barberId) fetch();
}, [barberId]);

Step 4: Display data in JSX
───────────────────────────
{!loading && profileData && (
  <h2>{profileData.fullName || profileData.name}</h2>
)}

Done! The data is now integrated.


AUTHENTICATION SETUP
─────────────────────────────────────────────────────────────────────────────────

After user logs in:
  1. Save token: localStorage.setItem('token', jwtToken)
  2. Save user ID: localStorage.setItem('userId', userId)

Before making protected API calls:
  1. Get barberId: const userId = localStorage.getItem('userId');
  2. barberApi.js will auto-attach token to headers

Handling auth errors:
  - 401 response → barberApi.js auto-redirects to /signin
  - 403 response → show "access denied" message


ENVIRONMENT VARIABLES
─────────────────────────────────────────────────────────────────────────────────

Add to .env file in frontend root:
  VITE_API_BASE_URL=http://localhost:5000

For production:
  VITE_API_BASE_URL=https://api.styloq.com

If not set, barberApi.js defaults to http://localhost:5000


INTEGRATION CHECKLIST
─────────────────────────────────────────────────────────────────────────────────

For Each Page You Integrate:

[ ] 1. Import required functions from barberApi
      import { functionName } from '../services/barberApi';

[ ] 2. Add state for data
      const [data, setData] = useState(null);
      const [loading, setLoading] = useState(true);

[ ] 3. Add useEffect to fetch data
      useEffect(() => { /* fetch */ }, [dependencies]);

[ ] 4. Update JSX to use API data
      {loading ? <Spinner /> : <Content data={data} />}

[ ] 5. Handle errors gracefully
      {error && <ErrorMessage message={error} />}

[ ] 6. Show loading state while fetching
      {loading && <LoadingSpinner />}

[ ] 7. Test with network tab (F12 → Network)
      - Verify requests include Authorization header
      - Check response status codes
      - Confirm data displays correctly

[ ] 8. Test error scenarios
      - Disconnect internet and refresh page
      - Provide invalid barberId
      - Not logged in trying to access protected endpoint

[ ] 9. No console errors
      - Open F12 → Console
      - Verify no red errors
      - Debug any issues

[ ] 10. Component works end-to-end
       - Data loads on mount
       - All buttons/actions work
       - No layout changes from original


COMMON PATTERNS
─────────────────────────────────────────────────────────────────────────────────

Pattern 1: Fetch and Display
────────────────────────────
const [data, setData] = useState(null);

useEffect(() => {
  const fetch = async () => {
    const res = await getBarberProfile(id);
    if (res.success) setData(res.data);
  };
  fetch();
}, [id]);

return (
  {data && <h2>{data.name}</h2>}
);


Pattern 2: Form Submission
──────────────────────────
const [formData, setFormData] = useState({ name: '', email: '' });

const handleSubmit = async (e) => {
  e.preventDefault();
  const res = await updateProfile(id, formData);
  if (res.success) alert('Saved!');
  else alert(res.message);
};

return (
  <form onSubmit={handleSubmit}>
    <input onChange={handleChange} />
    <button>Save</button>
  </form>
);


Pattern 3: File Upload
─────────────────────
const [file, setFile] = useState(null);

const handleUpload = async () => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await addPortfolioItem(id, formData);
  if (res.success) setItems([...items, res.data]);
};

return (
  <>
    <input type="file" onChange={(e) => setFile(e.target.files[0])} />
    <button onClick={handleUpload}>Upload</button>
  </>
);


Pattern 4: Delete with Confirmation
────────────────────────────────────
const handleDelete = async (id) => {
  if (!confirm('Delete?')) return;
  const res = await deletePortfolioItem(barberId, id);
  if (res.success) setItems(items.filter(i => i.id !== id));
};


Pattern 5: List with Actions
─────────────────────────────
const [items, setItems] = useState([]);

useEffect(() => {
  const fetch = async () => {
    const res = await getAppointments(id);
    if (res.success) setItems(res.data);
  };
  fetch();
}, [id]);

return (
  <div>
    {items.map(item => (
      <div key={item.id} className="item">
        <h3>{item.title}</h3>
        <button onClick={() => handleAccept(item.id)}>Accept</button>
        <button onClick={() => handleReject(item.id)}>Reject</button>
      </div>
    ))}
  </div>
);


ERROR RESPONSE HANDLING
─────────────────────────────────────────────────────────────────────────────────

Backend sends error as:
{
  "success": false,
  "reason": "UNAUTHORIZED",
  "message": "User must be logged in"
}

Frontend handling:
const result = await apiFunction();

if (!result.success) {
  // Show user-friendly message
  alert(result.message);
  
  // Log technical reason for debugging
  console.error('Error reason:', result.reason);
  
  // Handle specific errors
  if (result.reason === 'UNAUTHORIZED') {
    // Redirect to login
    navigate('/signin');
  } else if (result.reason === 'FORBIDDEN') {
    // Show access denied
    alert('Access denied');
  }
}


WORKING WITH TOKENS
─────────────────────────────────────────────────────────────────────────────────

Getting token:
  const token = localStorage.getItem('token');

Checking if logged in:
  const isLoggedIn = !!localStorage.getItem('token');

barberApi.js automatically:
  ✓ Adds "Authorization: Bearer <token>" header to all requests
  ✓ Redirects to /signin if token missing/invalid (401)
  ✓ Shows "Access denied" for 403 responses

You don't need to manually handle tokens in components!


TESTING WITH NETWORK TAB
─────────────────────────────────────────────────────────────────────────────────

1. Open DevTools: Press F12
2. Go to Network tab
3. Reload page or trigger API call
4. Look for requests to /barber/* endpoints
5. Click on request to see:
   - Request headers (should have Authorization)
   - Response status (200 = success, 401 = unauthorized, etc.)
   - Response body (should have { success, data, ... })

Expected headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiI...
  Content-Type: application/json


PAGE-BY-PAGE IMPLEMENTATION GUIDE
─────────────────────────────────────────────────────────────────────────────────

See BARBER_API_INTEGRATION_GUIDE.md for detailed integration steps for:

1. BarberProfileView.jsx
   - Load profile, portfolio, posts
   - Display all data
   - Show loading/error states

2. BookingPage.jsx
   - Load availability
   - Show available time slots
   - Submit booking to API

3. BarberDashboard.jsx
   - Load appointments
   - Accept/reject/reschedule actions
   - Update UI optimistically

4. Profile Edit Pages
   - Update profile fields
   - Update location
   - Show success messages

5. Portfolio Management
   - Upload portfolio items
   - Display portfolio grid
   - Delete items with confirmation


REFERENCE: COMPLETE EXAMPLE
─────────────────────────────────────────────────────────────────────────────────

See COMPLETE_EXAMPLE.jsx for a fully working BarberProfileView component with:
- All API integration patterns
- Error handling examples
- Loading states
- Fallback to mock data
- Complete JSX with comments
- Can be copied and modified for other pages


TROUBLESHOOTING
─────────────────────────────────────────────────────────────────────────────────

Issue: Requests failing with 401
Solution: Check localStorage has 'token' key
         Check token hasn't expired
         Check backend is running

Issue: Data not displaying
Solution: Check API response in Network tab
         Verify result.success is true
         Check data structure matches expectations
         Check for typos in property names

Issue: CORS errors
Solution: Backend should have CORS headers configured
         Check API_BASE_URL is correct
         Check backend is running on correct port

Issue: Files not uploading
Solution: Use FormData() not JSON
         Don't set Content-Type header (let browser set it)
         Check file size isn't too large

Issue: Token not persisting
Solution: Make sure to save token after login:
         localStorage.setItem('token', response.token);
         localStorage.setItem('userId', response.userId);

Issue: Getting 403 Forbidden
Solution: User might not have 'barber' role
         Check user role in backend
         Only barbers can call protected barber endpoints


BEST PRACTICES
─────────────────────────────────────────────────────────────────────────────────

✓ DO:
  - Use barberApi service for all API calls
  - Add loading and error states
  - Show user-friendly error messages
  - Fetch data in useEffect with dependencies
  - Use Promise.all for parallel requests
  - Fallback to mock data if API fails gracefully
  - Check result.success before using data
  - Log errors for debugging
  - Keep components clean and readable
  - Test with Network tab to verify requests

✗ DON'T:
  - Make fetch calls without barberApi service
  - Ignore error responses
  - Hardcode API URLs
  - Forget to set Authorization header
  - Call APIs in render method
  - Ignore loading states
  - Show technical error reasons to users
  - Make same API call on every render
  - Mutate state directly
  - Leave console errors unfixed


SUPPORT RESOURCES
─────────────────────────────────────────────────────────────────────────────────

Files to reference:
- barberApi.js - All API functions with comments
- BARBER_API_INTEGRATION_GUIDE.md - Detailed page-by-page guide
- QUICK_REFERENCE.md - Quick lookup and patterns
- COMPLETE_EXAMPLE.jsx - Full working example

Common React patterns:
- useState - for component state
- useEffect - for side effects (API calls)
- useParams - to get URL parameters
- useNavigate - to redirect pages
- import/export - for code organization

Backend expectations:
- All requests to /barber/* endpoints
- Token in Authorization header with "Bearer " prefix
- Response format: { success, data, message, reason }
- 401 = unauthorized, 403 = forbidden, 200 = success


SUMMARY
────────

You now have:
✓ Complete barberApi.js service with all endpoints
✓ Detailed integration guide for each page
✓ Quick reference with patterns and checklist
✓ Complete working example (BarberProfileView)
✓ Error handling and authentication setup
✓ Testing and troubleshooting guide

Next step: Pick ONE page and follow the integration steps in
BARBER_API_INTEGRATION_GUIDE.md. Test it thoroughly, then move to next page.

Good luck! 🚀

