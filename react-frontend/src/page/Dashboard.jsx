import React, { useEffect, useState } from "react";
import request from "../utils/request";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { Chart, Pie, Line } from "react-chartjs-2"; // 👈 ADDED 'Line' HERE
import { FaCoffee, FaUtensils, FaUsers, FaMoneyBillWave } from "react-icons/fa";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [dailyData, setDailyData] = useState([]); // 👈 NEW: State for the line chart
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all 3 APIs at the same time
        const [dashRes, invRes, dailyRes] = await Promise.all([
          request("/api/report/dashboard", "GET"),
          request("/api/report/inventory", "GET"),
          request("/api/report/sale/daily", "GET"), // 👈 NEW: Fetching daily chart data
        ]);

        if (dashRes?.success) setStats(dashRes.data);
        if (invRes?.success) setCategoryData(invRes.data.byCategory || []);
        if (dailyRes?.success) setDailyData(dailyRes.data || []);

      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // --- CHART CONFIGURATIONS ---
  const pieChartData = {
    labels: categoryData.map(c => c.category),
    datasets: [{
      data: categoryData.map(c => c.count),
      backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
      hoverOffset: 10,
    }],
  };

  const lineChartData = {
    labels: dailyData.map(d => `Day ${d.day}`),
    datasets: [
      {
        label: 'Daily Revenue ($)',
        data: dailyData.map(d => d.totalAmount),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4, // Gives the line that smooth curved look!
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { 
        y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
        x: { grid: { display: false } }
    }
  };

  if (loading) return <div className="loading" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Updating Café Stats...</div>;

  return (
    <div className="page-container" style={{ padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '25px', color: '#1e293b' }}>Café Overview</h1>
      
      {/* 4 Quick Stat Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="stat-card" style={{ background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #3b82f6' }}>
          <FaMoneyBillWave style={{ color: '#3b82f6', fontSize: '20px' }} />
          <h3 style={{ margin: '10px 0 5px', fontSize: '13px', color: '#64748b' }}>TOTAL REVENUE</h3>
          <p style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>${stats?.totalSales || "0.00"}</p>
        </div>
        <div className="stat-card" style={{ background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #10b981' }}>
          <FaCoffee style={{ color: '#10b981', fontSize: '20px' }} />
          <h3 style={{ margin: '10px 0 5px', fontSize: '13px', color: '#64748b' }}>TOTAL DRINKS</h3>
          <p style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>{stats?.totalProducts || 0}</p>
        </div>
        <div className="stat-card" style={{ background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #f59e0b' }}>
          <FaUtensils style={{ color: '#f59e0b', fontSize: '20px' }} />
          <h3 style={{ margin: '10px 0 5px', fontSize: '13px', color: '#64748b' }}>PENDING ORDERS</h3>
          <p style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>{stats?.pendingOrders || 0}</p>
        </div>
        <div className="stat-card" style={{ background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #ef4444' }}>
          <FaUsers style={{ color: '#ef4444', fontSize: '20px' }} />
          <h3 style={{ margin: '10px 0 5px', fontSize: '13px', color: '#64748b' }}>CUSTOMERS</h3>
          <p style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>{stats?.totalCustomers || 0}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
        
        {/* 🚨 NEW: The Line Chart rendering! */}
        <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px', color: '#1e293b' }}>Sales Trend (Daily)</h3>
          <div style={{ height: '300px' }}>
             {dailyData.length > 0 ? (
                 <Line data={lineChartData} options={lineChartOptions} />
             ) : (
                 <p style={{ textAlign: 'center', color: '#94a3b8', paddingTop: '100px' }}>No sales data for this month yet.</p>
             )}
          </div>
        </div>
        
        <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px', color: '#1e293b' }}>Menu Distribution</h3>
          <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
            {categoryData.length > 0 ? <Pie data={pieChartData} options={{ maintainAspectRatio: false }} /> : <p style={{ color: '#94a3b8', marginTop: '100px' }}>No category data</p>}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '18px', color: '#1e293b' }}>Recent Transactions</h3>
        
        {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '14px' }}>
                <th style={{ padding: '12px 0' }}>Invoice ID</th>
                <th>Type</th>
                <th>Payment</th>
                <th>Time</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTransactions.map((tx) => (
                <tr key={tx.sale_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '15px 0', fontWeight: 'bold', color: '#334155' }}>#{tx.invoice_id?.slice(-6) || tx.sale_id.slice(-6)}</td>
                  
                  <td>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                      backgroundColor: tx.order_type === 'Dine-in' ? '#eff6ff' : tx.order_type === 'Takeaway' ? '#fef3c7' : '#dcfce3',
                      color: tx.order_type === 'Dine-in' ? '#3b82f6' : tx.order_type === 'Takeaway' ? '#d97706' : '#16a34a'
                    }}>
                      {tx.order_type || 'POS'}
                    </span>
                  </td>
                  
                  <td style={{ color: '#64748b' }}>{tx.pay_method}</td>
                  <td style={{ color: '#64748b', fontSize: '13px' }}>
                    {new Date(tx.created_on).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: '#1e293b' }}>
                    ${parseFloat(tx.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>No recent transactions found.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;