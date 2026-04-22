import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import request from "../utils/request";
import { showAlert } from "../utils/alert";

const ReportsPage = () => {
  const location = useLocation();
  
  const getInitialTab = () => {
    const path = location.pathname;
    if (path.includes("/reports/sales")) return "sales";
    if (path.includes("/reports/inventory")) return "inventory";
    if (path.includes("/reports/customer")) return "customers";
    return "sales";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [loading, setLoading] = useState(false);
  
  const [salesData, setSalesData] = useState({ data: [], summary: {} });
  const [inventoryData, setInventoryData] = useState([]);
  const [inventorySummary, setInventorySummary] = useState({});
  const [customerStats, setCustomerStats] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]); // Used as Suppliers in Café context
  
  const [period, setPeriod] = useState("daily");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  useEffect(() => {
    fetchReportData();
    fetchFilters();
  }, [activeTab, period]);

  const fetchFilters = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        request("/api/category", "GET"),
        request("/api/brand", "GET"),
      ]);
      if (catRes?.success) setCategories(catRes.data || []);
      if (brandRes?.success) setBrands(brandRes.data || []);
    } catch (error) {
      console.error("Filters Error:", error);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case "sales":
          const [salesRes, paymentRes] = await Promise.all([
            request(`api/report/sales?period=${period}`, "GET"),
            request("/api/report/sales/payment-methods", "GET"),
          ]);
          if (salesRes?.success) setSalesData(salesRes);
          if (paymentRes?.success) setPaymentMethods(paymentRes.data);
          break;
        case "inventory":
          const [invRes, productsRes] = await Promise.all([
            request("/api/report/inventory", "GET"),
            request("/api/product", "GET"),
          ]);
          if (invRes?.success) setInventorySummary(invRes.data);
          if (productsRes?.success) setInventoryData(productsRes.data || []);
          break;
        case "customers":
          const custRes = await request("/api/report/customers", "GET");
          if (custRes?.success) setCustomerStats(custRes.data);
          break;
      }
    } catch (error) {
      console.error("Report Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (v) => `$${Number(v || 0).toFixed(2)}`;
  const formatDate = (d) => (!d || d === "0000-00-00") ? "-" : new Date(d).toLocaleDateString();

  const getStockStatus = (qty) => {
    if (qty <= 0) return { label: "OUT OF STOCK", color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" };
    if (qty < 15) return { label: "LOW STOCK", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" };
    return { label: "AVAILABLE", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" };
  };

  const filteredInventory = inventoryData.filter((item) => {
    const matchSearch = !searchTerm || item.prd_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !selectedCategory || item.category_id === selectedCategory;
    const matchBrand = !selectedBrand || item.brand_id === selectedBrand;
    return matchSearch && matchCategory && matchBrand;
  });

  const styles = {
    container: { padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh" },
    tabBtn: (active) => ({
      padding: "12px 24px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700",
      backgroundColor: active ? "#3b82f6" : "#fff", color: active ? "#fff" : "#64748b",
      boxShadow: active ? "0 4px 12px rgba(59,130,246,0.3)" : "none", marginRight: "10px", transition: "0.2s"
    }),
    card: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }
  };

  return (
    <div style={styles.container}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
        <h1 style={{ color: "#1e293b", fontSize: "24px", fontWeight: "800" }}>Café Analytics</h1>
        <button onClick={() => window.print()} style={{ background: "#1e293b", color: "#fff", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>
           Print Report
        </button>
      </div>

      <div style={{ marginBottom: "25px" }}>
        {["sales", "inventory", "customers"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={styles.tabBtn(activeTab === t)}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? <p>Loading Café Data...</p> : (
        <div style={{ display: "grid", gap: "25px" }}>
          {/* SALES VIEW */}
          {activeTab === "sales" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
                <div style={styles.card}><h5>Total Revenue</h5><h2 style={{color: "#3b82f6"}}>{formatCurrency(salesData.summary?.totalSales)}</h2></div>
                <div style={styles.card}><h5>Orders Count</h5><h2>{salesData.summary?.totalOrders || 0}</h2></div>
                <div style={styles.card}><h5>Daily Average</h5><h2>{formatCurrency(salesData.summary?.averageOrderValue)}</h2></div>
                <div style={styles.card}><h5>Active Methods</h5><h2>{paymentMethods.length}</h2></div>
              </div>
              <div style={styles.card}>
                 <h3 style={{marginBottom: "15px"}}>Order History by {period}</h3>
                 <table className="category-table">
                    <thead><tr><th>#</th><th>Date</th><th>Orders</th><th>Revenue</th></tr></thead>
                    <tbody>
                      {salesData.data?.map((item, i) => (
                        <tr key={i}><td>{i+1}</td><td>{item.date}</td><td>{item.orders}</td><td style={{color: "#10b981", fontWeight: "bold"}}>{formatCurrency(item.sales)}</td></tr>
                      ))}
                    </tbody>
                 </table>
              </div>
            </>
          )}

          {/* INVENTORY VIEW */}
          {activeTab === "inventory" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                <div style={styles.card}><h5>Total Menu Items</h5><h2>{inventorySummary.totalProducts || 0}</h2></div>
                <div style={styles.card}><h5>Total Units in Stock</h5><h2>{inventorySummary.totalStock || 0}</h2></div>
                <div style={styles.card}><h5>Asset Value</h5><h2 style={{color: "#10b981"}}>{formatCurrency(inventorySummary.totalValue)}</h2></div>
              </div>
              <div style={styles.card}>
                 <h3>Stock Levels</h3>
                 <table className="category-table">
                    <thead><tr><th>Drink/Item</th><th>Category</th><th>Supplier</th><th>Stock Qty</th><th>Status</th></tr></thead>
                    <tbody>
                      {filteredInventory.map((item, i) => {
                        const s = getStockStatus(item.qty);
                        return (
                          <tr key={i}>
                            <td><strong>{item.prd_name}</strong></td>
                            <td>{item.category_id}</td>
                            <td>{item.brand_id}</td>
                            <td>{item.qty}</td>
                            <td><span className="status-badge" style={{backgroundColor: s.bg, color: s.color, border: `1px solid ${s.color}`}}>{s.label}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                 </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;