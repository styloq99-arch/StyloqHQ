import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function SignUpBarberStep5() {
  const navigate = useNavigate();

  // State for Certificates List (Added 'file' property for tracking)
  const [certificates, setCertificates] = useState([
    { id: 1, name: '', institute: '', date: '', desc: '', file: null }
  ]);

  const [loading, setLoading] = useState(false);

  // Handle Add More Certificates
  const handleAddMore = () => {
    setCertificates([...certificates, { id: Date.now(), name: '', institute: '', date: '', desc: '', file: null }]);
  };

  // Handle File Upload (THIS WAS MISSING IN YOUR SNIPPET)
  const handleCertImageUpload = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      setCertificates(prev => prev.map(cert => 
        cert.id === id ? { ...cert, file } : cert
      ));
    }
  };

  // Update Certificate Input
  const handleCertChange = (id, field, value) => {
    const updatedCerts = certificates.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    );
    setCertificates(updatedCerts);
  };

  // Handle Next Button Click
  const handleNext = (e) => {
    e.preventDefault(); // Prevent default behavior if inside form
    
    // 1. Validation: Check if at least one certificate is filled
    const hasData = certificates.some(c => c.name !== '' || c.file !== null);
    
    if (!hasData) {
      alert("Please fill in at least one certificate or click Skip.");
      return;
    }

    // 2. Show Loading
    setLoading(true);

    // 3. Simulate Save & Navigate
    setTimeout(() => {
      setLoading(false);
      
      console.log("Certificates Saved:", certificates);

      // Navigate to Step 6 (Passing data)
      navigate("/signup-barber-step6", { state: certificates });
    }, 1500);
  };

  return (
    <div className="app-container">
      
      {/* --- Header --- */}
      <header className="header">
        <Link to="/signup-barber-step4" className="back-btn">
            <i className="fas fa-arrow-left"></i>
        </Link>
        
        <div className="header-text">
          <h1>Certifications & Credentials</h1>
        </div>

        <Link to="/signup-barber-step6" className="skip-btn">
            Skip
        </Link>
      </header>

      {/* --- Main Content --- */}
      <main className="content">
        
        <section>
          <div className="section-card">
            
            <label className="section-label">Upload Certificate</label>
            <label className="upload-zone">
                {/* Hidden Input */}
                <input
                    type="file"
                    style={{ display: 'none' }}
                    accept="image/*, .pdf"
                    onChange={(e) => handleCertImageUpload(certificates[0].id, e)}
                />

                {/* Visual Part */}
                <div className="upload-icon">
                    <i className="fas fa-cloud-upload-alt"></i>
                </div>
                <p className="upload-text">Tap to upload certificate</p>
                <span className="upload-subtext">PDF, JPG or PNG</span>
            </label>

            {/* 2. Certificate Details */}
            {certificates.map((cert) => (
              <div key={cert.id} className="cert-form-group">
                <div className="input-group">
                  <label className="section-label">Certificate Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Master Barber Certification"
                    value={cert.name}
                    onChange={(e) => handleCertChange(cert.id, 'name', e.target.value)}
                  />
                </div><br />

                <div className="input-group">
                  <label className="section-label">Issuing Institute</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Aveda Academy"
                    value={cert.institute}
                    onChange={(e) => handleCertChange(cert.id, 'institute', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="section-label">Issue Date</label>
                  <input 
                    type="date" 
                    className="input-field"
                    value={cert.date}
                    onChange={(e) => handleCertChange(cert.id, 'date', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="section-label">Short Description (Optional)</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Brief summary..."
                    value={cert.desc}
                    onChange={(e) => handleCertChange(cert.id, 'desc', e.target.value)}
                  />
                </div>
              </div>
            ))}

            <button className="add-more-btn" onClick={handleAddMore}>
              <i className="fas fa-plus"></i> Add More Certificates
            </button>
          </div>
        </section>

        {/* --- NEXT BUTTON (Replaced Link with Button) --- */}
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
    </div>
  );
}