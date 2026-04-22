import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUserPlus, FaUserEdit, FaTrashAlt, FaCamera } from "react-icons/fa";
import { getImagePath } from "../../utils/config";

// 1. Helper for image paths
const getProfilePic = (photoName) => {
  return photoName
    ? `https://fullstackproject1-2.onrender.com/assets/upload/${photoName}`
    : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"; // Fallback avatar
};

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [editId, setEditId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    role: "barista",
    status: "Active",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://fullstackproject1-1-dzlc.onrender.com/api/user",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      setMessage("Failed to load employees.");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      let userId = editId;
      let res;

      // Step A: Save or Update user text data
      if (editId) {
        res = await axios.put(
          `https://fullstackproject1-1-dzlc.onrender.com/api/user`,
          { ...formData, user_id: editId },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } else {
        res = await axios.post(
          "https://fullstackproject1-1-dzlc.onrender.com/api/user",
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        userId = res.data.data?.user_id;
      }

      // Step B: Handle Photo Upload if a file was selected
      if (selectedFile && userId) {
        const photoData = new FormData();
        photoData.append("photo", selectedFile);

        const photoRes = await axios.put(
          `https://fullstackproject1-1-dzlc.onrender.com/api/user/upload-photo/${userId}`,
          photoData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );

        // Step C: Sync LocalStorage if updating YOUR OWN profile
        const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (userId === loggedInUser.user_id) {
          loggedInUser.photo = photoRes.data.photo;
          localStorage.setItem("user", JSON.stringify(loggedInUser));
          window.location.reload();
        }
      }

      setMessage("✅ Staff data and photo updated!");
      resetForm();
      fetchEmployees();
    } catch (error) {
      setMessage(
        "❌ Error: " + (error.response?.data?.message || "Action failed"),
      );
    }
  };

  const resetForm = () => {
    setEditId(null);
    setSelectedFile(null);
    setFormData({
      fullname: "",
      username: "",
      email: "",
      password: "",
      role: "barista",
      status: "Active",
    });
  };

  const handleEdit = (emp) => {
    setEditId(emp.user_id);
    setFormData({
      fullname: emp.fullname,
      username: emp.username,
      email: emp.email,
      password: "",
      role: emp.role,
      status: emp.status,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `https://fullstackproject1-1-dzlc.onrender.com/api/user/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        fetchEmployees();
      } catch (error) {
        setMessage("❌ Failed to delete.");
      }
    }
  };

  const inputStyle = {
    padding: "0.8rem",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
  };
  const buttonStyle = {
    padding: "0.8rem",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    marginTop: "10px",
  };
  const thStyle = {
    padding: "1rem 1.2rem",
    textAlign: "left",
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "600",
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0 }}>
          Staff Directory
        </h2>
        <div style={{ color: "#64748b" }}>
          Total Employees: {employees.length}
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: "1rem",
            marginBottom: "1.5rem",
            backgroundColor: "#eff6ff",
            color: "#1d4ed8",
            borderRadius: "12px",
            fontWeight: "600",
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            padding: "2rem",
            borderRadius: "16px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            height: "fit-content",
            border: "1px solid #f1f5f9",
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            {editId ? "Edit Profile" : "Add New Member"}
          </h3>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <div
                style={{ position: "relative", width: "80px", height: "80px" }}
              >
                <img
                  src={
                    selectedFile
                      ? URL.createObjectURL(selectedFile)
                      : getProfilePic(
                          employees.find((e) => e.user_id === editId)?.photo,
                        )
                  }
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid #e2e8f0",
                  }}
                  alt="Preview"
                />
                <label
                  htmlFor="photo-upload"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: "#4f46e5",
                    color: "white",
                    padding: "6px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    display: "flex",
                  }}
                >
                  <FaCamera size={12} />
                </label>
              </div>
              <input
                id="photo-upload"
                type="file"
                hidden
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
            <input
              type="text"
              name="fullname"
              placeholder="Full Name"
              value={formData.fullname}
              onChange={handleInputChange}
              required
              style={inputStyle}
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              required
              style={inputStyle}
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={inputStyle}
            />
            <input
              type="password"
              name="password"
              placeholder={editId ? "Update password (optional)" : "Password"}
              value={formData.password}
              onChange={handleInputChange}
              required={!editId}
              style={inputStyle}
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              style={inputStyle}
            >
              <option value="barista">Barista</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              style={{ ...buttonStyle, backgroundColor: "#22c55e" }}
            >
              {editId ? "Save Changes" : "Create Account"}
            </button>
            {editId && (
              <button
                onClick={resetForm}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cancel changes
              </button>
            )}
          </form>
        </div>

        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            border: "1px solid #f1f5f9",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#f8fafc" }}>
              <tr>
                <th style={thStyle}>Employee</th>
                <th style={thStyle}>Role</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr
                  key={emp.user_id}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <td
                    style={{
                      padding: "1.2rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <img
                      src={getImagePath(emp.photo)}
                      alt={emp.fullname}
                      style={{
                        width: "45px",
                        height: "45px",
                        borderRadius: "50%",
                      }}
                    />
                  </td>
                  <td style={{ padding: "1.2rem" }}>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        backgroundColor:
                          emp.role === "admin"
                            ? "#fee2e2"
                            : emp.role === "manager"
                              ? "#fef3c7"
                              : "#dcfce7",
                        color:
                          emp.role === "admin"
                            ? "#ef4444"
                            : emp.role === "manager"
                              ? "#d97706"
                              : "#16a34a",
                      }}
                    >
                      {emp.role}
                    </span>
                  </td>
                  <td style={{ padding: "1.2rem", textAlign: "right" }}>
                    <button
                      onClick={() => handleEdit(emp)}
                      style={{
                        marginRight: "15px",
                        color: "#4f46e5",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                      }}
                    >
                      <FaUserEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(emp.user_id)}
                      style={{
                        color: "#ef4444",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                      }}
                    >
                      <FaTrashAlt size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;
