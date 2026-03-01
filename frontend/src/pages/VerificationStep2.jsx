import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerificationStep2() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Retrieve data passed from Step 2 (Phone, etc.)
  const prevData = location.state || {};

  // 2. State for 4-digit OTP (stored as array for easy indexing)
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  
  // 3. UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 4. Ref to auto-focus first input on load
  useEffect(() => {
    const firstInput = document.getElementById("otp-0");
    if (firstInput) firstInput.focus();
  }, []);

  // --- HANDLERS ---

  const handleChange = (e, index) => {
    const value = e.target.value;

    // Only allow numbers
    if (!/^[0-9]*$/.test(value)) return;

    // Update OTP state
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only the last character
    setOtp(newOtp);

    // Clear error when user types
    if (error) setError("");

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // If Backspace is pressed and input is empty, move to previous
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4).split("");
    
    // Only paste if numbers
    if (!pastedData.join("").match(/^[0-9]+$/)) return;

    const newOtp = [...otp];
    
    // Fill array
    pastedData.forEach((char, i) => {
      if (i < 4) newOtp[i] = char;
    });

    setOtp(newOtp);

    // Focus the next empty box or the last box
    const nextIndex = pastedData.length < 4 ? pastedData.length : 3;
    const nextInput = document.getElementById(`otp-${nextIndex}`);
    if (nextInput) nextInput.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const otpValue = otp.join("");

    // 1. Validation
    if (otpValue.length !== 4) {
      setError("Please enter the 4-digit code.");
      return;
    }

    // 2. Simulate Verification
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      
      // For Demo: We accept any 4 digits.
      // In real app: if (otpValue !== backendCode) { setError("Invalid Code"); return; }

      console.log("Verified Phone:", prevData.phone, "with code:", otpValue);

      // Navigate to Step 4
      navigate("/signup-barber-step4", {
        state: { 
          ...prevData, 
          phoneVerified: true 
        }
      });
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
            <h1 className="verification-title">Phone Verification</h1>
            <p className="verification-content">Enter your OTP code here</p>
        </div>

        {/* Error Display */}
        {error && (
            <div style={{ color: "#FF5722", textAlign: "center", marginBottom: "15px", fontSize: "14px" }}>
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit}>
            {/* --- OTP INPUTS --- */}
            <div className="otp-container">
                {Array(4).fill(0).map((_, index) => (
                    <input
                        key={index}
                        id={`otp-${index}`} // FIXED SYNTAX: Corrected template literal
                        type="text"
                        inputMode="numeric" // Number keypad on mobile
                        pattern="[0-9]*"
                        className="otp-input"
                        maxLength={1}
                        value={otp[index]}
                        
                        // Events
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={index === 0 ? handlePaste : undefined} // Only handle paste on first input
                        
                        style={{
                            borderColor: error ? '#FF5722' : ''
                        }}
                    />
                ))}
            </div>

            {/* NAVIGATION BUTTONS */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={loading}
                    style={{ 
                        alignItems: "center", 
                        width: '50%', 
                        height: '48px', 
                        marginTop: '2rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? "VERIFYING..." : "CONTINUE"}
                </button>
            </div>
        </form>

      </div>
    </div>
  );
}