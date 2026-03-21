import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignUpCustomerFinal() {
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

  // Get data from previous step
  const step1Data = location.state?.step1 || {};

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Password validation
  const validatePasswords = () => {
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validatePasswords()) return;

    setLoading(true);

    try {
      // Prepare registration data
      const userData = {
        name: step1Data.name,
        email: step1Data.email,
        phone: step1Data.phone,
        idNumber: step1Data.idNumber,
        city: step1Data.city,
        password: password,
        role: "client",
      };

      const res = await register(userData);

      if (res.success) {
        if (res.needsConfirmation) {
          setLoading(false);
          setError(res.message || "Please check your email to confirm your account.");
          return;
        }
        // Navigation handled by useEffect above when auth state updates
        // Keep loading=true until redirect happens
        return;
      } else {
        setError(res.message || "Registration failed");
        // Redirect to signin if account already exists
        if (res.redirect) {
          setTimeout(() => navigate(res.redirect), 2000);
        }
      }
    } catch (err) {
      setError("An error occurred during registration");
    }
    setLoading(false);
  };

  const handleBack = () => {
    navigate(-1);
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
      <div className="content-side" style={{ justifyContent: "flex-start", paddingTop: "10vh" }}>
        <div className="brand-content">
          <h1 className="brand-title">StyloQ</h1>
        </div>

        <div className="step-progress">
          <h1 className="step-title">Create your Customer Account</h1>
          <p className="step-subtitle">Set your password</p>
        </div>

        <div className="form-container compact-form" style={{ marginBottom: "60px" }}>
          {/* Error Message */}
          {error && (
            <div
              style={{
                color: "#FF5722",
                backgroundColor: "rgba(255, 87, 34, 0.1)",
                padding: "10px",
                borderRadius: "8px",
                fontSize: "13px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Password */}
            <div className="input-group">
              <label>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  disabled={loading}
                  style={{ paddingRight: "42px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    color: "#888",
                  }}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <br />

            {/* Confirm Password */}
            <div className="input-group">
              <label>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="input-field"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError("");
                  }}
                  disabled={loading}
                  style={{ paddingRight: "42px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    color: "#888",
                  }}
                >
                  {showConfirmPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </button>
          </form>
        </div>

        {/* NAVIGATION BUTTONS */}
        <div className="nav-buttons">
          <button
            type="button"
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
