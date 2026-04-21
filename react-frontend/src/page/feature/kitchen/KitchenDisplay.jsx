import React from "react";
import { useKitchen } from "./useKitchen";
import "./kitchen.css";

const KitchenDisplay = () => {
  const { orders, loading, completeOrder } = useKitchen();

  return (
    <div className="kitchen-wrapper">
      <header className="kitchen-nav">
        <div className="kitchen-logo">
          <span className="material-symbols-outlined">coffee_maker</span>
          <h1>BARISTA STATION</h1>
        </div>
        <div className="order-stats">
          <span>Active Orders: <strong>{orders.length}</strong></span>
        </div>
      </header>

      {loading ? (
        <div className="kitchen-loading">Syncing with POS...</div>
      ) : (
        <div className="order-grid">
          {orders.map((order) => (
            <div key={order.sale_id} className="order-ticket" style={{ border: order.is_rush ? '3px solid #ef4444' : 'none' }}>
              {/* 🔥 RUSH UPGRADE: Red border and header if rushed */}
              
              <div className="ticket-header" style={{ background: order.is_rush ? '#ef4444' : '#3b82f6' }}>
                <span className="ticket-number">
                  {order.is_rush && "🔥 "}#{order.invoice_id?.slice(-4)}
                </span>
                <span className={`type-tag ${order.order_type?.toLowerCase()}`}>
                  {order.order_type}
                </span>
              </div>
              
              <div className="ticket-meta">
                <span className="table-no">{order.table_id || "TAKEAWAY"}</span>
                <span className="time">{new Date(order.created_on).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div className="items-area">
                {order.saleItems?.map((item, idx) => (
                  <div key={idx} className="ticket-item">
                    <div className="item-row">
                      <span className="item-qty">{item.qty}x</span>
                      <span className="item-name">{item.prd_name}</span>
                    </div>
                    <div className="item-mods">
                      <span>SIZE: {item.size}</span>
                      <span>SUGAR: {item.sugar}</span>
                      <span>ICE: {item.ice}</span>
                      {/* 🧋 TOPPINGS UPGRADE: Show topping if they ordered one */}
                      {item.topping && item.topping !== 'None' && (
                         <span style={{ color: '#ef4444', fontWeight: '900' }}>+ {item.topping}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button 
                className="btn-complete" 
                onClick={() => completeOrder(order.sale_id)}
              >
                DONE
              </button>
            </div>
          ))}
          
          {orders.length === 0 && (
            <div className="empty-state">
              <span className="material-symbols-outlined">check_circle</span>
              <p>Queue is clear! Take a break.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KitchenDisplay;