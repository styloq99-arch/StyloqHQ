/**
 * ════════════════════════════════════════════════════════════════
 * COPY-PASTE CODE SNIPPETS
 * Ready for immediate use in your signup pages
 * ════════════════════════════════════════════════════════════════
 */

// ════════════════════════════════════════════════════════════════
// 1. IMPORT STATEMENTS
// ════════════════════════════════════════════════════════════════

// Add to your signup page:
//
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// ════════════════════════════════════════════════════════════════
// 2. HOOK SETUP
// ════════════════════════════════════════════════════════════════

// Add inside your component:
//
// const navigate = useNavigate();
// const { register } = useAuth();
// const [loading, setLoading] = useState(false);
// const [error, setError] = useState("");

// ════════════════════════════════════════════════════════════════
// 3. SUBMIT HANDLER - CUSTOMER
// ════════════════════════════════════════════════════════════════

const handleCustomerSignupSubmit = async (e) => {
  e.preventDefault();
  setError("");

  // Validation...
  if (!password || password.length < 6) {
    setError("Password must be at least 6 characters");
    return;
  }
  if (password !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  setLoading(true);

  const registrationData = {
    email: formData.email, // from previous step
    password, // from this step
    name: formData.name, // from previous step
    phone: formData.phone, // from previous step
    city: formData.city, // from previous step
    id_number: formData.idNumber, // from previous step
    role: "client", // ← IMPORTANT: Client role
  };

  const result = await register(registrationData);
  setLoading(false);

  if (result.success) {
    navigate("/customer-home");
  } else {
    setError(result.message || "Registration failed");
  }
};

// ════════════════════════════════════════════════════════════════
// 4. SUBMIT HANDLER - BARBER
// ════════════════════════════════════════════════════════════════

const handleBarberSignupSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!password || password.length < 6) {
    setError("Password must be at least 6 characters");
    return;
  }
  if (password !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  setLoading(true);

  const registrationData = {
    email: barberData.email,
    password,
    name: barberData.name,
    role: "barber", // ← IMPORTANT: Barber role
    // Add other barber fields
  };

  const result = await register(registrationData);
  setLoading(false);

  if (result.success) {
    navigate("/barber-dashboard");
  } else {
    setError(result.message || "Registration failed");
  }
};

// ════════════════════════════════════════════════════════════════
// 5. SUBMIT HANDLER - SALON
// ════════════════════════════════════════════════════════════════

const handleSalonSignupSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!password || password.length < 6) {
    setError("Password must be at least 6 characters");
    return;
  }
  if (password !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  setLoading(true);

  const registrationData = {
    email: salonData.email,
    password,
    name: salonData.salonName,
    role: "salon", // ← IMPORTANT: Salon role
    // Add other salon fields
  };

  const result = await register(registrationData);
  setLoading(false);

  if (result.success) {
    navigate("/salon-dashboard");
  } else {
    setError(result.message || "Registration failed");
  }
};

// ════════════════════════════════════════════════════════════════
// 6. LOGOUT BUTTON (for any component)
// ════════════════════════════════════════════════════════════════

// Add this button anywhere to logout:
//
// const { logout } = useAuth();
//
// <button onClick={() => { logout(); navigate("/signin"); }}>
//   Logout
// </button>

// ════════════════════════════════════════════════════════════════
// 7. PROTECTED COMPONENT EXAMPLE
// ════════════════════════════════════════════════════════════════

import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export function UserProfileComponent() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/signin" />;

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 8. MAKING API CALLS IN COMPONENTS
// ════════════════════════════════════════════════════════════════

import { apiGet, apiPost, apiPut, apiDelete } from "../utils/api";

// Get customer bookings
async function loadBookings() {
  const data = await apiGet("/customer/bookings");
  if (data.success) {
    console.log("Bookings:", data.data);
  } else {
    console.error("Error:", data.message);
  }
}

// Create a booking
async function createBooking() {
  const result = await apiPost("/booking/create", {
    barber_id: 5,
    service_id: 2,
    date: "2024-03-25",
    time: "10:00 AM",
  });
  if (result.success) {
    console.log("Booking created!");
  }
}

// Update booking
async function updateBooking() {
  const result = await apiPut("/booking/5", {
    status: "confirmed",
  });
}

// Delete booking
async function deleteBooking() {
  const result = await apiDelete("/booking/5");
}

// ════════════════════════════════════════════════════════════════
// 9. ERROR DISPLAY IN JSX
// ════════════════════════════════════════════════════════════════

// Show error message:
//
// {error && (
//   <div style={{
//     color: "#FF5722",
//     backgroundColor: "rgba(255, 87, 34, 0.1)",
//     padding: "12px",
//     borderRadius: "8px",
//     marginBottom: "10px"
//   }}>
//     {error}
//   </div>
// )}

// ════════════════════════════════════════════════════════════════
// 10. COMPLETE WORKING EXAMPLE
// ════════════════════════════════════════════════════════════════

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ExampleFinalSignupStep() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const result = await register({
      email: "user@example.com",
      password,
      name: "John Doe",
      role: "client", // Change based on signup type
    });

    setLoading(false);

    if (result.success) {
      navigate("/customer-home");
    } else {
      setError(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: "red" }}>{error}</p>}

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
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
}

// ════════════════════════════════════════════════════════════════
// THAT'S IT!
// Copy-paste these snippets into your signup pages
// ════════════════════════════════════════════════════════════════
