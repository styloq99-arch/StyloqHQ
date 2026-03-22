import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SalonSidebar({ activePage }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const links = [
    { to: "/salon-home", icon: "fas fa-home", label: "Home" },
    { to: "/salon-dashboard", icon: "fas fa-tachometer-alt", label: "Dashboard" },
    { to: "/salon-hire", icon: "fas fa-users", label: "Hire Barbers" },
    { to: "/message", icon: "fas fa-comments", label: "Message" },
    { to: "/salon-profile", icon: "fas fa-user-circle", label: "Profile" },
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
      <div className="sidebar-user">
        <img
          src={user?.avatar || "https://i.pravatar.cc/150?img=32"}
          alt="Salon"
          className="user-avatar"
        />
        <div className="user-info">
          <p className="user-name">{user?.full_name || "Salon Owner"}</p>
          <p className="user-status">Salon</p>
        </div>
      </div>
    </aside>
  );
}
