import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BarberSidebar from '../Components/BarberSidebar';
import { apiGet, apiPut, apiPost } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

// ─── Empty defaults (all data is fetched from Supabase) ──────────────────────

const EMPTY_PROFILE = {
  name: '',
  email: '',
  phone: '',
  idNumber: '',
  city: '',
  experience: '0',
  bio: '',
  specialties: [],
  avatar: '',
  coverImage: '',
  workingHours: {
    Mon: { active: false, start: 'Closed', end: 'Closed' },
    Tue: { active: false, start: 'Closed', end: 'Closed' },
    Wed: { active: false, start: 'Closed', end: 'Closed' },
    Thu: { active: false, start: 'Closed', end: 'Closed' },
    Fri: { active: false, start: 'Closed', end: 'Closed' },
    Sat: { active: false, start: 'Closed', end: 'Closed' },
    Sun: { active: false, start: 'Closed', end: 'Closed' },
  },
  services: [],
  locations: [],
  certifications: [],
};

// Posts are fetched from the database

const TIME_SLOTS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM',
];

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ section, profile, onSave, onClose }) {
  const [data, setData] = useState(() => JSON.parse(JSON.stringify(profile)));
  const avatarRef = useRef(null);
  const coverRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // specialty tag input
  const [newSpecialty, setNewSpecialty] = useState('');

  const set = (key, val) => setData(prev => ({ ...prev, [key]: val }));

  // Store actual File objects for upload
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
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
          end: !prev.workingHours[day].active ? '06:00 PM' : 'Closed',
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
    if (coverPreview) saved.coverImage = coverPreview;
    // Attach actual File objects for Supabase Storage upload
    saved._avatarFile = avatarFile;
    saved._coverFile = coverFile;
    onSave(saved);
  };

  const renderContent = () => {
    switch (section) {

      // ── Photos ──
      case 'photo':
        return (
          <div className="bop-modal-photo-section">
            <input type="file" ref={avatarRef} accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            <input type="file" ref={coverRef} accept="image/*" style={{ display: 'none' }} onChange={handleCoverChange} />
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
              { label: 'Full Name', key: 'name', type: 'text' },
              { label: 'Email Address', key: 'email', type: 'email' },
              { label: 'Phone Number', key: 'phone', type: 'tel' },
              { label: 'City', key: 'city', type: 'text' },
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
                  { label: 'Salon Name', key: 'salonName', placeholder: "e.g. The Gentleman's Cut" },
                  { label: 'Address', key: 'address', placeholder: 'Street address' },
                  { label: 'District', key: 'district', placeholder: 'e.g. Colombo 05' },
                  { label: 'Postal Code', key: 'postalCode', placeholder: 'e.g. 00100' },
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
                  { label: 'Certificate Title', key: 'title', type: 'text', placeholder: 'e.g. Master Barber Diploma' },
                  { label: 'Issuing Institute', key: 'institute', type: 'text', placeholder: 'e.g. IHB Academy' },
                  { label: 'Issue Date', key: 'date', type: 'date', placeholder: '' },
                  { label: 'Description', key: 'desc', type: 'text', placeholder: 'Brief summary of the cert...' },
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
    photo: 'Edit Photos',
    personal: 'Edit Profile Info',
    specialties: 'Edit Specialties',
    hours: 'Edit Working Hours',
    services: 'Edit Services',
    locations: 'Edit Locations',
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
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  return (
    <div className="bop-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bop-modal bop-modal-sm">
        <div className="bop-modal-header">
          <h3 className="bop-modal-title">Upload Work Photo</h3>
          <button className="bop-modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <div className="bop-modal-body">
          <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
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
          <button className="bop-modal-cancel" onClick={onClose} disabled={isUploading}>Cancel</button>
          <button 
            className="bop-modal-save" 
            disabled={!preview || isUploading} 
            onClick={async () => {
              setIsUploading(true);
              await onUpload(file, caption);
              setIsUploading(false);
              onClose(); 
            }}
          >
            {isUploading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-upload"></i>} Upload
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Post Detail Modal ───────────────────────────────────────────────────────
function PostDetailModal({ post, profile, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await apiGet(`/feed/${post.id}/comments`);
        if (res.success) setComments(res.data.comments || []);
      } catch(err) { console.error('Failed to fetch comments:', err); }
      finally { setLoadingComments(false); }
    };
    fetchComments();
    setIsLiked(post.liked || false);
  }, [post.id]);

  const handleLike = async () => {
    setIsLiked(prev => !prev);
    setLikeCount(prev => (isLiked ? prev - 1 : prev + 1));
    await apiPost(`/feed/${post.id}/like`);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const res = await apiPost(`/feed/${post.id}/comment`, { comment: newComment });
    if (res.success) {
      setComments([...comments, { user_name: 'You', text: newComment, created_at: new Date().toISOString() }]);
      setNewComment('');
    }
  };

  return (
    <div className="post-detail-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="post-detail-modal">
        <button className="post-detail-close" onClick={onClose}><i className="fas fa-times"></i></button>
        <div className="post-detail-left">
          <img src={post.imageUrl || post.image_url} alt="Post" />
        </div>
        <div className="post-detail-right">
          <div className="post-detail-header">
            <img src={profile.avatar || 'https://via.placeholder.com/40'} alt="avatar" className="post-avatar" />
            <span className="post-author">{profile.name || 'Barber'}</span>
          </div>
          <div className="post-detail-body">
            {post.caption && (
              <div className="post-caption-block">
                <img src={profile.avatar || 'https://via.placeholder.com/40'} alt="avatar" className="post-avatar" />
                <p><strong>{profile.name || 'Barber'}</strong> {post.caption}</p>
              </div>
            )}
            <div className="post-comments-list">
              {loadingComments ? <p className="bop-no-tags-hint">Loading comments...</p> : 
                comments.map((c, i) => (
                  <div key={i} className="post-comment-item">
                     <strong>{c.user_name || c.author}</strong> {c.text || c.comment}
                  </div>
                ))
              }
            </div>
          </div>
          <div className="post-detail-footer">
            <div className="post-actions">
              <button onClick={handleLike} className={isLiked ? 'liked' : ''}>
                <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
              </button>
              <button><i className="far fa-comment"></i></button>
            </div>
            <div className="post-likes-count">{likeCount} likes</div>
            <form onSubmit={handleCommentSubmit} className="post-comment-form">
              <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." />
              <button type="submit" disabled={!newComment.trim()}>Post</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BarberOwnProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [profileLoading, setProfileLoading] = useState(true);
  const [workPhotos, setWorkPhotos] = useState([]);
  const [editSection, setEditSection] = useState(null);
  const [photoModal, setPhotoModal] = useState(false);
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [photoViewer, setPhotoViewer] = useState(null);

  // Fetch barber profile from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const res = await apiGet('/barber/me/profile');
        if (res.success && res.data) {
          const d = res.data;

          // Map availability (day_of_week 0-6) to working hours object
          const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const workingHours = { ...EMPTY_PROFILE.workingHours };
          if (Array.isArray(d.availability)) {
            d.availability.forEach(slot => {
              const dayName = DAY_NAMES[slot.day_of_week];
              if (dayName) {
                const formatTime = (t) => {
                  if (!t) return '09:00 AM';
                  const parts = t.split(':');
                  let h = parseInt(parts[0]);
                  const m = parts[1] || '00';
                  const ampm = h >= 12 ? 'PM' : 'AM';
                  if (h > 12) h -= 12;
                  if (h === 0) h = 12;
                  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
                };
                workingHours[dayName] = {
                  active: true,
                  start: formatTime(slot.start_time),
                  end: formatTime(slot.end_time),
                };
              }
            });
          }

          setProfile({
            id: d.id,
            name: d.name || '',
            email: d.email || '',
            phone: d.phone || '',
            idNumber: '',
            city: d.current_location_name || '',
            experience: d.years_experience ? String(d.years_experience) : '0',
            bio: d.bio || '',
            specialties: Array.isArray(d.specialties) ? d.specialties : [],
            avatar: d.avatar || d.profile_image || '',
            coverImage: d.cover_image || '',
            workingHours,
            services: Array.isArray(d.services)
              ? d.services.map(s => ({ id: s.id, name: s.name, price: String(s.price || ''), desc: s.description || '' }))
              : [],
            locations: d.current_location_name
              ? [{ id: 1, salonName: '', address: d.current_location_name, district: '', postalCode: '' }]
              : [],
            certifications: Array.isArray(d.certifications)
              ? d.certifications.map(c => ({ title: c.name, institute: c.issuing_body || '', date: '', desc: '' }))
              : [],
            // Store raw stats for dynamic display
            _postsCount: d.posts_count || 0,
            _avgRating: d.avg_rating || 0,
            _reviewCount: d.review_count || 0,
          });
        }
      } catch (err) {
        console.error('Failed to fetch barber profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const fetchPosts = async () => {
    if (!profile.id) return;
    try {
      const res = await apiGet(`/feed?limit=50&barber_id=${profile.id}`);
      console.log('[DEBUG] Feed response for profile posts:', res);
      if (res.success && Array.isArray(res.data)) {
        setWorkPhotos(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [profile.id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleSave = async (updated) => {
    setEditSection(null);

    try {
      // Upload images to Supabase Storage if new files were selected
      let avatarUrl = updated.avatar;
      let coverUrl = updated.coverImage;

      console.log('[DEBUG] handleSave called. _avatarFile:', updated._avatarFile, '_coverFile:', updated._coverFile);

      if (updated._avatarFile) {
        const ext = updated._avatarFile.name.split('.').pop();
        const path = `avatars/${Date.now()}_avatar.${ext}`;
        console.log('[DEBUG] Uploading avatar to path:', path);
        const { data: uploadData, error } = await supabase.storage
          .from('profile-images')
          .upload(path, updated._avatarFile, { upsert: true });
        console.log('[DEBUG] Avatar upload result:', { uploadData, error });
        if (error) {
          console.error('Avatar upload failed:', error);
          showToast('Failed to upload profile photo: ' + error.message);
          return;
        }
        const { data: urlData } = supabase.storage
          .from('profile-images')
          .getPublicUrl(uploadData.path);
        avatarUrl = urlData.publicUrl;
        console.log('[DEBUG] Avatar public URL:', avatarUrl);
      }

      if (updated._coverFile) {
        const ext = updated._coverFile.name.split('.').pop();
        const path = `covers/${Date.now()}_cover.${ext}`;
        console.log('[DEBUG] Uploading cover to path:', path);
        const { data: uploadData, error } = await supabase.storage
          .from('profile-images')
          .upload(path, updated._coverFile, { upsert: true });
        console.log('[DEBUG] Cover upload result:', { uploadData, error });
        if (error) {
          console.error('Cover upload failed:', error);
          showToast('Failed to upload cover photo: ' + error.message);
          return;
        }
        const { data: urlData } = supabase.storage
          .from('profile-images')
          .getPublicUrl(uploadData.path);
        coverUrl = urlData.publicUrl;
        console.log('[DEBUG] Cover public URL:', coverUrl);
      }

      // Clean up temp file references
      const { _avatarFile, _coverFile, ...cleanUpdated } = updated;
      cleanUpdated.avatar = avatarUrl;
      cleanUpdated.coverImage = coverUrl;

      setProfile(cleanUpdated);
      showToast('Profile updated successfully!');

      await apiPut('/barber/me/profile', {
        full_name: cleanUpdated.name,
        phone_number: cleanUpdated.phone,
        city: cleanUpdated.city,
        bio: cleanUpdated.bio,
        experience_years: parseInt(cleanUpdated.experience) || 0,
        specialties: cleanUpdated.specialties,
        profile_image: avatarUrl,
        cover_image: coverUrl,
      });
    } catch (err) {
      console.error('Profile save error:', err);
      showToast('Failed to save profile.');
    }
  };

  const handlePhotoUpload = async (file, caption) => {
    try {
      showToast('Uploading photo...');
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      const res = await apiPost('/feed/create', {
        caption: caption,
        image_url: publicUrl
      });

      if (res.success) {
        fetchPosts();
        showToast('Photo uploaded!');
      } else {
        showToast(res.message || 'Failed to create post');
      }
    } catch (err) {
      console.error(err);
      showToast('Upload failed');
    }
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
      {photoViewer !== null && workPhotos[photoViewer] && (
        <PostDetailModal
          post={workPhotos[photoViewer]}
          profile={profile}
          onClose={() => setPhotoViewer(null)}
        />
      )}

      {/* ── Desktop Sidebar ── */}
      <BarberSidebar activePage="Profile" />

      {/* ── Main Content ── */}
      <div className="main-content">
        {profileLoading ? (
          <div className="page-loading-overlay">
            <div className="page-loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Loading profile…</span>
            </div>
          </div>
        ) : (
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
                {[
                  { label: 'Posts', value: profile._postsCount || workPhotos.length || 0 },
                  { label: 'Rating', value: profile._avgRating || '–' },
                  { label: 'Reviews', value: profile._reviewCount || 0 },
                ].map(st => (
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
            <button className={`bop-tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
              <i className="fas fa-th"></i> <span>Posts</span>
            </button>
            <button className={`bop-tab ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
              <i className="fas fa-cut"></i> <span>Services</span>
            </button>
            <button className={`bop-tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
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
                {workPhotos.map((post, i) => (
                  <div key={i} className="bop-grid-item" onClick={() => setPhotoViewer(i)}>
                    <img src={post.imageUrl || post.image_url} alt={`work ${i + 1}`} className="bop-grid-img" />
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
              {profile.services.length === 0 ? (
                <p className="bop-no-tags-hint" style={{ marginBottom: '1.5rem' }}>No services added yet.</p>
              ) : (
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
              )}

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
                  { icon: 'fa-user', label: 'Full Name', value: profile.name },
                  { icon: 'fa-envelope', label: 'Email', value: profile.email },
                  { icon: 'fa-phone', label: 'Phone', value: profile.phone },
                  { icon: 'fa-id-card', label: 'ID Number', value: profile.idNumber },
                  { icon: 'fa-map-marker-alt', label: 'City', value: profile.city },
                  { icon: 'fa-briefcase', label: 'Experience', value: `${profile.experience} years` },
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
                {profile.locations.length === 0 ? (
                  <p className="bop-no-tags-hint">No locations added yet.</p>
                ) : (
                  profile.locations.map(loc => (
                    <div key={loc.id} className="bop-location-block">
                      <div className="bop-location-icon"><i className="fas fa-map-marker-alt"></i></div>
                      <div>
                        <p className="bop-location-name">{loc.salonName}</p>
                        <p className="bop-location-addr">{loc.address}, {loc.district} {loc.postalCode}</p>
                      </div>
                    </div>
                  ))
                )}
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
        )}

      </div>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        <Link to="/barber-home" className="nav-item"><i className="fas fa-home"></i><span>Home</span></Link>
        <Link to="/barber-dashboard" className="nav-item"><i className="fas fa-chart-bar"></i><span>Dashboard</span></Link>
        <Link to="/postingPhotos" className="nav-item add-circle-btn"><i className="fas fa-plus"></i></Link>
        <Link to="/message" className="nav-item"><i className="fas fa-comments"></i><span>Message</span></Link>
        <Link to="/barber-OwnProfile" className="nav-item active"><i className="fas fa-user"></i><span>Profile</span></Link>
      </nav>

    </div>
  );
}