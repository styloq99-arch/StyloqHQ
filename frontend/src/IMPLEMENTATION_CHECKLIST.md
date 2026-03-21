// ═══════════════════════════════════════════════════════════════════════════════
// IMPLEMENTATION CHECKLIST - PRINT & USE THIS
// ═══════════════════════════════════════════════════════════════════════════════
// 
// Print this document or keep it open in a separate window
// Check off items as you complete them
// Helps track progress across multiple pages


============================================================================
PHASE 1: SETUP & PREREQUISITES
============================================================================

PRE-INTEGRATION SETUP
  [ ] Backend is running on http://localhost:5000 (or correct port)
  [ ] Frontend installed with npm install (in StyloqHQ/frontend/)
  [ ] Vite config is set up correctly
  [ ] React Router is installed and working
  [ ] Pages navigate correctly without errors
  [ ] JWT token implementation exists in SignIn page
  [ ] Token is stored in localStorage as "token"
  [ ] User ID is stored in localStorage as "userId"

BARBER API FILES CREATED
  [ ] barberApi.js exists at: src/services/barberApi.js
  [ ] INTEGRATION_SUMMARY.md exists in src/
  [ ] QUICK_REFERENCE.md exists in src/
  [ ] BARBER_API_INTEGRATION_GUIDE.md exists in src/
  [ ] COMPLETE_EXAMPLE.jsx exists in src/
  [ ] FILE_STRUCTURE_AND_NAVIGATION.md exists in src/
  [ ] .env.example exists in frontend/ root

ENVIRONMENT SETUP
  [ ] Created .env file in frontend/ root (copy from .env.example)
  [ ] VITE_API_BASE_URL is set in .env
  [ ] .env is added to .gitignore
  [ ] Ran npm install again (if .env added after installation)

INITIAL TESTING
  [ ] Opened DevTools (F12 or Ctrl+Shift+I)
  [ ] Checked Network tab is working
  [ ] Made a request and saw it in Network tab
  [ ] Verified token appears in Authorization header
  [ ] No CORS errors in console


============================================================================
PHASE 2: FIRST PAGE INTEGRATION (BarberProfileView.jsx)
============================================================================

Before Starting This Section:
  [ ] Read INTEGRATION_SUMMARY.md (entire document)
  [ ] Read QUICK_REFERENCE.md (sections: Quick Start, Common Patterns)
  [ ] Read FILE_STRUCTURE_AND_NAVIGATION.md (understand organization)
  [ ] Read BARBER_API_INTEGRATION_GUIDE.md (BarberProfileView section)
  [ ] Have COMPLETE_EXAMPLE.jsx open as reference

Step 1: Add Imports
  [ ] Open BarberProfileView.jsx
  [ ] Add import: import { getBarberProfile, getBarberPortfolio, getBarberPosts } from '../services/barberApi';
  [ ] Add import: import { useParams } from 'react-router-dom';
  [ ] File compiles without import errors

Step 2: Add State
  [ ] Add: const { barberId } = useParams();
  [ ] Add: const [profileData, setProfileData] = useState(null);
  [ ] Add: const [portfolioItems, setPortfolioItems] = useState([]);
  [ ] Add: const [posts, setPosts] = useState([]);
  [ ] Add: const [loading, setLoading] = useState(true);
  [ ] Add: const [error, setError] = useState(null);
  [ ] File compiles without state errors

Step 3: Add UseEffect Hook
  [ ] Copy useEffect block from BARBER_API_INTEGRATION_GUIDE.md
  [ ] Paste into component after state declarations
  [ ] Verify fetch logic calls all three API functions
  [ ] Check Promise.all() syntax is correct
  [ ] File compiles without effect errors

Step 4: Update JSX - Profile Section
  [ ] Replace BARBER_DATA.name with: displayProfile?.fullName || displayProfile?.name
  [ ] Replace BARBER_DATA.avatar with: displayProfile?.profilePictureUrl
  [ ] Replace BARBER_DATA.experience with: displayProfile?.bio
  [ ] Add onError handlers to image tags (fallback URLs)
  [ ] Images show (either from API or fallback)

Step 5: Update JSX - Portfolio Section
  [ ] Replace SERVICES mapping with portfolioItems mapping
  [ ] Display portfolio items instead of mock services
  [ ] Add loading spinner during fetch
  [ ] Add error message if fetch fails
  [ ] Portfolio displays correctly when data loads

Step 6: Optional - Add Posts Section
  [ ] Create new section for posts
  [ ] Display posts data returned from API
  [ ] Only show if posts.length > 0
  [ ] Format properly in JSX

Step 7: Test in Browser
  [ ] npm run dev (start dev server)
  [ ] Navigate to BarberProfileView page
  [ ] Check no console errors (F12 → Console)
  [ ] Check Network tab for /barber/* requests
  [ ] Verify Authorization header is present
  [ ] Verify response status is 200
  [ ] Verify data displays on page
  [ ] Loading spinner shows during fetch
  [ ] Try with invalid barberId (should show error gracefully)

Step 8: Test Error Scenarios
  [ ] Stop backend server
  [ ] Refresh page (should show error but not crash)
  [ ] Start backend again
  [ ] Refresh page (should work again)
  [ ] Check console for error stack traces (should be handled)

BarberProfileView.jsx COMPLETE!
  ✓ Profile data loads from API
  ✓ Portfolio items load from API
  ✓ Posts load from API (if implemented)
  ✓ Error handling works
  ✓ Loading state displays
  ✓ No console errors
  ✓ No layout changes from original


============================================================================
PHASE 3: SECOND PAGE INTEGRATION (BookingPage.jsx)
============================================================================

Before Starting This Section:
  [ ] BarberProfileView.jsx fully working and tested
  [ ] Feel confident about the pattern
  [ ] Re-read BARBER_API_INTEGRATION_GUIDE.md BookingPage section

Step 1: Add Imports
  [ ] Add: import { getBarberAvailability, bookAppointment } from '../services/barberApi';
  [ ] Add: import { useParams, useNavigate } from 'react-router-dom';
  [ ] File compiles

Step 2: Add State
  [ ] Add: const { barberId } = useParams();
  [ ] Add: const [availability, setAvailability] = useState([]);
  [ ] Add: const [loadingAvailability, setLoadingAvailability] = useState(true);
  [ ] File compiles

Step 3: Add UseEffect Hook
  [ ] Copy useEffect from BARBER_API_INTEGRATION_GUIDE.md
  [ ] Calls getBarberAvailability()
  [ ] Sets availabilityData on success
  [ ] File compiles

Step 4: Update Booking Handler
  [ ] Find booking form submission handler
  [ ] Add API call to bookAppointment()
  [ ] Pass correct parameters (barberId, bookingData)
  [ ] Check result.success before proceeding
  [ ] Redirect on success (to confirmation page)
  [ ] Show error message on failure
  [ ] Disable buttons during submission

Step 5: Update Time Slots
  [ ] Optional: Filter available time slots based on availability data
  [ ] Mark unavailable slots as disabled
  [ ] Show visual indication (different color/opacity)
  [ ] Prevent clicking disabled slots

Step 6: Test in Browser
  [ ] Navigate to BookingPage
  [ ] Check availability loads from API
  [ ] Try booking an appointment
  [ ] Check Network tab for bookAppointment request
  [ ] Verify response has success: true
  [ ] Verify redirect or success message shows
  [ ] Test with error (invalid data, network down)
  [ ] No console errors

BookingPage.jsx COMPLETE!
  ✓ Availability loads from API
  ✓ Booking submits to API
  ✓ Redirect on success
  ✓ Error handling works
  ✓ No console errors


============================================================================
PHASE 4: THIRD PAGE - DASHBOARD (BarberDashboard.jsx or similar)
============================================================================

Before Starting:
  [ ] First two pages working perfectly
  [ ] Confident with API patterns
  [ ] Read BARBER_API_INTEGRATION_GUIDE.md Dashboard section

Step 1: Add Imports
  [ ] Add: import { getAppointments, acceptAppointment, rejectAppointment, rescheduleAppointment } from '../services/barberApi';
  [ ] File compiles

Step 2: Add State
  [ ] Add: const [appointments, setAppointments] = useState([]);
  [ ] Add: const [loadingAppointments, setLoadingAppointments] = useState(true);
  [ ] Add: const barberId = localStorage.getItem('userId');
  [ ] File compiles

Step 3: Add UseEffect Hook
  [ ] Fetch appointments on mount
  [ ] Set appointments state on success
  [ ] Handle errors gracefully

Step 4: Add Action Handlers
  [ ] Add handleAcceptAppointment() function
  [ ] Add handleRejectAppointment() function
  [ ] Add handleRescheduleAppointment() function
  [ ] Each updates local state after API success
  [ ] Each shows error message on failure

Step 5: Update JSX
  [ ] Replace mock appointments with API data
  [ ] Map through appointments array
  [ ] Show accept/reject/reschedule buttons
  [ ] Wire buttons to handlers
  [ ] Show confirmation dialogs where appropriate

Step 6: Test in Browser
  [ ] Check appointments load correctly
  [ ] Test Accept button (appointment status changes)
  [ ] Test Reject button (appointment removed)
  [ ] Test Reschedule button (date/time updates)
  [ ] Check Network tab for all requests
  [ ] Verify each request has correct parameters
  [ ] Test error scenarios (invalid appointment, network error)
  [ ] No console errors

BarberDashboard.jsx COMPLETE!
  ✓ Appointments load from API
  ✓ Accept/Reject/Reschedule work
  ✓ Local state updates optimistically
  ✓ Error handling works
  ✓ No console errors


============================================================================
PHASE 5: PROFILE EDIT PAGE (CustomerProfile.jsx or similar)
============================================================================

Before Starting:
  [ ] Three pages done and working
  [ ] Understand pattern well
  [ ] Read BARBER_API_INTEGRATION_GUIDE.md Profile Edit section

Step 1: Add Imports
  [ ] Add: import { updateProfile, updateLocation } from '../services/barberApi';
  [ ] File compiles

Step 2: Add State
  [ ] Add profile form state (name, email, phone, bio, etc.)
  [ ] Add location form state (address, latitude, longitude)
  [ ] Add submitting flag
  [ ] Add success message flag
  [ ] File compiles

Step 3: Add Handlers
  [ ] Add handleProfileChange() - updates form state
  [ ] Add handleLocationChange() - updates location state
  [ ] Add handleSaveProfile() - API call + state update
  [ ] Add handleSaveLocation() - API call + state update
  [ ] Each shows success/error messages

Step 4: Add Forms to JSX
  [ ] Create profile edit form
  [ ] Create location edit form
  [ ] Wire change handlers
  [ ] Wire submit handlers
  [ ] Show success messages

Step 5: Test in Browser
  [ ] Load page with profile data
  [ ] Edit profile fields
  [ ] Click Save (should call updateProfile API)
  [ ] Check Network tab for request
  [ ] Verify success message shows
  [ ] Edit location fields
  [ ] Click Save location (should call updateLocation API)
  [ ] Test validation (required fields)
  [ ] Test error handling
  [ ] No console errors

Profile Edit Page COMPLETE!
  ✓ Profile data can be updated
  ✓ Location data can be updated
  ✓ Forms validate correctly
  ✓ Success messages display
  ✓ Error messages display
  ✓ No console errors


============================================================================
PHASE 6: PORTFOLIO MANAGEMENT PAGE
============================================================================

Before Starting:
  [ ] All previous pages done
  [ ] Comfortable with file uploads
  [ ] Read BARBER_API_INTEGRATION_GUIDE.md Portfolio section

Step 1: Add Imports
  [ ] Add: import { getBarberPortfolio, addPortfolioItem, deletePortfolioItem } from '../services/barberApi';
  [ ] File compiles

Step 2: Add State
  [ ] Add: const [portfolioItems, setPortfolioItems] = useState([]);
  [ ] Add: const [loading, setLoading] = useState(true);
  [ ] Add: const [uploading, setUploading] = useState(false);
  [ ] Add: const [selectedFile, setSelectedFile] = useState(null);
  [ ] Add: const [portfolioForm, setPortfolioForm] = useState({ title, description });
  [ ] File compiles

Step 3: Add UseEffect - Load Portfolio
  [ ] Fetch portfolio items on mount
  [ ] Set portfolioItems state on success
  [ ] Handle errors

Step 4: Add Handlers
  [ ] Add handleFileSelect() - store selected file
  [ ] Add handleFormChange() - update form fields
  [ ] Add handleAddPortfolioItem() - upload with FormData
  [ ] Add handleDeletePortfolioItem() - delete with confirmation
  [ ] Each manages local state and shows messages

Step 5: Important - File Upload
  [ ] Create FormData object (new FormData())
  [ ] Append file: formData.append('file', file)
  [ ] Append metadata: formData.append('title', title)
  [ ] Pass FormData to addPortfolioItem()
  [ ] Do NOT set Content-Type header
  [ ] Do NOT JSON.stringify FormData

Step 6: Add JSX - Upload Form
  [ ] Create file input
  [ ] Create title input
  [ ] Create description textarea
  [ ] Create upload button
  [ ] Show uploading progress

Step 7: Add JSX - Portfolio Grid
  [ ] Map through portfolioItems
  [ ] Display image, title, description
  [ ] Add delete button for each item
  [ ] Show confirmation before delete

Step 8: Test in Browser
  [ ] Load portfolio items (should display)
  [ ] Select an image file
  [ ] Enter title and description
  [ ] Click upload
  [ ] Check Network tab (verify FormData in request)
  [ ] Item should appear in grid
  [ ] Try delete button
  [ ] Confirm dialog appears
  [ ] Item removed from grid
  [ ] Test error scenarios
  [ ] No console errors

Portfolio Management COMPLETE!
  ✓ Portfolio items load from API
  ✓ New items can be uploaded
  ✓ Items display in grid
  ✓ Items can be deleted
  ✓ Error handling works
  ✓ No console errors


============================================================================
PHASE 7: FINAL VERIFICATION & TESTING
============================================================================

COMPILE & BUILD CHECK
  [ ] npm run dev - no build errors
  [ ] npm run build - builds successfully to dist/
  [ ] No TypeScript/ESLint errors (if applicable)
  [ ] No console warnings about deprecated APIs

FUNCTIONALITY CHECK
  [ ] BarberProfileView - loads and displays data
  [ ] BookingPage - books appointments successfully
  [ ] Dashboard - manage appointments works
  [ ] Profile Edit - update profile works
  [ ] Portfolio - upload/delete items works
  [ ] All pages navigate correctly
  [ ] Back buttons work
  [ ] All links work

NETWORK & API CHECK
  [ ] Network tab shows /barber/* requests
  [ ] All requests have Authorization header
  [ ] All successful requests get 200 status
  [ ] All responses have { success: true, data: ... }
  [ ] Error responses handled gracefully
  [ ] 401 errors redirect to login
  [ ] 403 errors show access denied message

AUTHENTICATION CHECK
  [ ] Can login successfully
  [ ] Token stored in localStorage
  [ ] User ID stored in localStorage
  [ ] Token included in API requests
  [ ] 401 redirects to /signin
  [ ] 403 shows permission message
  [ ] Logout clears token

ERROR HANDLING CHECK
  [ ] Disconnect internet - graceful error display
  [ ] Invalid barberId - error message shows
  [ ] Network error on API call - error message shows
  [ ] Missing token - redirects to login
  [ ] Server returns error - user-friendly message shows

CONSOLE CHECK
  [ ] No red errors in console (F12)
  [ ] No yellow warnings (ok to have some)
  [ ] No undefined references
  [ ] All imports resolve correctly
  [ ] No fetch/CORS errors

PERFORMANCE CHECK
  [ ] Pages load quickly
  [ ] No duplicate API calls
  [ ] No infinite loops or re-renders
  [ ] Loading spinners display during fetch
  [ ] Images load properly

USER EXPERIENCE CHECK
  [ ] Error messages are user-friendly
  [ ] Success messages display after actions
  [ ] Buttons disable during submission
  [ ] Forms validate before submit
  [ ] No unexpected redirects
  [ ] Navigation is smooth


============================================================================
PHASE 8: CLEANUP & DOCUMENTATION
============================================================================

CODE CLEANUP
  [ ] Remove console.log() statements (or make them debug-only)
  [ ] Remove commented-out code
  [ ] Remove any test data or mocks that aren't needed
  [ ] Format code consistently (indent, spacing)
  [ ] Add comments for complex logic
  [ ] Check spelling in variable names

DOCUMENTATION
  [ ] Update component comments if changed
  [ ] Document any custom logic added
  [ ] Note any gotchas or important details
  [ ] Keep DOCUMENTATION files updated

GIT COMMIT
  [ ] Stage all changes: git add .
  [ ] Commit with message: git commit -m "Integrate barber APIs"
  [ ] Verify nothing sensitive was committed

FINAL REVIEW
  [ ] Read through main changes
  [ ] Check for any remaining issues
  [ ] Test one more time end-to-end
  [ ] All checkboxes above are checked


============================================================================
SUMMARY OF CHECKLIST
============================================================================

SETUP:              12 items
Phase 1 (Profile):  8 items  ✓ COMPLETE
Phase 2 (Booking):  6 items  ✓ COMPLETE
Phase 3 (Dashboard): 6 items ✓ COMPLETE
Phase 4 (Profile Edit): 5 items ✓ COMPLETE
Phase 5 (Portfolio): 8 items ✓ COMPLETE
Final Testing:      22 items ✓ COMPLETE
Cleanup:            5 items  ✓ COMPLETE

TOTAL ITEMS:        72
COMPLETED:          ____ / 72


============================================================================
IF YOU GET STUCK
============================================================================

Compilation Error?
  → Check imports are from correct path
  → Check syntax is correct (missing comma, bracket, etc.)
  → Check file exists

API Request Failing?
  → Open Network tab (F12)
  → Check request URL is correct
  → Check Authorization header has token
  → Check response status and body
  → Check backend is running

Data Not Displaying?
  → Check result.success is true
  → Check property names match API response
  → Check data type (array vs object)
  → Check JSX references correct properties
  → Check error message in console

Button Not Working?
  → Check onClick handler is attached
  → Check handler is calling API function
  → Check handler parameters are correct
  → Check loading/disabled states logic
  → Check error in console

Token Not Saving?
  → Check signin page saves token to localStorage
  → Check localStorage.setItem() is called
  → Check key name is 'token'
  → Test in private/incognito window
  → Check localStorage quota isn't exceeded

Need Help?
  → Check QUICK_REFERENCE.md for patterns
  → Check BARBER_API_INTEGRATION_GUIDE.md for your page
  → Check COMPLETE_EXAMPLE.jsx for working code
  → Check troubleshooting section in INTEGRATION_SUMMARY.md


============================================================================
YOU'RE DONE!
============================================================================

If all checkboxes above are checked ✓, then you have successfully:

✓ Integrated barber API service into React frontend
✓ Connected all barber-related pages to backend
✓ Implemented authentication and token management
✓ Added error handling and user feedback
✓ Tested all endpoints and functionality
✓ Cleaned up code and documented changes

Congratulations! The barber API is now fully integrated. 🎉

Your frontend is ready to work with the StyloQ backend.

