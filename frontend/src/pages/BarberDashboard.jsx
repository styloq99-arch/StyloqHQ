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

const WEEKLY_DATA = [
  { label: 'S', value: 9200 },
  { label: 'M', value: 4500 },
  { label: 'T', value: 3800 },
  { label: 'W', value: 2900 },
  { label: 'T', value: 5600 },
  { label: 'F', value: 7800 },
  { label: 'S', value: 8400 },
];

const MONTHLY_DATA = [
  { label: '1',  value: 6200 }, { label: '2',  value: 5800 }, { label: '3',  value: 7100 },
  { label: '4',  value: 4900 }, { label: '5',  value: 5300 }, { label: '6',  value: 6800 },
  { label: '7',  value: 7400 }, { label: '8',  value: 4200 }, { label: '9',  value: 3900 },
  { label: '10', value: 5100 }, { label: '11', value: 6300 }, { label: '12', value: 7200 },
  { label: '13', value: 3600 }, { label: '14', value: 4100 }, { label: '15', value: 5500 },
  { label: '16', value: 6100 }, { label: '17', value: 7800 }, { label: '18', value: 5200 },
  { label: '19', value: 4700 }, { label: '20', value: 3800 }, { label: '21', value: 4400 },
  { label: '22', value: 5900 }, { label: '23', value: 6700 }, { label: '24', value: 7300 },
  { label: '25', value: 5600 }, { label: '26', value: 4800 }, { label: '27', value: 6200 },
  { label: '28', value: 7100 }, { label: '29', value: 5400 }, { label: '30', value: 6800 },
  { label: '31', value: 7600 },
];

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
   LINE CHART
═══════════════════════════════════════════════════════ */
function LineChart({ data, color = '#FF5722', chartH = 160 }) {
  const [animated, setAnimated] = useState(false);
  const [tooltip,  setTooltip]  = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, [data]);

  const W = 320, H = chartH;
  const pL = 14, pR = 14, pT = 16, pB = 14;
  const vals = data.map(d => d.value);
  const minV = Math.min(...vals), maxV = Math.max(...vals);
  const range = maxV - minV || 1;

  const pts = data.map((d, i) => ({
    x: pL + (i / (data.length - 1)) * (W - pL - pR),
    y: pT + ((maxV - d.value) / range) * (H - pT - pB),
    label: d.label, value: d.value,
  }));

  const pathD = pts.map((p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = pts[i - 1];
    const cx1 = prev.x + (p.x - prev.x) * 0.45;
    const cx2 = p.x   - (p.x - prev.x) * 0.45;
    return `C${cx1},${prev.y} ${cx2},${p.y} ${p.x},${p.y}`;
  }).join(' ');

  const areaD = pathD + ` L${pts[pts.length-1].x},${H-pB} L${pts[0].x},${H-pB} Z`;
  const pathLen = pts.length * 45;
  const gradId = `grad${color.replace('#','')}${data.length}`;

  const onMove = (clientX) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = ((clientX - rect.left) / rect.width) * W;
    let best = pts[0], bestD = Infinity;
    pts.forEach(p => { const d = Math.abs(p.x - mx); if (d < bestD) { bestD = d; best = p; } });
    setTooltip(best);
  };

  return (
    <div className="db-chart-wrap">
      <span className="db-chart-ylabel">total earning / day</span>
      <div className="db-chart-inner">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="db-chart-svg"
          style={{ height: chartH }}
          onMouseMove={e => onMove(e.clientX)}
          onMouseLeave={() => setTooltip(null)}
          onTouchMove={e => { e.preventDefault(); onMove(e.touches[0].clientX); }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0"    />
            </linearGradient>
          </defs>

          {/* Grid */}
          {[0.25, 0.5, 0.75].map((f, i) => (
            <line key={i}
              x1={pL} y1={pT + f*(H-pT-pB)} x2={W-pR} y2={pT + f*(H-pT-pB)}
              stroke="#2a2a2a" strokeWidth="1" strokeDasharray="4 4"
            />
          ))}

          {/* Axes */}
          <line x1={pL} y1={pT-6} x2={pL} y2={H-pB} stroke="#fff" strokeWidth="1.5" />
          <line x1={pL} y1={H-pB} x2={W-pR+6} y2={H-pB} stroke="#fff" strokeWidth="1.5" />
          <polygon points={`${pL-4},${pT} ${pL+4},${pT} ${pL},${pT-8}`} fill="#fff" />
          <polygon points={`${W-pR+4},${H-pB-4} ${W-pR+4},${H-pB+4} ${W-pR+10},${H-pB}`} fill="#fff" />

          {/* Area */}
          <path d={areaD} fill={`url(#${gradId})`}
            style={{ opacity: animated ? 1 : 0, transition: 'opacity 0.8s ease 0.6s' }}
          />

          {/* Line */}
          <path d={pathD} fill="none" stroke={color} strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            style={{
              strokeDasharray: pathLen,
              strokeDashoffset: animated ? 0 : pathLen,
              transition: 'stroke-dashoffset 1.6s ease',
            }}
          />

          {/* Hover */}
          {tooltip && (
            <>
              <line x1={tooltip.x} y1={pT} x2={tooltip.x} y2={H-pB}
                stroke={color} strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
              <circle cx={tooltip.x} cy={tooltip.y} r="5"
                fill={color} stroke="#121212" strokeWidth="2" />
            </>
          )}
        </svg>

        {tooltip && (
          <div className="db-chart-tooltip" style={{
            left: `${(tooltip.x / W) * 100}%`,
            top:  `${(tooltip.y / chartH) * 100}%`,
          }}>
            <span className="db-tt-label">{tooltip.label}</span>
            <span className="db-tt-val">RS. {tooltip.value.toLocaleString()}</span>
          </div>
        )}

        <div className="db-chart-xlabels" style={{ gridTemplateColumns: `repeat(${data.length},1fr)` }}>
  {data.map((d, i) => (
    <span key={i} className={data.length > 10 ? 'db-xlabel-condensed' : ''}>
      {data.length > 10 ? (i % 5 === 0 ? d.label : '') : d.label}
    </span>
  ))}
</div>
<p className="db-chart-xtitle">Day</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   BAR CHART
═══════════════════════════════════════════════════════ */
function BarChart({ data, color = '#FF5722' }) {
  const [animated, setAnimated] = useState(false);
  const [hovered,  setHovered]  = useState(null);

  useEffect(() => {
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, [data]);

  const maxV = Math.max(...data.map(d => d.value));

  const isMany = data.length > 10;

  return (
    <div className="db-bar-chart-scroll">
      <div
        className="db-bar-chart"
        style={isMany ? { minWidth: data.length * 23 + 16 } : { justifyContent: 'space-around' }}
      >
        {data.map((d, i) => (
          <div
            key={i}
            className="db-bar-col"
            style={isMany ? { width: 18 } : { flex: 1, width: 'auto' }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {hovered === i && (
              <div className="db-bar-tooltip">
                RS.{'\n'}{d.value.toLocaleString()}
              </div>
            )}

            <div
              className="db-bar-track"
              style={isMany ? { width: '100%' } : { width: '60%' }}
            >
              <div
                className="db-bar-fill"
                style={{
                  width: '100%',
                  height: animated ? `${(d.value / maxV) * 100}%` : '0%',
                  background: hovered === i
                    ? '#ffffff'
                    : `linear-gradient(to top, #FF5722, #FF572299)`,
                  borderRadius: '4px 4px 0 0',
                  transition: `height 0.8s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.07}s`,
                }}
              />
            </div>
            <span className="db-bar-label">{d.label}</span>
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

    const [chartTab,   setChartTab]   = useState('line');    // line | bar
  const [periodTab,  setPeriodTab]  = useState('weekly');  // weekly | monthly

  const chartData    = periodTab === 'weekly' ? WEEKLY_DATA : MONTHLY_DATA;
  const totalEarning = periodTab === 'weekly' ? EARNINGS.week : EARNINGS.month;

 

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
              <Link to="/postingPhotos"     className="sidebar-link">
                <i className="fas fa-plus-square"></i> <span>New Post</span>
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


                      </div>
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
                        {/* 6. EARNINGS CHART */}
                        <section className="db-card">
                          {/* Chart header */}
                          <div className="db-chart-header">
                            <div>
                              <p className="db-earn-period" style={{ margin: 0 }}>
                                {periodTab === 'weekly' ? 'WEEKLY' : 'MONTHLY'} TOTAL EARNING
                              </p>
                              <p className="db-earn-amount" style={{ margin: '4px 0 0', fontSize: '1.15rem' }}>
                                {fmt(totalEarning)}
                              </p>
                            </div>

                            <div className="db-chart-controls">
                              {/* Period toggle */}
                              <div className="db-toggle-group">
                                {['weekly','monthly'].map(p => (
                                  <button
                                    key={p}
                                    className={`db-toggle-btn${periodTab === p ? ' active' : ''}`}
                                    onClick={() => setPeriodTab(p)}
                                  >
                                    {p === 'weekly' ? 'Week' : 'Month'}
                                  </button>
                                ))}
                              </div>
                              {/* Chart type toggle */}
                              <div className="db-toggle-group">
                                <button
                                  className={`db-toggle-btn${chartTab === 'line' ? ' active' : ''}`}
                                  onClick={() => setChartTab('line')}
                                  title="Line chart"
                                ><i className="fas fa-chart-line"></i></button>
                                <button
                                  className={`db-toggle-btn${chartTab === 'bar' ? ' active' : ''}`}
                                  onClick={() => setChartTab('bar')}
                                  title="Bar chart"
                                ><i className="fas fa-chart-bar"></i></button>
                              </div>
                            </div>
                          </div>

                          {/* Chart render */}
                          <div className="db-chart-container" key={`${chartTab}-${periodTab}`}>
                            {chartTab === 'line'
                              ? <LineChart data={chartData} chartH={180} />
                              : <BarChart  data={chartData} />
                            }
                          </div>

                          {/* Quick stats */}
                          <div className="db-chart-stats">
                            {[
                              { label: 'Peak',    val: Math.max(...chartData.map(d => d.value)) },
                              { label: 'Average', val: Math.round(chartData.reduce((s,d)=>s+d.value,0)/chartData.length) },
                              { label: 'Low',     val: Math.min(...chartData.map(d => d.value)) },
                            ].map(({ label, val }) => (
                              <div key={label} className="db-cstat">
                                <span className="db-cstat-label">{label}</span>
                                <span className="db-cstat-val">RS. {val.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </section>
                            

                      </div>
                  </div>
                  <div style={{ height: 90 }} />
              </div>

      </div>{/* end main */}

      
      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        <Link to="/barber-home"       className="nav-item"><i className="fas fa-home"></i><span>Home</span></Link>
        <Link to="/barber-dashboard"  className="nav-item active"><i className="fas fa-chart-bar"></i><span>Dashboard</span></Link>
        <Link to="/postingPhotos"     className="nav-item add-circle-btn"><i className="fas fa-plus"></i></Link>
        <Link to="/message"           className="nav-item"><i className="fas fa-comments"></i><span>Message</span></Link>
        <Link to="/barber-OwnProfile" className="nav-item"><i className="fas fa-user"></i><span>Profile</span></Link>
      </nav>

    </div>
  );
}