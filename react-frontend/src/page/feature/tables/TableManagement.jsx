import React, { useState, useEffect } from "react";
import axios from "axios";
import { showAlert } from "../../../utils/alert";
import "./tables.css";

const TableManagement = () => {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/tables");
      if (response.data.success) {
        setTables(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching tables");
    }
  };

  const toggleTableStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Available" ? "Occupied" : "Available";
    
    // Update UI instantly
    setTables(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

    // Update Database
    try {
      await axios.put(`http://localhost:3000/api/tables/${id}`, { status: newStatus });
    } catch (error) {
      showAlert("error", "Failed to sync with database");
      fetchTables(); // Revert UI if DB fails
    }
  };

  return (
    <div className="table-container">
      <div className="table-header">
        <div className="title-group">
          <span className="material-symbols-outlined text-3xl">grid_view</span>
          <h1>Table Layout</h1>
        </div>
        <div className="status-legend">
          <div className="legend-item"><span className="dot available"></span> Available</div>
          <div className="legend-item"><span className="dot occupied"></span> Occupied</div>
        </div>
      </div>

      <div className="cafeteria-map">
        <div className="table-grid">
          {tables.map((table) => (
            <div 
              key={table.id} 
              className={`table-box ${table.status.toLowerCase()}`}
              onClick={() => toggleTableStatus(table.id, table.status)}
            >
              <span className="material-symbols-outlined table-icon">
                {table.name.includes("Sofa") ? "weekend" : "deck"}
              </span>
              <div className="table-info">
                <span className="table-name">{table.name}</span>
                <span className="table-status-text">{table.status}</span>
              </div>
              {table.currentOrder && <div className="order-tag">{table.currentOrder}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableManagement;