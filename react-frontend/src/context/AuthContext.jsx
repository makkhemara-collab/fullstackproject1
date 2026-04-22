import React, { createContext, useContext, useState, useEffect } from "react";
import request from "../utils/request";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("customer");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      localStorage.setItem("customer", JSON.stringify(user));
    } else {
      localStorage.removeItem("customer");
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError("");
      
      // API call for customer login
      const response = await request("/api/customer/login", "POST", { gmail: email, password });
      
      if (response?.success && response?.data) {
        const customerData = {
          id: response.data.customer_id,
          name: response.data.fullname,
          email: response.data.gmail,
          phone: response.data.phone,
          photo: response.data.photo,
          token: response.token,
        };
        setUser(customerData);
        return { success: true, data: customerData };
      }
      return { success: false, message: response?.message || "Invalid credentials" };
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Login failed. Please try again.";
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      setError("");
      
      // API call for customer registration
      const response = await request("/api/customer/register", "POST", {
        fullname: userData.name,
        gmail: userData.email,
        phone: userData.phone,
        password: userData.password
      });
      
      if (response?.success && response?.data) {
        const customerData = {
          id: response.data.customer_id,
          name: response.data.fullname,
          email: response.data.gmail,
          phone: response.data.phone,
          photo: response.data.photo,
          token: response.token,
        };
        setUser(customerData);
        return { success: true, data: customerData };
      }
      return { success: false, message: response?.message || "Registration failed" };
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Registration failed. Please try again.";
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("customer");
    localStorage.removeItem("cart");
  };

  const isAuthenticated = () => {
    return !!user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        isAuthenticated,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
