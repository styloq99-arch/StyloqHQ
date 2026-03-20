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

                        {/* ─── BIO SECTION ─── */}
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