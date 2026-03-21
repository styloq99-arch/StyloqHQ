import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignUpExample() {
  const navigate = useNavigate();
  const { register, loading: authLoading, isAuthenticated, getRoleRedirect } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "client", // Default role
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const correctPath = getRoleRedirect("client"); // Default to client for signup
      navigate(correctPath, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    // Clear server message when user types
    if (serverMessage) {
      setServerMessage("");
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Role validation
    const validRoles = ["client", "barber", "salon"];
    if (!validRoles.includes(formData.role)) {
      newErrors.role = "Please select a valid role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMessage("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      };

      const res = await register(userData);

      if (res.success) {
        // Registration successful - user will be redirected by AuthContext
        setServerMessage("Registration successful! Redirecting...");
      } else {
        // Handle specific error cases
        if (res.reason === "email_exists") {
          setServerMessage(res.message);
          // Auto-redirect to signin after delay
          setTimeout(() => {
            navigate("/signin");
          }, 3000);
        } else if (res.reason === "validation_error" && res.errors) {
          // Set field-specific errors from backend validation
          setErrors(res.errors);
          setServerMessage("Please fix the errors below");
        } else {
          setServerMessage(res.message || "Registration failed");
        }
      }
    } catch (err) {
      setServerMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      {/* LEFT SIDE (IMAGE) */}
      <div className="visual-side">
        <img src="src/assets/images/login-bg.png" alt="StyloQ Background" />
        <div className="visual-overlay"></div>
        <div className="gradient-mask"></div>

        <div className="brand-content">
          <h1 className="brand-title">StyloQ</h1>
          <p className="brand-tagline">Connecting grooming independence</p>
        </div>
      </div>

      {/* RIGHT SIDE (CONTENT) */}
      <div
        className="content-side"
        style={{ justifyContent: "flex-start", paddingTop: "10vh" }}
      >
        <div className="brand-content">
          <h1 className="brand-title">StyloQ</h1>
        </div>

        <div className="form-container">
          {/* Server Message */}
          {serverMessage && (
            <div
              style={{
                color: serverMessage.includes("successful") ? "#4CAF50" : "#FF5722",
                backgroundColor: serverMessage.includes("successful") 
                  ? "rgba(76, 175, 80, 0.1)" 
                  : "rgba(255, 87, 34, 0.1)",
                padding: "10px",
                borderRadius: "8px",
                fontSize: "13px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              {serverMessage}
            </div>
          )}

          <div className="page-header">
            <h2>Sign Up</h2>
            <p>Create your account to get started</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                className="input-field"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading || authLoading}
                style={{
                  borderColor: errors.name ? "#FF5722" : "",
                }}
              />
              {errors.name && (
                <span style={{ color: "#FF5722", fontSize: "11px" }}>
                  {errors.name}
                </span>
              )}
            </div>
            <br />

            {/* Email */}
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                className="input-field"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading || authLoading}
                style={{
                  borderColor: errors.email ? "#FF5722" : "",
                }}
              />
              {errors.email && (
                <span style={{ color: "#FF5722", fontSize: "11px" }}>
                  {errors.email}
                </span>
              )}
            </div>
            <br />

            {/* Role Selection */}
            <div className="input-group">
              <label>I am a</label>
              <select
                name="role"
                className="input-field"
                value={formData.role}
                onChange={handleChange}
                disabled={loading || authLoading}
                style={{
                  borderColor: errors.role ? "#FF5722" : "",
                }}
              >
                <option value="client">Client</option>
                <option value="barber">Barber</option>
                <option value="salon">Salon</option>
              </select>
              {errors.role && (
                <span style={{ color: "#FF5722", fontSize: "11px" }}>
                  {errors.role}
                </span>
              )}
            </div>
            <br />

            {/* Password */}
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                className="input-field"
                placeholder="Create a password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                disabled={loading || authLoading}
                style={{
                  borderColor: errors.password ? "#FF5722" : "",
                }}
              />
              {errors.password && (
                <span style={{ color: "#FF5722", fontSize: "11px" }}>
                  {errors.password}
                </span>
              )}
            </div>
            <br />

            {/* Confirm Password */}
            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="input-field"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading || authLoading}
                style={{
                  borderColor: errors.confirmPassword ? "#FF5722" : "",
                }}
              />
              {errors.confirmPassword && (
                <span style={{ color: "#FF5722", fontSize: "11px" }}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            <button 
              type="submit" 
              className="btn-submit" 
              disabled={loading || authLoading}
              style={{ marginTop: "20px" }}
            >
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </button>
          </form>

          <div className="divider">Or continue with</div>
          <div className="social-buttons">
            <button className="btn-social" disabled={loading || authLoading}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M5.26 9.76A7.08 7.08 0 0 1 12 4.93c1.68 0 3.22.6 4.42 1.58l3.3-3.3A11.92 11.92 0 0 0 12 0 12 12 0 0 0 1.24 6.65l4.02 3.11z"
                />
                <path
                  fill="#34A853"
                  d="M16.04 18.01A7.02 7.02 0 0 1 12 19.07a7.08 7.08 0 0 1-6.75-4.86L1.2 17.3A12 12 0 0 0 12 24c3.2 0 6.1-1.23 8.27-3.23l-4.23-2.76z"
                />
                <path
                  fill="#4A90E2"
                  d="M20.27 20.77A11.88 11.88 0 0 0 24 12c0-.79-.08-1.57-.22-2.32H12v4.64h6.76c-.29 1.48-1.14 2.73-2.32 3.56l3.83 2.89z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.25 14.21a7.1 7.1 0 0 1 0-4.42L1.2 6.66A11.95 11.95 0 0 0 0 12c0 1.92.45 3.74 1.24 5.34l4.01-3.13z"
                />
              </svg>
            </button>
            <button className="btn-social" disabled={loading || authLoading}>
              <svg width="20" height="20" viewBox="0 0 384 512" fill="#fff">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
              </svg>
            </button>
          </div>

          <div className="signup-link">
            Already have an account? <Link to="/signin">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
