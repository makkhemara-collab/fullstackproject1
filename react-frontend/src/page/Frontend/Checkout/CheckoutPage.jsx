import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import { showAlert } from "../../../utils/alert";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState("pickup"); // pickup or dine-in

  const subtotal = getCartTotal();
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      showAlert("success", "Order placed! Head to the counter in 10 minutes.");
      clearCart();
      navigate("/index");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 font-display">
      <div className="container mx-auto max-w-5xl px-6">
        <h1 className="mb-8 text-3xl font-black text-slate-800">Finalize Your Order</h1>
        
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Order Details */}
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
              <h2 className="mb-6 text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">instruction</span>
                Order Options
              </h2>
              
              <div className="flex gap-4 mb-8">
                <button 
                  type="button"
                  onClick={() => setOrderType("pickup")}
                  className={`flex-1 p-4 rounded-2xl border-2 font-bold transition-all ${orderType === 'pickup' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}>
                  🛍️ Takeaway
                </button>
                <button 
                  type="button"
                  onClick={() => setOrderType("dine-in")}
                  className={`flex-1 p-4 rounded-2xl border-2 font-bold transition-all ${orderType === 'dine-in' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}>
                  ☕ Dine-In
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Pickup/Arrival Time</label>
                  <select className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-500">
                    <option>ASAP (10-15 mins)</option>
                    <option>In 30 minutes</option>
                    <option>In 1 hour</option>
                  </select>
                </div>
                {orderType === "dine-in" && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Table Number (If already seated)</label>
                    <input type="text" placeholder="e.g. T-05" className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-500" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Special Notes</label>
                  <textarea placeholder="e.g. Extra napkins, please!" className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-500" rows="3"></textarea>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
              <h2 className="mb-6 text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">account_balance_wallet</span>
                Payment Method
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 cursor-pointer">
                  <input type="radio" name="pay" defaultChecked className="w-5 h-5 text-blue-600" />
                  <span className="font-bold">Pay at Counter</span>
                </label>
                <label className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 cursor-pointer opacity-50">
                  <input type="radio" name="pay" disabled className="w-5 h-5" />
                  <span className="font-bold">KHQR (Coming Soon)</span>
                </label>
              </div>
            </div>
          </form>

          {/* Right: Summary */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
              <h2 className="mb-6 text-xl font-bold">Order Summary</h2>
              <div className="space-y-4 max-h-60 overflow-auto mb-6 pr-2">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{item.quantity}x {item.name}</p>
                      <p className="text-xs text-blue-500 font-bold uppercase">{item.customOptions?.size} | {item.customOptions?.sugar}</p>
                    </div>
                    <span className="font-bold text-slate-600">{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-500"><span>VAT (10%)</span><span>${tax.toFixed(2)}</span></div>
                <div className="flex justify-between text-xl font-black text-slate-900 pt-2">
                  <span>Total</span>
                  <span className="text-blue-600">${total.toFixed(2)}</span>
                </div>
              </div>
              <button 
                onClick={handlePlaceOrder}
                disabled={loading}
                className="mt-8 w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all disabled:opacity-50">
                {loading ? "Processing..." : "Confirm & Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;