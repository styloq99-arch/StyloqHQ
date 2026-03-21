import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#121212",
          color: "#f5f5f5",
          fontFamily: "Poppins, sans-serif",
          padding: "2rem",
          textAlign: "center",
        }}>
          <i className="fas fa-exclamation-triangle" style={{ fontSize: "3rem", color: "#FF5722", marginBottom: "1rem" }}></i>
          <h2 style={{ marginBottom: "0.5rem" }}>Something went wrong</h2>
          <p style={{ color: "#aaa", fontSize: "14px", marginBottom: "1.5rem", maxWidth: "400px" }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = "/"; }}
            style={{
              background: "#FF5722",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Go to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
