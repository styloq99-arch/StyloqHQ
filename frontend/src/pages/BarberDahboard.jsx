import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════ */
const BARBER = {
  name: 'Mr. Perera',
  avatar: 'https://i.pravatar.cc/150?img=11',
  rating: 4.0,
  reviewCount: '1.2K',
};


const SUBSCRIPTION = {
  activeSubscribers: 145,
  monthlyRevenue: 24500,
  renewalRate: 71.1,
};

const RETENTION = {
  returning: 62,
  newCustomers: 38,
};

const TRENDS = [
  { id: 1, name: 'Taper Fade', views: '4.2k', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&h=380&fit=crop' },
  { id: 2, name: 'Bob Cut',    views: '1.2M', image: 'https://images.unsplash.com/photo-1605980766347-c2943e0d9b31?w=300&h=380&fit=crop' },
  { id: 3, name: 'Wolf Cut',   views: '890k', image: 'https://images.unsplash.com/photo-1618354691551-44de113f0164?w=300&h=380&fit=crop' },
  { id: 4, name: 'Mullet',     views: '560k', image: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=300&h=380&fit=crop' },
  { id: 5, name: 'Buzz Cut',   views: '320k', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&h=380&fit=crop' },
];

const EARNINGS = { today: 10000, week: 80000, month: 210000 };

const fmt = (n) => 'RS. ' + n.toLocaleString('en-US');


/* ═══════════════════════════════════════════════════════
   STAR RATING
═══════════════════════════════════════════════════════ */
function Stars({ rating, max = 5 }) {
  return (
    <div className="db-stars">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`db-star ${i < Math.floor(rating) ? 'filled' : i < rating ? 'half' : 'empty'}`}>★</span>
      ))}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   DONUT CHART
═══════════════════════════════════════════════════════ */
function DonutChart({ data }) {
  const [animated, setAnimated] = useState(false);
  const [hovered, setHovered]   = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  const r    = 62;
  const cx   = 85;
  const cy   = 85;
  const circ = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0);

  let cum = 0;
  const segments = data.map((d) => {
    const pct  = d.value / total;
    const dash = pct * circ;
    const off  = cum;
    cum += dash;
    return { ...d, pct, dash, off };
  });

  const active = hovered !== null ? segments[hovered] : segments[0];

  return (
    <div className="db-donut-wrap">
      <svg viewBox="0 0 170 170" className="db-donut-svg">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2a2a2a" strokeWidth="24" />
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={hovered === i ? 30 : 24}
            strokeDasharray={`${animated ? seg.dash : 0} ${circ}`}
            strokeDashoffset={-seg.off}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: `stroke-dasharray 1.2s ease ${i * 0.25}s, stroke-width 0.2s` }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className="db-donut-seg"
          />
        ))}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="#fff" fontSize="20" fontWeight="bold" fontFamily="Viga,sans-serif">
          {Math.round(active.pct * 100)}%
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#aaa" fontSize="9" fontFamily="Viga,sans-serif">
          {active.label.split(' ')[0]}
        </text>
      </svg>

      <div className="db-donut-legend">
        {segments.map((seg, i) => (
          <div
            key={i}
            className={`db-legend-row${hovered === i ? ' db-legend-row--active' : ''}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="db-legend-dot" style={{ background: seg.color }} />
            <div>
              <p className="db-legend-label">{seg.label}</p>
              <p className="db-legend-val">{Math.round(seg.pct * 100)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════ */
export default function BarberDashboard() {

     const ratingBreakdown = { 5: 45, 4: 30, 3: 15, 2: 7, 1: 3 };

       const retentionData = [
    { label: 'Returning Customers', value: RETENTION.returning,    color: '#FF5722' },
    { label: 'New Customers',       value: RETENTION.newCustomers, color: '#666666' },
  ];

  return (
    <div className="db-root">

     {/* --- DESKTOP SIDEBAR --- */}
          <aside className="desktop-sidebar">
            <div className="sidebar-logo">
              <h1 className="brand-title" style={{fontSize : '40px'}}>StyloQ</h1>
            </div>
            <nav className="sidebar-nav">
              <Link to="/barber-home" className="sidebar-link">
                <i className="fas fa-home"></i> <span>Home</span>
              </Link>
              <Link to="/barber-dashboard" className="sidebar-link active">
                <i className="fas fa-calendar-alt"></i> <span>DashBoard</span>
              </Link>
              <Link to="/message" className="sidebar-link">
                <i className="fas fa-comments"></i> <span>Message</span>
              </Link>
              <Link to="/barber-OwnProfile" className="sidebar-link">
                <i className="fas fa-user"></i> <span>Profile</span>
              </Link>
              <Link to="/postingPhotos" className="sidebar-link">
                <i className="fa fa-plus"></i>
              </Link>
            </nav>
          </aside>

      {/* ═══ MAIN ═══ */}
      <div className="db-main">
        {/* HEADER */}
        <header className="db-header">
          <Link to="/barber-home" className="db-back-btn"><i className="fas fa-chevron-left"></i></Link>
          <h2 className="db-header-title">DASHBOARD</h2>
          <img src={BARBER.avatar} alt="Profile" className="db-header-avatar" />
        </header>

              <div className="db-body">
                  <div className="db-content-grid">
                      <div className="db-col">
                             {/* 1. AVERAGE RATING */}
                            <section className="db-card">
                                <div className="db-card-row">
                                <h3 className="db-card-title">Average Rating</h3>
                                <div className="db-rating-right">
                                    <Stars rating={BARBER.rating} />
                                    <span className="db-rating-count">{BARBER.rating} ({BARBER.reviewCount})</span>
                                </div>
                                </div>
                                <div className="db-rating-bars">
                                {[5, 4, 3, 2, 1].map(s => (
                                    <div key={s} className="db-rbar-row">
                                    <span className="db-rbar-star">{s}★</span>
                                    <div className="db-rbar-track">
                                        <div className="db-rbar-fill" style={{ width: `${ratingBreakdown[s]}%` }} />
                                    </div>
                                    <span className="db-rbar-pct">{ratingBreakdown[s]}%</span>
                                    </div>
                                ))}
                                </div>
                            </section>
                            {/* 2. SUBSCRIPTION PERFORMANCE */}
                            <section className="db-card">
                                <h3 className="db-section-title">Subscription Performance</h3>
                                <div className="db-sub-grid">
                                <div className="db-sub-item">
                                    <span className="db-sub-big">{SUBSCRIPTION.activeSubscribers}</span>
                                    <span className="db-sub-label">Active Subscribers</span>
                                </div>
                                <div className="db-sub-item">
                                    <span className="db-sub-big">Rs. {SUBSCRIPTION.monthlyRevenue.toLocaleString()}</span>
                                    <span className="db-sub-label">Monthly Revenue</span>
                                </div>
                                <div className="db-sub-item">
                                    <span className="db-sub-big db-sub-orange">{SUBSCRIPTION.renewalRate}%</span>
                                    <span className="db-sub-label">Renewal Rate</span>
                                </div>
                                </div>
                                <div className="db-renewal-bar-wrap">
                                <span className="db-renewal-label-text">Renewal Progress</span>
                                <div className="db-renewal-track">
                                    <div className="db-renewal-fill" style={{ width: `${SUBSCRIPTION.renewalRate}%` }} />
                                </div>
                                <span className="db-renewal-pct">{SUBSCRIPTION.renewalRate}%</span>
                                </div>
                            </section>

                            {/* 3. CUSTOMER RETENTION */}
                            <section className="db-card">
                                <h3 className="db-section-title">Customer Retention</h3>
                                <DonutChart data={retentionData} />
                            </section>

                            {/* 4. RECENT REVIEWS */}
                            <section className="db-card">
                                <h3 className="db-section-title">Recent Reviews</h3>
                                <div className="db-reviews-list">
                                {[
                                    { name: 'Chamodi W.',  avatar: 'https://i.pravatar.cc/150?img=5',  rating: 5, comment: 'Amazing fade, very clean lines!', time: '2h ago' },
                                    { name: 'Danush W.',   avatar: 'https://i.pravatar.cc/150?img=12', rating: 4, comment: 'Great service, will come back.', time: '1d ago' },
                                    { name: 'Ranuthi D.', avatar: 'https://i.pravatar.cc/150?img=9',  rating: 5, comment: 'Best barber in town honestly.', time: '2d ago' },
                                ].map((r, i) => (
                                    <div key={i} className="db-review-item">
                                    <img src={r.avatar} alt={r.name} className="db-review-avatar" />
                                    <div className="db-review-body">
                                        <div className="db-review-top">
                                        <span className="db-review-name">{r.name}</span>
                                        <span className="db-review-time">{r.time}</span>
                                        </div>
                                        <div className="db-review-stars">
                                        {Array.from({ length: 5 }).map((_, s) => (
                                            <span key={s} style={{ color: s < r.rating ? '#FFB300' : '#3a3a3a', fontSize: 13 }}>★</span>
                                        ))}
                                        </div>
                                        <p className="db-review-comment">"{r.comment}"</p>
                                    </div>
                                    </div>
                                ))}
                                </div>
                            </section>

                      </div> {/*end of the left column */}
                      {/* ═══ RIGHT COLUMN ═══ */}
                      <div className="db-col">

                        {/* 4. NEW TRENDS */}
                        <section className="db-card">
                            <h3 className="db-section-title">New Trends</h3>
                            <div className="db-trends-scroll">
                            {TRENDS.map(t => (
                                <div key={t.id} className="db-trend-card">
                                <div className="db-trend-badge">
                                    <span>{t.views}</span>
                                    <span className="db-trend-star">★</span>
                                </div>
                                <img src={t.image} alt={t.name} className="db-trend-img" />
                                <p className="db-trend-name">{t.name}</p>
                                </div>
                            ))}
                            </div>
                        </section>
                        {/* 5. EARNING SUMMARY */}
                        <section className="db-card">
                          <h3 className="db-section-title">Earning Summary</h3>
                          <div className="db-earn-list">
                            {[
                              { period: 'TODAY',  sub: 'TOTAL EARNING', val: EARNINGS.today  },
                              { period: 'WEEK',   sub: 'TOTAL EARNING', val: EARNINGS.week   },
                              { period: 'MONTH',  sub: 'TOTAL EARNING', val: EARNINGS.month  },
                            ].map(({ period, sub, val }) => (
                              <div key={period} className="db-earn-item">
                                <div className="db-earn-left">
                                  <p className="db-earn-period">{period}</p>
                                  <p className="db-earn-sublabel">{sub}</p>
                                </div>
                                <p className="db-earn-amount">{fmt(val)}</p>
                              </div>
                            ))}
                          </div>
                        </section>

                      </div>
                  </div>
                  <div style={{ height: 90 }} />
              </div>



      </div>{/* end main */}

      
      {/* --- MOBILE BOTTOM NAV --- */}
            <nav className="bottom-nav">
              <Link to="/barber-home" className="nav-item">
                <i className="fas fa-home"></i>
                <span>Home</span>
              </Link>
              <Link to="/barber-dashboard" className="nav-item active">
                <i className="fas fa-calendar-alt"></i>
                <span>DashBoard</span>
              </Link>
              <Link to="/addphoto" className="nav-item add-circle-btn">
                <i className="fas fa-plus"></i>
              </Link>
              <Link to="/message" className="nav-item">
                <i className="fas fa-comments"></i>
                <span>Message</span>
              </Link>
              <Link to="/barber-OwnProfile" className="nav-item">
                <i className="fas fa-user"></i>
                <span>Profile</span>
              </Link>                  
            </nav>

    </div>
  );
}