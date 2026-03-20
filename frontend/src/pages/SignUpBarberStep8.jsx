import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignUpBarberStep8() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated, user, getRoleRedirect } = useAuth();

  // Navigate AFTER auth state updates (avoids race condition with ProtectedRoute)
  useEffect(() => {
    if (isAuthenticated && user) {
      const dest = getRoleRedirect(user.role);
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, user]);

  // 1. Retrieve data from previous steps
  const prevData = location.state || {};

  // 2. State for LIST of Locations
  const [locations, setLocations] = useState([
    { id: 1, salonName: "", address: "", district: "", postalCode: "" }
  ]);

  // 3. State for Account Details (pre-filled from previous steps if available)
  const [fullName, setFullName] = useState(prevData.name || "");
  const [email, setEmail] = useState(prevData.email || "");
  const [phone, setPhone] = useState(prevData.phone || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 4. State for Validation/Loading
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

  // Handle COMPLETE REGISTRATION
  const handleNext = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate account details
      if (!fullName.trim()) {
        setError("Full name is required");
        setLoading(false);
        return;
      }
      if (!email.trim()) {
        setError("Email is required");
        setLoading(false);
        return;
      }

      // Validate password
      if (!password.trim()) {
        setError("Password is required");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      // Validate locations
      const validLocations = locations.filter(loc => 
        loc.salonName.trim() && loc.address.trim()
      );

      if (validLocations.length === 0) {
        setError("Please add at least one complete location");
        setLoading(false);
        return;
      }

      // Prepare registration data
      const userData = {
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password,
        role: "barber",
        locations: validLocations,
        // Add other barber-specific fields from previous steps
        experience: prevData.experience,
        specialties: prevData.specialties,
        about: prevData.about,
        availability: prevData.availability,
      };

      const res = await register(userData);

      if (res.success) {
        // Navigation handled by useEffect above when auth state updates
      } else {
        setError(res.message || "Registration failed");
        // Redirect to signin if account already exists
        if (res.redirect) {
          setTimeout(() => navigate(res.redirect), 2000);
        }
      }
    } catch (err) {
      setError("An error occurred during registration");
    } finally {
      setLoading(false);
    }
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

        {/* --- ACCOUNT DETAILS --- */}
        <section style={{ marginBottom: "20px" }}>
          <div className="section-card">
            <label className="section-label">Account Details</label>
            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); if (error) setError(""); }}
                disabled={loading}
              />
            </div><br />
            <div className="input-group">
              <label>Email</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="Enter your email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                disabled={loading}
              />
            </div><br />
            <div className="input-group">
              <label>Phone</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); if (error) setError(""); }}
                disabled={loading}
              />
            </div>
          </div>
        </section>

        {/* --- PASSWORD FIELDS --- */}
        <section style={{ marginBottom: "20px" }}>
          <div className="section-card">
            <label className="section-label">Create Your Password</label>
            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="Enter password (min 6 characters)"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
                disabled={loading}
              />
            </div><br />
            <div className="input-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(""); }}
                disabled={loading}
              />
            </div>
          </div>
        </section>

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

        {/* --- COMPLETE REGISTRATION BUTTON --- */}
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
            {loading ? "CREATING ACCOUNT..." : "Complete Registration"}
        </button>

      </main>
    </div>
  );
}


