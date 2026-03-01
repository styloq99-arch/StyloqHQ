import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

// Time Options for Dropdowns
const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
  "06:00 PM"
];

export default function SignUpBarberStep5() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Retrieve data from previous steps
  const prevData = location.state || {};

  // 2. State for Working Hours
  const [hours, setHours] = useState({
    Mon: { active: true, start: "09:00 AM", end: "06:00 PM" },
    Tue: { active: true, start: "09:00 AM", end: "06:00 PM" },
    Wed: { active: true, start: "09:00 AM", end: "06:00 PM" },
    Thu: { active: true, start: "09:00 AM", end: "06:00 PM" },
    Fri: { active: true, start: "09:00 AM", end: "06:00 PM" },
    Sat: { active: true, start: "09:00 AM", end: "06:00 PM" },
    Sun: { active: false, start: "Closed", end: "Closed" }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Handlers ---

  // Toggle Day Active/Inactive
  const toggleDay = (day) => {
    setHours(prev => {
      const isActive = !prev[day].active;
      return {
        ...prev,
        [day]: {
          ...prev[day],
          active: isActive,
          // Reset time to defaults if unchecked or set if checked
          start: isActive ? "09:00 AM" : "Closed",
          end: isActive ? "06:00 PM" : "Closed"
        }
      };
    });
  };

  // Handle Time Dropdown Change
  const handleTimeChange = (day, field, value) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
    if (error) setError("");
  };

  // Reset All to 9-6 Default
  const resetHours = () => {
    setHours({
      Mon: { active: true, start: "09:00 AM", end: "06:00 PM" },
      Tue: { active: true, start: "09:00 AM", end: "06:00 PM" },
      Wed: { active: true, start: "09:00 AM", end: "06:00 PM" },
      Thu: { active: true, start: "09:00 AM", end: "06:00 PM" },
      Fri: { active: true, start: "09:00 AM", end: "06:00 PM" },
      Sat: { active: true, start: "09:00 AM", end: "06:00 PM" },
      Sun: { active: false, start: "Closed", end: "Closed" }
    });
  };

  // --- FIXED: Handle Next Button Click ---
  const handleNext = (e) => {
    e.preventDefault(); // Prevent default form behavior

    // Show Loading
    setLoading(true);

    // Simulate API Save
    setTimeout(() => {
      setLoading(false);

      const finalData = {
        ...prevData,
        workingHours: hours
      };

      console.log("Working Hours Saved:", finalData);
      
      navigate("/signup-barber-step7", { state: finalData });
    }, 1500);
  };

  return (
    <div className="app-container">
      
      {/* --- Header --- */}
      <header className="header">
        <Link to="/signup-barber-step5" className="back-btn">
            <i className="fas fa-arrow-left"></i>
        </Link>
        
        <div className="header-text">
          <h1>Working Hours</h1>
        </div>

        <Link to="/signup-barber-step7" className="skip-btn">
            Skip
        </Link>
      </header>

      {/* --- Main Content --- */}
      <main className="content">
        
        <section>
          <div className="section-card">
            
            <label className="section-label">Weekly Schedule</label>
            <div style={{ marginBottom: "15px", fontSize: "13px", color: "#888" }}>
                Select days and set time slots below.
            </div>

            {/* --- DAYS LIST --- */}
            {Object.keys(hours).map((day, idx) => (
              <div key={day} className="cert-form-group">
                
                {/* Day Row Wrapper */}
                <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "1px solid #333" 
                }}>
                  
                  {/* 1. Checkbox & Day Name */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "120px" }}>
                    <input 
                        type="checkbox" 
                        className="specialty-checkbox" // Reusing checkbox style from CSS
                        checked={hours[day].active}
                        onChange={() => toggleDay(day)}
                    />
                    <span style={{ 
                        color: hours[day].active ? "#fff" : "#666",
                        fontSize: "14px",
                        fontWeight: "bold",
                        textTransform: "uppercase"
                    }}>
                        {day}
                    </span>
                  </div>

                  {/* 2. Time Dropdowns (Only show if active) */}
                  {hours[day].active ? (
                    <div style={{ display: "flex", gap: "10px", flex: 1 }}>
                        
                        {/* Start Time */}
                        <div className="input-group">
                            <label style={{fontSize: "10px"}}>Start</label>
                            <select 
                                className="input-field"
                                value={hours[day].start}
                                onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                                style={{ cursor: 'pointer' }}
                            >
                                {TIME_SLOTS.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                        </div>

                        {/* End Time */}
                        <div className="input-group">
                            <label style={{fontSize: "10px"}}>End</label>
                            <select 
                                className="input-field"
                                value={hours[day].end}
                                onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                                style={{ cursor: 'pointer' }}
                            >
                                {TIME_SLOTS.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                        </div>

                    </div>
                  ) : (
                    /* Closed Text if Inactive */
                    <div style={{ flex: 1, color: "#666", fontSize: "13px" }}>
                        Closed
                    </div>
                  )}

                </div>
              </div>
            ))}

            {/* --- RESET BUTTON --- */}
            <button 
                type="button" 
                className="add-more-btn" 
                onClick={resetHours}
            >
                <i className="fas fa-undo"></i> Reset to Defaults
            </button>
          </div>
        </section>

        {/* --- NEXT BUTTON (Corrected) --- */}
        <button 
            onClick={handleNext}
            className="btn btn-primary" 
            disabled={loading}
            style={{ 
                width: '100%', 
                height: '48px', 
                marginTop: '2rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
            }}
        >
            {loading ? "SAVING..." : "NEXT"}
        </button>

      </main>
    </div>
  );
}