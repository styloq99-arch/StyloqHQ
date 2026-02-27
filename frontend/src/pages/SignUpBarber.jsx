import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignupBarber() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Form State 
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    idNumber: "",
    city: "",
    experience: "",
    avatar: null,
  });

  // State for Previewing
  const [avatarPreview, setAvatarPreview] = useState(null);

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

  // Handle Avatar Upload
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setFormData((prev) => ({ ...prev, avatar: file }));
      if (errors.avatar) setErrors((prev) => ({ ...prev, avatar: "" }));
    }
  };

  // Validation Logic
  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.idNumber.trim()) newErrors.idNumber = "ID Number is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.experience) newErrors.experience = "Experience is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      navigate("/signup-barber-step2", { state: { step1: formData } });
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
          <h1 className="step-title">Create your Barber Account</h1><br />
          <p className="step-subtitle">Personal Information</p>
        </div>

        {/* Inner Frame */}
        <div className="form-container compact-form" style={{ marginBottom: "60px" }}>
          <form noValidate>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleFileChange}
            />

            {/* 1. Avatar */}
            <div className="avatar-upload">
              <div
                className="avatar-circle"
                onClick={handleAvatarClick}
                style={{ cursor: "pointer" }}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span style={{ fontSize: 12, color: "#5a5452" }}>Upload</span>
                  </>
                )}
              </div>
            </div>
            {errors.avatar && (
              <p style={{ color: "#FF5722", fontSize: "11px", textAlign: "center", marginTop: "-10px" }}>
                {errors.avatar}
              </p>
            )}

            {/* 2. Full Name */}
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                className="input-field"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                style={{ borderColor: errors.name ? "#FF5722" : "" }}
              />
              {errors.name && (
                <span style={{ color: "#FF5722", fontSize: "11px" }}>{errors.name}</span>
              )}
            </div><br />

            {/* 3. Email */}
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                className="input-field"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                style={{ borderColor: errors.email ? "#FF5722" : "" }}
              />
              {errors.email && (
                <span style={{ color: "#FF5722", fontSize: "11px" }}>{errors.email}</span>
              )}
            </div><br />

            {/* 4. Phone & ID */}
            <div className="input-row-bottom">
              <div className="input-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="input-field"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ borderColor: errors.phone ? "#FF5722" : "" }}
                />
                {errors.phone && (
                  <span style={{ color: "#FF5722", fontSize: "11px" }}>{errors.phone}</span>
                )}
              </div>

              <div className="input-group">
                <label>ID Number</label>
                <input
                  type="text"
                  name="idNumber"
                  className="input-field"
                  placeholder="ID Number"
                  value={formData.idNumber}
                  onChange={handleChange}
                  style={{ borderColor: errors.idNumber ? "#FF5722" : "" }}
                />
                {errors.idNumber && (
                  <span style={{ color: "#FF5722", fontSize: "11px" }}>{errors.idNumber}</span>
                )}
              </div>
            </div><br />

            {/* 5. City & Experience */}
            <div className="input-row-bottom">
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

              <div className="input-group">
                <label>Years of Experience</label>
                <input
                  type="number"
                  name="experience"
                  className="input-field"
                  placeholder="Years"
                  min="0"
                  max="60"
                  value={formData.experience}
                  onChange={handleChange}
                  style={{ borderColor: errors.experience ? "#FF5722" : "" }}
                />
                {errors.experience && (
                  <span style={{ color: "#FF5722", fontSize: "11px" }}>{errors.experience}</span>
                )}
              </div>
            </div><br />

          </form>
        </div>

        {/* NAVIGATION BUTTONS */}
        <div className="nav-buttons" >
          <Link to="/" className="btn btn-secondary" style={{ flex: 1 }}>
            Back
          </Link>
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
