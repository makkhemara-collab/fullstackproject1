import React from "react"; 
import { useNavigate, useSearchParams } from "react-router-dom"; 
import usePos from "./logic";
import { printReceipt } from "../../../utils/printReceipt";
import "./pos.css";
import { getImagePath } from "../../../utils/config"; 
import OrderHistory from "./OrderHistory"; 

// 🌐 Updated Translation Dictionary
const t = {
  EN: { 
    menu: "Menu", items: "items", cart: "Current Order", checkout: "Checkout", 
    table: "Select Table", type: "Order Type", dine: "Dine-In", take: "Takeaway",
    search: "Search drinks...", all: "All Menu", payment: "Payment Summary",
    subtotal: "Subtotal", tax: "Tax", total: "Total", customer: "Customer",
    walkin: "Walk-in Customer", paySuccess: "Payment Successful!", print: "Print Receipt",
    history: "Order History", back: "Back to Menu", dashboard: "Dashboard"
  },
  KH: { 
    menu: "បញ្ជីមុខម្ហូប", items: "មុខ", cart: "ការបញ្ជាទិញ", checkout: "ទូទាត់ប្រាក់", 
    table: "ជ្រើសរើសតុ", type: "ប្រភេទការកម្ម៉ង់", dine: "ញ៉ាំនៅទីនេះ", take: "ខ្ចប់ទៅផ្ទះ",
    search: "ស្វែងរកភេសជ្ជៈ...", all: "មុខម្ហូបទាំងអស់", payment: "សេចក្តីសង្ខេបការទូទាត់",
    subtotal: "សរុប", tax: "ពន្ធ", total: "សរុបរួម", customer: "អតិថិជន",
    walkin: "អតិថិជនទូទៅ", paySuccess: "ការទូទាត់បានជោគជ័យ!", print: "បោះពុម្ពវិក្កយបត្រ",
    history: "ប្រវត្តិនៃការលក់", back: "ត្រឡប់ក្រោយ", dashboard: "ផ្ទាំងគ្រប់គ្រង"
  }
};

const PosPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view") || "menu";

  const {
    cart, search, setSearch, activeCategory, paymentMethod, setPaymentMethod, cashReceived, setCashReceived,
    loading, categories, showPaymentModal, paymentSuccess, 
    orderType, setOrderType, customizingProduct, customOptions, handleOptionChange, confirmAddToCart, 
    cancelCustomization, handleProductClick, filteredProducts, subtotal, tax, total, change,
    handleCategoryClick, updateQty, removeItem, clearCart, fmt, 
    executePaymentAPI, language, setLanguage, selectedTable, setSelectedTable, tables, isRush, setIsRush, closeModal
  } = usePos();

  const cur = t[language || "EN"];

  return (
    <div className="pos-screen" style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* ─── 🛠️ NEW NAVIGATION HEADER ─── */}
      <div className="pos-nav-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '12px 20px', 
        background: '#fff', 
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {/* 🔙 SMART BACK BUTTON */}
          <button 
            onClick={() => {
              if (view === "history") {
                setSearchParams({});
              } else {
                navigate("/dashboard");
              }
            }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', 
              borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', 
              cursor: 'pointer', fontWeight: 'bold', color: '#475569' 
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span> 
            {view === "history" ? cur.back : cur.dashboard}
          </button>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
            {view === "menu" ? "Point of Sale" : cur.history}
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* 🕒 VIEW HISTORY BUTTON */}
          {view === "menu" && (
            <button 
              onClick={() => setSearchParams({ view: "history" })}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', 
                borderRadius: '8px', background: '#f1f5f9', color: '#475569', 
                border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold' 
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>history</span> {cur.history}
            </button>
          )}

          {/* 🇰🇭 Language Toggle */}
          <button 
            onClick={() => setLanguage(language === "EN" ? "KH" : "EN")}
            style={{ background: '#eff6ff', border: '1px solid #dbeafe', color: '#3b82f6', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
          >
            {language === "EN" ? "កម្ពុជា" : "English"}
          </button>
        </div>
      </div>

      {/* ─── 🚀 CONDITIONAL RENDERING ─── */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {view === "menu" ? (
          <div className="pos-main-grid" style={{ height: '100%' }}>
            {/* ─── Products panel ─── */}
            <div className="panel">
              <div className="panel-head">
                <h2>{cur.menu}</h2>
                <div style={{ position: "relative" }}>
                   <span className="material-symbols-outlined" style={{ position: "absolute", left: "12px", top: "10px", color: "#94a3b8", fontSize: "20px" }}>search</span>
                   <input type="text" placeholder={cur.search} value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: "40px" }} />
                </div>
              </div>

              <div className="pos-tabs">
                <button className={activeCategory === "All" ? "active" : ""} onClick={() => handleCategoryClick("All")}>{cur.all}</button>
                {categories.map((cat) => (
                  <button key={cat.code} className={activeCategory !== "All" && activeCategory.code === cat.code ? "active" : ""} onClick={() => handleCategoryClick(cat)}>
                    {cat.desc}
                  </button>
                ))}
              </div>

              <div style={{ flex: 1, overflow: "auto", marginTop: 14 }}>
                {loading ? (
                  <div className="pos-empty">
                     <span className="material-symbols-outlined" style={{ fontSize: '32px', animation: 'spin 1s linear infinite' }}>sync</span>
                     <p>Loading...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <p className="pos-empty">No products found</p>
                ) : (
                  <div className="products-grid">
                    {filteredProducts.map((item) => (
                      <div className="product-card" key={item.prd_id} onClick={() => handleProductClick(item)}>
                        <div className="product-thumb">
                          {item.photo ? (
                            <img src={getImagePath(item.photo)} alt={item.prd_name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
                          ) : (
                            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#cbd5e1' }}>local_cafe</span>
                          )}
                        </div>
                        <h3 style={{ fontSize: language === 'KH' ? '16px' : '14px' }}>{item.prd_name || item.prd_id}</h3>
                        <div className="product-meta"><strong>{fmt(item.unit_cost)}</strong></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ─── Cart panel ─── */}
            <div className="panel">
              <div className="panel-head middle-head">
                <div><h2>{cur.cart}</h2><p>{cart.length} {cur.items}</p></div>
                <button className="icon-clear" title="Clear cart" onClick={clearCart}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                </button>
              </div>
              <div className="cart-scroll">
                {cart.length === 0 ? ( <p className="pos-empty">Cart is empty</p> ) : (
                  cart.map((item) => (
                    <div className="cart-item-card" key={item.cartItemId}>
                      <div className="cart-item-left">
                        <div className="cart-avatar" style={{ background: '#e0f2fe', color: '#2563eb' }}>
                          <span className="material-symbols-outlined">local_cafe</span>
                        </div>
                        <div>
                          <h4>{item.prd_name}</h4>
                          <p style={{ color: "#3b82f6", fontSize: "11px", fontWeight: "bold" }}>
                            {item.customOptions.size} • Sug: {item.customOptions.sugar} • {item.customOptions.ice}
                          </p>
                          <p>{fmt(item.finalPrice)}</p>
                        </div>
                      </div>
                      <div className="cart-item-right">
                        <strong>{fmt(item.finalPrice * item.qty)}</strong>
                        <div className="qty-box">
                          <button onClick={() => updateQty(item.cartItemId, -1)}>−</button>
                          <span>{item.qty}</span>
                          <button onClick={() => updateQty(item.cartItemId, 1)}>+</button>
                        </div>
                        <button className="remove-x" onClick={() => removeItem(item.cartItemId)}>✕</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ─── Payment panel ─── */}
            <div className="panel payment-panel">
              <h2>{cur.payment}</h2>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', background: '#f1f5f9', padding: '6px', borderRadius: '10px' }}>
                <button onClick={() => setOrderType("Dine-in")} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: orderType === "Dine-in" ? '#ffffff' : 'transparent', color: orderType === "Dine-in" ? '#3b82f6' : '#64748b' }}>{cur.dine}</button>
                <button onClick={() => setOrderType("Takeaway")} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: orderType === "Takeaway" ? '#ffffff' : 'transparent', color: orderType === "Takeaway" ? '#3b82f6' : '#64748b' }}>{cur.take}</button>
                <button onClick={() => setIsRush(!isRush)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: isRush ? '#fee2e2' : 'transparent', color: isRush ? '#ef4444' : '#64748b' }}>🔥 RUSH</button>
              </div>

              {orderType === "Dine-in" && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>{cur.table}</label>
                  <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '5px' }}>
                    <option value="">-- {cur.table} --</option>
                    {tables?.map(tab => <option key={tab} value={tab}>{tab}</option>)}
                  </select>
                </div>
              )}

              <div className="amount-list">
                <div><span>{cur.subtotal}</span><strong>{fmt(subtotal)}</strong></div>
                <div><span>{cur.tax} (10%)</span><strong>{fmt(tax)}</strong></div>
              </div>
              <div className="total-row"><span>{cur.total}</span><strong style={{ color: '#3b82f6' }}>{fmt(total)}</strong></div>

              <div className="payment-methods">
                <button className={paymentMethod === "cash" ? "active" : ""} onClick={() => setPaymentMethod("cash")}><span className="material-symbols-outlined">payments</span> Cash</button>
                <button className={paymentMethod === "card" ? "active" : ""} onClick={() => setPaymentMethod("card")}><span className="material-symbols-outlined">credit_card</span> Card</button>
                <button className={paymentMethod === "qr" ? "active" : ""} onClick={() => setPaymentMethod("qr")}><span className="material-symbols-outlined">qr_code_scanner</span> QR</button>
              </div>

              {paymentMethod === "cash" && (
                <div className="cash-box">
                  <label>Cash Received</label>
                  <input type="number" value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} />
                  <div className="change-row"><span>Change</span><strong>{fmt(change >= 0 ? change : 0)}</strong></div>
                </div>
              )}

              <button className="checkout-btn" onClick={executePaymentAPI} style={{ background: '#3b82f6', color: 'white', marginTop: '10px' }}>
                {cur.checkout} — {fmt(total)}
              </button>
            </div>
          </div>
        ) : (
          /* ─── 🕒 ORDER HISTORY VIEW ─── */
          <div style={{ height: '100%', overflow: 'auto', background: '#f8fafc', padding: '20px' }}>
             <OrderHistory /> 
          </div>
        )}
      </div>

      {/* ─── MODALS (CUSTOMIZATION & SUCCESS) ─── */}
      {customizingProduct && (
        <div className="payment-modal-overlay" onClick={cancelCustomization}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header"><h2>Customize Drink</h2><button className="modal-close" onClick={cancelCustomization}>✕</button></div>
            <div className="modal-body" style={{ padding: '20px' }}>
               <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <h3>{customizingProduct.prd_name}</h3>
                  <p style={{ color: '#3b82f6', fontWeight: 'bold' }}>{fmt(customizingProduct.unit_cost)}</p>
               </div>
               <div style={{ marginBottom: '15px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Size</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {["S", "M", "L"].map(s => <button key={s} onClick={() => handleOptionChange("size", s)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `2px solid ${customOptions.size === s ? '#3b82f6' : '#e2e8f0'}`, background: customOptions.size === s ? '#eff6ff' : '#fff', color: customOptions.size === s ? '#3b82f6' : '#64748b', fontWeight: 'bold' }}>{s}</button>)}
                  </div>
               </div>
               <div style={{ marginBottom: '15px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Sugar Level</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {["0%", "50%", "100%"].map(s => <button key={s} onClick={() => handleOptionChange("sugar", s)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `2px solid ${customOptions.sugar === s ? '#3b82f6' : '#e2e8f0'}`, background: customOptions.sugar === s ? '#eff6ff' : '#fff', color: customOptions.sugar === s ? '#3b82f6' : '#64748b', fontWeight: 'bold' }}>{s}</button>)}
                  </div>
               </div>
               <div style={{ marginBottom: '15px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Temperature</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {["Hot", "Iced"].map(temp => (
                      <button key={temp} onClick={() => handleOptionChange("ice", temp)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `2px solid ${customOptions.ice === temp ? '#3b82f6' : '#e2e8f0'}`, background: customOptions.ice === temp ? '#eff6ff' : '#fff', color: customOptions.ice === temp ? '#3b82f6' : '#64748b', fontWeight: 'bold' }}>{temp} {temp === 'Iced' ? '(+$0.50)' : ''}</button>
                    ))}
                  </div>
               </div>
               <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Add Topping (+$0.50)</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {["None", "Boba", "Coffee Jelly", "Cream"].map(top => (
                      <button key={top} onClick={() => handleOptionChange("topping", top)} style={{ flex: 1, minWidth: '80px', padding: '8px', borderRadius: '8px', border: `2px solid ${customOptions.topping === top ? '#3b82f6' : '#e2e8f0'}`, background: customOptions.topping === top ? '#eff6ff' : '#fff', color: customOptions.topping === top ? '#3b82f6' : '#64748b', fontWeight: 'bold', fontSize: '12px' }}>{top}</button>
                    ))}
                  </div>
               </div>
               <button onClick={confirmAddToCart} style={{ width: '100%', padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Add to Order</button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            {paymentSuccess ? (
              <div className="payment-success" style={{ textAlign: 'center', padding: '40px' }}>
                <div className="success-icon" style={{ background: '#10b981', color: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '30px' }}>✓</div>
                <h2>{cur.paySuccess}</h2>
                <p className="success-total" style={{ fontSize: '32px', fontWeight: '900', color: '#1e293b' }}>{fmt(total)}</p>
                <button 
                  onClick={() => printReceipt({ invoice_id: "REPRINT", items: cart, total: total, pay_method: paymentMethod, order_type: orderType, table_id: selectedTable })}
                  style={{ marginTop: '20px', padding: '12px 24px', borderRadius: '8px', border: '2px solid #3b82f6', color: '#3b82f6', background: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '20px auto' }}
                >
                  <span className="material-symbols-outlined">print</span> {cur.print}
                </button>
                <button onClick={closeModal} style={{ marginTop: '15px', color: '#94a3b8', border: 'none', background: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Close Window</button>
              </div>
            ) : (
              <div className="payment-processing" style={{ padding: '40px', textAlign: 'center' }}>
                <div className="processing-spinner"></div>
                <h2 style={{ marginTop: '20px' }}>Processing Payment...</h2>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PosPage;