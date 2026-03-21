import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ── Mock applications the barber has submitted (replace with API later) ──────
// Status comes from the salon side: Pending → Shortlisted → Hired / Rejected
const MY_APPLICATIONS = [
  {
    id: 1,
    role: 'Senior Barber',
    salon: 'Liyo Salons (pvt) Ltd',
    location: 'Colombo 05',
    type: 'Full Time',
    salary: 'RS. 60,000 – 80,000',
    appliedDate: '2026-01-10',
    deadline: '2026-01-15',
    status: 'Shortlisted',
    photo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80',
    skills: ['Fade', 'Beard Design', 'Color'],
    cvName: 'Perera_CV_2026.pdf',
    coverLetter: 'I am highly experienced in fade techniques and have worked in 3 salons across Colombo.',
    salonNote: 'Your profile stood out! We would like to invite you for an interview on Jan 18.',
  },
  {
    id: 2,
    role: 'Junior Barber',
    salon: 'Salon Next (pvt) Ltd',
    location: 'Peliyagoda',
    type: 'Part Time',
    salary: 'RS. 30,000 – 45,000',
    appliedDate: '2026-01-08',
    deadline: '2026-01-30',
    status: 'Pending',
    photo: null,
    skills: ['Classic Cut', 'Shave'],
    cvName: 'Perera_CV_2026.pdf',
    coverLetter: '',
    salonNote: null,
  },
  {
    id: 3,
    role: 'Master Stylist',
    salon: "The Gentleman's Cut",
    location: 'Colombo 07',
    type: 'Full Time',
    salary: 'RS. 75,000 – 95,000',
    appliedDate: '2026-01-05',
    deadline: '2026-02-10',
    status: 'Hired',
    photo: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80',
    skills: ['Color', 'Perms', 'Texture'],
    cvName: 'Perera_CV_2026.pdf',
    coverLetter: 'I specialise in high-end color and texture work and am looking for a premium salon environment.',
    salonNote: 'Congratulations! You have been selected. Please contact us at 0771234567.',
  },
  {
    id: 4,
    role: 'Barber & Grooming Specialist',
    salon: 'Sharps Barbershop',
    location: 'Nugegoda',
    type: 'Full Time',
    salary: 'RS. 50,000 – 65,000',
    appliedDate: '2026-01-03',
    deadline: '2026-02-20',
    status: 'Rejected',
    photo: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80',
    skills: ['Skin Fade', 'Beard Sculpting'],
    cvName: 'Perera_CV_2026.pdf',
    coverLetter: '',
    salonNote: 'Thank you for applying. We have decided to go with a more experienced candidate.',
  },
];

const FILTERS = ['All', 'Pending', 'Shortlisted', 'Hired', 'Rejected'];

// Status config — colour, icon, label, description
const STATUS_CONFIG = {
  Pending:     { color: '#FFC107', bg: 'rgba(255,193,7,0.12)',   border: 'rgba(255,193,7,0.3)',   icon: 'fa-clock',         label: 'Pending Review',  desc: 'Your application is being reviewed by the salon.' },
  Shortlisted: { color: '#0095f6', bg: 'rgba(0,149,246,0.12)',   border: 'rgba(0,149,246,0.3)',   icon: 'fa-bookmark',      label: 'Shortlisted',     desc: 'You have been shortlisted! The salon may contact you soon.' },
  Hired:       { color: '#4CAF50', bg: 'rgba(76,175,80,0.12)',   border: 'rgba(76,175,80,0.3)',   icon: 'fa-check-circle',  label: 'Hired!',          desc: 'Congratulations! You got the job.' },
  Rejected:    { color: '#e53935', bg: 'rgba(229,57,53,0.12)',   border: 'rgba(229,57,53,0.3)',   icon: 'fa-times-circle',  label: 'Not Selected',    desc: 'The salon chose another candidate this time.' },
};

export default function BarberApplicationsPage() {
  const navigate = useNavigate();

  const [filter,     setFilter]     = useState('All');
  const [detailApp,  setDetailApp]  = useState(null);
  const [withdrawId, setWithdrawId] = useState(null);
  const [apps,       setApps]       = useState(MY_APPLICATIONS);
  const [toast,      setToast]      = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2800); };

  const visible = filter === 'All' ? apps : apps.filter(a => a.status === filter);

  const handleWithdraw = id => {
    setApps(prev => prev.filter(a => a.id !== id));
    setWithdrawId(null);
    setDetailApp(null);
    showToast('Application withdrawn successfully.');
  };

  const fmtDate  = d => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtShort = d => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  const countFor = f => f === 'All' ? apps.length : apps.filter(a => a.status === f).length;

  return (
    <div className="app-layout">

      {/* ── Desktop Sidebar ── */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <h1 className="brand-title" style={{ fontSize: '40px' }}>StyloQ</h1>
        </div>
        <nav className="sidebar-nav">
          <Link to="/barber-home"       className="sidebar-link"><i className="fas fa-home"></i> <span>Home</span></Link>
          <Link to="/barber-dashboard"  className="sidebar-link active"><i className="fas fa-calendar-alt"></i> <span>DashBoard</span></Link>
          <Link to="/message"           className="sidebar-link"><i className="fas fa-comments"></i> <span>Message</span></Link>
          <Link to="/barber-OwnProfile" className="sidebar-link"><i className="fas fa-user"></i> <span>Profile</span></Link>
          <Link to="/postingPhotos"     className="sidebar-link"><i className="fas fa-plus-square"></i> <span>New Post</span></Link>
        </nav>
      </aside>

      <div className="main-content">
        <div className="ba-page">

          {/* ── HEADER ── */}
          <header className="ba-header">
            <button className="bv-back-btn" onClick={() => navigate('/barber-vacancies')}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <div className="ba-header-text">
              <h1 className="ba-header-title">My Applications</h1>
              <p className="ba-header-sub">{apps.length} total · {apps.filter(a => a.status === 'Hired').length} hired</p>
            </div>
            <Link to="/barber-vacancies" className="ba-find-btn">
              <i className="fas fa-search"></i>
              <span>Find Jobs</span>
            </Link>
          </header>

          {/* ── STATS ROW ── */}
          <div className="ba-stats-row">
            {['Pending', 'Shortlisted', 'Hired', 'Rejected'].map(s => {
              const cfg = STATUS_CONFIG[s];
              return (
                <div key={s} className="ba-stat-card" style={{ borderColor: cfg.border }}
                  onClick={() => setFilter(filter === s ? 'All' : s)}>
                  <i className={`fas ${cfg.icon} ba-stat-icon`} style={{ color: cfg.color }}></i>
                  <span className="ba-stat-num" style={{ color: cfg.color }}>{countFor(s)}</span>
                  <span className="ba-stat-label">{s}</span>
                </div>
              );
            })}
          </div>

          {/* ── FILTER PILLS ── */}
          <div className="bv-filters">
            {FILTERS.map(f => (
              <button key={f}
                className={`bv-filter-pill${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f} {f !== 'All' && <span className="ba-pill-count">({countFor(f)})</span>}
              </button>
            ))}
          </div>

          {/* ── APPLICATIONS LIST ── */}
          {visible.length === 0 ? (
            <div className="ba-empty">
              <i className="fas fa-folder-open ba-empty-icon"></i>
              <p className="ba-empty-title">No applications here</p>
              <p className="ba-empty-sub">
                {filter === 'All' ? "You haven't applied to any jobs yet." : `No ${filter.toLowerCase()} applications.`}
              </p>
              <Link to="/barber-vacancies" className="ba-browse-btn">
                <i className="fas fa-briefcase"></i> Browse Vacancies
              </Link>
            </div>
          ) : (
            <div className="ba-list">
              {visible.map((app, idx) => {
                const cfg = STATUS_CONFIG[app.status];
                return (
                  <div key={app.id} className="ba-card" style={{ animationDelay: `${idx * 60}ms` }}>

                    {/* Left: photo or placeholder */}
                    <div className="ba-card-left">
                      {app.photo
                        ? <img src={app.photo} alt={app.role} className="ba-card-photo" />
                        : <div className="ba-card-photo-ph"><i className="fas fa-store"></i></div>
                      }
                    </div>

                    {/* Right: info */}
                    <div className="ba-card-body">
                      <div className="ba-card-top">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className="ba-card-role">{app.role}</p>
                          <p className="ba-card-salon"><i className="fas fa-store"></i> {app.salon}</p>
                          <p className="ba-card-location"><i className="fas fa-map-marker-alt"></i> {app.location}</p>
                        </div>
                        {/* Status badge */}
                        <div className="ba-status-badge"
                          style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                          <i className={`fas ${cfg.icon}`}></i>
                          <span>{cfg.label}</span>
                        </div>
                      </div>

                      <p className="ba-card-salary"><i className="fas fa-money-bill-wave"></i> {app.salary}</p>

                      {/* Skills */}
                      <div className="bv-card-skills">
                        {app.skills.slice(0, 3).map(s => <span key={s} className="bv-skill-tag">{s}</span>)}
                      </div>

                      {/* Salon note if any */}
                      {app.salonNote && (
                        <div className="ba-salon-note" style={{ borderColor: cfg.border }}>
                          <i className="fas fa-comment-dots ba-note-icon" style={{ color: cfg.color }}></i>
                          <p className="ba-note-text">{app.salonNote}</p>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="ba-card-footer">
                        <div className="ba-card-dates">
                          <span className="bv-meta-item">
                            <i className="fas fa-paper-plane"></i> Applied {fmtShort(app.appliedDate)}
                          </span>
                          <span className="bv-meta-item">
                            <i className="fas fa-calendar-alt"></i> Closes {fmtShort(app.deadline)}
                          </span>
                        </div>
                        <div className="ba-card-actions">
                          <button className="bv-details-btn" onClick={() => setDetailApp(app)}>
                            View
                          </button>
                          {app.status === 'Pending' && (
                            <button className="ba-withdraw-btn" onClick={() => setWithdrawId(app.id)}>
                              Withdraw
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        <Link to="/barber-home"       className="nav-item"><i className="fas fa-home"></i><span>Home</span></Link>
        <Link to="/barber-dashboard"  className="nav-item"><i className="fas fa-chart-bar"></i><span>Dashboard</span></Link>
        <Link to="/postingPhotos"     className="nav-item add-circle-btn"><i className="fas fa-plus"></i></Link>
        <Link to="/message"           className="nav-item"><i className="fas fa-comments"></i><span>Message</span></Link>
        <Link to="/barber-OwnProfile" className="nav-item"><i className="fas fa-user"></i><span>Profile</span></Link>
      </nav>

      {/* ── DETAIL MODAL ── */}
      {detailApp && (() => {
        const cfg = STATUS_CONFIG[detailApp.status];
        return (
          <div className="bv-backdrop" onClick={e => e.target === e.currentTarget && setDetailApp(null)}>
            <div className="bv-modal">
              <div className="bv-modal-hdr">
                <h3 className="bv-modal-title">{detailApp.role}</h3>
                <button className="bv-modal-close" onClick={() => setDetailApp(null)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="bv-modal-body">

                {/* Status banner */}
                <div className="ba-detail-status-banner"
                  style={{ background: cfg.bg, borderColor: cfg.border }}>
                  <i className={`fas ${cfg.icon}`} style={{ color: cfg.color, fontSize: 22 }}></i>
                  <div>
                    <p className="ba-banner-label" style={{ color: cfg.color }}>{cfg.label}</p>
                    <p className="ba-banner-desc">{cfg.desc}</p>
                  </div>
                </div>

                {/* Salon note */}
                {detailApp.salonNote && (
                  <div className="ba-detail-note" style={{ borderColor: cfg.border }}>
                    <p className="ba-detail-note-title" style={{ color: cfg.color }}>
                      <i className="fas fa-comment-dots"></i> Message from Salon
                    </p>
                    <p className="ba-detail-note-body">{detailApp.salonNote}</p>
                  </div>
                )}

                {/* Job info */}
                {detailApp.photo && <img src={detailApp.photo} alt="" className="bv-detail-img" />}
                <div className="bv-detail-salon-row">
                  <div>
                    <p className="bv-detail-salon-name">{detailApp.salon}</p>
                    <p className="bv-card-location" style={{ marginTop: 4 }}>
                      <i className="fas fa-map-marker-alt"></i> {detailApp.location}
                    </p>
                  </div>
                  <span className={`bv-type-badge ${detailApp.type === 'Full Time' ? 'full' : 'part'}`}>
                    {detailApp.type}
                  </span>
                </div>

                <div className="bv-info-grid">
                  {[
                    { icon: 'fa-money-bill-wave', label: 'Salary',       val: detailApp.salary             },
                    { icon: 'fa-calendar-alt',    label: 'Applied',      val: fmtDate(detailApp.appliedDate) },
                    { icon: 'fa-calendar-times',  label: 'Deadline',     val: fmtDate(detailApp.deadline)   },
                    { icon: 'fa-file-pdf',        label: 'CV Submitted', val: detailApp.cvName              },
                  ].map(r => (
                    <div key={r.label} className="bv-info-item">
                      <i className={`fas ${r.icon}`}></i>
                      <div>
                        <span className="bv-info-label">{r.label}</span>
                        <span className="bv-info-val">{r.val}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cover letter */}
                {detailApp.coverLetter && (
                  <div className="ba-detail-cover">
                    <h4 className="bv-detail-block-title">Your Cover Letter</h4>
                    <p className="ba-cover-text">{detailApp.coverLetter}</p>
                  </div>
                )}

                {/* Skills */}
                <div className="bv-detail-block">
                  <h4 className="bv-detail-block-title">Applied Skills</h4>
                  <div className="bv-card-skills">
                    {detailApp.skills.map(s => <span key={s} className="bv-skill-tag">{s}</span>)}
                  </div>
                </div>

              </div>
              <div className="bv-modal-ftr">
                <button className="bv-btn-cancel" onClick={() => setDetailApp(null)}>Close</button>
                {detailApp.status === 'Pending' && (
                  <button className="ba-btn-withdraw-modal" onClick={() => { setDetailApp(null); setWithdrawId(detailApp.id); }}>
                    <i className="fas fa-undo"></i> Withdraw
                  </button>
                )}
                {detailApp.status === 'Hired' && (
                  <a href="tel:+94771234567" className="ba-btn-contact">
                    <i className="fas fa-phone"></i> Contact Salon
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── WITHDRAW CONFIRM MODAL ── */}
      {withdrawId && (
        <div className="bv-backdrop" onClick={e => e.target === e.currentTarget && setWithdrawId(null)}>
          <div className="bv-modal ba-confirm-modal">
            <div className="ba-confirm-inner">
              <div className="ba-confirm-icon">
                <i className="fas fa-undo"></i>
              </div>
              <h3 className="ba-confirm-title">Withdraw Application?</h3>
              <p className="ba-confirm-body">
                This will remove your application. You can re-apply later if the vacancy is still open.
              </p>
            </div>
            <div className="bv-modal-ftr">
              <button className="bv-btn-cancel" onClick={() => setWithdrawId(null)}>Cancel</button>
              <button className="ba-btn-confirm-withdraw" onClick={() => handleWithdraw(withdrawId)}>
                Yes, Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="bv-toast"><i className="fas fa-check-circle"></i> {toast}</div>}

    </div>
  );
}
