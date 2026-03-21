import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const EMPTY_FORM = { title: '', type: 'Full Time', salary: '', deadline: '', skills: '', experience: '', photo: null };

export default function SalonHirePage() {
  const [page, setPage]           = useState('listings');
  const [listings, setListings]   = useState([]);
  const [apps, setApps]           = useState([]);
  const [filter, setFilter]       = useState('All');
  const [confirm, setConfirm]     = useState(null);
  const [postModal, setPostModal] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [formErr, setFormErr]     = useState({});
  const [toast, setToast]         = useState('');
  const photoRef                  = useRef(null);

  const showToast  = msg => { setToast(msg); setTimeout(() => setToast(''), 2500); };
  const closeModal = ()  => { setPostModal(false); setForm(EMPTY_FORM); setFormErr({}); };

  const postVacancy = () => {
    const e = {};
    if (!form.title.trim())  e.title    = 'Required';
    if (!form.salary.trim()) e.salary   = 'Required';
    if (!form.deadline)      e.deadline = 'Required';
    setFormErr(e);
    if (Object.keys(e).length) return;
    setListings(p => [{
      id: Date.now(), title: form.title, type: form.type,
      salary: form.salary, deadline: form.deadline,
      experience: form.experience,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      applicants: 0, photo: form.photo,
    }, ...p]);
    closeModal();
    showToast('Vacancy posted! Barbers can now see it.');
  };

  return (
    <div className="app-layout barber-home-page">

      {/* ── Desktop Sidebar ── */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <h1 className="brand-title" style={{ fontSize: '40px' }}>StyloQ</h1>
        </div>
        <nav className="sidebar-nav">
          <Link to="/salon-home"    className="sidebar-link"><i className="fas fa-home" />        <span>Home</span></Link>
          <Link to="/salon-hire"    className="sidebar-link active"><i className="fas fa-users" /> <span>Hire Barbers</span></Link>
          <Link to="/salon-profile" className="sidebar-link"><i className="fas fa-user-circle" />  <span>Profile</span></Link>
        </nav>
        <div className="sidebar-user">
          <img src="https://i.pravatar.cc/150?img=32" alt="Salon" className="user-avatar" />
          <div className="user-info">
            <p className="user-name">Liyo Salon</p>
            <p className="user-status">Colombo 07</p>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">
        <header className="customer-barber-header">
          <div className="header-top">
            <div className="header-profile">
              <div className="barber-welcome-text">
                <h2 className="hire-title-large">HIRE</h2>
                <h2>BARBERS</h2>
              </div>
            </div>
            {page === 'listings' && (
              <button onClick={() => setPostModal(true)} className="post-vacancy-btn">
                <i className="fas fa-plus" /> Post Vacancy
              </button>
            )}
          </div>

          {/* Page toggle */}
          <div className="page-toggle-bar">
            {[
              { key: 'listings',     label: 'Job Listings', icon: 'fas fa-briefcase' },
              { key: 'applications', label: 'Applications', icon: 'fas fa-users'     },
            ].map(btn => (
              <button
                key={btn.key}
                onClick={() => setPage(btn.key)}
                className={`page-toggle-btn${page === btn.key ? ' active' : ''}`}
              >
                <i className={btn.icon} /> {btn.label}
              </button>
            ))}
          </div>
        </header>

        <div className="page-body barber-home-body" />
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="bottom-nav">
        <Link to="/salon-home"    className="nav-item"><i className="fas fa-home"/>        <span>Home</span></Link>
        <Link to="/salon-hire"    className="nav-item active"><i className="fas fa-users" /><span>Hire</span></Link>
        <Link to="/salon-profile" className="nav-item"><i className="fas fa-user-circle" /> <span>Profile</span></Link>
      </nav>

      {/* ── Post Vacancy Modal ── */}
      {postModal && (
        <div
          className="post-modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="post-modal">
            <div className="post-modal__header">
              <h3 className="post-modal__title">Post Vacancy</h3>
              <button onClick={closeModal} className="post-modal__close-btn">
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="post-modal__body">
              <div className="input-group">
                <label>Job Title *</label>
                <input
                  className={`input-field${formErr.title ? ' field-error' : ''}`}
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Senior Barber"
                />
                {formErr.title && <p className="form-error">Required</p>}
              </div>

              <div className="post-modal__grid-row">
                <div className="input-group">
                  <label>Type</label>
                  <select
                    className="input-field"
                    value={form.type}
                    onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  >
                    <option>Full Time</option>
                    <option>Part Time</option>
                    <option>Contract</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Deadline *</label>
                  <input
                    type="date"
                    className={`input-field${formErr.deadline ? ' field-error' : ''}`}
                    value={form.deadline}
                    onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
                  />
                  {formErr.deadline && <p className="form-error">Required</p>}
                </div>
              </div>

              <div className="input-group">
                <label>Salary Range *</label>
                <input
                  className={`input-field${formErr.salary ? ' field-error' : ''}`}
                  value={form.salary}
                  onChange={e => setForm(p => ({ ...p, salary: e.target.value }))}
                  placeholder="e.g. RS. 60,000 – 80,000"
                />
                {formErr.salary && <p className="form-error">Required</p>}
              </div>

              <div className="input-group">
                <label>Years of Experience Required</label>
                <input
                  className="input-field"
                  value={form.experience}
                  onChange={e => setForm(p => ({ ...p, experience: e.target.value }))}
                  placeholder="e.g. 2+ years, 3-5 years"
                />
              </div>

              <div className="input-group">
                <label>Required Skills</label>
                <input
                  className="input-field"
                  value={form.skills}
                  onChange={e => setForm(p => ({ ...p, skills: e.target.value }))}
                  placeholder="e.g. Fade, Beard Trim, Color"
                />
              </div>

              <div className="input-group">
                <label>Photo (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={photoRef}
                  style={{ display: 'none' }}
                  onChange={e => {
                    const f = e.target.files[0];
                    if (f) setForm(p => ({ ...p, photo: URL.createObjectURL(f) }));
                  }}
                />
                {form.photo ? (
                  <div className="photo-preview-wrap">
                    <img src={form.photo} alt="Preview" className="photo-preview-img" />
                    <button onClick={() => setForm(p => ({ ...p, photo: null }))} className="photo-preview-remove">
                      <i className="fas fa-times" />
                    </button>
                  </div>
                ) : (
                  <div onClick={() => photoRef.current.click()} className="upload-zone">
                    <div className="upload-icon"><i className="fas fa-image" /></div>
                    <p className="upload-text">Tap to add a photo</p>
                    <p className="upload-subtext">JPG or PNG — optional</p>
                  </div>
                )}
              </div>
            </div>

            <div className="post-modal__footer">
              <button onClick={closeModal} className="btn btn-secondary">Cancel</button>
              <button onClick={postVacancy} className="btn btn-primary">Post Vacancy</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="cp-toast" style={{ bottom: 90 }}>
          <i className="fas fa-check-circle" /> {toast}
        </div>
      )}

    </div>
  );
}
