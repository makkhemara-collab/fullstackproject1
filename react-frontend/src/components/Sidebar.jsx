import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../style/Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState(null);

  // Get the full path including the ?view=history part to properly highlight menus
  const currentFullUrl = location.pathname + location.search;

  // ✅ Get the logged-in user's role to handle permissions
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { role: "barista" };

  // List menu items adapted specifically for Cafe Operations
  const menuItems = [
    { 
      id: "dashboard", 
      icon: <span className="material-symbols-outlined">dashboard</span>, 
      label: "Dashboard", 
      path: "/dashboard" 
    },
    // 🔐 ONLY ADMIN can see Menu Management
    ...(user.role === "admin" ? [{
      id: "products",
      icon: <span className="material-symbols-outlined">restaurant_menu</span>,
      label: "Menu Management",
      path: "/products",
      submenu: [
        { id: "categories", icon: <span className="material-symbols-outlined">category</span>, label: "Categories", path: "/categories" },
        { id: "brands", icon: <span className="material-symbols-outlined">vaping_rooms</span>, label: "Brands/Suppliers", path: "/brands" },
        { id: "products", icon: <span className="material-symbols-outlined">coffee</span>, label: "Drink Items", path: "/products" },
      ],
    }] : []),
    {
      id: "sales",
      icon: <span className="material-symbols-outlined">point_of_sale</span>,
      label: "Point Of Sale",
      path: "/pos",
      submenu: [
        // 👈 UPDATED: Exact paths for the POS and History views
        { id: "new-sale", icon: <span className="material-symbols-outlined">add_shopping_cart</span>, label: "New Order", path: "/pos" },
        { id: "sales-list", icon: <span className="material-symbols-outlined">history</span>, label: "Order History", path: "/pos?view=history" },
      ],
    },
    { 
      id: "kitchen", 
      icon: <span className="material-symbols-outlined">coffee_maker</span>, 
      label: "Kitchen Display", 
      path: "/kitchen" 
    },
    { 
      id: "tables", 
      icon: <span className="material-symbols-outlined">table_restaurant</span>, 
      label: "Table Map", 
      path: "/tables" 
    },
    { 
      id: "customers", 
      icon: <span className="material-symbols-outlined">group</span>, 
      label: "Customers", 
      path: "/customers" 
    },
    // 🔐 ONLY ADMIN can see Employee Management
    ...(user.role === "admin" ? [{
      id: "employees",
      icon: <span className="material-symbols-outlined">badge</span>,
      label: "Manage Staff",
      path: "/admin/employees",
    }] : []),
    // 🔐 ONLY ADMIN can see Reports
    ...(user.role === "admin" ? [{
      id: "reports",
      icon: <span className="material-symbols-outlined">analytics</span>,
      label: "Reports",
      path: "/reports",
      submenu: [
        { id: "sales-report", icon: <span className="material-symbols-outlined">bar_chart</span>, label: "Sales Analysis", path: "/reports/sales" },
        { id: "inventory-report", icon: <span className="material-symbols-outlined">inventory</span>, label: "Stock Levels", path: "/reports/inventory" },
      ],
    }] : []),
    {
      id: "setting",
      icon: <span className="material-symbols-outlined">settings</span>,
      label: "Settings",
      path: "/setting",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const toggleSubmenu = (id) => {
    setExpandedMenu(expandedMenu === id ? null : id);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>KMR CAFÉ</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          // Check if any submenu item matches the current exact URL
          const isSubmenuActive = item.submenu?.some(
            (sub) => currentFullUrl === sub.path || location.pathname.startsWith(sub.path + "/")
          );
          const isActive = location.pathname === item.path || isSubmenuActive;

          return (
            <div key={item.id} className="nav-item-wrapper">
              <button
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  if (item.submenu) {
                    toggleSubmenu(item.id);
                  } else {
                    handleNavigation(item.path);
                  }
                }}
              >
                <span className="nav-item-content">
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </span>
                {item.submenu && (
                  <span className={`submenu-toggle ${expandedMenu === item.id ? "open" : ""}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      expand_more
                    </span>
                  </span>
                )}
              </button>

              {item.submenu && expandedMenu === item.id && (
                <div className="submenu">
                  {item.submenu.map((subitem) => (
                    <button
                      key={subitem.id}
                      // 👈 UPDATED: Now perfectly matches the exact path (including ?view=history)
                      className={`submenu-item ${
                        currentFullUrl === subitem.path ? "active" : ""
                      }`}
                      onClick={() => handleNavigation(subitem.path)}
                    >
                      <span className="nav-icon">{subitem.icon}</span>
                      <span className="nav-label">{subitem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;