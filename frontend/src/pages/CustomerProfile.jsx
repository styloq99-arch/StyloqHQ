import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CustomerSidebar from '../Components/CustomerSidebar';
import { apiGet, apiPatch } from '../utils/api';

// ─── Static Data ─────────────────────────────────────────────────────────────

const FALLBACK_AVATAR = 'https://randomuser.me/api/portraits/men/1.jpg';

const PROFILE_FIELDS = [
  { icon: 'fa-user', label: 'Full Name', key: 'name' },
  { icon: 'fa-envelope', label: 'Email Address', key: 'email' },
  { icon: 'fa-phone', label: 'Phone Number', key: 'phone' },
  { icon: 'fa-at', label: 'Username', key: 'username', prefix: '@' },
];

const APPT_DETAIL_ROWS = [
  { icon: 'fa-cut', label: 'Service', key: 'service' },
  { icon: 'fa-calendar', label: 'Date', key: 'date' },
  { icon: 'fa-clock', label: 'Time', key: 'time' },
  { icon: 'fa-map-marker-alt', label: 'Location', key: 'location' },
  { icon: 'fa-credit-card', label: 'Payment', key: 'payment' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

/**
 * Normalize backend booking status to frontend display status.
 * Backend uses: Pending, Accepted, Completed, Cancelled, Rescheduled
 * Frontend expects: upcoming, completed, cancelled
 */
const normalizeStatus = (backendStatus) => {
  if (!backendStatus) return 'upcoming';
  const s = backendStatus.toLowerCase();
  if (s === 'completed') return 'completed';
  if (s === 'cancelled') return 'cancelled';
  return 'upcoming';
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', username: '',
    avatar: FALLBACK_AVATAR,
  });
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [appointmentFilter, setAppointmentFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [cancelModal, setCancelModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);

  // Loading & error states
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState(null);

  // ── Map backend profile response → local state ──
  const mapProfileData = (d) => ({
    name: d.full_name || '',
    email: d.email || '',
    phone: d.phone_number || '',
    username: d.email ? d.email.split('@')[0] : '',
    avatar: FALLBACK_AVATAR,
  });

  // ── Fetch profile + bookings on mount ──
  useEffect(() => {
    fetchProfile();
    fetchBookings();
  }, []);

  const fetchProfile = async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const res = await apiGet('/customers/profile');

      if (res.status === 401 || res.reason === 'unauthorized') {
        logout();
        navigate('/signin');
        return;
      }

      if (res.success && res.data) {
        const mapped = mapProfileData(res.data);
        setProfile(mapped);
        setEditData(mapped);
      } else {
        setProfileError(res.message || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setProfileError('Unable to connect to server. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchBookings = async () => {
    setAppointmentsLoading(true);
    setAppointmentsError(null);
    try {
      const res = await apiGet('/customers/bookings');

      if (res.status === 401 || res.reason === 'unauthorized') {
        return;
      }

      if (res.success && Array.isArray(res.data)) {
        setAppointments(res.data.map(b => ({
          id: b.id || b.booking_id,
          barber: b.barber_name || 'Barber',
          barberImg: b.barber_avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
          service: b.service_name || b.service || 'Service',
          serviceType: b.service_type || 'Hair Services',
          date: b.appointment_datetime ? b.appointment_datetime.split('T')[0] : '',
          time: b.appointment_datetime
            ? new Date(b.appointment_datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : '',
          location: b.location || 'N/A',
          price: b.price ? `Rs.${b.price}` : 'N/A',
          payment: b.payment_method || 'Pay On Visit',
          status: normalizeStatus(b.status),
        })));
      } else {
        setAppointmentsError(res.message || 'Failed to load appointments');
      }
    } catch (err) {
      console.error('Bookings fetch error:', err);
      setAppointmentsError('Unable to load appointments. Please try again.');
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // ── Edit handlers ──
  const handleEditStart = () => {
    setEditData({ ...profile });
    setAvatarPreview(null);
    setEditErrors({});
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditErrors({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
    if (editErrors[name]) setEditErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAvatarClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      setEditData(prev => ({ ...prev, avatar: url }));
    }
  };

  const validateEdit = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editData.name.trim()) errors.name = 'Name is required';
    if (!editData.email.trim()) errors.email = 'Email is required';
    else if (!emailRegex.test(editData.email)) errors.email = 'Invalid email format';
    if (!editData.phone.trim()) errors.phone = 'Phone is required';
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateEdit()) return;
    const updatedProfile = { ...editData, avatar: avatarPreview || editData.avatar };
    try {
      const res = await apiPatch('/customers/profile', {
        full_name: updatedProfile.name,
        phone_number: updatedProfile.phone,
      });

      if (res.success && res.data) {
        const serverProfile = mapProfileData(res.data);
        serverProfile.avatar = updatedProfile.avatar;
        setProfile(serverProfile);
      } else {
        setProfile(updatedProfile);
      }
    } catch (_) {
      setProfile(updatedProfile);
    }
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // ── Appointment helpers ──
  const filteredAppointments = appointments.filter(a =>
    appointmentFilter === 'all' ? true : a.status === appointmentFilter
  );

  const handleCancelConfirm = async () => {
    try {
      await apiPatch(`/customers/bookings/${cancelModal}/cancel`);
    } catch (_) { /* update UI anyway */ }
    setAppointments(prev =>
      prev.map(a => a.id === cancelModal ? { ...a, status: 'cancelled' } : a)
    );
    setCancelModal(null);
  };

  const upcomingCount = appointments.filter(a => a.status === 'upcoming').length;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="app-layout">

      {/* ── Desktop Sidebar ── */}
      <CustomerSidebar activePage="Profile" />

      {/* ── Main Content ── */}
      <div className="main-content cp-page">

        {profileLoading ? (
          <div className="page-loading-overlay">
            <div className="page-loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Loading profile…</span>
            </div>
          </div>
        ) : profileError ? (
          <div className="cp-error-container">
            <div className="cp-error-card">
              <i className="fas fa-exclamation-circle"></i>
              <h3>Something went wrong</h3>
              <p>{profileError}</p>
              <button className="cp-retry-btn" onClick={fetchProfile}>
                <i className="fas fa-redo"></i> Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
        {/* Hero */}
        <div className="cp-hero">
          <img
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=300&fit=crop"
            alt="Profile"
            className="cp-hero-img"
          />
          <div className="cp-hero-overlay" />
        </div>

        {/* Identity */}
        <div className="cp-identity">
          <div className="cp-avatar-wrap">
            <img src={profile.avatar} alt={profile.name} className="cp-avatar" />
            {isEditing && (
              <div className="cp-avatar-edit-btn" onClick={handleAvatarClick}>
                <i className="fas fa-camera"></i>
              </div>
            )}
          </div>
          <h2 className="cp-identity-name">{profile.name || 'Customer'}</h2>
          <p className="cp-identity-username">@{profile.username || 'user'}</p>
        </div>

        {/* Tab Bar */}
        <div className="cp-tabs">
          <button
            className={`cp-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user"></i> Profile
          </button>
          <button
            className={`cp-tab ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <i className="fas fa-calendar-alt"></i> Appointments
            {upcomingCount > 0 && (
              <span className="cp-tab-badge">{upcomingCount}</span>
            )}
          </button>
        </div>

        {/* ══ PROFILE TAB ══ */}
        {activeTab === 'profile' && (
          <div className="cp-profile-section">

            <div className="cp-section-header">
              <span className="cp-section-title">Personal Details</span>
              {!isEditing && (
                <button className="cp-edit-btn" onClick={handleEditStart}>
                  <i className="fas fa-pen"></i> Edit Profile
                </button>
              )}
            </div>

            {/* View Mode */}
            {!isEditing && (
              <div className="cp-info-grid">
                {PROFILE_FIELDS.map(({ icon, label, key, prefix }) => (
                  <div className="cp-info-row" key={label}>
                    <div className="cp-info-icon">
                      <i className={`fas ${icon}`}></i>
                    </div>
                    <div className="cp-info-content">
                      <div className="cp-info-label">{label}</div>
                      <div className="cp-info-value">{prefix}{profile[key] || '—'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Edit Mode */}
            {isEditing && (
              <div className="cp-edit-form">
                <div className="cp-edit-form-title">
                  <i className="fas fa-pen"></i> Edit Profile
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="cp-hidden-input"
                  accept="image/*"
                  onChange={handleFileChange}
                />

                <div className="cp-edit-avatar-row">
                  <img src={avatarPreview || editData.avatar} alt="Avatar" className="cp-edit-avatar" />
                  <button className="cp-avatar-change-btn" onClick={handleAvatarClick} type="button">
                    <i className="fas fa-camera"></i> Change Photo
                  </button>
                </div>

                <div className="cp-form-group">
                  <label className="cp-form-label">Full Name</label>
                  <input className={`cp-form-input ${editErrors.name ? 'error' : ''}`} type="text" name="name" value={editData.name} onChange={handleEditChange} placeholder="Enter your full name" />
                  {editErrors.name && <div className="cp-form-error">{editErrors.name}</div>}
                </div>

                <div className="cp-form-group">
                  <label className="cp-form-label">Email Address</label>
                  <input className="cp-form-input" type="email" name="email" value={editData.email} disabled placeholder="Email (managed by auth)" />
                </div>

                <div className="cp-form-group">
                  <label className="cp-form-label">Phone Number</label>
                  <input className={`cp-form-input ${editErrors.phone ? 'error' : ''}`} type="tel" name="phone" value={editData.phone} onChange={handleEditChange} placeholder="Phone number" />
                  {editErrors.phone && <div className="cp-form-error">{editErrors.phone}</div>}
                </div>

                <div className="cp-edit-actions">
                  <button className="cp-btn-cancel" onClick={handleEditCancel}>Cancel</button>
                  <button className="cp-btn-save" onClick={handleSave}>
                    <i className="fas fa-check"></i> Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            <div className="cp-danger-zone">
              <div className="cp-danger-title">
                <i className="fas fa-exclamation-triangle"></i> Account
              </div>
              <button className="cp-logout-btn" onClick={() => { logout(); navigate('/signin'); }}>
                <i className="fas fa-sign-out-alt"></i> Log Out
              </button>
            </div>

          </div>
        )}

        {/* ══ APPOINTMENTS TAB ══ */}
        {activeTab === 'appointments' && (
          <div className="cp-appt-section">

            <div className="cp-filter-row">
              {['all', 'upcoming', 'completed', 'cancelled'].map(f => (
                <button
                  key={f}
                  className={`cp-filter-chip ${appointmentFilter === f ? 'active' : ''}`}
                  onClick={() => setAppointmentFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f !== 'all' && (
                    <span className="cp-filter-count">
                      ({appointments.filter(a => a.status === f).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {appointmentsLoading ? (
              <div className="cp-appt-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Loading appointments…</span>
              </div>
            ) : appointmentsError ? (
              <div className="cp-error-container">
                <div className="cp-error-card">
                  <i className="fas fa-exclamation-circle"></i>
                  <h3>Could not load appointments</h3>
                  <p>{appointmentsError}</p>
                  <button className="cp-retry-btn" onClick={fetchBookings}>
                    <i className="fas fa-redo"></i> Try Again
                  </button>
                </div>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="cp-empty">
                <i className="fas fa-calendar-times"></i>
                <h3>No appointments found</h3>
                <p>You have no {appointmentFilter !== 'all' ? appointmentFilter : ''} appointments yet.</p>
              </div>
            ) : (
              <div className="cp-appt-cards">
                {filteredAppointments.map(appt => (
                  <div className="cp-appt-card" key={appt.id}>

                    <div className="cp-appt-card-header">
                      <img src={appt.barberImg} alt={appt.barber} className="cp-appt-barber-img" />
                      <div className="cp-appt-barber-info">
                        <div className="cp-appt-barber-name">{appt.barber}</div>
                        <div className="cp-appt-service-type">{appt.serviceType}</div>
                      </div>
                      <div className={`cp-appt-status-badge ${appt.status}`}>
                        {appt.status}
                      </div>
                    </div>

                    <div className="cp-appt-card-body">
                      <div className="cp-appt-id">#{appt.id}</div>
                      {APPT_DETAIL_ROWS.map(({ icon, label, key }) => (
                        <div className="cp-appt-detail-row" key={label}>
                          <span className="cp-appt-detail-key">
                            <i className={`fas ${icon}`}></i> {label}
                          </span>
                          <span className="cp-appt-detail-val">
                            {key === 'date' ? formatDate(appt[key]) : appt[key]}
                          </span>
                        </div>
                      ))}
                      <div className="cp-appt-detail-row">
                        <span className="cp-appt-detail-key"><i className="fas fa-tag"></i> Total</span>
                        <span className="cp-appt-detail-val cp-appt-price">{appt.price}</span>
                      </div>
                    </div>

                    <div className="cp-appt-card-footer">
                      {appt.status === 'upcoming' && (
                        <>
                          <button className="cp-appt-cancel-btn" onClick={() => setCancelModal(appt.id)}>
                            <i className="fas fa-times"></i> Cancel
                          </button>
                          <button className="cp-appt-view-btn" onClick={() => setDetailModal(appt)}>
                            <i className="fas fa-eye"></i> Details
                          </button>
                        </>
                      )}
                      {appt.status === 'completed' && (
                        <>
                          <button className="cp-appt-rebook-btn" onClick={() => navigate('/booking')}>
                            <i className="fas fa-redo"></i> Rebook
                          </button>
                          <button className="cp-appt-view-btn" onClick={() => setDetailModal(appt)}>
                            <i className="fas fa-eye"></i> Details
                          </button>
                        </>
                      )}
                      {appt.status === 'cancelled' && (
                        <button className="cp-appt-rebook-btn full-width" onClick={() => navigate('/booking')}>
                          <i className="fas fa-plus"></i> Book Again
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="cp-page-spacer" />
        </>
        )}
      </div>

      {/* ── Bottom Nav ── */}
      <nav className="bottom-nav">
        <Link to="/home" className="nav-item"><i className="fas fa-home"></i><span>Home</span></Link>
        <Link to="/customer-search" className="nav-item"><i className="fas fa-search"></i><span>Search</span></Link>
        <Link to="/favourites" className="nav-item"><i className="fas fa-heart"></i><span>Favourites</span></Link>
        <Link to="/message" className="nav-item"><i className="fas fa-comments"></i><span>Message</span></Link>
        <Link to="/customer-profile" className="nav-item active"><i className="fas fa-user"></i><span>Profile</span></Link>
      </nav>

      {/* ── Cancel Modal ── */}
      {cancelModal && (
        <div className="cp-modal-overlay" onClick={() => setCancelModal(null)}>
          <div className="cp-modal" onClick={e => e.stopPropagation()}>
            <div className="cp-modal-icon"><i className="fas fa-calendar-times"></i></div>
            <h3>Cancel Appointment?</h3>
            <p>Are you sure you want to cancel this appointment? This action cannot be undone.</p>
            <div className="cp-modal-actions">
              <button className="cp-modal-keep" onClick={() => setCancelModal(null)}>Keep It</button>
              <button className="cp-modal-cancel" onClick={handleCancelConfirm}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {detailModal && (
        <div className="cp-modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="cp-detail-modal" onClick={e => e.stopPropagation()}>

            <div className="cp-detail-modal-header">
              <img src={detailModal.barberImg} alt={detailModal.barber} className="cp-detail-modal-barber-img" />
              <div>
                <div className="cp-detail-modal-title">{detailModal.barber}</div>
                <div className="cp-detail-modal-subtitle">{detailModal.serviceType}</div>
              </div>
              <button className="cp-detail-modal-close" onClick={() => setDetailModal(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="cp-detail-modal-body">
              <div className="cp-booking-id">Booking ID: #{detailModal.id}</div>
              {[
                ['Service', detailModal.service],
                ['Date', formatDate(detailModal.date)],
                ['Time', detailModal.time],
                ['Location', detailModal.location],
                ['Payment', detailModal.payment],
                ['Status', detailModal.status.charAt(0).toUpperCase() + detailModal.status.slice(1)],
              ].map(([k, v]) => (
                <div className="cp-detail-row" key={k}>
                  <span className="cp-detail-key">{k}</span>
                  <span className={`cp-detail-val ${k === 'Status' ? `status-${detailModal.status}` : ''}`}>{v}</span>
                </div>
              ))}
              <div className="cp-detail-row cp-detail-total">
                <span className="cp-detail-key">Total</span>
                <span className="cp-detail-val">{detailModal.price}</span>
              </div>
            </div>

            <div className="cp-detail-modal-footer">
              <button className="cp-detail-close-btn" onClick={() => setDetailModal(null)}>Close</button>
            </div>

          </div>
        </div>
      )}

      {/* ── Success Toast ── */}
      {saveSuccess && (
        <div className="cp-toast">
          <i className="fas fa-check-circle"></i> Profile updated successfully!
        </div>
      )}

    </div>
  );
}
