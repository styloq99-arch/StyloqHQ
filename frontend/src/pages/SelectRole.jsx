import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createUserWithRole } from "../api/supabaseDb";

export default function SelectRole() {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    needsRoleSelection,
    completeOAuthOnboarding,
    getRoleRedirect,
    loading: authLoading,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already fully authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(getRoleRedirect(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate, getRoleRedirect]);

  // Redirect to signin if not in role-selection flow
  useEffect(() => {
    if (!authLoading && !needsRoleSelection && !isAuthenticated) {
      navigate("/signin", { replace: true });
    }
  }, [authLoading, needsRoleSelection, isAuthenticated, navigate]);

  const handleSelectRole = async (role) => {
    setError("");
    setLoading(true);

    try {
      const { user: dbUser, error: dbError } = await createUserWithRole({
        email: user.email,
        fullName: user.full_name || user.email.split("@")[0],
        role,
        supabaseUid: user.supabase_uid,
      });

      if (dbError) {
        if (dbError.code === "23505") {
          setError(
            "An account with this email already exists. Redirecting to sign in...",
          );
          setTimeout(() => navigate("/signin"), 2000);
          return;
        }
        setError(
          dbError.message || "Failed to create account. Please try again.",
        );
        return;
      }

      completeOAuthOnboarding(dbUser);
      navigate(getRoleRedirect(role), { replace: true });
    } catch (err) {
      console.error("[SelectRole] Error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      key: "client",
      label: "Customer",
      description:
        "Book appointments, browse barbers, and manage your grooming schedule",
      icon: "fas fa-user",
    },
    {
      key: "barber",
      label: "Barber",
      description:
        "Manage your portfolio, accept bookings, and grow your client base",
      icon: "fas fa-cut",
    },
    {
      key: "salon",
      label: "Salon Owner",
      description:
        "Manage your salon, barbers, and track business performance",
      icon: "fas fa-store",
    },
  ];

  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#121212",
          color: "#f5f5f5",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* LEFT SIDE */}
      <div className="visual-side">
        <img src="src/assets/images/login-bg.png" alt="StyloQ" />
        <div className="visual-overlay"></div>
        <div className="gradient-mask"></div>
        <div className="brand-content">
          <h1 className="brand-title">StyloQ</h1>
          <p className="brand-tagline">Connecting grooming independence</p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div
        className="content-side"
        style={{ justifyContent: "flex-start", paddingTop: "8vh" }}
      >
        <div className="brand-content">
          <h1 className="brand-title">StyloQ</h1>
        </div>

        <div className="step-progress">
          <h1 className="step-title">Welcome to StyloQ!</h1>
          <p className="step-subtitle">
            Choose how you'd like to use the platform
          </p>
          {user?.email && (
            <p
              style={{
                color: "#aaa",
                fontSize: "13px",
                marginTop: "4px",
              }}
            >
              Signed in as{" "}
              <span style={{ color: "#FF5722" }}>{user.email}</span>
            </p>
          )}
        </div>

        {error && (
          <div
            style={{
              color: "#FF5722",
              backgroundColor: "rgba(255, 87, 34, 0.1)",
              padding: "10px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "20px",
              textAlign: "center",
              maxWidth: "440px",
              width: "100%",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            width: "100%",
            maxWidth: "440px",
            marginBottom: "40px",
          }}
        >
          {roles.map((r) => (
            <button
              key={r.key}
              onClick={() => handleSelectRole(r.key)}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "20px 24px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                cursor: loading ? "not-allowed" : "pointer",
                textAlign: "left",
                color: "#f5f5f5",
                transition: "all 0.2s ease",
                opacity: loading ? 0.6 : 1,
                fontFamily: "Poppins, sans-serif",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background =
                    "rgba(255, 87, 34, 0.15)";
                  e.currentTarget.style.borderColor = "#FF5722";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor =
                  "rgba(255, 255, 255, 0.1)";
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "rgba(255, 87, 34, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i
                  className={r.icon}
                  style={{ fontSize: "20px", color: "#FF5722" }}
                ></i>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                >
                  Continue as {r.label}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#aaa",
                    lineHeight: "1.4",
                  }}
                >
                  {r.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        {loading && (
          <p style={{ color: "#aaa", fontSize: "14px" }}>
            Setting up your account...
          </p>
        )}
      </div>
    </div>
  );
}
