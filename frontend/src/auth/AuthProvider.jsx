// frontend/auth/AuthProvider.jsx
import React, { createContext, useState, useEffect } from "react";
import api from "../api/api.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchProfile();
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      // ✅ Fetch the logged-in user directly
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      logout();
    }
  };

 // inside AuthProvider.jsx
const login = (user, token) => {
  setToken(token);
  localStorage.setItem("token", token);
  setUser(user);
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;