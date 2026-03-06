import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ─── Static Data ─────────────────────────────────────────────────────────────

const INITIAL_PROFILE = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '077 123 4567',
  idNumber: '200012345678',
  city: 'Colombo',
  username: 'john_doe',
  avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
};

const PROFILE_FIELDS = [
  { icon: 'fa-user',           label: 'Full Name',     key: 'name'     },
  { icon: 'fa-envelope',       label: 'Email Address', key: 'email'    },
  { icon: 'fa-phone',          label: 'Phone Number',  key: 'phone'    },
  { icon: 'fa-id-card',        label: 'ID Number',     key: 'idNumber' },
  { icon: 'fa-at',             label: 'Username',      key: 'username', prefix: '@' },
  { icon: 'fa-map-marker-alt', label: 'City',          key: 'city'     },
];


export default function CustomerProfile() {
  const navigate     = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('styloq_profile') || 'null');
      return saved || INITIAL_PROFILE;
    } catch { return INITIAL_PROFILE; }
  });

  const [activeTab, setActiveTab]  = useState('profile');
  const [isEditing, setIsEditing]               = useState(false);
  const [editData, setEditData]                 = useState({ ...INITIAL_PROFILE });
  const [editErrors, setEditErrors]             = useState({});
  const [avatarPreview, setAvatarPreview]       = useState(null);
  const [saveSuccess, setSaveSuccess]           = useState(false);

  // Sync to localStorage whenever profile changes
  React.useEffect(() => {
    try { localStorage.setItem('styloq_profile', JSON.stringify(profile)); } catch (_) {}
  }, [profile]);

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
    if (!editData.name.trim())  errors.name  = 'Name is required';
    if (!editData.email.trim()) errors.email = 'Email is required';
    else if (!emailRegex.test(editData.email)) errors.email = 'Invalid email format';
    if (!editData.phone.trim()) errors.phone = 'Phone is required';
    if (!editData.city.trim())  errors.city  = 'City is required';
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateEdit()) return;
    const updatedProfile = { ...editData, avatar: avatarPreview || editData.avatar };
    try { localStorage.setItem('styloq_profile', JSON.stringify(updatedProfile)); } catch (_) {}
    setProfile(updatedProfile);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="app-layout">

      {/* ── Desktop Sidebar ── */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <h1 className="brand-title" style={{fontSize : '40px'}}>StyloQ</h1>
        </div>
        <nav className="sidebar-nav">
          <Link to="/customer-home"   className="sidebar-link"><i className="fas fa-home"></i>   <span>Home</span></Link>
          <Link to="/customer-search" className="sidebar-link"><i className="fas fa-search"></i> <span>Search</span></Link>
          <Link to="/favourites"       className="sidebar-link"><i className="fas fa-heart"></i>  <span>Favourites</span></Link>
          <Link to="/profile"         className="sidebar-link active"><i className="fas fa-user"></i> <span>Profile</span></Link>
        </nav>
        <div className="sidebar-user">
          <img src={profile.avatar} alt="User" className="user-avatar" />
          <div className="user-info">
            <p className="user-name">{profile.name.split(' ')[0]}</p>
            <p className="user-status">Customer</p>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="main-content cp-page">

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
          <h2 className="cp-identity-name">{profile.name}</h2>
          <p className="cp-identity-username">@{profile.username}</p>
          <div className="cp-identity-city-badge">
            <i className="fas fa-map-marker-alt"></i>
            {profile.city}
          </div>
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
                      <div className="cp-info-value">{prefix}{profile[key]}</div>
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
                  <input className={`cp-form-input ${editErrors.email ? 'error' : ''}`} type="email" name="email" value={editData.email} onChange={handleEditChange} placeholder="Enter your email" />
                  {editErrors.email && <div className="cp-form-error">{editErrors.email}</div>}
                </div>

                <div className="cp-form-row">
                  <div className="cp-form-group">
                    <label className="cp-form-label">Phone</label>
                    <input className={`cp-form-input ${editErrors.phone ? 'error' : ''}`} type="tel" name="phone" value={editData.phone} onChange={handleEditChange} placeholder="Phone number" />
                    {editErrors.phone && <div className="cp-form-error">{editErrors.phone}</div>}
                  </div>
                  <div className="cp-form-group">
                    <label className="cp-form-label">City</label>
                    <input className={`cp-form-input ${editErrors.city ? 'error' : ''}`} type="text" name="city" value={editData.city} onChange={handleEditChange} placeholder="Your city" />
                    {editErrors.city && <div className="cp-form-error">{editErrors.city}</div>}
                  </div>
                </div>

                <div className="cp-form-group">
                  <label className="cp-form-label">Username</label>
                  <input className="cp-form-input" type="text" name="username" value={editData.username} onChange={handleEditChange} placeholder="Username" />
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
              <button className="cp-logout-btn" onClick={() => navigate('/')}>
                <i className="fas fa-sign-out-alt"></i> Log Out
              </button>
            </div>

          </div>
        )}

        <div className="cp-page-spacer" />
      </div>

      {/* ── Bottom Nav ── */}
      <nav className="bottom-nav">
        <Link to="/customer-home"   className="nav-item"><i className="fas fa-home"></i><span>Home</span></Link>
        <Link to="/customer-search" className="nav-item"><i className="fas fa-search"></i><span>Search</span></Link>
        <Link to="/favourites"       className="nav-item"><i className="fas fa-heart"></i><span>Favourites</span></Link>
        <Link to="/profile"         className="nav-item active"><i className="fas fa-user"></i><span>Profile</span></Link>
      </nav>

      {/* ── Success Toast ── */}
      {saveSuccess && (
        <div className="cp-toast">
          <i className="fas fa-check-circle"></i> Profile updated successfully!
        </div>
      )}

    </div>
  );
}
