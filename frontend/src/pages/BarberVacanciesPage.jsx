import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ALL_VACANCIES = [
  { id:1, title:'Senior Barber',              salon:'Liyo Salons (pvt) Ltd',  location:'Colombo 05', type:'Full Time', salary:'RS. 60,000 – 80,000', deadline:'2026-01-15', experience:'3+ years',  description:'We are looking for an experienced senior barber to join our flagship Colombo 05 salon. You will handle a high volume of clients and mentor junior staff.',       skills:['Fade','Beard Design','Color','Straight Razor'], photo:'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80', applicants:4, postedDays:2 },
  { id:2, title:'Junior Barber',              salon:'Salon Next (pvt) Ltd',   location:'Peliyagoda', type:'Part Time', salary:'RS. 30,000 – 45,000', deadline:'2026-01-30', experience:'0–2 years', description:'Great opportunity for a fresh graduate or junior barber. Full training provided in a friendly, busy environment.',                                             skills:['Classic Cut','Shave','Lineup'],                  photo:null,                                                                                    applicants:2, postedDays:5 },
  { id:3, title:'Master Stylist',             salon:"The Gentleman's Cut",    location:'Colombo 07', type:'Full Time', salary:'RS. 75,000 – 95,000', deadline:'2026-02-10', experience:'5+ years',  description:'Premium salon seeking a master stylist with expertise in coloring, perms and texture services. Clientele includes corporate professionals.',                  skills:['Color','Perms','Texture','Balayage'],            photo:'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80', applicants:1, postedDays:1 },
  { id:4, title:'Barber & Grooming Specialist',salon:'Sharps Barbershop',     location:'Nugegoda',   type:'Full Time', salary:'RS. 50,000 – 65,000', deadline:'2026-02-20', experience:'2–4 years', description:'Modern barbershop looking for a skilled grooming specialist. Expertise in skin fades and beard sculpting essential.',                                        skills:['Skin Fade','Beard Sculpting','Wax Treatments'],  photo:'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80', applicants:6, postedDays:7 },
];

const FILTERS = ['All', 'Full Time', 'Part Time'];

export default function BarberVacanciesPage() {
  const navigate = useNavigate();
  const cvRef    = useRef(null);

  const [filter,      setFilter]      = useState('All');
  const [detailJob,   setDetailJob]   = useState(null);
  const [applyJob,    setApplyJob]    = useState(null);
  const [cvFile,      setCvFile]      = useState(null);
  const [letter,      setLetter]      = useState('');
  const [applied,     setApplied]     = useState([]);
  const [toast,       setToast]       = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2800); };
  const isApplied = id => applied.includes(id);
  const visible   = filter === 'All' ? ALL_VACANCIES : ALL_VACANCIES.filter(v => v.type === filter);

  const handleSubmit = () => {
    if (!cvFile) { showToast('Please upload your CV first.'); return; }
    setSubmitting(true);
    setTimeout(() => {
      setApplied(p => [...p, applyJob.id]);
      setApplyJob(null); setCvFile(null); setLetter(''); setSubmitting(false);
      showToast(`Applied to ${applyJob.title} at ${applyJob.salon}!`);
    }, 1200);
  };

  const fmtDate = d => new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });
  const fmtShort = d => new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short' });

  return (
    <div className="app-layout">

      {/* Sidebar */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo"><h1 className="brand-title" style={{fontSize:'40px'}}>StyloQ</h1></div>
        <nav className="sidebar-nav">
          <Link to="/barber-home"       className="sidebar-link"><i className="fas fa-home"></i> <span>Home</span></Link>
          <Link to="/barber-dashboard"  className="sidebar-link active"><i className="fas fa-calendar-alt"></i> <span>DashBoard</span></Link>
          <Link to="/message"           className="sidebar-link"><i className="fas fa-comments"></i> <span>Message</span></Link>
          <Link to="/barber-OwnProfile" className="sidebar-link"><i className="fas fa-user"></i> <span>Profile</span></Link>
          <Link to="/postingPhotos"     className="sidebar-link"><i className="fas fa-plus-square"></i> <span>New Post</span></Link>
        </nav>
      </aside>

      <div className="main-content">
        <div className="bv-page">

          {/* HEADER */}
          <header className="bv-header">
            <button className="bv-back-btn" onClick={() => navigate('/barber-dashboard')}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <div className="bv-header-text">
              <h1 className="bv-header-title">Job Vacancies</h1>
              <p className="bv-header-sub">{visible.length} opportunities</p>
            </div>
            <Link to="/barber-applications" className="bv-my-apps-btn">
              <i className="fas fa-file-alt"></i>
              <span>My Applications</span>
            </Link>
          </header>

          {/* FILTER PILLS */}
          <div className="bv-filters">
            {FILTERS.map(f => (
              <button key={f} className={`bv-filter-pill${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>

          {/* CARDS GRID */}
          <div className="bv-grid">
            {visible.map((v, idx) => (
              <div key={v.id} className={`bv-card${isApplied(v.id) ? ' bv-card-applied' : ''}`}
                style={{ animationDelay: `${idx * 60}ms` }}>

                {v.photo
                  ? <img src={v.photo} alt={v.title} className="bv-card-img" />
                  : <div className="bv-card-img-placeholder"><i className="fas fa-store"></i></div>
                }

                <div className="bv-card-body">
                  <div className="bv-card-top">
                    <div style={{ flex:1, minWidth:0 }}>
                      <p className="bv-card-title">{v.title}</p>
                      <p className="bv-card-salon"><i className="fas fa-store"></i> {v.salon}</p>
                      <p className="bv-card-location"><i className="fas fa-map-marker-alt"></i> {v.location}</p>
                    </div>
                    <span className={`bv-type-badge ${v.type === 'Full Time' ? 'full' : 'part'}`}>{v.type}</span>
                  </div>

                  <p className="bv-card-salary"><i className="fas fa-money-bill-wave"></i> {v.salary}</p>

                  <div className="bv-card-skills">
                    {v.skills.slice(0, 3).map(s => <span key={s} className="bv-skill-tag">{s}</span>)}
                    {v.skills.length > 3 && <span className="bv-skill-tag bv-skill-more">+{v.skills.length - 3}</span>}
                  </div>

                  <div className="bv-card-footer">
                    <div className="bv-card-meta">
                      <span className="bv-meta-item"><i className="fas fa-users"></i> {v.applicants}</span>
                      <span className="bv-meta-item"><i className="fas fa-calendar-alt"></i> {fmtShort(v.deadline)}</span>
                      <span className="bv-meta-item"><i className="fas fa-clock"></i> {v.postedDays}d ago</span>
                    </div>
                    <div className="bv-card-actions">
                      <button className="bv-details-btn" onClick={() => setDetailJob(v)}>Details</button>
                      {isApplied(v.id)
                        ? <span className="bv-applied-badge"><i className="fas fa-check"></i> Applied</span>
                        : <button className="bv-apply-btn" onClick={() => setApplyJob(v)}>Apply Now</button>
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="bottom-nav">
        <Link to="/barber-home"       className="nav-item"><i className="fas fa-home"></i><span>Home</span></Link>
        <Link to="/barber-dashboard"  className="nav-item"><i className="fas fa-chart-bar"></i><span>Dashboard</span></Link>
        <Link to="/postingPhotos"     className="nav-item add-circle-btn"><i className="fas fa-plus"></i></Link>
        <Link to="/message"           className="nav-item"><i className="fas fa-comments"></i><span>Message</span></Link>
        <Link to="/barber-OwnProfile" className="nav-item"><i className="fas fa-user"></i><span>Profile</span></Link>
      </nav>

      {/* ── DETAIL MODAL ── */}
      {detailJob && (
        <div className="bv-backdrop" onClick={e => e.target === e.currentTarget && setDetailJob(null)}>
          <div className="bv-modal">
            <div className="bv-modal-hdr">
              <h3 className="bv-modal-title">{detailJob.title}</h3>
              <button className="bv-modal-close" onClick={() => setDetailJob(null)}><i className="fas fa-times"></i></button>
            </div>
            <div className="bv-modal-body">
              {detailJob.photo && <img src={detailJob.photo} alt="" className="bv-detail-img" />}
              <div className="bv-detail-salon-row">
                <div>
                  <p className="bv-detail-salon-name">{detailJob.salon}</p>
                  <p className="bv-card-location" style={{marginTop:4}}><i className="fas fa-map-marker-alt"></i> {detailJob.location}</p>
                </div>
                <span className={`bv-type-badge ${detailJob.type === 'Full Time' ? 'full' : 'part'}`}>{detailJob.type}</span>
              </div>
              <div className="bv-info-grid">
                {[
                  { icon:'fa-money-bill-wave', label:'Salary',     val:detailJob.salary           },
                  { icon:'fa-briefcase',        label:'Experience', val:detailJob.experience        },
                  { icon:'fa-calendar-alt',     label:'Deadline',   val:fmtDate(detailJob.deadline) },
                  { icon:'fa-users',            label:'Applicants', val:`${detailJob.applicants} so far` },
                ].map(r => (
                  <div key={r.label} className="bv-info-item">
                    <i className={`fas ${r.icon}`}></i>
                    <div><span className="bv-info-label">{r.label}</span><span className="bv-info-val">{r.val}</span></div>
                  </div>
                ))}
              </div>
              <div className="bv-detail-block">
                <h4 className="bv-detail-block-title">About the Role</h4>
                <p className="bv-detail-desc">{detailJob.description}</p>
              </div>
              <div className="bv-detail-block">
                <h4 className="bv-detail-block-title">Required Skills</h4>
                <div className="bv-card-skills">
                  {detailJob.skills.map(s => <span key={s} className="bv-skill-tag">{s}</span>)}
                </div>
              </div>
            </div>
            <div className="bv-modal-ftr">
              <button className="bv-btn-cancel" onClick={() => setDetailJob(null)}>Close</button>
              {isApplied(detailJob.id)
                ? <span className="bv-applied-badge bv-applied-lg"><i className="fas fa-check"></i> Already Applied</span>
                : <button className="bv-btn-apply" onClick={() => { setDetailJob(null); setApplyJob(detailJob); }}>
                    <i className="fas fa-paper-plane"></i> Apply Now
                  </button>
              }
            </div>
          </div>
        </div>
      )}

      {/* ── APPLY MODAL ── */}
      {applyJob && (
        <div className="bv-backdrop" onClick={e => e.target === e.currentTarget && setApplyJob(null)}>
          <div className="bv-modal">
            <div className="bv-modal-hdr">
              <h3 className="bv-modal-title">Apply — {applyJob.title}</h3>
              <button className="bv-modal-close" onClick={() => setApplyJob(null)}><i className="fas fa-times"></i></button>
            </div>
            <div className="bv-modal-body">
              <div className="bv-apply-summary">
                <p className="bv-apply-role">{applyJob.title}</p>
                <p className="bv-apply-salon"><i className="fas fa-store"></i> {applyJob.salon} · {applyJob.location}</p>
              </div>

              {/* CV upload */}
              <div className="bv-field">
                <label className="bv-field-label">Upload Your CV *</label>
                <input type="file" ref={cvRef} accept=".pdf,.doc,.docx" style={{display:'none'}} onChange={e => { if(e.target.files[0]) setCvFile(e.target.files[0]); }} />
                {cvFile ? (
                  <div className="bv-cv-done">
                    <div className="bv-cv-name"><i className="fas fa-file-pdf"></i><span>{cvFile.name}</span></div>
                    <button className="bv-cv-change-btn" onClick={() => cvRef.current.click()}>Change</button>
                  </div>
                ) : (
                  <div className="bv-upload-zone" onClick={() => cvRef.current.click()}>
                    <i className="fas fa-cloud-upload-alt"></i>
                    <p>Tap to upload your CV</p>
                    <span>PDF, DOC or DOCX</span>
                  </div>
                )}
              </div>

              {/* Cover letter */}
              <div className="bv-field">
                <label className="bv-field-label">Cover Letter <span style={{color:'#555',fontWeight:400}}>(optional)</span></label>
                <textarea className="bv-letter-input"
                  placeholder="Write a short note about why you're a great fit..."
                  value={letter} onChange={e => setLetter(e.target.value)}
                  rows={4} maxLength={500}/>
                <span className="bv-char-count">{letter.length} / 500</span>
              </div>
            </div>
            <div className="bv-modal-ftr">
              <button className="bv-btn-cancel" onClick={() => setApplyJob(null)}>Cancel</button>
              <button className={`bv-btn-apply${submitting ? ' submitting' : ''}`} onClick={handleSubmit} disabled={submitting}>
                {submitting
                  ? <><i className="fas fa-circle-notch fa-spin"></i> Submitting…</>
                  : <><i className="fas fa-paper-plane"></i> Submit Application</>
                }
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
