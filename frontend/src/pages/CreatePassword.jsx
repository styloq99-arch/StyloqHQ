import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

export default function CreatePassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Retrieve data from Step 1
  const prevData = location.state || {};

  // 2. State for Form
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });

  // 3. State for Validation/Loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Handlers ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form behavior

    // 1. Validation
    if (!formData.username.trim()) {
      setError("Username is required.");
      return;
    }
    if (!formData.password) {
      setError("Password is required.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // 2. Show Loading & Submit
    setLoading(true);

    // Simulate API Call
    setTimeout(() => {
      setLoading(false);

      const finalData = {
        ...prevData,
        username: formData.username,
        password: formData.password
      };

      console.log("Account Created:", finalData);

      // Navigate to Customer Dashboard (Final Step)
      navigate("/", { state: finalData });
    }, 1500);
  };

  return (
    <div className="app-container">
      
      {/* --- Header (Back Button Removed) --- */}
      <header className="header">

        <Link to="/signup-customer" className="back-btn">
            <i className="fas fa-arrow-left"></i>
        </Link>

        <div className="header-text">
          <h1>Create Password</h1>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="content">
        
        {/* Error Message */}
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

        <section>
          <div className="section-card">
            <div className="section-desc">Choose a strong password to secure your account.</div><br />
            
            <div className="cert-form-group">
                {/* 1. Username */}
                <div className="input-group">
                    <label>Username</label>
                    <input 
                        type="text" 
                        name="username" 
                        className="input-field" 
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleChange}
                        style={{ borderColor: error && error.includes("User") ? '#FF5722' : '' }}
                    />
                </div><br />

                {/* 2. Create Password */}
                <div className="input-group">
                    <label>Create Password</label>
                    <input 
                        type="password" 
                        name="password" 
                        className="input-field" 
                        placeholder="••••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        style={{ borderColor: error && error.includes("Password") ? '#FF5722' : '' }}
                    />
                </div><br />

                {/* 3. Confirm Password */}
                <div className="input-group">
                    <label>Confirm Password</label>
                    <input 
                        type="password" 
                        name="confirmPassword" 
                        className="input-field" 
                        placeholder="•••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        style={{ borderColor: error && error.includes("Match") ? '#FF5722' : '' }}
                    />
                </div>
            </div>
            </div>
        </section>

        {/* --- COMPLETE REGISTRATION BUTTON --- */}
        <button 
            onClick={handleSubmit}
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
            {loading ? "SAVING..." : "Complete Registration"}
        </button>

        
      </main>
    </div>
  );
}