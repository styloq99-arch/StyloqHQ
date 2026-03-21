import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function CreatePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register: registerUser,
    getRoleRedirect,
    isAuthenticated,
    user,
    error: authError,
    loading: authLoading,
  } = useAuth();

  // Navigate AFTER auth state updates (avoids race condition with ProtectedRoute)
  useEffect(() => {
    if (isAuthenticated && user) {
      const dest = getRoleRedirect(user.role);
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, user]);

  // 1. Retrieve data from Step 1
  const prevData = location.state || {};

  // 2. State for Form
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  // 3. State for Validation/Loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(authError || "");

  // --- Handlers ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation
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

    // Combine registration data
    const registrationData = {
      name: prevData.name || "",
      email: prevData.email || "",
      phone: prevData.phone || "",
      password: formData.password,
      role: prevData.role || "client",
    };

    // Call register function
    const res = await registerUser(registrationData);

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
      setLoading(false);
      setError(res.message || "Registration failed");
      if (res.redirect) {
        setTimeout(() => navigate(res.redirect), 2000);
      }
    }
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
          <div
            style={{
              color: "#FF5722",
              textAlign: "center",
              marginBottom: "10px",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        <section>
          <div className="section-card">
            <div className="section-desc">
              Choose a strong password to secure your account.
            </div>
            <br />

            <div className="cert-form-group">
              {/* 1. Create Password */}
              <div className="input-group">
                <label>Create Password</label>
                <input
                  type="password"
                  name="password"
                  className="input-field"
                  placeholder="••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  style={{
                    borderColor:
                      error && error.includes("Password") ? "#FF5722" : "",
                  }}
                />
              </div>
              <br />

              {/* 2. Confirm Password */}
              <div className="input-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="input-field"
                  placeholder="•••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  style={{
                    borderColor:
                      error && error.includes("Match") ? "#FF5722" : "",
                  }}
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
            width: "100%",
            height: "48px",
            marginTop: "2rem",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "SAVING..." : "Complete Registration"}
        </button>
      </main>
    </div>
  );
}
