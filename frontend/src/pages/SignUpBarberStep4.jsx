import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

// Sample Data
const INITIAL_SPECIALTIES = [
  "Fade Haircut",
  "Beard Styling",
  "Buzz Cut",
  "Classic Shave",
  "Hair Coloring",
  "Kids Cut",
  "Straight Razor",
  "Line Up"
];

export default function SignUpBarberStep4() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Retrieve data from Step 1, 2, 3
  const prevData = location.state || {};

  // 2. State for Bio
  const [bio, setBio] = useState("");  
  
  // 3. State for Specialties
  const [specialtiesList, setSpecialtiesList] = useState(INITIAL_SPECIALTIES);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  
  // 4. State for "Another +" Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState("");

  // 5. State for Navigation (Loading/Error)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Handlers ---

  // Toggle selection
  const toggleSpecialty = (item) => {
    if (selectedSpecialties.includes(item)) {
      setSelectedSpecialties(prev => prev.filter(i => i !== item));
    } else {
      setSelectedSpecialties(prev => [...prev, item]);
    }
    if (error) setError(""); // Clear error on selection
  };

  // Handle Add New Specialty
  const handleAddNew = () => {
    if (newSpecialty.trim() !== "") {
      setSpecialtiesList(prev => [...prev, newSpecialty]);
      setSelectedSpecialties(prev => [...prev, newSpecialty]);
      setNewSpecialty("");
      setIsModalOpen(false);
    }
  };

  // Handle Next Button Click
  const handleNext = (e) => {
    e.preventDefault(); // Prevent default behavior
    
    // 1. Validation: Must select at least one specialty
    if (selectedSpecialties.length === 0) {
      setError("Please select at least one specialty.");
      return;
    }

    // 2. Show Loading
    setLoading(true);

    // 3. Simulate Save & Navigate
    setTimeout(() => {
      setLoading(false);

      const finalData = {
        ...prevData,
        bio: bio,
        specialties: selectedSpecialties
      };

      console.log("Profile Step Complete:", finalData);

      // Navigate to Step 5 (Working Hours) passing all data
      navigate("/signup-barber-step5", { state: finalData });
    }, 1500);
  };

  return (
    <div className="app-container">
      
      {/* --- Header --- */}
      <header className="header">

        {/* --- Back Link --- */}
        <Link to="/signup-barber-step3" className="back-btn">
          <i className="fas fa-arrow-left"></i>
        </Link>

        <div className="header-text">
          <h1>Complete Your Profile</h1>
        </div>

        <Link to="/signup-barber-step5" className="skip-btn">
          Skip
        </Link>
      </header>

      {/* --- Main Content --- */}
      <main className="content">
        
        {/* Error Message */}
        {error && (
          <div style={{ 
            color: "#FF5722", 
            textAlign: "center", 
            fontSize: "13px", 
            marginBottom: "10px" 
          }}>
            {error}
          </div>
        )}

        {/* 1. Professional Bio Section */}
        <label className="section-label">Professional Bio</label>
        <section>
            <div className="section-card">
                <span className="section-desc">
                    Briefly describe your experience and style.
                </span>
                <textarea
                    className="textarea"
                    placeholder="e.g. Master barber with 10 years of experience..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={300}
                />
                <div className="char-count">{bio.length}/300</div>
            </div>
        </section>

        {/* 2. Specialties Section */}
        <label className="section-label">Specialties</label>
        <section>
            <div className="section-card">
                <span className="section-desc">
                    Select services you excel at.
                </span>

                <div className="specialties-grid">
                    {/* Render Checkboxes */}
                    {specialtiesList.map((item, index) => (
                    <label
                        key={index}
                        className={`specialty-item ${selectedSpecialties.includes(item) ? "active" : ""}`}
                    >
                        {/* The Checkbox Input */}
                        <input
                            type="checkbox"
                            className="specialty-checkbox"
                            checked={selectedSpecialties.includes(item)}
                            onChange={() => toggleSpecialty(item)}
                        />
                        {/* The Text Label */}
                        <span className="specialty-text">{item}</span>
                    </label>
                    ))}

                    {/* Another + Button */}
                    <div
                        className="specialty-item add-btn"
                        onClick={() => setIsModalOpen(true)}
                    >
                    <i className="fas fa-plus"></i> Another +
                    </div>
                </div>
            </div>
        </section>

        {/* --- NEXT BUTTON (Fully Functional) --- */}
        <button 
            onClick={handleNext}
            className="btn btn-primary" 
            disabled={loading}
            style={{ 
                width: '100%', 
                height: '48px', 
                marginTop: '2rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
            }}
        >
            {loading ? "SAVING..." : "NEXT"}
        </button>

      </main>

      {/* --- Modal for Adding New Specialty --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Specialty</h3>
            <input
              type="text"
              className="modal-input"
              placeholder="e.g. Dreadlocks"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              autoFocus
            />
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button className="btn-confirm" onClick={handleAddNew}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
