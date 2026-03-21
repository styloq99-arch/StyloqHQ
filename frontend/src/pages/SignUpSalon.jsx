import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignupSalon() {
  const navigate = useNavigate();

  // Form State — FIX: added missing "salonAddress" to match validation & JSX used "address" key, unified to "salonAddress"
  const [formData, setFormData] = useState({
    salonName: "",
    salonEmail: "",
    salonPhone: "",
    salonAddress: "",
    city: "",
    district: "",
    postalCode: "",
  });

  // State for Validation Errors
  const [errors, setErrors] = useState({});

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validation Logic
  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.salonName.trim()) newErrors.salonName = "Salon Name is required";
    if (!formData.salonEmail.trim()) newErrors.salonEmail = "Email Address is required";
    else if (!emailRegex.test(formData.salonEmail)) newErrors.salonEmail = "Invalid email format";
    if (!formData.salonPhone.trim()) newErrors.salonPhone = "Phone Number is required";
    if (!formData.salonAddress.trim()) newErrors.salonAddress = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // FIX: Next button validates before navigating
  const handleNext = () => {
    if (validate()) {
      navigate("/create-password", {
        state: {
          name: formData.salonName,
          email: formData.salonEmail,
          phone: formData.salonPhone,
          role: "salon",
          address: formData.salonAddress,
          city: formData.city,
          district: formData.district,
          postalCode: formData.postalCode,
        },
      });
    }
  };

  return (
    <div className="app-layout">
      {/* --- LEFT SIDE --- */}
      <div className="visual-side">
        <img
          src="src/assets/images/login-bg.png"
          alt="StyloQ"
        />
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
          <h1 className="step-title">Create your Salon Account</h1><br />
          <p className="step-subtitle">Salon Details</p>
        </div>

        {/* Inner Frame */}
        <div className="form-container compact-form" style={{ marginBottom: "20px" }}>
          <form noValidate>

            {/* 1. Salon Name */}
            <div className="input-group">
              <label>Salon Name</label>
              <input
                type="text"
                name="salonName"
                className="input-field"
                placeholder="Enter your salon name"
                value={formData.salonName}
                onChange={handleChange}
                style={{ borderColor: errors.salonName ? "#FF5722" : "" }}
              />
              {errors.salonName && (
                <span style={{ color: "#FF5722", fontSize: "11px" }}>{errors.salonName}</span>
              )}
            </div><br />

            {/* 2. Email */}
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                name="salonEmail"
                className="input-field"
                placeholder="Enter your email"
                value={formData.salonEmail}
                onChange={handleChange}
                style={{ borderColor: errors.salonEmail ? "#FF5722" : "" }}
              />
              {errors.salonEmail && (
                <span style={{ color: "#FF5722", fontSize: "11px" }}>{errors.salonEmail}</span>
              )}
            </div><br />

            {/* 3. Phone */}
            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="salonPhone"
                className="input-field"
                placeholder="Phone"
                value={formData.salonPhone}
                onChange={handleChange}
                style={{ borderColor: errors.salonPhone ? "#FF5722" : "" }}
              />
              {errors.salonPhone && (
                <span style={{ color: "#FF5722", fontSize: "11px" }}>{errors.salonPhone}</span>
              )}
            </div><br />

            {/* 4. Address & City */}
            <div className="input-row-bottom">
              <div className="input-group">
                <label>Address</label>
                <input
                  type="text"
                  name="salonAddress"
                  className="input-field"
                  placeholder="Address"
                  value={formData.salonAddress}
                  onChange={handleChange}
                  style={{ borderColor: errors.salonAddress ? "#FF5722" : "" }}
                />
                {errors.salonAddress && (
                  <span style={{ color: "#FF5722", fontSize: "11px" }}>{errors.salonAddress}</span>
                )}
              </div>
              <div className="input-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  className="input-field"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  style={{ borderColor: errors.city ? "#FF5722" : "" }}
                />
                {errors.city && (
                  <span style={{ color: "#FF5722", fontSize: "11px" }}>{errors.city}</span>
                )}
              </div>
            </div><br />

            {/* 5. District & Postal Code */}
            <div className="input-row-bottom">
              <div className="input-group">
                <label>District</label>
                <input
                  type="text"
                  name="district"
                  className="input-field"
                  placeholder="District"
                  value={formData.district}
                  onChange={handleChange}
                  style={{ borderColor: errors.district ? "#FF5722" : "" }}
                />
                {errors.district && (
                  <span style={{ color: "#FF5722", fontSize: "11px" }}>{errors.district}</span>
                )}
              </div>
              <div className="input-group">
                <label>Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  className="input-field"
                  placeholder="Postal Code"
                  value={formData.postalCode}
                  onChange={handleChange}
                  style={{ borderColor: errors.postalCode ? "#FF5722" : "" }}
                />
                {errors.postalCode && (
                  <span style={{ color: "#FF5722", fontSize: "11px" }}>{errors.postalCode}</span>
                )}
              </div>
            </div><br />

          </form>
        </div>

        {/* NAVIGATION BUTTONS */}
        <div className="nav-buttons">
          <Link to="/" className="btn btn-secondary" style={{ flex: 1 }}>
            Back
          </Link>
          {/* FIX: button instead of Link so validation runs before navigation */}
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={handleNext}
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}
