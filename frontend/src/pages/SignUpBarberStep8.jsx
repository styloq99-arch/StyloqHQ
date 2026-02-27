import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

export default function SignUpBarberStep8() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Retrieve data from previous steps
  const prevData = location.state || {};

  // 2. State for LIST of Locations
  const [locations, setLocations] = useState([
    { id: 1, salonName: "", address: "", district: "", postalCode: "" }
  ]);

  // 3. State for Validation/Loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Handlers ---

  // Handle Inputs for SPECIFIC location by ID
  const handleLocationChange = (id, field, value) => {
    setLocations(prev => prev.map(loc => 
      loc.id === id ? { ...loc, [field]: value } : loc
    ));
    if (error) setError(""); // Clear error on type
  };

  // Add NEW Location
  const handleAddAnother = () => {
    setLocations(prev => [...prev, { 
      id: Date.now(), 
      salonName: "", 
      address: "", 
      district: "", 
      postalCode: "" 
    }]);
    setError("");
  };

  // Remove Location
  const removeLocation = (id) => {
    // Safety check: Don't remove the last one if it's the only one
    if (locations.length === 1) {
      alert("You must have at least one location.");
      return;
    }
    setLocations(prev => prev.filter(loc => loc.id !== id));
  };

  // Handle NEXT BUTTON (Renamed from Complete Registration)
  const handleNext = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API Save
    setTimeout(() => {
      setLoading(false);

      // --- AUTO-FILL LOGIC: Ensure data exists before navigating ---
      let finalLocations = locations;
      if (finalLocations.length === 0) {
        // If empty, add a default "Home Salon" entry
        finalLocations = [{
          id: Date.now(),
          salonName: "Home Salon",
          address: "",
          district: "",
          postalCode: ""
        }];
      }

      const finalData = {
        ...prevData,
        locations: finalLocations
      };

      console.log("Step 8 Data Saved, Proceeding to Step 9:", finalData);

      // Navigate to Next Step (Step 9) instead of Dashboard
      navigate("/signup-barber-step9", { state: finalData });
    }, 1500);
  };

  return (
    <div className="app-container">
      
      {/* --- Header --- */}
      <header className="header">
        <Link to="/signup-barber-step7" className="back-btn">
            <i className="fas fa-arrow-left"></i>
        </Link>
        
        <div className="header-text">
          <h1>Current Working Location</h1>
        </div>

        <Link to="/signup-barber-step8" className="skip-btn">
            Skip
        </Link>
      </header>

      {/* --- Main Content --- */}
      <main className="content">
        
        {/* Error Display */}
        {error && (
          <div style={{ 
            color: "#FF5722", 
            textAlign: "center", 
            marginBottom: "10px", 
            fontSize: "13px" 
          }}>
            {error}
          </div>
        )}

        {/* --- LOCATIONS LIST --- */}
        {locations.map((loc, idx) => (
          <section key={loc.id} style={{ marginBottom: "20px" }}>
            <div className="section-card">
                
                {/* Location Header / Remove Button */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <label className="section-label">Location #{idx + 1}</label>
                    {locations.length > 1 && (
                        <button 
                            type="button"
                            onClick={() => removeLocation(loc.id)}
                            style={{ 
                                background: "none", 
                                border: "none", 
                                color: "#666", 
                                cursor: "pointer", 
                                fontSize: "13px"
                            }}
                        >
                            <i className="fas fa-trash"></i> Remove
                        </button>
                    )}
                </div>

                {/* Inputs for this Location */}
                <div className="input-group">
                    <label>Salon Name</label>
                    <input 
                        type="text" 
                        className="input-field" 
                        placeholder="e.g. The Gentleman's Cut"
                        value={loc.salonName}
                        onChange={(e) => handleLocationChange(loc.id, 'salonName', e.target.value)}
                        style={{ borderColor: error && error.includes("Name") ? '#FF5722' : '' }}
                    />
                </div><br />

                <div className="input-group">
                    <label>Address</label>
                    <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Street address"
                        value={loc.address}
                        onChange={(e) => handleLocationChange(loc.id, 'address', e.target.value)}
                        style={{ borderColor: error && error.includes("Address") ? '#FF5722' : '' }}
                    />
                </div><br />

                <div className="input-row-bottom">
                    <div className="input-group">
                        <label>District</label>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="e.g. Colombo 05"
                            value={loc.district}
                            onChange={(e) => handleLocationChange(loc.id, 'district', e.target.value)}
                            style={{ borderColor: error && error.includes("District") ? '#FF5722' : '' }}
                        />
                    </div>              
                    <div className="input-group">
                        <label>Postal Code</label>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="e.g. 00100"
                            value={loc.postalCode}
                            onChange={(e) => handleLocationChange(loc.id, 'postalCode', e.target.value)}
                            style={{ borderColor: error && error.includes("Postal") ? '#FF5722' : '' }}
                        />
                    </div>
                </div><br />
            </div>
          </section>
        ))}

        {/* --- ADD ANOTHER LOCATION BUTTON --- */}
        <button 
            type="button" 
            className="add-more-btn" 
            onClick={handleAddAnother}
        >
            <i className="fas fa-plus"></i> Add Another Location
        </button>

        {/* --- NEXT BUTTON --- */}
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
            {loading ? "LOADING..." : "Next"}
        </button>

      </main>
    </div>
  );
}


