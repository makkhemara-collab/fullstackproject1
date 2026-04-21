import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { showAlert } from "../utils/alert";
import "../style/Layout.css";

const Layout = () => {
  const navigate = useNavigate();

  // Parse user data from localStorage safely
  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    // 🛡️ SECURITY CHECK: If no token or user data, kick to login
    if (!token || !user) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // ⏱️ SESSION MANAGEMENT: 15-minute auto-logout
    const inactivityLimit = 15 * 60 * 1000;
    let inactivityTimeout;

    const logoutByInactivity = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // Also clear user data
      showAlert("warning", "Session expired. Please login again.");
      navigate("/login", { replace: true });
    };

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(logoutByInactivity, inactivityLimit);
    };

    const activityEvents = [
      "mousemove", "mousedown", "keydown", "scroll", "touchstart",
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimer);
    });

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimeout);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetInactivityTimer);
      });
    };
  }, [navigate]);

   return (
    <div className="app-container">
      <div className="main-layout">
        {/* Pass user data to Sidebar if needed for the bottom profile link */}
        <Sidebar user={userData} />
        
        <div className="content-area">
          {/* Pass user data to Navbar for the top-right profile circle */}
          <Navbar user={userData} />
          
          <div className="page-content">
             <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;