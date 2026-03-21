/**
 * ════════════════════════════════════════════════════════════════
 * COMPLETE EXAMPLE: Customer Signup with Authentication
 * ════════════════════════════════════════════════════════════════
 *
 * This shows a COMPLETE FINAL STEP for customer signup.
 * Copy the pattern for barber and salon.
 *
 * Place this logic in your final signup step component.
 */

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * EXAMPLE: Final Customer Signup Step - Ready to use
 *
 * This component:
 * 1. Receives form data from previous steps (via navigation state)
 * 2. Collects password and confirms it
 * 3. Validates the password
 * 4. Calls register() with complete user data including role
 * 5. Redirects to dashboard on success
 * 6. Shows errors if registration fails
 */
export default function CustomerSignupFinalExample() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  // 📦 Get data from previous signup steps
  const previousData = location.state?.formData || {};

  // 🔐 Password state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ⚠️ Error and loading states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Validation
  const validateForm = () => {
    setError("");

    if (!password.trim()) {
      setError("Password is required");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (!confirmPassword.trim()) {
      setError("Please confirm your password");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  // 🚀 Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 📝 Prepare registration data
      const registrationData = {
        // Data from previous steps
        name: previousData.name,
        email: previousData.email,
        phone: previousData.phone,
        city: previousData.city,
        id_number: previousData.idNumber,

        // Password from this step
        password,

        // 🔴 IMPORTANT: Role must be set
        role: "client",

        // Optional: avatar if collected
        // avatar: previousData.avatar
      };

      console.log("Registering with:", registrationData);

      // Call register from AuthContext
      const result = await register(registrationData);

      setLoading(false);

      if (result.success) {
        // ✅ Registration successful
        // User is now logged in (stored in AuthContext)
        // Token is saved to localStorage
        // Redirect to customer home
        navigate("/customer-home");
      } else {
        // ❌ Registration failed
        setError(result.message || "Registration failed");
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="app-layout">
      <div className="visual-side">
        <img src="src/assets/images/login-bg.png" alt="StyloQ" />
        <div className="visual-overlay"></div>
        <div className="gradient-mask"></div>

        <div className="brand-content">
          <h1 className="brand-title">StyloQ</h1>
          <p className="brand-tagline">Connecting grooming independence</p>
        </div>
      </div>

      <div
        className="content-side"
        style={{ justifyContent: "flex-start", paddingTop: "10vh" }}
      >
        <div className="brand-content">
          <h1 className="brand-title">StyloQ</h1>
        </div>

        <div className="step-progress">
          <h1 className="step-title">Create your Password</h1>
          <br />
          <p className="step-subtitle">Secure your account</p>
        </div>

        <div
          className="form-container compact-form"
          style={{ marginBottom: "60px" }}
        >
          {/* Error Message */}
          {error && (
            <div
              style={{
                color: "#FF5722",
                backgroundColor: "rgba(255, 87, 34, 0.1)",
                padding: "12px",
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
            {/* Password Field */}
            <div className="input-group">
              <label>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  placeholder="Enter a secure password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  disabled={loading}
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  disabled={loading}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#888",
                  }}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <small
                style={{ color: "#999", fontSize: "12px", marginTop: "4px" }}
              >
                At least 6 characters
              </small>
            </div>
            <br />

            {/* Confirm Password Field */}
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
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  disabled={loading}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#888",
                  }}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
            <br />

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading ? "CREATING ACCOUNT..." : "SIGN UP"}
            </button>
          </form>

          {/* Terms */}
          <p
            style={{
              fontSize: "12px",
              color: "#999",
              marginTop: "16px",
              textAlign: "center",
            }}
          >
            By signing up, you agree to our Terms & Conditions
          </p>
        </div>

        {/* Navigation */}
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
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "SIGNING UP..." : "SIGN UP"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ════════════════════════════════════════════════════════════════
 * HOW TO USE THIS EXAMPLE IN YOUR SIGNUP PAGES
 * ════════════════════════════════════════════════════════════════
 *
 * 1. For Customer Signup:
 *    - Use this exactly as-is
 *    - Modify placeholders/styling if needed
 *
 * 2. For Barber Signup:
 *    - Copy the pattern
 *    - Change role: "client" → role: "barber"
 *    - Change navigate("/customer-home") → navigate("/barber-dashboard")
 *    - Adjust form fields for barber data
 *
 * 3. For Salon Signup:
 *    - Copy the pattern
 *    - Change role: "client" → role: "salon"
 *    - Change navigate("/customer-home") → navigate("/salon-dashboard")
 *    - Adjust form fields for salon data
 *
 * MINIMAL CHANGES REQUIRED:
 *
 *   const registrationData = {
 *     name: previousData.name,
 *     email: previousData.email,
 *     password,
 *     role: "client",  // ← CHANGE THIS
 *   };
 *
 *   navigate("/customer-home");  // ← CHANGE THIS
 *
 *
 * KEY POINTS:
 *
 * ✅ Must set role: "client" / "barber" / "salon"
 * ✅ Must include email and password
 * ✅ Must call useAuth().register()
 * ✅ Success means user is logged in
 * ✅ Redirect to correct dashboard
 * ✅ Handle errors with setError()
 *
 * ════════════════════════════════════════════════════════════════
 */
