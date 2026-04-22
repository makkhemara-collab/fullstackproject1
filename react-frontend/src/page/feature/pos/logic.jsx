import { useState, useEffect, useMemo } from "react";
import request from "../../../utils/request";
import { printReceipt } from "../../../utils/printReceipt";

const usePos = () => {
  // ... (previous states: products, cart, search, etc.)
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardDetails, setCardDetails] = useState({ cardNumber: "", cardHolder: "", expiryDate: "", cvv: "" });

  // ☕ CAFÉ ENHANCEMENTS ☕
  const [orderType, setOrderType] = useState("Dine-in");
  const [isRush, setIsRush] = useState(false);
  const [selectedTable, setSelectedTable] = useState(""); // Requirement 3.4
  const [language, setLanguage] = useState("EN"); // Requirement 4.3 (EN/KH)
  const [customizingProduct, setCustomizingProduct] = useState(null);
  const [customOptions, setCustomOptions] = useState({ size: "M", sugar: "100%", ice: "Normal", topping: "None" });
  const [tables, setTables] = useState(["T-01", "T-02", "T-03", "T-04", "T-05", "Sofa-01"]);

  // ... (previous useEffects and handlers)
  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await request("/api/product", "GET");
      if (response.success) setProducts(response.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const response = await request("/api/category", "GET");
      if (response.success) setCategories(response.data);
    } catch (error) {}
  };

  const filteredProducts = useMemo(() => {
    let list = products;
    if (activeCategory !== "All") list = list.filter((p) => p.category_id === activeCategory.code);
    if (search.trim()) {
      const kw = search.toLowerCase();
      list = list.filter((p) => (p.prd_name?.toLowerCase().includes(kw)) || (p.prd_id?.toLowerCase().includes(kw)));
    }
    return list;
  }, [products, activeCategory, search]);

  const handleProductClick = (product) => {
    setCustomizingProduct(product);
    setCustomOptions({ size: "M", sugar: "100%", ice: "Normal" });
  };

const confirmAddToCart = () => {
    let sizeModifier = 0;
    
    // Size math
    if (customOptions.size === "L") sizeModifier = 0.50;
    if (customOptions.size === "S") sizeModifier = -0.50;
    
    // Topping math
    if (customOptions.topping !== "None") sizeModifier += 0.50; 

    // 🔥 NEW: Ice math! (+0.50 for Iced)
    if (customOptions.ice === "Iced") {
        sizeModifier += (customizingProduct.iced_cost || 0.50); 
    }

    const finalPrice = Math.max(0, customizingProduct.unit_cost + sizeModifier);
    const cartItemId = `${customizingProduct.prd_id}-${customOptions.size}-${customOptions.sugar}-${customOptions.ice}-${customOptions.topping}`;

    setCart((prev) => {
      const exists = prev.find((c) => c.cartItemId === cartItemId);
      if (exists) return prev.map((c) => c.cartItemId === cartItemId ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...customizingProduct, cartItemId, finalPrice, qty: 1, customOptions }];
    });
    setCustomizingProduct(null);
  };

const executePaymentAPI = async () => {
    // Validation for Table
    if (orderType === "Dine-in" && !selectedTable) {
      return alert(language === "EN" ? "Please select a table!" : "សូមជ្រើសរើសតុ!");
    }

    try {
      setProcessing(true);
      
      // Calculate total once so we don't repeat code
      const totalAmount = cart.reduce((s, c) => s + c.finalPrice * c.qty, 0);

      const saleData = {
        invoice_id: `INV-${Date.now()}`,
        amount: totalAmount,
        sub_total: totalAmount, 
        tax: 0,                 
        order_type: orderType,
        table_id: selectedTable,
        pay_method: paymentMethod.toUpperCase(), // 🚨 CRITICAL FIX: Adds .toUpperCase()
        is_rush: isRush,
        create_by: "Barista", // 👈 Fallback name so the DB doesn't crash on null
        items: cart.map(i => ({ 
           prd_id: i.prd_id, 
           prd_name: i.prd_name, 
           qty: i.qty, 
           price: i.finalPrice,
           customOptions: i.customOptions 
        }))
      };

      await request("/api/sale", "POST", saleData);

      setProcessing(false);
      setPaymentSuccess(true);

     // 🖨️ AUTO-PRINT RECEIPT 🖨️
      printReceipt({
        ...saleData,
        customer_name: "Walk-in Customer",
        total: saleData.amount
      });

    } catch (error) {
      setProcessing(false);
      console.error("🚨 Checkout Crash Details:", error); 
      alert("Payment failed. Please check your backend terminal for the exact error!");
    }
  };

  const fmt = (v) => `$${Number(v || 0).toFixed(2)}`;

  return {
    products, cart, search, setSearch, activeCategory, paymentMethod, setPaymentMethod, cashReceived, setCashReceived,
    loading, categories, showPaymentModal, processing, paymentSuccess, showCardModal, cardDetails,
    orderType, setOrderType, selectedTable, setSelectedTable, tables, language, setLanguage,
    customizingProduct, customOptions, handleOptionChange: (t, v) => setCustomOptions(p => ({...p, [t]: v})), 
    confirmAddToCart, cancelCustomization: () => setCustomizingProduct(null), handleProductClick,
    filteredProducts, total: cart.reduce((s, c) => s + c.finalPrice * c.qty, 0),
    handleCategoryClick: (c) => setActiveCategory(c), updateQty: (id, d) => setCart(prev => prev.map(c => c.cartItemId === id ? {...c, qty: c.qty + d} : c).filter(c => c.qty > 0)),
    removeItem: (id) => setCart(p => p.filter(c => c.cartItemId !== id)), clearCart: () => setCart([]), 
    handleCheckout: () => (cart.length > 0 && setShowPaymentModal(true)), closeModal: () => (!processing && setShowPaymentModal(false)), fmt, executePaymentAPI, isRush, setIsRush
  };
};

export default usePos;