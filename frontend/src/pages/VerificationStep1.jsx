import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerificationStep1() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Retrieve data from Step 1 (Name, Email, etc.)
  const step1Data = location.state || {};

  // 2. State
  const [phone, setPhone] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 3. Initialize with phone from Step 1 if it exists
  useEffect(() => {
    if (step1Data.phone) {
      setPhone(step1Data.phone);
    }
  }, [step1Data.phone]);

  // 4. Handle "Get Code" / "Continue"
  const handleGetCode = (e) => {
    e.preventDefault();
    setError("");

    // Validate Phone (Basic check)
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    setLoading(true);

    // Simulate API Call to Send SMS
    setTimeout(() => {
      setLoading(false);
      
      // Success: Navigate to Step 3 (The actual code entry page)
      // We pass the phone number along with other step 1 data
      navigate("/verification-step2", { 
        state: { 
          ...step1Data, 
          phone: phone // Ensure the potentially edited phone number is passed forward
        } 
      });
      
      // In a real app: console.log("SMS sent to:", phone);
    }, 1500);
  };

  return (
    <div className="app-layout">
      
      {/* --- LEFT SIDE --- */}
      <div className="visual-side">
        <img src="src/assets/images/login-bg.png" alt="StyloQ" />
        <div className="visual-overlay"></div>
        <div className="gradient-mask"></div>

        <div className="brand-content">
          <h1 className="brand-title">StyloQ</h1>
          <p className="brand-tagline">Connecting grooming independence</p>
        </div>
      </div>

      {/* --- RIGHT SIDE --- */}
      <div className="content-side" >
        
        <div className="brand-content">
          <h1 className="brand-title">StyloQ</h1>
        </div><br />

        <div className="verification-section">
            <h1 className="verification-title">Verify Phone Number</h1>
            <p className="verification-content">Enter your mobile number to receive a verification code.</p>
        </div>

        {/* Error Message */}
        {error && (
            <div style={{ 
                color: "#FF5722", 
                textAlign: "center", 
                fontSize: "13px", 
                marginBottom: "10px" 
            }}>
                {error}
            </div>
        )}

        <form onSubmit={handleGetCode}>
            <div className="input-row" style={{justifyContent: 'center'}}>
                <div className="input-group">
                    <input 
                        type="tel" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="input-field" 
                        placeholder="+94 77 123 4567" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ 
                            borderColor: error ? '#FF5722' : '' 
                        }}
                    />
                </div>
            </div>

            {/* NAVIGATION BUTTONS */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                {/* Changed to button to handle Logic, but kept your style */}
                <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={loading}
                    style={{ 
                        alignItems: "center", 
                        width: '100%', 
                        height: '48px', 
                        marginTop: '2rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? "SENDING CODE..." : "CONTINUE"}
                </button>
            </div>
        </form>

      </div>
    </div>
  );
}