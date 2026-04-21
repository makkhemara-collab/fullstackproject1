import React, { useEffect, useState } from "react";
import request from "../../utils/request";
import "./home.css";
import { getImagePath } from "../../utils/config";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    const [prodRes, catRes] = await Promise.all([
      request("api/product", "GET"),
      request("api/category", "GET"),
    ]);
    if (prodRes?.success) setProducts(prodRes.data);
    if (catRes?.success) setCategories(catRes.data);
  };

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category_id === activeCategory);

  return (
    <div className="menu-container">
      {/* Hero Section */}
      <header className="menu-hero">
        <div className="hero-content">
          <h1>CLUBCODE CAFÉ</h1>
          <p>Handcrafted Coffee & Artisanal Pastries</p>
          <div className="search-bar">
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="Search your favorite drink..." />
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="category-scroller">
        <button
          className={activeCategory === "All" ? "active" : ""}
          onClick={() => setActiveCategory("All")}
        >
          All Items
        </button>
        {categories.map((cat) => (
          <button
            key={cat.code}
            className={activeCategory === cat.code ? "active" : ""}
            onClick={() => setActiveCategory(cat.code)}
          >
            {cat.desc}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="menu-grid">
        {filteredProducts.map((item) => (
          <div key={item.prd_id} className="menu-card">
            <div className="item-image-wrapper">
              <img src={getImagePath(item.photo)} alt={item.prd_name} />
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=500"; }}
              <button className="add-quick-btn">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <div className="item-details">
              <h3>{item.prd_name}</h3>
              <p className="item-desc">
                {item.remark || "Freshly brewed and served hot or iced."}
              </p>
              <div className="item-footer">
                <span className="price">${item.unit_price}</span>
                <span className="stock-tag">
                  {item.qty > 0 ? "In Stock" : "Sold Out"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
