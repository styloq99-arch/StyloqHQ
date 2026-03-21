import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const INITIAL_PROFILE = {
  salonName:   'Liyo Salon',
  ownerName:   'Ravindra Perera',
  email:       'liyo.salon@gmail.com',
  phone:       '011 234 5678',
  address:     'No. 45, Galle Road, Colombo 07',
  city:        'Colombo 07',
  description: 'Premium unisex salon offering haircuts, styling, coloring, and beard grooming. Serving Colombo since 2019.',
  avatar:      'https://i.pravatar.cc/150?img=32',
  cover:       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=300&fit=crop',
};

const FIELDS = [
  { icon: 'fa-store',          label: 'Salon Name',  key: 'salonName'  },
  { icon: 'fa-user-tie',       label: 'Owner',       key: 'ownerName'  },
  { icon: 'fa-envelope',       label: 'Email',       key: 'email'      },
  { icon: 'fa-phone',          label: 'Phone',       key: 'phone'      },
  { icon: 'fa-map-marker-alt', label: 'Address',     key: 'address'    },
  { icon: 'fa-city',           label: 'City',        key: 'city'       },
];

export default function SalonProfilePage() {
  const navigate        = useNavigate();
  const fileInputRef    = useRef(null);
  const coverInputRef   = useRef(null);

  const [profile,   setProfile]   = useState(INITIAL_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [editData,  setEditData]  = useState({ ...INITIAL_PROFILE });
  const [errors,    setErrors]    = useState({});
  const [preview,   setPreview]   = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [toast,     setToast]     = useState(false);

  const startEdit  = () => {
    setEditData({ ...profile });
    setPreview(null);
    setCoverPreview(null);
    setErrors({});
    setIsEditing(true);
  };
  const cancelEdit = () => { setIsEditing(false); setErrors({}); };

  const handleChange = e => {
    const { name, value } = e.target;
    setEditData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setEditData(p => ({ ...p, avatar: url }));
  };

  const handleCoverFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
    setEditData(p => ({ ...p, cover: url }));
  };

  const validate = () => {
    const e = {};
    if (!editData.salonName.trim()) e.salonName = 'Required';
    if (!editData.email.trim())     e.email     = 'Required';
    if (!editData.phone.trim())     e.phone     = 'Required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = () => {
    if (!validate()) return;
    setProfile({
      ...editData,
      avatar: preview      || editData.avatar,
      cover:  coverPreview || editData.cover,
    });
    setIsEditing(false);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const inputStyle = err => ({
    width: '100%', background: 'var(--fill-glass-mid)',
    border: `1px solid ${err ? 'var(--color-accent)' : 'var(--border-default)'}`,
    borderRadius: 12, padding: '10px 14px', color: 'var(--text-primary)',
    fontFamily: 'Poppins, sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  });

  return (
    <div className="app-layout">

      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <h1 className="brand-title" style={{ fontSize: '40px' }}>StyloQ</h1>
        </div>
        <nav className="sidebar-nav">
          <Link to="/salon-home"    className="sidebar-link">       <i className="fas fa-home" />       <span>Home</span></Link>
          <Link to="/salon-hire"    className="sidebar-link">       <i className="fas fa-users" />      <span>Hire Barbers</span></Link>
          <Link to="/salon-profile" className="sidebar-link active"><i className="fas fa-user-circle" /><span>Profile</span></Link>
        </nav>
        <div className="sidebar-user">
          <img src={profile.avatar} alt="Salon" className="user-avatar" />
          <div className="user-info">
            <p className="user-name">{profile.salonName}</p>
            <p className="user-status">{profile.city}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content cp-page">

        {/* Hero / Cover Photo */}
        <div className="cp-hero" style={{ position: 'relative' }}>
          <img
            src={isEditing ? (coverPreview || editData.cover) : profile.cover}
            alt="Cover"
            className="cp-hero-img"
          />
          <div className="cp-hero-overlay" />

          {/* Cover photo edit button — visible only in edit mode */}
          {isEditing && (
            <>
              <input
                type="file"
                ref={coverInputRef}
                accept="image/*"
                onChange={handleCoverFile}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => coverInputRef.current.click()}
                style={{
                  position: 'absolute',
                  bottom: 12,
                  right: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  background: 'rgba(0,0,0,0.55)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 10,
                  color: '#fff',
                  fontSize: 13,
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500,
                  padding: '7px 14px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.75)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.55)'}
              >
                <i className="fas fa-camera" /> Change Cover Photo
              </button>
            </>
          )}
        </div>

        {/* Identity */}
        <div className="cp-identity">
          <div className="cp-avatar-wrap">
            <img src={isEditing ? (preview || editData.avatar) : profile.avatar} alt={profile.salonName} className="cp-avatar" />
            {isEditing && (
              <>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
                <div className="cp-avatar-edit-btn" onClick={() => fileInputRef.current.click()}>
                  <i className="fas fa-camera" />
                </div>
              </>
            )}
          </div>
          <h2 className="cp-identity-name">{profile.salonName}</h2>
          <p className="cp-identity-username">{profile.ownerName}</p>
          <div className="cp-identity-city-badge">
            <i className="fas fa-map-marker-alt" /> {profile.city}
          </div>
        </div>

        {/* Profile Section */}
        <div className="cp-profile-section">

          <div className="cp-section-header">
            <span className="cp-section-title">Salon Details</span>
            {!isEditing && (
              <button className="cp-edit-btn" onClick={startEdit}>
                <i className="fas fa-pen" /> Edit
              </button>
            )}
          </div>

          {/* View Mode */}
          {!isEditing && (
            <>
              <div className="cp-info-grid">
                {FIELDS.map(({ icon, label, key }) => (
                  <div className="cp-info-row" key={key}>
                    <div className="cp-info-icon"><i className={`fas ${icon}`} /></div>
                    <div className="cp-info-content">
                      <div className="cp-info-label">{label}</div>
                      <div className="cp-info-value">{profile[key]}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* About */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Poppins, sans-serif' }}>About</p>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 12, padding: '14px 16px' }}>
                  {profile.description}
                </p>
              </div>
            </>
          )}

          {/* Edit Mode */}
          {isEditing && (
            <div className="cp-edit-form">
              <div className="cp-edit-form-title"><i className="fas fa-pen" /> Edit Salon Profile</div>

              {/* Cover photo row in form */}
              <div style={{ marginBottom: 20 }}>
                <label className="cp-form-label" style={{ display: 'block', marginBottom: 8 }}>Cover Photo</label>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: 130,
                    borderRadius: 14,
                    overflow: 'hidden',
                    border: '1px solid var(--border-default)',
                    cursor: 'pointer',
                  }}
                  onClick={() => coverInputRef.current.click()}
                >
                  <img
                    src={coverPreview || editData.cover}
                    alt="Cover"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.35)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 6, color: '#fff',
                  }}>
                    <i className="fas fa-image" style={{ fontSize: 22 }} />
                    <span style={{ fontSize: 13, fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                      Click to change cover photo
                    </span>
                  </div>
                </div>
              </div>

              {/* Avatar row */}
              <div className="cp-edit-avatar-row">
                <img src={preview || editData.avatar} alt="Avatar" className="cp-edit-avatar" />
                <button className="cp-avatar-change-btn" type="button" onClick={() => fileInputRef.current.click()}>
                  <i className="fas fa-camera" /> Change Logo
                </button>
              </div>

              <div className="cp-form-row">
                <div className="cp-form-group">
                  <label className="cp-form-label">Salon Name *</label>
                  <input style={inputStyle(errors.salonName)} name="salonName" value={editData.salonName} onChange={handleChange} placeholder="Salon name" />
                  {errors.salonName && <div className="cp-form-error">{errors.salonName}</div>}
                </div>
                <div className="cp-form-group">
                  <label className="cp-form-label">Owner Name</label>
                  <input style={inputStyle(false)} name="ownerName" value={editData.ownerName} onChange={handleChange} placeholder="Owner name" />
                </div>
              </div>

              <div className="cp-form-group">
                <label className="cp-form-label">Email *</label>
                <input style={inputStyle(errors.email)} name="email" type="email" value={editData.email} onChange={handleChange} placeholder="Email address" />
                {errors.email && <div className="cp-form-error">{errors.email}</div>}
              </div>

              <div className="cp-form-row">
                <div className="cp-form-group">
                  <label className="cp-form-label">Phone *</label>
                  <input style={inputStyle(errors.phone)} name="phone" value={editData.phone} onChange={handleChange} placeholder="Phone number" />
                  {errors.phone && <div className="cp-form-error">{errors.phone}</div>}
                </div>
                <div className="cp-form-group">
                  <label className="cp-form-label">City</label>
                  <input style={inputStyle(false)} name="city" value={editData.city} onChange={handleChange} placeholder="City" />
                </div>
              </div>

              <div className="cp-form-group">
                <label className="cp-form-label">Address</label>
                <input style={inputStyle(false)} name="address" value={editData.address} onChange={handleChange} placeholder="Full address" />
              </div>

              <div className="cp-form-group">
                <label className="cp-form-label">About</label>
                <textarea style={{ ...inputStyle(false), resize: 'none', minHeight: 80 }} name="description" value={editData.description} onChange={handleChange} placeholder="Describe your salon..." />
              </div>

              <div className="cp-edit-actions">
                <button className="cp-btn-cancel" onClick={cancelEdit}>Cancel</button>
                <button className="cp-btn-save" onClick={handleSave}>
                  <i className="fas fa-check" /> Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Logout */}
          {!isEditing && (
            <div className="cp-danger-zone">
              <div className="cp-danger-title"><i className="fas fa-exclamation-triangle" /> Account</div>
              <button className="cp-logout-btn" onClick={() => navigate('/')}>
                <i className="fas fa-sign-out-alt" /> Log Out
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        <Link to="/salon-home"    className="nav-item">       <i className="fas fa-home" />       <span>Home</span></Link>
        <Link to="/salon-hire"    className="nav-item">       <i className="fas fa-users" />       <span>Hire</span></Link>
        <Link to="/salon-profile" className="nav-item active"><i className="fas fa-user-circle" /> <span>Profile</span></Link>
      </nav>

      {/* Toast */}
      {toast && (
        <div className="cp-toast">
          <i className="fas fa-check-circle" /> Profile updated successfully!
        </div>
      )}
    </div>
  );
}
