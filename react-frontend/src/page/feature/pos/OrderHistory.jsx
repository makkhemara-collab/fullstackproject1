import React, { useEffect, useState } from "react";
import request from "../../../utils/request"; 
import { FaCheckCircle, FaClock } from "react-icons/fa";

const OrderHistory = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await request("api/sale", "GET");
      
      // 💡 Let's look at exactly what the backend is sending
      console.log("API Response:", res); 

      if (res) {
        // 🛡️ Safe check: Find the array. 
        // Adjust "res.data" if your array is named something else (like res.sales or res.list)
        if (Array.isArray(res)) {
            setSales(res); 
        } else if (res.data && Array.isArray(res.data)) {
            setSales(res.data); // 👈 Usually, this is the fix!
        } else {
            setSales([]); // Fallback so .map() doesn't crash
        }
      }
    } catch (error) {
      console.error("Error fetching sales history:", error);
      setSales([]); // Fallback on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Sales...</div>;

  return (
    <div className="order-history-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Recent Transactions</h3>
        <button onClick={fetchSales} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>
          Refresh
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', color: '#64748b' }}>
            <tr>
              <th style={{ padding: '20px' }}>Invoice</th>
              <th>Time</th>
              <th>Type</th>
              <th>Method</th>
              <th>Status</th>
              <th style={{ textAlign: 'right', paddingRight: '20px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {sales?.map((sale) => (
              <tr key={sale.sale_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '20px', fontWeight: 'bold' }}>#{sale.invoice_id?.slice(-6)}</td>
                <td>{new Date(sale.created_on).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>{sale.order_type}</td>
                <td>{sale.pay_method}</td>
                <td>
                  <span style={{ color: sale.status === 'Completed' ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', fontSize: '13px' }}>
                    {sale.status === 'Completed' ? <FaCheckCircle /> : <FaClock />} {sale.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right', paddingRight: '20px', fontWeight: '800' }}>
                  ${parseFloat(sale.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderHistory;