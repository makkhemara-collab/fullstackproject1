import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./page/Dashboard";
import PosPage from "./page/feature/pos/PosPage";
import CustomersPage from "./page/CustomersPage";
import ReportsPage from "./page/ReportsPage";
import CategoryPage from "./page/feature/category/category";
import BrandPage from "./page/feature/brand/BrandPage";
import ProductPage from "./page/feature/products/ProductPage";
import Login from "./page/feature/login/login";
import Setting from "./page/feature/setting/Setting";
import KitchenDisplay from "./page/feature/kitchen/KitchenDisplay";
import TableManagement from "./page/feature/tables/TableManagement";
import Home from "./page/home/Home";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import ProductDetailPage from "./page/Frontend/ProductDetail/ProductDetailPage";
import CartPage from "./page/Frontend/Cart/CartPage";
import CheckoutPage from "./page/Frontend/Checkout/CheckoutPage";
import CustomerLogin from "./page/Frontend/Auth/CustomerLogin";
import CustomerRegister from "./page/Frontend/Auth/CustomerRegister";
import EmployeeManagement from './components/Admin/EmployeeManagement';
import ProtectedRoute from "./utils/ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* ☕ SHARED STAFF ROUTES (Both Admin & Barista can see these) */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "manager", "barista"]} />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/kitchen" element={<KitchenDisplay />} />
              <Route path="/pos" element={<PosPage />} />
              <Route path="/tables" element={<TableManagement />} />
            </Route>
          </Route>

          {/* 🔐 ADMIN ONLY ROUTES (Strictly Admin/Manager Level) */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
            <Route element={<Layout />}>
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/reports/sales" element={<ReportsPage />} />
              <Route path="/reports/inventory" element={<ReportsPage />} />
              <Route path="/reports/customer" element={<ReportsPage />} />
              <Route path="/setting" element={<Setting />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/categories" element={<CategoryPage />} />
              <Route path="/brands" element={<BrandPage />} />
              <Route path="/products" element={<ProductPage />} />
              <Route path="/admin/employees" element={<EmployeeManagement />} />
            </Route>
          </Route>

          {/* 🛍️ PUBLIC CUSTOMER ROUTES */}
          <Route path="/index" element={<Home />} />
          <Route path="/index/product/:id" element={<ProductDetailPage />} />
          <Route path="/index/cart" element={<CartPage />} />
          <Route path="/index/checkout" element={<CheckoutPage />} />
          <Route path="/index/login" element={<CustomerLogin />} />
          <Route path="/index/register" element={<CustomerRegister />} />

          <Route path="*" element={<Navigate to="/index" />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;