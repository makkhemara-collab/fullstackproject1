import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
  } = useCart();

  const subtotal = getCartTotal();
  const tax = subtotal * 0.1; // 10% VAT
  const total = subtotal + tax;

  const handleCheckout = () => {
    navigate("/index/checkout");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-display text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/index" className="flex items-center gap-3 text-blue-600">
            <span className="material-symbols-outlined text-3xl">local_cafe</span>
            <h1 className="text-xl font-bold">ClubCode Café</h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500">My Order ({getCartCount()})</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <h1 className="mb-8 text-3xl font-black text-slate-800">Review Your Order</h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <span className="material-symbols-outlined text-7xl text-slate-300 mb-4">shopping_cart_off</span>
            <h2 className="text-xl font-bold text-slate-600">Your cart is empty</h2>
            <Link to="/index" className="mt-6 rounded-xl bg-blue-600 px-8 py-3 font-bold text-white shadow-lg shadow-blue-200">
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
                <div className="divide-y divide-slate-100">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-6 py-6 first:pt-0 last:pb-0">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link to={`/index/product/${item.prd_id}`} className="text-lg font-bold hover:text-blue-600">
                              {item.name}
                              {/* ☕ YOUR CUSTOMIZATION SNIPPET ADDED HERE ☕ */}
                              {item.customOptions && (
                                <p className="text-xs font-bold text-blue-500 uppercase tracking-tight mt-1">
                                  {item.customOptions.size} • Sugar: {item.customOptions.sugar} • Ice: {item.customOptions.ice}
                                </p>
                              )}
                            </Link>
                          </div>
                          <p className="text-lg font-black text-slate-800">{item.price}</p>
                        </div>
                        
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center rounded-lg border border-slate-200 p-1">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 px-3 hover:bg-slate-50">−</button>
                            <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 px-3 hover:bg-slate-50">+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-sm font-bold text-red-400 hover:text-red-600 flex items-center gap-1">
                            <span className="material-symbols-outlined text-lg">delete_outline</span> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={clearCart} className="text-sm font-bold text-slate-400 hover:text-slate-600 px-4">
                Clear all items
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
                <h2 className="mb-6 text-xl font-bold">Total Bill</h2>
                <div className="space-y-4 border-b border-slate-800 pb-6">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="text-white font-bold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tax (10%)</span>
                    <span className="text-white font-bold">${tax.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-6 flex justify-between text-2xl font-black">
                  <span>Total</span>
                  <span className="text-blue-400">${total.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
                >
                  <span className="material-symbols-outlined">payments</span>
                  Checkout Now
                </button>
                
                <p className="mt-6 text-center text-xs text-slate-500">
                  By clicking checkout, you agree to our <br/> Terms of Service.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;