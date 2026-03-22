import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CustomerSidebar from "../Components/CustomerSidebar";

export default function AiRecommendation() {
  const { token, user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Reset state on new file
      setResults(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch("/ai/hairstyle", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          // Let the browser set the boundary for multipart/form-data
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to analyze image");
      }

      setResults(data.data);
    } catch (err) {
      setError(err.message || "Something went wrong during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <CustomerSidebar activePage="AI Stylist" />

      {/* Main Content */}
      <div className="main-content">
        <header className="customer-barber-header" style={{ paddingBottom: "5px" }}>
          <div className="header-top">
            <div className="mobile-brandContent">
              <h1 className="mobile-brand">AI Hairstylist</h1>
            </div>
          </div>
        </header>

        <div className="page-body" style={{ padding: "2rem" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "2rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                Discover Your Perfect Style
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                Upload a portrait and our AI will analyze your face shape to recommend hairstyles tailored specifically to you.
              </p>
            </div>

            <div style={{
              background: "var(--bg-elevated)",
              borderRadius: "16px",
              boxShadow: "var(--shadow-modal)",
              padding: "2rem",
              marginBottom: "2rem",
              border: "1px solid var(--border-faint)"
            }}>

              {!selectedFile ? (
                <div
                  style={{
                    border: "2px dashed var(--border-deep)",
                    borderRadius: "12px",
                    padding: "3rem 2rem",
                    textAlign: "center",
                    cursor: "pointer",
                    position: "relative"
                  }}
                  onClick={() => document.getElementById("file-upload").click()}
                >
                  <i className="fas fa-cloud-upload-alt" style={{ fontSize: "3rem", color: "var(--color-accent)", marginBottom: "1rem" }}></i>
                  <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>Upload your photo</h3>
                  <p style={{ color: "var(--text-dim)", margin: 0 }}>JPG, PNG. Max 5MB</p>
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/*"
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxWidth: "300px",
                      borderRadius: "12px",
                      objectFit: "cover",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                  />
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => { setSelectedFile(null); setPreviewUrl(null); setResults(null); }}
                      disabled={loading}
                    >
                      Choose Different Photo
                    </button>
                    {!results && (
                      <button
                        className="btn btn-primary"
                        onClick={handleAnalyze}
                        disabled={loading}
                        style={{ background: "var(--color-accent)", border: "none" }}
                      >
                        {loading ? (
                          <><i className="fas fa-spinner fa-spin" style={{ marginRight: "0.5rem" }}></i> Analyzing...</>
                        ) : (
                          "Analyze Face Shape"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div style={{ padding: "1rem", background: "#fee", color: "#c00", borderRadius: "8px", marginTop: "1rem", border: "1px solid #fcc", textAlign: "center" }}>
                  <i className="fas fa-exclamation-circle"></i> {error}
                </div>
              )}
            </div>

            {results && (
              <div className="results-container" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                  <h3 style={{ color: "var(--text-primary)", fontSize: "1.5rem" }}>Analysis Complete</h3>
                  <div style={{ display: "inline-block", background: "var(--bg-highlight, #f0f7ff)", padding: "0.5rem 1.5rem", borderRadius: "20px", marginTop: "1rem" }}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Face Shape: </span>
                    <span style={{ color: "var(--color-accent)", fontWeight: 700, textTransform: "capitalize" }}>{results.faceShape}</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                  {results.recommendedStyles.map((style) => (
                    <div key={style.id} style={{
                      background: "var(--bg-elevated)",
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: "var(--shadow-card, 0 4px 6px rgba(0,0,0,0.05))",
                      border: "1px solid var(--border-faint)"
                    }}>
                      <div style={{ width: "100%", height: "250px", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {style.previewImage ? (
                          <img
                            src={`data:image/jpeg;base64,${style.previewImage}`}
                            alt={style.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <div style={{ textAlign: "center", color: "var(--text-dim)" }}>
                            <i className="fas fa-image" style={{ fontSize: "3rem", opacity: 0.5, marginBottom: "0.5rem" }}></i>
                            <p>No preview generated</p>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: "1.5rem" }}>
                        <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--text-primary)", fontSize: "1.2rem" }}>{style.name}</h4>
                        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.5 }}>
                          {style.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {results.note && (
                  <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "0.85rem", marginTop: "2rem" }}>
                    * {results.note}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
