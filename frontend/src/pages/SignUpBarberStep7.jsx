import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

export default function SignUpBarberStep6() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Retrieve data from previous steps
  const prevData = location.state || {};

  // 2. State for Services List
  const [services, setServices] = useState([]);

  // 3. State for "Add New" Form Inputs
  const [newService, setNewService] = useState({
    name: "",
    price: "",
    desc: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Handlers ---

  // Handle Input Changes in Form
  const handleInputChange = (field, value) => {
    setNewService(prev => ({ ...prev, [field]: value }));
    if (error) setError(""); // Clear error on type
  };

  // Add Service to List
  const handleAddService = () => {
    // 1. Validation
    if (!newService.name.trim()) {
      setError("Service Name is required");
      return;
    }
    if (!newService.price) {
      setError("Price is required");
      return;
    }

    // 2. Create Service Object
    const serviceToAdd = {
      id: Date.now(),
      name: newService.name,
      price: newService.price,
      desc: newService.desc
    };

    // 3. Update List
    setServices(prev => [...prev, serviceToAdd]);

    // 4. Reset Form
    setNewService({ name: "", price: "", desc: "" });
  };

  // Remove Service from List
  const removeService = (id) => {
    // Safety check: Don't remove last item if it's the only one
    if (services.length === 1) {
      alert("You must have at least one service.");
      return;
    }
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // Handle Next Button
  const handleNext = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API Save
    setTimeout(() => {
      setLoading(false);

      const finalData = {
        ...prevData,
        services: services
      };

      console.log("Service Rates Saved:", finalData);

      navigate("/signup-barber-step8", { state: finalData });
    }, 1500);
  };

  return (
    <div className="app-container">
      
      {/* --- Header --- */}
      <header className="header">
        <Link to="/signup-barber-step6" className="back-btn">
            <i className="fas fa-arrow-left"></i>
        </Link>
        
        <div className="header-text">
          <h1>Service Rates</h1>
        </div>

        <Link to="/signup-barber-step8" className="skip-btn">
            Skip
        </Link>
      </header>

      {/* --- Main Content --- */}
      <main className="content">
        
        {/* Error Display */}
        {error && (
          <div style={{ 
            color: "#FF5722", 
            textAlign: "center", 
            marginBottom: "10px", 
            fontSize: "13px" 
          }}>
            {error}
          </div>
        )}

        {/* 1. ADD NEW SERVICE SECTION --- */}
        <section>
          <div className="section-card">
            <label className="section-label">Add New Service</label><br />
            <div className="section-desc">Enter service details below</div>
            
            <div className="cert-form-group">
                <div className="input-group">
                    <label>Service Name</label>
                    <input 
                        type="text" 
                        className="input-field" 
                        placeholder="e.g. Classic Cut"
                        value={newService.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        style={{ borderColor: error && error.includes("Name") ? '#FF5722' : '' }}
                    />
                </div><br />

                <div className="input-group">
                    <label>Price (LKR)</label>
                    <input 
                        type="number" 
                        className="input-field" 
                        placeholder="0.00"
                        value={newService.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        style={{ borderColor: error && error.includes("Price") ? '#FF5722' : '' }}
                    />
                </div>
            </div>

            <div className="input-group">
                <label>Description (Optional)</label>
                <textarea
                    className="textarea"
                    placeholder="Brief description of service..."
                    value={newService.desc}
                    onChange={(e) => handleInputChange('desc', e.target.value)}
                    style={{ minHeight: '60px' }}
                />
            </div><br />

            <button 
                type="button" 
                className="add-more-btn" 
                onClick={handleAddService}
            >
                <i className="fas fa-plus"></i> Add Service
            </button>
          </div>
        </section>

        {/* 2. LIST OF ADDED SERVICES --- */}
        <section>
          <div className="section-card">
            <label className="section-label">Your Service List</label>
            
            {services.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                    No services added yet.
                </div>
            ) : (
                <div className="cert-form-group">
                    {services.map((service) => (
                        <div key={service.id} style={{ 
                            borderBottom: "1px solid #333", 
                            padding: "15px 0",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            
                            {/* Left: Name & Desc */}
                            <div style={{ flex: 2 }}>
                                <div style={{ color: "#fff", fontSize: "16px", fontWeight: "bold" }}>
                                    {service.name}
                                </div>
                                {service.desc && (
                                    <div style={{ color: "#888", fontSize: "13px", marginTop: "4px" }}>
                                        {service.desc}
                                    </div>
                                )}
                            </div>
                            
                            {/* Right: Price & Remove */}
                            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                <div style={{ color: "#FF5722", fontSize: "18px", fontWeight: "bold" }}>
                                    LKR {service.price}
                                </div>

                                <button 
                                    type="button"
                                    onClick={() => removeService(service.id)}
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        color: '#666', 
                                        cursor: 'pointer', 
                                        fontSize: '16px',
                                        padding: '5px'
                                    }}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}
          </div>
        </section>

        {/* --- NEXT BUTTON (Changed Text) --- */}
        <button 
            onClick={handleNext}
            className="btn btn-primary" 
            disabled={loading || services.length === 0}
            style={{ 
                width: '100%', 
                height: '48px', 
                marginTop: '2rem',
                cursor: (loading || services.length === 0) ? 'not-allowed' : 'pointer',
                opacity: (loading || services.length === 0) ? 0.7 : 1
            }}
        >
            {loading ? "SAVING..." : "NEXT"}
        </button>

      </main>
    </div>
  );
}