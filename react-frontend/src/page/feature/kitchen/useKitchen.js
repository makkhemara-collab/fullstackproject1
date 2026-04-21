import { useState, useEffect } from "react";
import request from "../../../utils/request";

export const useKitchen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await request("api/sale", "GET"); // Assuming sales are the orders
      if (response?.success) {
        // We only want orders from "Today" that aren't 'Completed'
        const activeOrders = response.data.filter(o => o.status !== "Completed");
        setOrders(activeOrders);
      }
    } catch (err) {
      console.error("Kitchen Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const timer = setInterval(fetchOrders, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(timer);
  }, []);

  const completeOrder = async (id) => {
    try {
      await request(`api/sale/${id}`, "PUT", { status: "Completed" });
      fetchOrders();
    } catch (err) {
      console.error("Update Error:", err);
    }
  };

  return { orders, loading, completeOrder };
};