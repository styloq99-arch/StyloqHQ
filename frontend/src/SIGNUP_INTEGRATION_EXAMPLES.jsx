/**
 * SIGNUP INTEGRATION EXAMPLES
 *
 * This file shows how to integrate authentication into your multi-step signup forms.
 * Apply this pattern to SignUpCustomer.jsx, SignUpBarber.jsx, and SignUpSalon.jsx
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * EXAMPLE: Customer Signup - Final Step
 *
 * This is the final step where you collect password and call register()
 */
export function CustomerSignupFinal() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Data from previous steps (passed via navigation state)
  const [customerData] = useState(() => {
    const stateData = window.history.state?.usr?.state || {};
    return stateData.customerData || {};
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
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

    // Prepare registration payload
    const registrationData = {
      ...customerData,
      password,
      role: "client", // IMPORTANT: Set role for customer
    };

    // Call register from AuthContext
    const result = await register(registrationData);

    setLoading(false);

    if (result.success) {
      // User is now logged in and stored in AuthContext
      // Redirect to customer home
      navigate("/customer-home");
    } else {
      setError(result.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div
          style={{ color: "#FF5722", marginBottom: "10px", fontSize: "13px" }}
        >
          {error}
        </div>
      )}

      <div className="input-group">
        <label>Password</label>
        <input
          type="password"
          className="input-field"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="input-group">
        <label>Confirm Password</label>
        <input
          type="password"
          className="input-field"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "REGISTERING..." : "SIGN UP"}
      </button>
    </form>
  );
}

/**
 * BARBER SIGNUP - Final Step Example
 *
 * Barber signup should include role: "barber"
 */
export function BarberSignupFinal() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get barber data from previous steps
  const [barberData] = useState(() => {
    // Retrieve from your state management or session storage
    return {};
  });

  const handleSubmit = async (e) => {
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
      ...barberData,
      password,
      role: "barber", // IMPORTANT: Set role for barber
    };

    const result = await register(registrationData);
    setLoading(false);

    if (result.success) {
      navigate("/barber-dashboard");
    } else {
      setError(result.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ color: "#FF5722" }}>{error}</div>}

      <div className="input-group">
        <label>Password</label>
        <input
          type="password"
          className="input-field"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="input-group">
        <label>Confirm Password</label>
        <input
          type="password"
          className="input-field"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "REGISTERING..." : "SIGN UP"}
      </button>
    </form>
  );
}

/**
 * SALON SIGNUP - Final Step Example
 *
 * Salon signup should include role: "salon"
 */
export function SalonSignupFinal() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [salonData] = useState(() => {
    return {};
  });

  const handleSubmit = async (e) => {
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
      ...salonData,
      password,
      role: "salon", // IMPORTANT: Set role for salon
    };

    const result = await register(registrationData);
    setLoading(false);

    if (result.success) {
      navigate("/salon-dashboard");
    } else {
      setError(result.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ color: "#FF5722" }}>{error}</div>}

      <div className="input-group">
        <label>Password</label>
        <input
          type="password"
          className="input-field"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="input-group">
        <label>Confirm Password</label>
        <input
          type="password"
          className="input-field"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "REGISTERING..." : "SIGN UP"}
      </button>
    </form>
  );
}

/**
 * KEY POINTS FOR SIGNUP INTEGRATION:
 *
 * 1. Import useAuth:
 *    import { useAuth } from "../context/AuthContext";
 *
 * 2. Get register function:
 *    const { register } = useAuth();
 *
 * 3. Prepare registration payload with required fields:
 *    - email (required)
 *    - password (required)
 *    - name (required)
 *    - role (required) - must be "client", "barber", or "salon"
 *    - Other fields as needed for each role
 *
 * 4. Call register() with the data:
 *    const result = await register(registrationData);
 *
 * 5. Check result:
 *    if (result.success) {
 *      // User is logged in, redirect based on role
 *    } else {
 *      // Show error
 *    }
 *
 * 6. Redirect after successful registration:
 *    - client → /customer-home
 *    - barber → /barber-dashboard
 *    - salon → /salon-dashboard
 */
