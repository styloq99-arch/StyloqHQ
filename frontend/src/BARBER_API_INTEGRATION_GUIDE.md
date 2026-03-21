// ═══════════════════════════════════════════════════════════════════════════════
// BARBER API INTEGRATION GUIDE
// Integration snippets for each frontend page
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// 1. BARBER PROFILE VIEW (BarberProfileView.jsx)
// ─────────────────────────────────────────────────────────────────────────────

/*
LOCATION: At the top of the file with other imports

ADD THIS:
*/
import { getBarberProfile, getBarberPortfolio, getBarberPosts } from '../services/barberApi';

/*
LOCATION: Inside the BarberProfile component, after existing state declarations

ADD THIS:
*/
const [profileData, setProfileData] = useState(null);
const [portfolioItems, setPortfolioItems] = useState([]);
const [posts, setPosts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// Get barberId from URL params
const { barberId } = useParams(); // Make sure to import useParams from react-router-dom

/*
LOCATION: Inside BarberProfile component, after state declarations

ADD THIS EFFECT:
*/
useEffect(() => {
  const fetchBarberData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all barber data in parallel
      const [profileRes, portfolioRes, postsRes] = await Promise.all([
        getBarberProfile(barberId),
        getBarberPortfolio(barberId),
        getBarberPosts(barberId)
      ]);

      if (profileRes.success) {
        setProfileData(profileRes.data);
      }
      if (portfolioRes.success) {
        setPortfolioItems(portfolioRes.data || []);
      }
      if (postsRes.success) {
        setPosts(postsRes.data || []);
      }

      // Handle any errors
      if (!profileRes.success) {
        setError(profileRes.message || 'Failed to load profile');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Error fetching barber data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (barberId) {
    fetchBarberData();
  }
}, [barberId]);

/*
LOCATION: In the JSX, where barber name is displayed (around line where BARBER_DATA.name is used)

REPLACE:
  <h2 className="bp-name">{BARBER_DATA.name}</h2>

WITH:
  <h2 className="bp-name">{profileData?.fullName || profileData?.name || BARBER_DATA.name}</h2>

REPLACE:
  <p className="bp-experience">{BARBER_DATA.experience}</p>

WITH:
  <p className="bp-experience">{profileData?.bio || BARBER_DATA.experience}</p>

REPLACE:
  <img src={BARBER_DATA.avatar} alt={BARBER_DATA.name}

WITH:
  <img src={profileData?.profilePictureUrl || BARBER_DATA.avatar} alt={profileData?.fullName || BARBER_DATA.name}
*/

/*
LOCATION: In services/portfolio grid section

Instead of mapping SERVICES, map from API data:

REPLACE:
  {activeCategory && SERVICES.filter(s => s.category === activeCategory).map(service => (

WITH:
  {portfolioItems.length > 0 
    ? portfolioItems.map(item => (
        <div key={item.id} className="service-card" onClick={() => setSelectedService(item)}>
          <img src={item.imageUrl} alt={item.title} />
          <p>{item.title}</p>
          <p className="price">{item.description}</p>
        </div>
      ))
    : (activeCategory && SERVICES.filter(s => s.category === activeCategory).map(service => (
        // fallback to existing SERVICES
*/

/*
LOCATION: In the section where reviews are displayed

Keep existing reviews logic, but you can add posts data like:

  {posts.length > 0 && (
    <section className="posts-section">
      <h3>Latest Posts</h3>
      <div className="posts-grid">
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <img src={post.imageUrl} alt="" />
            <p>{post.caption}</p>
          </div>
        ))}
      </div>
    </section>
  )}
*/


// ─────────────────────────────────────────────────────────────────────────────
// 2. BOOKING PAGE (BookingPage.jsx)
// ─────────────────────────────────────────────────────────────────────────────

/*
LOCATION: At the top of the file with other imports

ADD THIS:
*/
import { getBarberAvailability, bookAppointment } from '../services/barberApi';
import { useParams } from 'react-router-dom';

/*
LOCATION: Inside BookingPage component, after existing state declarations

ADD THIS:
*/
const { barberId } = useParams();
const [availability, setAvailability] = useState([]);
const [loadingAvailability, setLoadingAvailability] = useState(true);

/*
LOCATION: Inside BookingPage component, after state declarations

ADD THIS EFFECT:
*/
useEffect(() => {
  const fetchAvailability = async () => {
    try {
      setLoadingAvailability(true);
      const result = await getBarberAvailability(barberId);
      if (result.success) {
        setAvailability(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
    } finally {
      setLoadingAvailability(false);
    }
  };

  if (barberId) {
    fetchAvailability();
  }
}, [barberId]);

/*
LOCATION: Where booking is submitted (look for form submission handler)

MODIFY THE EXISTING SUBMISSION HANDLER:
*/
const handleBookingSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // Ensure user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    // Prepare booking data
    const bookingData = {
      dateTime: selectedDate && selectedTime 
        ? `${selectedDate}T${selectedTime}` 
        : null,
      hairstyleId: selectedService?.id || null,
      serviceType: selectedGender,
      notes: specialRequests || ''
    };

    // Call API
    const result = await bookAppointment(barberId, bookingData);

    if (result.success) {
      // Success - navigate to confirmation or appointment page
      navigate(`/appointment-overview/${result.data.id}`);
      // or show success message
      alert('Appointment booked successfully!');
    } else {
      // Handle error
      alert(result.message || 'Failed to book appointment');
    }
  } catch (error) {
    console.error('Booking error:', error);
    alert(error.message || 'An error occurred while booking');
  }
};

/*
LOCATION: In time slots section, where TIME_SLOTS is used

You can enhance it with availability check:

REPLACE:
  {TIME_SLOTS.map(time => (

WITH:
  {TIME_SLOTS.map(time => {
    // Check if time is available
    const isAvailable = !availability.some(slot => 
      slot.time === time && slot.isBooked
    );
    
    return (
      <button
        key={time}
        className={`time-slot ${selectedTime === time ? 'selected' : ''} 
                    ${!isAvailable ? 'disabled' : ''}`}
        onClick={() => isAvailable && setSelectedTime(time)}
        disabled={!isAvailable}
      >
        {time}
      </button>
    );
  })}
*/


// ─────────────────────────────────────────────────────────────────────────────
// 3. BARBER DASHBOARD (BarberDashboard.jsx) - APPOINTMENTS MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/*
LOCATION: At the top of the file with other imports

ADD THIS:
*/
import { 
  getAppointments, 
  acceptAppointment, 
  rejectAppointment, 
  rescheduleAppointment 
} from '../services/barberApi';

/*
LOCATION: Inside BarberDashboard component, after existing state declarations

ADD THIS:
*/
const [appointments, setAppointments] = useState([]);
const [loadingAppointments, setLoadingAppointments] = useState(true);
const [error, setError] = useState(null);
const barberId = localStorage.getItem('userId'); // Assuming userId is stored after login

/*
LOCATION: Inside BarberDashboard component, after state declarations

ADD THIS EFFECT:
*/
useEffect(() => {
  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const result = await getAppointments(barberId);
      
      if (result.success) {
        setAppointments(result.data || []);
      } else {
        setError(result.message || 'Failed to load appointments');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  if (barberId) {
    fetchAppointments();
  }
}, [barberId]);

/*
LOCATION: Add handler functions for appointment actions

ADD THESE:
*/
const handleAcceptAppointment = async (appointmentId) => {
  try {
    const result = await acceptAppointment(appointmentId);
    if (result.success) {
      // Update local state
      setAppointments(prev => 
        prev.map(apt => apt.id === appointmentId 
          ? { ...apt, status: 'accepted' } 
          : apt
        )
      );
      alert('Appointment accepted');
    } else {
      alert(result.message || 'Failed to accept appointment');
    }
  } catch (error) {
    alert(error.message || 'An error occurred');
  }
};

const handleRejectAppointment = async (appointmentId, reason = '') => {
  try {
    const result = await rejectAppointment(appointmentId, { reason });
    if (result.success) {
      // Update local state
      setAppointments(prev => 
        prev.filter(apt => apt.id !== appointmentId)
      );
      alert('Appointment rejected');
    } else {
      alert(result.message || 'Failed to reject appointment');
    }
  } catch (error) {
    alert(error.message || 'An error occurred');
  }
};

const handleRescheduleAppointment = async (appointmentId, newDateTime) => {
  try {
    const result = await rescheduleAppointment(appointmentId, { dateTime: newDateTime });
    if (result.success) {
      // Update local state
      setAppointments(prev => 
        prev.map(apt => apt.id === appointmentId 
          ? { ...apt, dateTime: newDateTime } 
          : apt
        )
      );
      alert('Appointment rescheduled');
    } else {
      alert(result.message || 'Failed to reschedule appointment');
    }
  } catch (error) {
    alert(error.message || 'An error occurred');
  }
};

/*
LOCATION: In the JSX where appointments are displayed

Replace hardcoded appointment data with API data:

REPLACE appointments map/display with:
*/
{appointments.length > 0 ? (
  <div className="appointments-list">
    {appointments.map(apt => (
      <div key={apt.id} className="appointment-card">
        <div className="appointment-info">
          <h3>{apt.clientName}</h3>
          <p>Date: {new Date(apt.dateTime).toLocaleDateString()}</p>
          <p>Time: {new Date(apt.dateTime).toLocaleTimeString()}</p>
          <p>Service: {apt.serviceName}</p>
          <p>Status: <span className={`status-${apt.status}`}>{apt.status}</span></p>
        </div>
        <div className="appointment-actions">
          {apt.status === 'pending' && (
            <>
              <button 
                className="btn-accept"
                onClick={() => handleAcceptAppointment(apt.id)}
              >
                Accept
              </button>
              <button 
                className="btn-reject"
                onClick={() => handleRejectAppointment(apt.id)}
              >
                Reject
              </button>
            </>
          )}
          {apt.status === 'accepted' && (
            <button 
              className="btn-reschedule"
              onClick={() => {
                const newDate = prompt('Enter new date (YYYY-MM-DD):');
                if (newDate) {
                  handleRescheduleAppointment(apt.id, newDate);
                }
              }}
            >
              Reschedule
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
) : (
  <p>No appointments yet</p>
)}

/*
OPTIONAL: Add a refresh button to re-fetch appointments:
*/
<button onClick={() => {
  const result = await getAppointments(barberId);
  if (result.success) {
    setAppointments(result.data || []);
  }
}}>
  Refresh Appointments
</button>


// ─────────────────────────────────────────────────────────────────────────────
// 4. PROFILE EDIT PAGE (e.g., CustomerProfile.jsx or BarberProfileEdit.jsx)
// ─────────────────────────────────────────────────────────────────────────────

/*
LOCATION: At the top of the file with other imports

ADD THIS:
*/
import { updateProfile, updateLocation } from '../services/barberApi';

/*
LOCATION: Inside component, after state declarations

ADD THIS:
*/
const [formData, setFormData] = useState({
  fullName: '',
  bio: '',
  email: '',
  phone: '',
  // ... other fields
});

const [locationData, setLocationData] = useState({
  latitude: 0,
  longitude: 0,
  address: ''
});

const [submitting, setSubmitting] = useState(false);
const [saveSuccess, setSaveSuccess] = useState(false);
const barberId = localStorage.getItem('userId');

/*
LOCATION: Add handlers for form updates

ADD THESE:
*/
const handleProfileChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

const handleLocationChange = (e) => {
  const { name, value } = e.target;
  setLocationData(prev => ({
    ...prev,
    [name]: name === 'latitude' || name === 'longitude' ? parseFloat(value) : value
  }));
};

/**
 * Save profile changes
 */
const handleSaveProfile = async (e) => {
  e.preventDefault();
  try {
    setSubmitting(true);
    const result = await updateProfile(barberId, formData);
    
    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      alert('Profile updated successfully');
    } else {
      alert(result.message || 'Failed to update profile');
    }
  } catch (error) {
    alert(error.message || 'An error occurred');
  } finally {
    setSubmitting(false);
  }
};

/**
 * Save location changes
 */
const handleSaveLocation = async (e) => {
  e.preventDefault();
  try {
    setSubmitting(true);
    const result = await updateLocation(barberId, locationData);
    
    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      alert('Location updated successfully');
    } else {
      alert(result.message || 'Failed to update location');
    }
  } catch (error) {
    alert(error.message || 'An error occurred');
  } finally {
    setSubmitting(false);
  }
};

/*
LOCATION: In your form JSX

Example for profile form:
*/
<form onSubmit={handleSaveProfile}>
  <div className="form-group">
    <label>Full Name</label>
    <input
      type="text"
      name="fullName"
      value={formData.fullName}
      onChange={handleProfileChange}
      required
    />
  </div>

  <div className="form-group">
    <label>Bio</label>
    <textarea
      name="bio"
      value={formData.bio}
      onChange={handleProfileChange}
      rows="4"
    />
  </div>

  <div className="form-group">
    <label>Email</label>
    <input
      type="email"
      name="email"
      value={formData.email}
      onChange={handleProfileChange}
    />
  </div>

  <div className="form-group">
    <label>Phone</label>
    <input
      type="tel"
      name="phone"
      value={formData.phone}
      onChange={handleProfileChange}
    />
  </div>

  <button type="submit" disabled={submitting}>
    {submitting ? 'Saving...' : 'Save Profile'}
  </button>

  {saveSuccess && <p className="success-message">Profile saved successfully!</p>}
</form>

/*
Example for location form:
*/
<form onSubmit={handleSaveLocation}>
  <div className="form-group">
    <label>Address</label>
    <input
      type="text"
      name="address"
      value={locationData.address}
      onChange={handleLocationChange}
    />
  </div>

  <div className="form-group">
    <label>Latitude</label>
    <input
      type="number"
      name="latitude"
      value={locationData.latitude}
      onChange={handleLocationChange}
      step="0.000001"
    />
  </div>

  <div className="form-group">
    <label>Longitude</label>
    <input
      type="number"
      name="longitude"
      value={locationData.longitude}
      onChange={handleLocationChange}
      step="0.000001"
    />
  </div>

  <button type="submit" disabled={submitting}>
    {submitting ? 'Saving...' : 'Save Location'}
  </button>

  {saveSuccess && <p className="success-message">Location updated successfully!</p>}
</form>


// ─────────────────────────────────────────────────────────────────────────────
// 5. PORTFOLIO MANAGEMENT (Separate page or component)
// ─────────────────────────────────────────────────────────────────────────────

/*
LOCATION: At the top of the file with other imports

ADD THIS:
*/
import { getBarberPortfolio, addPortfolioItem, deletePortfolioItem } from '../services/barberApi';

/*
LOCATION: Inside PortfolioManagement component, after state declarations

ADD THIS:
*/
const [portfolioItems, setPortfolioItems] = useState([]);
const [loading, setLoading] = useState(true);
const [uploading, setUploading] = useState(false);
const [selectedFile, setSelectedFile] = useState(null);
const [portfolioForm, setPortfolioForm] = useState({
  title: '',
  description: ''
});
const barberId = localStorage.getItem('userId');

/*
LOCATION: Inside component, add effect to load portfolio

ADD THIS:
*/
useEffect(() => {
  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const result = await getBarberPortfolio(barberId);
      if (result.success) {
        setPortfolioItems(result.data || []);
      }
    } catch (err) {
      console.error('Error loading portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  if (barberId) {
    fetchPortfolio();
  }
}, [barberId]);

/*
LOCATION: Add handlers for portfolio operations

ADD THESE:
*/
const handleFileSelect = (e) => {
  setSelectedFile(e.target.files[0]);
};

const handleFormChange = (e) => {
  const { name, value } = e.target;
  setPortfolioForm(prev => ({
    ...prev,
    [name]: value
  }));
};

const handleAddPortfolioItem = async (e) => {
  e.preventDefault();
  
  if (!selectedFile) {
    alert('Please select an image');
    return;
  }

  if (!portfolioForm.title.trim()) {
    alert('Please enter a title');
    return;
  }

  try {
    setUploading(true);

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', portfolioForm.title);
    formData.append('description', portfolioForm.description);

    const result = await addPortfolioItem(barberId, formData);

    if (result.success) {
      // Add to local state
      setPortfolioItems(prev => [...prev, result.data]);
      // Reset form
      setSelectedFile(null);
      setPortfolioForm({ title: '', description: '' });
      alert('Portfolio item added successfully');
    } else {
      alert(result.message || 'Failed to add portfolio item');
    }
  } catch (error) {
    alert(error.message || 'An error occurred');
  } finally {
    setUploading(false);
  }
};

const handleDeletePortfolioItem = async (portfolioId) => {
  if (!window.confirm('Are you sure you want to delete this item?')) {
    return;
  }

  try {
    const result = await deletePortfolioItem(barberId, portfolioId);

    if (result.success) {
      // Remove from local state
      setPortfolioItems(prev => prev.filter(item => item.id !== portfolioId));
      alert('Portfolio item deleted');
    } else {
      alert(result.message || 'Failed to delete portfolio item');
    }
  } catch (error) {
    alert(error.message || 'An error occurred');
  }
};

/*
LOCATION: In the JSX - portfolio upload form

ADD THIS FORM:
*/
<form onSubmit={handleAddPortfolioItem} className="portfolio-form">
  <div className="form-group">
    <label>Image</label>
    <input
      type="file"
      accept="image/*"
      onChange={handleFileSelect}
      disabled={uploading}
      required
    />
  </div>

  <div className="form-group">
    <label>Title</label>
    <input
      type="text"
      name="title"
      value={portfolioForm.title}
      onChange={handleFormChange}
      placeholder="e.g., Classic Fade"
      disabled={uploading}
      required
    />
  </div>

  <div className="form-group">
    <label>Description</label>
    <textarea
      name="description"
      value={portfolioForm.description}
      onChange={handleFormChange}
      placeholder="Describe this style..."
      rows="3"
      disabled={uploading}
    />
  </div>

  <button type="submit" disabled={uploading}>
    {uploading ? 'Uploading...' : 'Add to Portfolio'}
  </button>
</form>

/*
LOCATION: In the JSX - portfolio items display

ADD THIS:
*/
{loading ? (
  <p>Loading portfolio...</p>
) : portfolioItems.length > 0 ? (
  <div className="portfolio-grid">
    {portfolioItems.map(item => (
      <div key={item.id} className="portfolio-item">
        <img src={item.imageUrl} alt={item.title} />
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <button
          className="btn-delete"
          onClick={() => handleDeletePortfolioItem(item.id)}
        >
          Delete
        </button>
      </div>
    ))}
  </div>
) : (
  <p>No portfolio items yet</p>
)}


// ═══════════════════════════════════════════════════════════════════════════════
// IMPORTANT NOTES
// ═══════════════════════════════════════════════════════════════════════════════

/*
1. TOKEN MANAGEMENT:
   - Token is stored in localStorage as "token"
   - barberApi.js automatically adds it to request headers
   - 401 errors trigger auto-logout

2. USER ID:
   - Replace localhost.getItem('userId') with your actual user ID storage
   - You must store userId after login
   - For current user context, store barberId after JWT validation

3. ERROR HANDLING:
   - Always wrap API calls in try-catch
   - Backend response format: { success: boolean, data: any, message?: string, reason?: string }
   - Show user-friendly messages (result.message)

4. STATE MANAGEMENT:
   - Use useState for local data
   - Use useEffect for data fetching
   - Combine multiple API calls with Promise.all for parallel requests

5. NO UI CHANGES:
   - All integrations use existing component structure
   - Only add state and effects
   - Keep existing CSS and layout intact
   - Progressively enhance with API data

6. ENVIRONMENT VARIABLES:
   - Set VITE_API_BASE_URL in .env file
   - Example: VITE_API_BASE_URL=http://localhost:5000
   - Falls back to http://localhost:5000 if not set

7. IMPORTS TO ADD TO COMPONENTS:
   - import { useParams } from 'react-router-dom' (if using URL params)
   - import { useNavigate } from 'react-router-dom' (if redirecting)
   - import { [functions] } from '../services/barberApi'

*/
