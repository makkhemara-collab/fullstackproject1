import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Navbar.css";

// 💡 Helper to get the image URL (Matches your assets/upload setup)
const getProfilePic = (photoName) => {
  return photoName 
    ? `https://fullstackproject1-2.onrender.com/assets/upload/${photoName}` 
    : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"; // Default fallback
};

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const profileRef = useRef(null);

  // 1. Get current user data from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // ✅ KEEPING YOUR CRITICAL FIX
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("customer");
    window.location.href = "/login"; 
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h2>Dashboard</h2>
        </div>

        <div className="profile-wrapper" ref={profileRef}>
          <button
            type="button"
            className="profile-trigger"
            onClick={() => setIsOpen((prev) => !prev)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {/* 📸 User Text Info (Shows Name & Role) */}
            <div style={{ textAlign: 'right', marginRight: '5px' }} className="nav-user-info">
              <span style={{ display: 'block', fontWeight: '800', fontSize: '14px', color: '#1e293b' }}>
                {user.fullname || "User"}
              </span>
              <span style={{ display: 'block', fontSize: '11px', color: '#64748b', textTransform: 'capitalize' }}>
                {user.role || "Staff"}
              </span>
            </div>

            {/* 🖼️ Dynamic Profile Image */}
            <img 
              src={getProfilePic(user.photo)} 
              alt="Profile" 
              className="profile-avatar-img"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #22c55e' // Green "Online" indicator
              }}
            />
          </button>

          {isOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header" style={{ padding: '10px 15px', borderBottom: '1px solid #f1f5f9', fontSize: '12px', color: '#94a3b8' }}>
                Logged in as <strong>{user.username}</strong>
              </div>
              <button type="button" className="dropdown-item" onClick={() => navigate("/setting")}>
                Account Settings
              </button>
              <button type="button" className="dropdown-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;