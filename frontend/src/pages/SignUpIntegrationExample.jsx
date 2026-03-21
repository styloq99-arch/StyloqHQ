/**
 * EXAMPLE: Signup Integration with Error Handling
 * 
 * This shows how to integrate the AuthContext register function
 * in a multi-step signup flow with proper error handling.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Example: Final step of customer signup
export default function SignUpFinalExample() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Data collected from previous steps (passed via state or context)
  const signupData = {
    name: "John Doe", // from step 1
    email: "john@example.com", // from step 1
    phone: "+1234567890", // from step 1
    role: "client", // determined by signup flow
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Frontend validation
    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    // Prepare registration data
    const userData = {
      name: signupData.name,
      email: signupData.email,
      password: password,
      role: signupData.role,
    };

    const res = await register(userData);

    if (res.success) {
      // Registration successful - AuthContext automatically:
      // 1. Saves token to localStorage
      // 2. Sets user in state
      // 3. Sets isAuthenticated to true
      
      // Redirect to appropriate dashboard
      // (Handled by AuthProvider useEffect or manually)
      const redirectPath = 
        signupData.role === "client" ? "/home" :
        signupData.role === "barber" ? "/barber-dashboard" :
        "/salon-dashboard";
      
      navigate(redirectPath, { replace: true });
    } else {
      // Handle specific errors
      if (res.redirectToSignin) {
        // Email already exists - show error and auto-redirect
        setError(res.message);
        
        // Optional: Auto-redirect after delay
        setTimeout(() => {
          navigate("/signin", { replace: true });
        }, 3000);
      } else {
        // Other errors (validation, network, etc.)
        setError(res.message);
      }
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Error Display */}
      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          {error}
        </div>
      )}

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={loading}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}

// EXAMPLE: Barber signup final step
export function BarberSignUpFinal() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleComplete = async (barberData) => {
    setLoading(true);
    setError("");

    const userData = {
      name: barberData.fullName,
      email: barberData.email,
      password: barberData.password,
      role: "barber",
    };

    const res = await register(userData);

    if (res.success) {
      // Auto-redirect to barber dashboard
      navigate("/barber-dashboard", { replace: true });
    } else if (res.redirectToSignin) {
      setError(res.message);
      setTimeout(() => navigate("/signin"), 3000);
    } else {
      setError(res.message);
    }

    setLoading(false);
  };

  return { handleComplete, loading, error };
}
