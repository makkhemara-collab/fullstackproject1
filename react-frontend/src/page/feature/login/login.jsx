import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCoffee, FaLock, FaEnvelope } from "react-line-awesome"; // Or whatever icons you use
import { baseURL } from "../../utils/config";
import { getImagePath } from "../../utils/config";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post(
        `${baseURL}/api/user/login`, // ✅ This will now use the correct -1-dzlc link
        { email, password },
      );
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data)); // Save profile & role

        // Route based on responsibility
        if (response.data.data.role === "barista") {
          navigate("/kitchen");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    }
  };

  return (
    <div
      style={{ display: "flex", height: "100vh", backgroundColor: "#f3f4f6" }}
    >
      {/* Left Side - Branding */}
      <div
        style={{
          flex: 1,
          /* 👇 1. This adds a 50% dark overlay AND your image */
         backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), #475569), url("${getImagePath("differents-types-de-cafe.jpg")}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          ☕ Café CMS
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            opacity: 0.9,
            textShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        >
          Manage your orders, staff, and inventory.
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "2rem",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: "bold",
              marginBottom: "1.5rem",
              color: "#1f2937",
            }}
          >
            Welcome Back
          </h2>

          {error && (
            <div
              style={{
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                padding: "0.75rem",
                borderRadius: "5px",
                marginBottom: "1rem",
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#4b5563",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "5px",
                  border: "1px solid #d1d5db",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#4b5563",
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "5px",
                  border: "1px solid #d1d5db",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#475569",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontSize: "1rem",
                cursor: "pointer",
                fontWeight: "bold",
                marginTop: "0.5rem",
              }}
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
