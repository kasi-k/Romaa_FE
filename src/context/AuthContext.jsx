import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";

const AuthContext = createContext();

// 1. Define the cleanup function right at the top, outside the provider
const clearTablePreferences = () => {
  const allKeys = Object.keys(localStorage);
  const tableKeys = allKeys.filter(key => key.startsWith('table_prefs_'));
  tableKeys.forEach(key => localStorage.removeItem(key));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setBrandColor } = useTheme();

  // 1. Check if user is already logged in on page load
  useEffect(() => {
    const storedUser = localStorage.getItem("crm_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 2. Login Action
  const login = (userData) => {
    // Save non-sensitive user info to LocalStorage
    localStorage.setItem("crm_user", JSON.stringify(userData));
    setUser(userData);
    navigate("/dashboard");
  };

  // 3. Logout Action
  const logout = () => {
    setBrandColor("#0f2a47");
    localStorage.removeItem("romaa_brand_color");
    
    // 2. Call the cleanup function here!
    clearTablePreferences();

    // Clear storage
    localStorage.removeItem("crm_user");
    setUser(null);
    
    // Optional: Call backend logout API to clear cookies
    navigate("/");
  };

  // 4. Helper to check permissions easily in components
  const canAccess = (module, subModule, action = "read") => {
    if (!user?.role?.permissions) return false;
    
    const modPerms = user.role.permissions[module];
    if (!modPerms) return false;

    if (!subModule) return modPerms[action] === true;
    
    return modPerms[subModule] && modPerms[subModule][action] === true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, canAccess, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);