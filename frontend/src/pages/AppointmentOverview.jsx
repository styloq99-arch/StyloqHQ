import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import BarberSidebar from '../Components/BarberSidebar';
import { apiGet } from '../utils/api';


// ─── HELPERS ────────────────────────────────────────────────────────────────
const buildPeakData = (raw, { start, end }) => {
  const result = [];
  for (let h = start; h < end; h++) {
    // Show 12-hr label (9, 10, 11, 12, 1, 2 …)
    const label = h > 12 ? String(h - 12) : String(h);
    result.push({ label, value: raw[h] ?? raw[String(h)] ?? 0 });
  }
  return result;
};

const getMax = (arr) => Math.max(...arr.map((d) => d.value), 1);

// Colour by relative height
const getBarColor = (value, max) => {
  const pct = value / max;
  if (pct >= 1) return '#D32F2F';   // peak  – deep red
  if (pct > 0.55) return '#FF5722';   // high  – accent orange
  if (pct > 0.25) return '#FF7043';   // mid   – light orange
  return '#8D5524';                    // low   – brown
};

// Y-axis tick values (5 evenly spaced labels: max … 0)
const buildYTicks = (max) => {
  const step = max / 4;
  return [max, Math.round(step * 3), Math.round(step * 2), Math.round(step), 0];
};

// ─── ANIMATED BAR ────────────────────────────────────────────────────────────
const AnimatedBar = ({ value, max, label, delay = 0, isPeak = false, showValue = true }) => {
  const [height, setHeight] = useState('0%');
  const pct = max > 0 ? (value / max) * 100 : 0;
  const color = isPeak ? '#D32F2F' : getBarColor(value, max);

  useEffect(() => {
    const t = setTimeout(() => setHeight(`${pct}%`), 200 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div className="bar-column">
      {showValue && <span className="bar-value">{value > 0 ? value : ''}</span>}
      <div
        className={`bar${isPeak ? ' bar--peak' : ''}`}
        style={{
          height,
          backgroundColor: color,
          transition: 'height 1.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      />
      <span className="x-axis-label">{label}</span>
    </div>
  );
};

// ─── CHART (grid + y-axis + bars) ────────────────────────────────────────────
const BarChart = ({ data, animKey, xTitle }) => {
  const max = getMax(data);
  const yticks = buildYTicks(max);
  const peakVal = Math.max(...data.map((d) => d.value));

  return (
    <div className="chart-container" key={animKey}>
      {/* Rotated y-axis label */}
      <div className="y-axis-title-wrap">
        <span className="y-axis-title">No of Appointments</span>
      </div>

      {/* Tick numbers */}
      <div className="y-axis">
        {yticks.map((v, i) => (
          <span key={i} className="y-tick">{v}</span>
        ))}
      </div>

      {/* Grid + bars + x-title */}
      <div className="chart-inner">
        {/* Grid lines (absolute, 5 lines for 4 intervals) */}
        <div className="grid-lines">
          {yticks.map((_, i) => <div key={i} className="grid-line" />)}
        </div>

        {/* Bars */}
        <div className="bars-wrapper">
          {data.map((d, i) => (
            <AnimatedBar
              key={i}
              value={d.value}
              max={max}
              label={d.day}
              delay={i * 60}
              isPeak={d.value === peakVal && d.value > 0}
              showValue
            />
          ))}
        </div>

        {/* X-axis title (bottom-right) */}
        <div className="x-axis-title">{xTitle}</div>
      </div>
    </div>
  );
};

const AppointmentsOverview = () => {

  const [filter, setFilter] = useState('week');
  const [dropOpen, setDropOpen] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const dropRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // ── Real data from API (replaces all mock constants) ──
  const [stats, setStats] = useState({ today: 0, total: 0, cancelled: 0, paid: 0 });
  const [weekData, setWeekData] = useState([]);
  const [monthData, setMonthData] = useState([]);
  const [peakHoursRaw, setPeakHoursRaw] = useState({});
  const [workingHours, setWorkingHours] = useState({ start: 9, end: 19 });

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await apiGet('/barber/me/appointments/overview');
        if (res.success && res.data) {
          setStats(res.data.stats);
          setWeekData(res.data.week_data);
          setMonthData(res.data.month_data);
          setPeakHoursRaw(res.data.peak_hours || {});
          setWorkingHours(res.data.working_hours || { start: 9, end: 19 });
        }
      } catch (err) {
        console.error('Failed to fetch overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const chartData = filter === 'week' ? weekData : monthData;
  const peakData = buildPeakData(peakHoursRaw, workingHours);
  const peakMax = getMax(peakData);
  const peakPeakVal = Math.max(...peakData.map((d) => d.value), 0);
  const peakPeakLabel = peakData.find((d) => d.value === peakPeakVal)?.label;

  const handleFilter = (val) => {
    setFilter(val);
    setDropOpen(false);
    setAnimKey((k) => k + 1);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div className="overview-page app-layout">

      {/* ── DESKTOP SIDEBAR ── */}
      <BarberSidebar activePage="Home" />

      {/* ── MAIN ────────────────────────────────────────────────── */}
      <div className="overview-main main-content">

        {/* Header */}
        <header className="overview-header">
          <img
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=900&q=60"
            alt=""
            className="overview-header-bg"
          />
          <div className="overview-header-top">
            <Link to="/barber-home" className="back-arrow">
              <i className="fas fa-chevron-left" />
            </Link>
            <div className="header-titles">
              <h1>APPOINTMENTS</h1>
              <h1>OVERVIEW</h1>
            </div>
            <img
              src="https://i.pravatar.cc/150?img=11"
              alt="Barber"
              className="overview-avatar"
            />
          </div>
        </header>

        {/* Body */}
        <div className="overview-body">

          {/* ── STATS ───────────────────────────────────────────── */}
          <div className="stats-grid">
            <div className="stat-card stat-card--orange">
              <span className="stat-label text-orange">TODAY<br />BOOKINGS</span>
              <span className="stat-value">{stats.today}</span>
            </div>
            <div className="stat-card stat-card--orange">
              <span className="stat-label text-orange">TOTAL<br />BOOKINGS</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat-card stat-card--red">
              <span className="stat-label text-red">CANCEL<br />BOOKINGS</span>
              <span className="stat-value">{stats.cancelled}</span>
            </div>
            <div className="stat-card stat-card--green">
              <span className="stat-label text-green">PAID<br />BOOKINGS</span>
              <span className="stat-value">{stats.paid}</span>
            </div>
          </div>

          <hr className="overview-divider" />

          {/* ── CHARTS ROW (side-by-side on desktop) ────────────── */}
          <div className="charts-row">

            {/* Appointments Overview chart */}
            <div className="chart-section">
              <div className="chart-section-header">
                <h2 className="chart-title">Appointments Overview</h2>

                {/* Filter dropdown */}
                <div className="chart-filter-wrapper" ref={dropRef}>
                  <button
                    className="overview-filter-btn"
                    onClick={() => setDropOpen((o) => !o)}
                  >
                    {filter === 'week' ? 'For week' : 'For month'}
                    <i className={`fas fa-chevron-down overview-filter-chevron${dropOpen ? ' open' : ''}`} />
                  </button>

                  {dropOpen && (
                    <div className="overview-dropdown">
                      <button
                        className={`overview-dropdown-item${filter === 'week' ? ' active' : ''}`}
                        onClick={() => handleFilter('week')}
                      >
                        <i className="fas fa-calendar-week" /> Weekly
                      </button>
                      <button
                        className={`overview-dropdown-item${filter === 'month' ? ' active' : ''}`}
                        onClick={() => handleFilter('month')}
                      >
                        <i className="fas fa-calendar-alt" /> Monthly
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <BarChart
                data={chartData}
                animKey={`chart-${animKey}`}
                xTitle={filter === 'week' ? 'Day' : 'Week'}
              />
            </div>

            {/* Peak Hours chart */}
            <div className="chart-section">
              <div className="chart-section-header">
                <div>
                  <h2 className="chart-title">Peak Hours</h2>
                  <p className="peak-hours-subtitle">
                    {workingHours.start}:00 – {workingHours.end}:00
                    &nbsp;·&nbsp;Peak:&nbsp;
                    <span className="peak-hours-highlight">
                      {peakPeakLabel}:00 ({peakPeakVal} appts)
                    </span>
                  </p>
                </div>
              </div>

              {/* Scrollable on small phones */}
              <div className="peak-scroll">
                <div className="peak-inner">
                  <div className="chart-container" key={`peak-${animKey}`}>
                    <div className="y-axis-title-wrap">
                      <span className="y-axis-title">No of Appointments</span>
                    </div>
                    <div className="y-axis">
                      {buildYTicks(peakMax).map((v, i) => (
                        <span key={i} className="y-tick">{v}</span>
                      ))}
                    </div>
                    <div className="chart-inner">
                      <div className="grid-lines">
                        {buildYTicks(peakMax).map((_, i) => <div key={i} className="grid-line" />)}
                      </div>
                      <div className="bars-wrapper">
                        {peakData.map((d, i) => (
                          <AnimatedBar
                            key={i}
                            value={d.value}
                            max={peakMax}
                            label={d.label}
                            delay={i * 50}
                            isPeak={d.value === peakPeakVal && d.value > 0}
                            showValue={false}
                          />
                        ))}
                      </div>
                      <div className="x-axis-title">Hour</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="peak-hours-legend">
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#D32F2F' }} />Peak
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#FF5722' }} />High
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#FF7043' }} />Mid
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#8D5524' }} />Normal
                </div>
              </div>
            </div>



          </div>{/* end charts-row */}

        </div>{/* end overview-body */}

        {/* Mobile bottom nav */}
        <nav className="bottom-nav">
          <Link to="/barber-home" className="nav-item active"><i className="fas fa-home"></i><span>Home</span></Link>
          <Link to="/barber-dashboard" className="nav-item"><i className="fas fa-chart-bar"></i><span>Dashboard</span></Link>
          <Link to="/postingPhotos" className="nav-item add-circle-btn"><i className="fas fa-plus"></i></Link>
          <Link to="/message" className="nav-item"><i className="fas fa-comments"></i><span>Message</span></Link>
          <Link to="/barber-OwnProfile" className="nav-item"><i className="fas fa-user"></i><span>Profile</span></Link>
        </nav>

      </div>{/* end overview-main */}
    </div>
  );
};

export default AppointmentsOverview;
