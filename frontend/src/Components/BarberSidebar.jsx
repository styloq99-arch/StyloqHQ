import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function BarberSidebar({ activePage }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const links = [
    { to: "/barber-home",       icon: "fas fa-home",         label: "Home" },
    { to: "/barber-dashboard",  icon: "fas fa-chart-bar",    label: "Dashboard" },
    { to: "/message",           icon: "fas fa-comments",     label: "Message" },
    { to: "/barber-OwnProfile", icon: "fas fa-user",         label: "Profile" },
    { to: "/postingPhotos",     icon: "fas fa-plus-square",  label: "New Post" },
  ];

  return (
    <aside className="desktop-sidebar">
      <div className="sidebar-logo">
        <h1 className="brand-title" style={{ fontSize: "40px" }}>StyloQ</h1>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`sidebar-link${activePage === link.label ? " active" : ""}`}
          >
            <i className={link.icon}></i> <span>{link.label}</span>
          </Link>
        ))}
        <button
          className="sidebar-link"
          onClick={handleLogout}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#FF5722",
            width: "100%",
            textAlign: "left",
            padding: "12px 16px",
            marginTop: "auto",
          }}
        >
          <i className="fas fa-sign-out-alt"></i> <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
}
