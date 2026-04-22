import React, { useState, useEffect } from "react";
import request from "../../../utils/request";
import { showAlert, showConfirm } from "../../../utils/alert";
import { Box, InputLabel, MenuItem, FormControl, Select } from "@mui/material";
import "../../feature/category/category.css";
import { getImagePath } from "../../../utils/config";

const emptyForm = {
  prd_id: "", prd_name: "", category_id: "", brand_id: "", stock_date: "", exp_date: "", qty: "", unit_cost: "", remark: "", photo: "",
};

const ProductPage = () => {
  const API_BASE_URL = "https://fullstackproject1-2.onrender.com";
  const MAX_PHOTO_SIZE_MB = 2;
  const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      setFilteredProducts(
        products.filter(
          (p) =>
            p.prd_id.toLowerCase().includes(kw) ||
            (p.prd_name && p.prd_name.toLowerCase().includes(kw)) ||
            (p.category_id && p.category_id.toLowerCase().includes(kw)) ||
            (p.brand_id && p.brand_id.toLowerCase().includes(kw))
        )
      );
    } else {
      setFilteredProducts(products);
    }
    setCurrentPage(1);
  }, [searchKeyword, products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await request("/api/product", "GET");
      if (response.success) setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await request("/api/category", "GET");
      if (response.success) setCategories(response.data);
    } catch (error) {}
  };

  const fetchBrands = async () => {
    try {
      const response = await request("/api/brand", "GET");
      if (response.success) setBrands(response.data);
    } catch (error) {}
  };

  const handleAddProduct = () => {
    setFormData(emptyForm);
    setSelectedPhotoFile(null);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setFormData({
      prd_id: product.prd_id,
      prd_name: product.prd_name || "",
      category_id: product.category_id || "",
      brand_id: product.brand_id || "",
      stock_date: product.stock_date ? product.stock_date.slice(0, 10) : "",
      exp_date: product.exp_date ? product.exp_date.slice(0, 10) : "",
      qty: product.qty ?? "",
      unit_cost: product.unit_cost ?? "",
      remark: product.remark || "",
      photo: product.photo || "",
    });
    setSelectedPhotoFile(null);
    setEditingId(product.prd_id);
    setShowForm(true);
  };

  const handleDeleteProduct = async (prd_id) => {
    const result = await showConfirm(
      "Are you sure?",
      `Delete product "${prd_id}"? This action cannot be undone.`,
      "Yes, delete it!"
    );
    if (result.isConfirmed) {
      try {
        const response = await request(`api/product/${prd_id}`, "DELETE");
        if (response.success) {
          showAlert("success", "Product deleted successfully");
          fetchProducts();
        }
      } catch (error) {
        showAlert("error", "Error deleting product");
      }
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      showAlert("warning", `Image too large. Please choose a file smaller than ${MAX_PHOTO_SIZE_MB}MB.`);
      event.target.value = "";
      return;
    }

    setSelectedPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, photo: reader.result || "" }));
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.prd_id.trim() || !formData.prd_name.trim()) {
      showAlert("warning", "Product ID and Name are required");
      return;
    }

    try {
      const payload = new FormData();
      payload.append("prd_name", formData.prd_name);
      payload.append("category_id", formData.category_id || "");
      payload.append("brand_id", formData.brand_id || "");
      payload.append("stock_date", formData.stock_date || "");
      payload.append("exp_date", formData.exp_date || "");
      payload.append("qty", formData.qty !== "" ? Number(formData.qty) : 0);
      payload.append("unit_cost", formData.unit_cost !== "" ? Number(formData.unit_cost) : 0);
      payload.append("remark", formData.remark || "");

      if (!editingId) payload.append("prd_id", formData.prd_id.trim());
      if (selectedPhotoFile) payload.append("photo", selectedPhotoFile);

      const response = editingId
        ? await request(`api/product`, "PUT", payload)
        : await request("/api/product", "POST", payload);

      if (response?.success) {
        showAlert("success", editingId ? "Product updated successfully" : "Product created successfully");
        setShowForm(false);
        fetchProducts();
      }
    } catch (error) {
      showAlert("error", "Error saving product");
    }
  };

  const set = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    setFormData((prev) => ({ ...prev, category_id: categoryId, brand_id: "" }));
    try {
      const response = await request(`api/brand?category=${categoryId}`, "GET");
      if (response.success) {
        setBrands(response.data);
      }
    } catch (error) {}
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const getCategoryLabel = (id) => {
    const cat = categories.find((c) => c.code === id);
    return cat ? `${cat.code}${cat.desc ? ` - ${cat.desc}` : ""}` : id || "-";
  };

  const getBrandLabel = (id) => {
    const b = brands.find((br) => br.code === id);
    return b ? `${b.code}${b.desc ? ` - ${b.desc}` : ""}` : id || "-";
  };

  return (
    <div className="category-container">
      <div className="category-header">
        <h1 className="category-title">Product Management</h1>
        <button className="btn-add-category" onClick={handleAddProduct}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
          Add New Product
        </button>
      </div>

      <div className="category-controls">
        <div className="items-per-page">
          <label>Show</label>
          <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
        </div>
        <div className="search-box">
          <label>Search:</label>
          <div style={{ position: "relative" }}>
             <span className="material-symbols-outlined" style={{ position: "absolute", left: "10px", top: "10px", color: "#94a3b8", fontSize: "18px" }}>search</span>
             <input
              type="text"
              placeholder="Search ID, name, category..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ paddingLeft: "35px" }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <span className="material-symbols-outlined" style={{ fontSize: '32px', animation: 'spin 1s linear infinite' }}>sync</span>
          <p>Loading data...</p>
        </div>
      ) : (
        <>
          <table className="category-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Qty</th>
                <th>Unit Cost</th>
                <th>Status</th>
                <th>Photo</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <tr key={product.prd_id}>
                    <td><strong>{product.prd_id}</strong></td>
                    <td>{product.prd_name || "-"}</td>
                    <td>{getCategoryLabel(product.category_id)}</td>
                    <td>{getBrandLabel(product.brand_id)}</td>
                    <td>{product.qty ?? "-"}</td>
                    <td>{product.unit_cost != null ? `$${product.unit_cost.toLocaleString()}` : "-"}</td>
                    <td>
                      <span className={`status-badge status-${product.status || 'unavailable'}`}>
                        {product.status || "Unavailable"}
                      </span>
                    </td>
                    <td>
                      {product.photo ? (
                        <img src={getImagePath(product.photo)} className="brand-photo" alt="product" />
                      ) : (
                        <span className="material-symbols-outlined" style={{ color: "#cbd5e1", fontSize: "32px" }}>image</span>
                      )}
                    </td>
                    <td>
                      <div className="actions" style={{ justifyContent: "flex-end" }}>
                        <button className="btn-edit" onClick={() => handleEditProduct(product)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span> Edit
                        </button>
                        <button className="btn-delete" onClick={() => handleDeleteProduct(product.prd_id)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#cbd5e1', display: 'block', marginBottom: '10px' }}>inventory</span>
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="pagination-info">
              Showing {filteredProducts.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries
            </div>
            <div className="pagination-controls">
              <button className="btn-pagination" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                Previous
              </button>
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i + 1} className={`page-number ${currentPage === i + 1 ? "active" : ""}`} onClick={() => setCurrentPage(i + 1)}>
                    {i + 1}
                  </button>
                ))}
              </div>
              <button className="btn-pagination" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" style={{ maxWidth: "640px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
              <button className="btn-close" onClick={() => setShowForm(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {/* Basic Info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label>Product ID <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="text" value={formData.prd_id} onChange={set("prd_id")} readOnly={!!editingId} placeholder="e.g. PRD-001" required />
                </div>
                <div className="form-group">
                  <label>Product Name <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="text" value={formData.prd_name} onChange={set("prd_name")} placeholder="Enter name" required />
                </div>
              </div>

              {/* Classification */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <Box>
                    <FormControl fullWidth size="small">
                      <InputLabel>Category</InputLabel>
                      <Select value={formData.category_id} label="Category" onChange={handleCategoryChange}>
                        <MenuItem value=""><em>-- None --</em></MenuItem>
                        {categories.map((cat) => (
                          <MenuItem key={cat.code} value={cat.code}>{cat.code} {cat.desc ? `- ${cat.desc}` : ""}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </div>
                <div className="form-group">
                  <Box>
                    <FormControl fullWidth size="small">
                      <InputLabel>Brand</InputLabel>
                      <Select value={formData.brand_id} label="Brand" onChange={set("brand_id")}>
                        <MenuItem value=""><em>-- None --</em></MenuItem>
                        {brands.map((b) => (
                          <MenuItem key={b.code} value={b.code}>{b.code} {b.desc ? `- ${b.desc}` : ""}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </div>
              </div>

              {/* Stock & Pricing */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" min="0" value={formData.qty} onChange={set("qty")} placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Unit Cost ($)</label>
                  <input type="number" min="0" step="0.01" value={formData.unit_cost} onChange={set("unit_cost")} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Stock Date</label>
                  <input type="date" value={formData.stock_date} onChange={set("stock_date")} style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }} />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input type="date" value={formData.exp_date} onChange={set("exp_date")} style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }} />
                </div>
              </div>

              {/* Photo & Remark */}
              <div className="form-group">
                <label>Photo</label>
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ padding: "8px" }} />
              </div>
              <div className="form-group">
                <label>Remark</label>
                <textarea value={formData.remark} onChange={set("remark")} placeholder="Optional notes..." rows="2" />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-submit">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
                  {editingId ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;