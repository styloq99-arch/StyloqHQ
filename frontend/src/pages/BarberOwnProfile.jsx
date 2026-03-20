import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ─── Mock Barber Data (from signup flow) ─────────────────────────────────────

const INITIAL_PROFILE = {
  name: 'S.S.K. Perera',
  email: 'ssk.perera@gmail.com',
  phone: '+94 77 234 5678',
  idNumber: '199012345678',
  city: 'Colombo',
  experience: '17',
  bio: 'Master barber with 17 years of experience. Fresh fades • Clean shaves • Good vibes. Crafting confidence one cut at a time.',
  specialties: ['Fade Haircut', 'Beard Styling', 'Classic Shave', 'Line Up', 'Hair Coloring'],
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  coverImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80',
  workingHours: {
    Mon: { active: true,  start: '09:00 AM', end: '06:00 PM' },
    Tue: { active: true,  start: '09:00 AM', end: '06:00 PM' },
    Wed: { active: true,  start: '09:00 AM', end: '06:00 PM' },
    Thu: { active: true,  start: '09:00 AM', end: '06:00 PM' },
    Fri: { active: true,  start: '09:00 AM', end: '07:00 PM' },
    Sat: { active: true,  start: '10:00 AM', end: '05:00 PM' },
    Sun: { active: false, start: 'Closed',   end: 'Closed'   },
  },
  services: [
    { id: 1, name: 'Side Part',     price: '1500', desc: 'Classic side part cut with clean finish' },
    { id: 2, name: 'Fade Haircut',  price: '1800', desc: 'Skin fade or taper fade, expertly blended' },
    { id: 3, name: 'Beard Trim',    price: '800',  desc: 'Shape and define your beard' },
    { id: 4, name: 'Classic Shave', price: '1200', desc: 'Hot towel straight-razor shave' },
    { id: 5, name: 'Under Cut',     price: '2000', desc: 'Bold undercut for a modern look' },
  ],
  locations: [
    { id: 1, salonName: 'Liyo Salons (pvt) Ltd', address: 'No. 06, Pagoda Road, Nugegoda',      district: 'Colombo', postalCode: '10250' },
    { id: 2, salonName: 'Salon Next (pvt) Ltd',  address: 'No. 7D, Vihara Mawatha, Peliyagoda', district: 'Colombo', postalCode: '11600' },
  ],
  certifications: [
    { title: 'Hair / Barber Diploma',      institute: 'Institute of Hairdressers & Beauticians (IHB)', date: '2010-05-15', desc: 'Basic hair-cutting, styling, salon hygiene and barbering skills.' },
    { title: 'Advanced Color Specialist',  institute: "L'Oréal Professional Academy",                  date: '2015-08-20', desc: 'Mastery in hair coloring, balayage, ombre, and color correction.' },
    { title: "Men's Grooming Masterclass", institute: 'British Barbers Association',                   date: '2019-11-10', desc: 'Advanced straight razor shaving, beard sculpting, and classic fades.' },
  ],
};

// Mock uploaded work photos
const WORK_PHOTOS = [
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&q=80',
  'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=300&q=80',
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=300&q=80',
  'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=300&q=80',
  'https://images.unsplash.com/photo-1621607512214-68297480165e?w=300&q=80',
  'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=300&q=80',
  'https://images.unsplash.com/photo-1560869713-bf919fd4a88a?w=300&q=80',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&q=80',
  'https://images.unsplash.com/photo-1549236177-f9b0031b5e8b?w=300&q=80',
];

const STATS = [
  { label: 'Posts',     value: '42'   },
  { label: 'Followers', value: '1.2K' },
  { label: 'Rating',    value: '4.9'  },
  { label: 'Bookings',  value: '380'  },
];

const TIME_SLOTS = [
  '08:00 AM','08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM',
  '11:00 AM','11:30 AM','12:00 PM','12:30 PM','01:00 PM','01:30 PM',
  '02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM',
  '05:00 PM','05:30 PM','06:00 PM','06:30 PM','07:00 PM',
];


// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ section, profile, onSave, onClose }) {
  const [data, setData] = useState(() => JSON.parse(JSON.stringify(profile)));
  const avatarRef = useRef(null);
  const coverRef  = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview,  setCoverPreview]  = useState(null);

  // specialty tag input
  const [newSpecialty, setNewSpecialty] = useState('');

  const set = (key, val) => setData(prev => ({ ...prev, [key]: val }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) setCoverPreview(URL.createObjectURL(file));
  };

  // ── specialty handlers ──
  const addCustomSpecialty = () => {
    const trimmed = newSpecialty.trim();
    if (!trimmed) return;
    if ((data.specialties || []).includes(trimmed)) return;
    setData(prev => ({ ...prev, specialties: [...(prev.specialties || []), trimmed] }));
    setNewSpecialty('');
  };

  const removeSpecialty = (s) => {
    setData(prev => ({ ...prev, specialties: (prev.specialties || []).filter(x => x !== s) }));
  };

  // ── working hours handlers ──
  const toggleDay = (day) => {
    setData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          active: !prev.workingHours[day].active,
          start: !prev.workingHours[day].active ? '09:00 AM' : 'Closed',
          end:   !prev.workingHours[day].active ? '06:00 PM' : 'Closed',
        },
      },
    }));
  };

  const handleTimeChange = (day, field, val) => {
    setData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: { ...prev.workingHours[day], [field]: val },
      },
    }));
  };

  // ── service handlers ──
  const addService = () => {
    setData(prev => ({
      ...prev,
      services: [...prev.services, { id: Date.now(), name: '', price: '', desc: '' }],
    }));
  };
  const removeService = (id) => setData(prev => ({ ...prev, services: prev.services.filter(s => s.id !== id) }));
  const updateService = (id, field, val) => setData(prev => ({
    ...prev,
    services: prev.services.map(s => s.id === id ? { ...s, [field]: val } : s),
  }));

  // ── location handlers ──
  const addLocation = () => setData(prev => ({
    ...prev,
    locations: [...prev.locations, { id: Date.now(), salonName: '', address: '', district: '', postalCode: '' }],
  }));
  const removeLocation = (id) => setData(prev => ({ ...prev, locations: prev.locations.filter(l => l.id !== id) }));
  const updateLocation = (id, field, val) => setData(prev => ({
    ...prev,
    locations: prev.locations.map(l => l.id === id ? { ...l, [field]: val } : l),
  }));

  // ── certification handlers ──
  const addCert = () => setData(prev => ({
    ...prev,
    certifications: [...prev.certifications, { title: '', institute: '', date: '', desc: '' }],
  }));
  const removeCert = (i) => setData(prev => ({
    ...prev,
    certifications: prev.certifications.filter((_, idx) => idx !== i),
  }));
  const updateCert = (i, field, val) => setData(prev => ({
    ...prev,
    certifications: prev.certifications.map((c, idx) => idx === i ? { ...c, [field]: val } : c),
  }));

  const handleSave = () => {
    const saved = { ...data };
    if (avatarPreview) saved.avatar = avatarPreview;
    if (coverPreview)  saved.coverImage = coverPreview;
    onSave(saved);
  };

  const renderContent = () => {
    switch (section) {

      // ── Photos ──
      case 'photo':
        return (
          <div className="bop-modal-photo-section">
            <input type="file" ref={avatarRef} accept="image/*" style={{ display:'none' }} onChange={handleAvatarChange} />
            <input type="file" ref={coverRef}  accept="image/*" style={{ display:'none' }} onChange={handleCoverChange}  />
            <div className="bop-photo-row">
              <div className="bop-photo-block">
                <p className="bop-photo-label">Profile Photo</p>
                <div className="bop-avatar-edit-wrap" onClick={() => avatarRef.current.click()}>
                  <img src={avatarPreview || data.avatar} alt="avatar" className="bop-avatar-edit-img" />
                  <div className="bop-avatar-edit-overlay"><i className="fas fa-camera"></i></div>
                </div>
              </div>
              <div className="bop-photo-block">
                <p className="bop-photo-label">Cover Photo</p>
                <div className="bop-cover-edit-wrap" onClick={() => coverRef.current.click()}>
                  <img src={coverPreview || data.coverImage} alt="cover" className="bop-cover-edit-img" />
                  <div className="bop-cover-edit-overlay"><i className="fas fa-camera"></i><span>Change Cover</span></div>
                </div>
              </div>
            </div>
          </div>
        );

      // ── Personal Info ──
      case 'personal':
        return (
          <div className="bop-modal-fields">
            {[
              { label: 'Full Name',          key: 'name',       type: 'text'   },
              { label: 'Email Address',       key: 'email',      type: 'email'  },
              { label: 'Phone Number',        key: 'phone',      type: 'tel'    },
              { label: 'City',               key: 'city',       type: 'text'   },
              { label: 'Years of Experience', key: 'experience', type: 'number' },
            ].map(f => (
              <div key={f.key} className="bop-field-group">
                <label className="bop-field-label">{f.label}</label>
                <input
                  type={f.type}
                  className="bop-field-input"
                  value={data[f.key] || ''}
                  onChange={e => set(f.key, e.target.value)}
                />
              </div>
            ))}
            <div className="bop-field-group">
              <label className="bop-field-label">Professional Bio</label>
              <textarea
                className="bop-field-input bop-textarea"
                value={data.bio || ''}
                onChange={e => set('bio', e.target.value)}
                maxLength={300}
                rows={4}
              />
              <span className="bop-char-count">{(data.bio || '').length}/300</span>
            </div>
          </div>
        );

      // ── Specialties — personalised tag input only, no fixed list ──
      case 'specialties':
        return (
          <div className="bop-modal-fields">
            <p className="bop-field-hint">Type and add your own specialties</p>

            <div className="bop-tag-input-row">
              <input
                className="bop-field-input bop-tag-input"
                value={newSpecialty}
                onChange={e => setNewSpecialty(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomSpecialty()}
                placeholder="e.g. Hot Towel Shave"
                maxLength={30}
              />
              <button className="bop-tag-add-btn" onClick={addCustomSpecialty}>
                <i className="fas fa-plus"></i> Add
              </button>
            </div>

            {(data.specialties || []).length > 0 ? (
              <div className="bop-specialty-grid">
                {(data.specialties || []).map(s => (
                  <span key={s} className="bop-specialty-chip active">
                    {s}
                    <button className="bop-tag-remove" onClick={() => removeSpecialty(s)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="bop-no-tags-hint">No specialties added yet.</p>
            )}
          </div>
        );

      // ── Working Hours ──
      case 'hours':
        return (
          <div className="bop-modal-fields">
            {Object.keys(data.workingHours).map(day => (
              <div key={day} className="bop-hours-row">
                <div className="bop-hours-day-wrap">
                  <label className="bop-hours-toggle">
                    <input
                      type="checkbox"
                      checked={data.workingHours[day].active}
                      onChange={() => toggleDay(day)}
                    />
                    <span className="bop-hours-slider"></span>
                  </label>
                  <span className={`bop-hours-day ${data.workingHours[day].active ? 'on' : 'off'}`}>{day}</span>
                </div>
                {data.workingHours[day].active ? (
                  <div className="bop-hours-times">
                    <select
                      className="bop-time-select"
                      value={data.workingHours[day].start}
                      onChange={e => handleTimeChange(day, 'start', e.target.value)}
                    >
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <span className="bop-hours-dash">–</span>
                    <select
                      className="bop-time-select"
                      value={data.workingHours[day].end}
                      onChange={e => handleTimeChange(day, 'end', e.target.value)}
                    >
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                ) : (
                  <span className="bop-hours-closed">Closed</span>
                )}
              </div>
            ))}
          </div>
        );

      // ── Services ──
      case 'services':
        return (
          <div className="bop-modal-fields">
            {data.services.map((svc, i) => (
              <div key={svc.id} className="bop-service-edit-card">
                <div className="bop-service-edit-header">
                  <span className="bop-service-edit-num">Service {i + 1}</span>
                  <button className="bop-service-remove" onClick={() => removeService(svc.id)}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="bop-field-group">
                  <label className="bop-field-label">Service Name</label>
                  <input className="bop-field-input" value={svc.name} onChange={e => updateService(svc.id, 'name', e.target.value)} placeholder="e.g. Classic Cut" />
                </div>
                <div className="bop-service-edit-row">
                  <div className="bop-field-group" style={{ flex: 1 }}>
                    <label className="bop-field-label">Price (LKR)</label>
                    <input type="number" className="bop-field-input" value={svc.price} onChange={e => updateService(svc.id, 'price', e.target.value)} placeholder="0" />
                  </div>
                </div>
                <div className="bop-field-group">
                  <label className="bop-field-label">Description</label>
                  <input className="bop-field-input" value={svc.desc} onChange={e => updateService(svc.id, 'desc', e.target.value)} placeholder="Brief description..." />
                </div>
              </div>
            ))}
            <button className="bop-add-btn" onClick={addService}>
              <i className="fas fa-plus"></i> Add Service
            </button>
          </div>
        );

      // ── Locations ──
      case 'locations':
        return (
          <div className="bop-modal-fields">
            {data.locations.map((loc, i) => (
              <div key={loc.id} className="bop-service-edit-card">
                <div className="bop-service-edit-header">
                  <span className="bop-service-edit-num">Location {i + 1}</span>
                  {data.locations.length > 1 && (
                    <button className="bop-service-remove" onClick={() => removeLocation(loc.id)}>
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
                {[
                  { label: 'Salon Name',  key: 'salonName',  placeholder: "e.g. The Gentleman's Cut" },
                  { label: 'Address',     key: 'address',    placeholder: 'Street address'            },
                  { label: 'District',    key: 'district',   placeholder: 'e.g. Colombo 05'           },
                  { label: 'Postal Code', key: 'postalCode', placeholder: 'e.g. 00100'                },
                ].map(f => (
                  <div key={f.key} className="bop-field-group">
                    <label className="bop-field-label">{f.label}</label>
                    <input className="bop-field-input" value={loc[f.key]} onChange={e => updateLocation(loc.id, f.key, e.target.value)} placeholder={f.placeholder} />
                  </div>
                ))}
              </div>
            ))}
            <button className="bop-add-btn" onClick={addLocation}>
              <i className="fas fa-plus"></i> Add Location
            </button>
          </div>
        );

      // ── Certifications ──
      case 'certifications':
        return (
          <div className="bop-modal-fields">
            {data.certifications.map((cert, i) => (
              <div key={i} className="bop-service-edit-card">
                <div className="bop-service-edit-header">
                  <span className="bop-service-edit-num">Certificate {i + 1}</span>
                  <button className="bop-service-remove" onClick={() => removeCert(i)}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                {[
                  { label: 'Certificate Title', key: 'title',     type: 'text', placeholder: 'e.g. Master Barber Diploma'    },
                  { label: 'Issuing Institute',  key: 'institute', type: 'text', placeholder: 'e.g. IHB Academy'             },
                  { label: 'Issue Date',         key: 'date',      type: 'date', placeholder: ''                             },
                  { label: 'Description',        key: 'desc',      type: 'text', placeholder: 'Brief summary of the cert...' },
                ].map(f => (
                  <div key={f.key} className="bop-field-group">
                    <label className="bop-field-label">{f.label}</label>
                    <input
                      type={f.type}
                      className="bop-field-input"
                      value={cert[f.key] || ''}
                      onChange={e => updateCert(i, f.key, e.target.value)}
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
              </div>
            ))}
            <button className="bop-add-btn" onClick={addCert}>
              <i className="fas fa-plus"></i> Add Certificate
            </button>
          </div>
        );

      default: return null;
    }
  };

  const TITLES = {
    photo:          'Edit Photos',
    personal:       'Edit Profile Info',
    specialties:    'Edit Specialties',
    hours:          'Edit Working Hours',
    services:       'Edit Services',
    locations:      'Edit Locations',
    certifications: 'Edit Certifications',
  };

  return (
    <div className="bop-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bop-modal">
        <div className="bop-modal-header">
          <h3 className="bop-modal-title">{TITLES[section]}</h3>
          <button className="bop-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="bop-modal-body">{renderContent()}</div>
        <div className="bop-modal-footer">
          <button className="bop-modal-cancel" onClick={onClose}>Cancel</button>
          <button className="bop-modal-save" onClick={handleSave}>
            <i className="fas fa-check"></i> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Photo Upload Modal ───────────────────────────────────────────────────────

function PhotoUploadModal({ onClose, onUpload }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="bop-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bop-modal bop-modal-sm">
        <div className="bop-modal-header">
          <h3 className="bop-modal-title">Upload Work Photo</h3>
          <button className="bop-modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <div className="bop-modal-body">
          <input type="file" ref={fileRef} accept="image/*" style={{ display:'none' }} onChange={handleFile} />
          {preview ? (
            <div className="bop-photo-preview-wrap">
              <img src={preview} alt="preview" className="bop-photo-preview" />
              <button className="bop-photo-change" onClick={() => fileRef.current.click()}>Change Photo</button>
            </div>
          ) : (
            <div className="bop-upload-zone" onClick={() => fileRef.current.click()}>
              <i className="fas fa-cloud-upload-alt"></i>
              <p>Tap to select photo</p>
              <span>JPG, PNG, WEBP</span>
            </div>
          )}
          <div className="bop-field-group" style={{ marginTop: 16 }}>
            <label className="bop-field-label">Caption (optional)</label>
            <input className="bop-field-input" value={caption} onChange={e => setCaption(e.target.value)} placeholder="Describe the work..." />
          </div>
        </div>
        <div className="bop-modal-footer">
          <button className="bop-modal-cancel" onClick={onClose}>Cancel</button>
          <button className="bop-modal-save" disabled={!preview} onClick={() => { onUpload(preview, caption); onClose(); }}>
            <i className="fas fa-upload"></i> Upload
          </button>
        </div>
      </div>
    </div>
  );
}






// ─── Main Component ───────────────────────────────────────────────────────────

export default function BarberOwnProfile() {
  const navigate = useNavigate();

    const [profile, setProfile]         = useState(INITIAL_PROFILE);
  const [workPhotos, setWorkPhotos]   = useState(WORK_PHOTOS);
  const [editSection, setEditSection] = useState(null);
  const [photoModal, setPhotoModal]   = useState(false);
  const [toast, setToast]             = useState('');
  const [activeTab, setActiveTab]     = useState('posts');
  const [photoViewer, setPhotoViewer] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleSave = (updated) => {
    setProfile(updated);
    setEditSection(null);
    showToast('Profile updated successfully!');
  };

  const handlePhotoUpload = (src) => {
    setWorkPhotos(prev => [src, ...prev]);
    showToast('Photo uploaded!');
  };

  return (
    <div className="app-layout">
              {toast && (
        <div className="bop-toast">
          <i className="fas fa-check-circle"></i> {toast}
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editSection && (
        <EditModal
          section={editSection}
          profile={profile}
          onSave={handleSave}
          onClose={() => setEditSection(null)}
        />
      )}

      {/* ── Photo Upload Modal ── */}
      {photoModal && (
        <PhotoUploadModal
          onClose={() => setPhotoModal(false)}
          onUpload={handlePhotoUpload}
        />
      )}

      {/* ── Photo Viewer ── */}
      {photoViewer !== null && (
        <div className="bop-viewer-backdrop" onClick={() => setPhotoViewer(null)}>
          <button className="bop-viewer-close" onClick={() => setPhotoViewer(null)}>
            <i className="fas fa-times"></i>
          </button>
          <img src={workPhotos[photoViewer]} alt="work" className="bop-viewer-img" />
          <div className="bop-viewer-nav">
            <button
              className="bop-viewer-btn"
              disabled={photoViewer === 0}
              onClick={e => { e.stopPropagation(); setPhotoViewer(v => v - 1); }}
            ><i className="fas fa-chevron-left"></i></button>
            <span className="bop-viewer-count">{photoViewer + 1} / {workPhotos.length}</span>
            <button
              className="bop-viewer-btn"
              disabled={photoViewer === workPhotos.length - 1}
              onClick={e => { e.stopPropagation(); setPhotoViewer(v => v + 1); }}
            ><i className="fas fa-chevron-right"></i></button>
          </div>
        </div>
      )}

      {/* ── Desktop Sidebar ── */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <h1 className="brand-title" style={{ fontSize: '40px' }}>StyloQ</h1>
        </div>
        <nav className="sidebar-nav">
          <Link to="/barber-home"       className="sidebar-link"><i className="fas fa-home"></i> <span>Home</span></Link>
          <Link to="/barber-dashboard"  className="sidebar-link"><i className="fas fa-calendar-alt"></i> <span>DashBoard</span></Link>
          <Link to="/message"           className="sidebar-link"><i className="fas fa-comments"></i> <span>Message</span></Link>
          <Link to="/barber-OwnProfile" className="sidebar-link active"><i className="fas fa-user"></i> <span>Profile</span></Link>
          <Link to="/postingPhotos"     className="sidebar-link"><i className="fa fa-plus"></i></Link>
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <div className="main-content">
        <div className="bop-page">
            {/* ─── COVER + AVATAR ─── */}
          <div className="bop-hero">

            {/* Cover — camera button removed, avatar camera handles both */}
            <div className="bop-cover-wrap">
              <img src={profile.coverImage} alt="Cover" className="bop-cover-img" />
              <div className="bop-cover-gradient"></div>
            </div>

            {/* Avatar row */}
            <div className="bop-avatar-row">
              <div className="bop-avatar-wrap">
                <img src={profile.avatar} alt={profile.name} className="bop-avatar" />
                <button className="bop-avatar-cam" onClick={() => setEditSection('photo')}>
                  <i className="fas fa-camera"></i>
                </button>
              </div>

              {/* Desktop action buttons */}
              <div className="bop-action-row-desktop">
                <button className="bop-btn-outline" onClick={() => setEditSection('personal')}>
                  <i className="fas fa-pen"></i> Edit Profile
                </button>
              </div>
            </div>

            9{/* ─── BIO SECTION ─── */}
            <div className="bop-bio-section">
              <div className="bop-bio-name-row">
                <h2 className="bop-name">{profile.name}</h2>
                <span className="bop-verified"><i className="fas fa-check-circle"></i></span>
                <button className="bop-bio-edit" onClick={() => setEditSection('personal')} title="Edit info">
                  <i className="fas fa-pen"></i>
                </button>
              </div>
              <p className="bop-role">
                <i className="fas fa-cut"></i> Barber · {profile.experience} yrs experience · {profile.city}
              </p>
              <p className="bop-bio-text">{profile.bio}</p>

              {/* Specialty chips */}
              <div className="bop-chips">
                {profile.specialties.map(s => (
                  <span key={s} className="bop-chip">{s}</span>
                ))}
                <button className="bop-chip bop-chip-edit" onClick={() => setEditSection('specialties')}>
                  <i className="fas fa-pen"></i> Edit
                </button>
              </div>

              {/* Stats */}
              <div className="bop-stats-row">
                {STATS.map(st => (
                  <div key={st.label} className="bop-stat">
                    <span className="bop-stat-val">{st.value}</span>
                    <span className="bop-stat-label">{st.label}</span>
                  </div>
                ))}
              </div>

            
            </div>

          </div>
          {/* ─── TAB NAV ─── */}
          <div className="bop-tabs">
            <button className={`bop-tab ${activeTab === 'posts'    ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
              <i className="fas fa-th"></i> <span>Posts</span>
            </button>
            <button className={`bop-tab ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
              <i className="fas fa-cut"></i> <span>Services</span>
            </button>
            <button className={`bop-tab ${activeTab === 'info'     ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
              <i className="fas fa-info-circle"></i> <span>Info</span>
            </button>
          </div>

          {/* ─── TAB: POSTS ─── */}
          {activeTab === 'posts' && (
            <div className="bop-posts-tab">
              <div className="bop-posts-toolbar">
                <span className="bop-posts-count">{workPhotos.length} photos</span>
                <button className="bop-upload-btn" onClick={() => setPhotoModal(true)}>
                  <i className="fas fa-plus"></i> Upload
                </button>
              </div>
              <div className="bop-grid">
                {workPhotos.map((src, i) => (
                  <div key={i} className="bop-grid-item" onClick={() => setPhotoViewer(i)}>
                    <img src={src} alt={`work ${i + 1}`} className="bop-grid-img" />
                    <div className="bop-grid-hover">
                      <i className="fas fa-expand-alt"></i>
                    </div>
                  </div>
                ))}
                <div className="bop-grid-item bop-grid-add" onClick={() => setPhotoModal(true)}>
                  <i className="fas fa-plus"></i>
                  <span>Add</span>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB: SERVICES ─── */}
          {activeTab === 'services' && (
            <div className="bop-services-tab">
              <div className="bop-section-head">
                <h3 className="bop-section-title">Service Rates</h3>
                <button className="bop-edit-btn" onClick={() => setEditSection('services')}>
                  <i className="fas fa-pen"></i> Edit
                </button>
              </div>
              <div className="bop-services-list">
                {profile.services.map(svc => (
                  <div key={svc.id} className="bop-service-row">
                    <div className="bop-service-info">
                      <span className="bop-service-name">{svc.name}</span>
                      {svc.desc && <span className="bop-service-desc">{svc.desc}</span>}
                    </div>
                    <span className="bop-service-price">LKR {parseInt(svc.price).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="bop-section-head" style={{ marginTop: 28 }}>
                <h3 className="bop-section-title">Working Hours</h3>
                <button className="bop-edit-btn" onClick={() => setEditSection('hours')}>
                  <i className="fas fa-pen"></i> Edit
                </button>
              </div>
              <div className="bop-hours-card">
                {Object.entries(profile.workingHours).map(([day, val]) => (
                  <div key={day} className={`bop-hours-display-row ${!val.active ? 'closed' : ''}`}>
                    <span className="bop-hours-display-day">{day}</span>
                    <span className="bop-hours-display-time">
                      {val.active ? `${val.start} – ${val.end}` : 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB: INFO ─── */}
          {activeTab === 'info' && (
            <div className="bop-info-tab">

              {/* Personal Info */}
              <div className="bop-info-card">
                <div className="bop-section-head">
                  <h3 className="bop-section-title">Personal Info</h3>
                  <button className="bop-edit-btn" onClick={() => setEditSection('personal')}>
                    <i className="fas fa-pen"></i> Edit
                  </button>
                </div>
                {[
                  { icon: 'fa-user',          label: 'Full Name',  value: profile.name                  },
                  { icon: 'fa-envelope',       label: 'Email',      value: profile.email                 },
                  { icon: 'fa-phone',          label: 'Phone',      value: profile.phone                 },
                  { icon: 'fa-id-card',        label: 'ID Number',  value: profile.idNumber              },
                  { icon: 'fa-map-marker-alt', label: 'City',       value: profile.city                  },
                  { icon: 'fa-briefcase',      label: 'Experience', value: `${profile.experience} years` },
                ].map((f, idx) => (
                  <div key={idx} className="bop-info-row">
                    <div className="bop-info-icon"><i className={`fas ${f.icon}`}></i></div>
                    <div className="bop-info-content">
                      <span className="bop-info-label">{f.label}</span>
                      <span className="bop-info-value">{f.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Locations */}
              <div className="bop-info-card">
                <div className="bop-section-head">
                  <h3 className="bop-section-title">Locations</h3>
                  <button className="bop-edit-btn" onClick={() => setEditSection('locations')}>
                    <i className="fas fa-pen"></i> Edit
                  </button>
                </div>
                {profile.locations.map(loc => (
                  <div key={loc.id} className="bop-location-block">
                    <div className="bop-location-icon"><i className="fas fa-map-marker-alt"></i></div>
                    <div>
                      <p className="bop-location-name">{loc.salonName}</p>
                      <p className="bop-location-addr">{loc.address}, {loc.district} {loc.postalCode}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Certifications — now editable */}
              <div className="bop-info-card">
                <div className="bop-section-head">
                  <h3 className="bop-section-title">Certifications</h3>
                  <button className="bop-edit-btn" onClick={() => setEditSection('certifications')}>
                    <i className="fas fa-pen"></i> Edit
                  </button>
                </div>
                {profile.certifications.length === 0 ? (
                  <p className="bop-no-tags-hint">No certifications added yet.</p>
                ) : (
                  profile.certifications.map((cert, i) => (
                    <div key={i} className="bop-cert-block">
                      <div className="bop-cert-icon"><i className="fas fa-certificate"></i></div>
                      <div>
                        <p className="bop-cert-name">{cert.title}</p>
                        <p className="bop-cert-inst">{cert.institute}</p>
                        {cert.date && (
                          <p className="bop-cert-date">
                            <i className="fas fa-calendar-alt"></i> {cert.date}
                          </p>
                        )}
                        <p className="bop-cert-desc-text">{cert.desc}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}


        </div>

        
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="bottom-nav">
        <Link to="/barber-home"       className="nav-item"><i className="fas fa-home"></i><span>Home</span></Link>
        <Link to="/barber-dashboard"  className="nav-item"><i className="fas fa-calendar-alt"></i><span>DashBoard</span></Link>
        <Link to="/addphoto"          className="nav-item add-circle-btn"><i className="fas fa-plus"></i></Link>
        <Link to="/message"           className="nav-item"><i className="fas fa-comments"></i><span>Message</span></Link>
        <Link to="/barber-OwnProfile" className="nav-item active"><i className="fas fa-user"></i><span>Profile</span></Link>
      </nav>

    </div>
  );
}