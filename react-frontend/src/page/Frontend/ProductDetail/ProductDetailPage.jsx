import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import request from "../../../utils/request";

const API_BASE_URL = "http://localhost:3000";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=500";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getCartCount } = useCart();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [options, setOptions] = useState({ size: "M", sugar: "100%", ice: "Normal" });
  const [quantity, setQuantity] = useState(1);
  const [showAdded, setShowAdded] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        const response = await request(`api/product/${id}`, "GET");
        if (response?.data) setProduct(response.data);
      } catch (error) { console.error(error); }
      finally { setIsLoading(false); }
    };
    loadProduct();
  }, [id]);

  const handleAdd = () => {
    // Calculate price based on size (+$0.50 for Large, -$0.50 for Small)
    let finalPrice = product.unit_cost;
    if (options.size === "L") finalPrice += 0.50;
    if (options.size === "S") finalPrice -= 0.50;

    const cartItem = {
      ...product,
      id: `${product.prd_id}-${options.size}-${options.sugar}-${options.ice}`,
      name: product.prd_name,
      price: `$${finalPrice.toFixed(2)}`,
      customOptions: options,
      image: product.photo ? `${API_BASE_URL}${product.photo}` : FALLBACK_IMAGE
    };

    addToCart(cartItem, quantity);
    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 3000);
  };

  if (isLoading) return <div className="loading">Loading Drink Details...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-display text-slate-900">
      <div className="container mx-auto px-4 py-12">
        <Link to="/index" className="mb-8 inline-flex items-center text-blue-600 hover:underline">
          <span className="material-symbols-outlined mr-2">arrow_back</span> Back to Menu
        </Link>

        <div className="grid gap-12 lg:grid-cols-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          {/* Image */}
          <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
            <img 
              src={product?.photo ? `${API_BASE_URL}${product.photo}` : FALLBACK_IMAGE} 
              className="h-full w-full object-cover" 
              alt={product?.prd_name} 
            />
          </div>

          {/* Selection Info */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-800">{product?.prd_name}</h1>
              <p className="mt-2 text-2xl font-bold text-blue-600">${product?.unit_cost.toFixed(2)}</p>
            </div>

            <hr className="border-slate-100" />

            {/* Size Choice */}
            <div>
              <p className="mb-3 font-bold text-slate-700">Select Size</p>
              <div className="flex gap-3">
                {["S", "M", "L"].map(s => (
                  <button key={s} onClick={() => setOptions({...options, size: s})}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${options.size === s ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 bg-white text-slate-400'}`}>
                    {s} {s === 'L' ? '(+$0.50)' : s === 'S' ? '(-$0.50)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Sugar Choice */}
            <div>
              <p className="mb-3 font-bold text-slate-700">Sugar Level</p>
              <div className="flex gap-3">
                {["0%", "50%", "100%"].map(s => (
                  <button key={s} onClick={() => setOptions({...options, sugar: s})}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${options.sugar === s ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 bg-white text-slate-400'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto flex items-center gap-4 pt-6">
              <div className="flex items-center rounded-xl border-2 border-slate-100 p-1">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-slate-50">-</button>
                <span className="w-8 text-center font-bold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:bg-slate-50">+</button>
              </div>
              <button 
                onClick={handleAdd}
                className="flex-1 bg-blue-600 py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">
                Add to Cart
              </button>
            </div>

            {showAdded && (
              <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-center gap-3 animate-bounce">
                <span className="material-symbols-outlined">check_circle</span>
                Added to your order! <Link to="/index/cart" className="underline font-bold">View Cart</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;