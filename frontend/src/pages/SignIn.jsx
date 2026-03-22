import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from '../supabaseClient'

export default function Signin() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    })

    if (error) {
      console.error(error)
      alert('Google login failed')
    }
  }
  const navigate = useNavigate();
  const { login, user, isAuthenticated, getRoleRedirect, needsRoleSelection } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const correctPath = getRoleRedirect(user.role);
      navigate(correctPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate, getRoleRedirect]);

  // Redirect OAuth users who need to pick a role
  useEffect(() => {
    if (needsRoleSelection) {
      navigate("/select-role", { replace: true });
    }
  }, [needsRoleSelection, navigate]);

  // Load persisted email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("styloq_remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const validateEmail = (val) =>
    String(val)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      );

  // Forgot Password modal: null | "confirm" | "sent"
  const [forgotModal, setForgotModal] = useState(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotClick = (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !validateEmail(email)) {
      setError(
        "Please enter your email address above first, then click Forgot Password.",
      );
      return;
    }

    setForgotModal("confirm");
  };

  const handleForgotConfirm = () => {
    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotModal("sent");
    }, 1500);
  };

  const closeForgotModal = () => setForgotModal(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setError(res.message || "Invalid email or password");
    }
    // Success navigation handled by useEffect above
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

        <motion.div 
          className="form-container"
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        >
          {/* Error Message */}
          {error && (
            <div
              style={{
                color: "#FF5722",
                backgroundColor: "rgba(255, 87, 34, 0.1)",
                padding: "10px",
                borderRadius: "8px",
                fontSize: "13px",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <div className="page-header">
            <h2>Sign In</h2>
            <p>Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                disabled={loading}
              />
            </div>
            <br />

            {/* Password with show/hide toggle */}
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
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  disabled={loading}
                  aria-label="Toggle password visibility"
                  style={{
                    position: "absolute",
                    right: 12,
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
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <br />

            {/* Remember Me + Forgot Password */}
            <div className="form-options-row">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="rememberMe">Remember Me</label>
              </div>
              <div className="forgot-password">
                <span
                  onClick={handleForgotClick}
                  style={{
                    color: "#FF5722",
                    fontWeight: 500,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Forgot Password?
                </span>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>

          <div className="divider">Or continue with</div>
          <div className="social-buttons">
            <button
              className="btn-social"
              disabled={loading}
              onClick={handleGoogleLogin}
            >
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
            <button className="btn-social" disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 384 512" fill="#fff">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
              </svg>
            </button>
          </div>

          <div className="signup-link">
            Don't have an account? <Link to="/">Sign up</Link>
          </div>
        </motion.div>
      </div>

      {/* FORGOT PASSWORD — CONFIRM MODAL */}
      <AnimatePresence>
      {forgotModal === "confirm" && (
        <motion.div 
          style={overlayStyle} 
          onClick={closeForgotModal}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            style={modalStyle} 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <button
              style={closeBtnStyle}
              onClick={closeForgotModal}
              aria-label="Close"
            >
              ✕
            </button>

            <div style={iconCircleStyle("#FF5722")}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <h2 style={{ ...modalTitleStyle, marginTop: 16 }}>
              Reset your password?
            </h2>
            <p style={modalSubtitleStyle}>
              We'll send a password reset link to:
            </p>
            <p
              style={{
                fontWeight: 700,
                color: "#1A1210",
                fontSize: 15,
                marginBottom: 28,
                textAlign: "center",
              }}
            >
              {email}
            </p>

            <button
              className="btn-submit"
              style={{ marginTop: 0, marginBottom: 12 }}
              onClick={handleForgotConfirm}
              disabled={forgotLoading}
            >
              {forgotLoading ? "SENDING..." : "YES, SEND RESET LINK"}
            </button>

            <button
              style={{ ...submitBtnStyle, marginTop: 0 }}
              onClick={closeForgotModal}
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* FORGOT PASSWORD — EMAIL SENT MODAL */}
      <AnimatePresence>
      {forgotModal === "sent" && (
        <motion.div 
          style={overlayStyle} 
          onClick={closeForgotModal}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            style={{ ...modalStyle, textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <button
              style={closeBtnStyle}
              onClick={closeForgotModal}
              aria-label="Close"
            >
              ✕
            </button>

            <div style={iconCircleStyle("#34A853")}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h2 style={{ ...modalTitleStyle, marginTop: 20 }}>
              Reset link sent!
            </h2>
            <p style={{ ...modalSubtitleStyle, marginBottom: 6 }}>
              We've sent a password reset link to:
            </p>
            <p
              style={{
                fontWeight: 700,
                color: "#1A1210",
                marginBottom: 8,
                fontSize: 15,
              }}
            >
              {email}
            </p>
            <p style={{ fontSize: 12, color: "#aaa", marginBottom: 28 }}>
              Didn't receive it? Check your spam folder.
            </p>

            <button
              onClick={closeForgotModal}
              style={{ ...submitBtnStyle, alignSelf: "center", marginTop: "20px" }}
            >
              BACK TO SIGN IN
            </button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

// Shared modal styles
const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  backdropFilter: "blur(2px)",
};

const modalStyle = {
  background: "#fff",
  borderRadius: 20,
  padding: "40px 36px",
  width: "100%",
  maxWidth: 420,
  position: "relative",
  boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
  textAlign: "center",
};

const closeBtnStyle = {
  position: "absolute",
  top: 16,
  right: 16,
  background: "#f5f5f5",
  border: "none",
  borderRadius: "50%",
  width: 32,
  height: 32,
  cursor: "pointer",
  fontSize: 14,
  color: "#666",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalTitleStyle = {
  fontSize: 22,
  fontWeight: 700,
  color: "#1A1210",
  marginBottom: 8,
};

const modalSubtitleStyle = {
  fontSize: 13,
  color: "#888",
  marginBottom: 8,
};

const cancelBtnStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: 10,
  background: "transparent",
  border: "1.5px solid #ddd",
  color: "#888",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

const iconCircleStyle = (color) => ({
  width: 64,
  height: 64,
  borderRadius: "50%",
  background: color,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
});
