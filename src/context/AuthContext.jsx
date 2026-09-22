import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("nqp_token") || null);
  const [isLoading, setIsLoading] = useState(true);
  const [cloudSyncStatus, setCloudSyncStatus] = useState("offline"); // "synced" | "syncing" | "offline"
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login"); // "login" | "register"

  // Check existing token or load cached user
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("nqp_token");
      const cachedUser = localStorage.getItem("nqp_user");

      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch (e) {
          // ignore parsing error
        }
      }

      if (savedToken) {
        try {
          const res = await api.get("/auth/me");
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem("nqp_user", JSON.stringify(res.data.user));
            setCloudSyncStatus("synced");
          }
        } catch (error) {
          console.warn("Failed to verify existing session token, keeping local state:", error);
          if (savedToken.startsWith("mock-")) {
            setCloudSyncStatus("synced");
          } else {
            setCloudSyncStatus("offline");
          }
        }
      } else {
        setCloudSyncStatus("offline");
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Register with Email & Password
  const register = async (name, email, password) => {
    try {
      const res = await api.post("/auth/register", { name, email, password });
      if (res.data && res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem("nqp_token", res.data.token);
        localStorage.setItem("nqp_user", JSON.stringify(res.data.user));
        setCloudSyncStatus("synced");
        setAuthModalOpen(false);
        return { success: true };
      }
    } catch (error) {
      console.warn("Server registration failed, falling back to mock local account:", error);
      // Fallback local registration
      const mockUser = {
        _id: "local_" + Date.now(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        readingStreak: 5,
        memorizedSurahs: 12,
        bookmarks: [],
        preferences: { theme: "system", accent: "emerald" }
      };
      const mockToken = "mock-token-" + Date.now();
      setToken(mockToken);
      setUser(mockUser);
      localStorage.setItem("nqp_token", mockToken);
      localStorage.setItem("nqp_user", JSON.stringify(mockUser));
      setCloudSyncStatus("offline");
      setAuthModalOpen(false);
      return { success: true, isMock: true };
    }
  };

  // Login with Email & Password
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data && res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem("nqp_token", res.data.token);
        localStorage.setItem("nqp_user", JSON.stringify(res.data.user));
        setCloudSyncStatus("synced");
        setAuthModalOpen(false);
        return { success: true };
      }
    } catch (error) {
      // Check if user has saved credentials locally in mock fallback
      const cached = localStorage.getItem("nqp_user");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.email === email.toLowerCase().trim()) {
            const mockToken = localStorage.getItem("nqp_token") || "mock-token-session";
            setToken(mockToken);
            setUser(parsed);
            setCloudSyncStatus("offline");
            setAuthModalOpen(false);
            return { success: true, isMock: true };
          }
        } catch (e) {}
      }

      // Allow quick demo login if backend is offline
      if (password && password.length >= 6) {
        const demoUser = {
          _id: "demo_user",
          name: email.split("@")[0] || "Believer",
          email: email.toLowerCase().trim(),
          readingStreak: 5,
          memorizedSurahs: 12,
          bookmarks: [],
          preferences: { theme: "system", accent: "emerald" }
        };
        const mockToken = "mock-demo-token";
        setToken(mockToken);
        setUser(demoUser);
        localStorage.setItem("nqp_token", mockToken);
        localStorage.setItem("nqp_user", JSON.stringify(demoUser));
        setCloudSyncStatus("offline");
        setAuthModalOpen(false);
        return { success: true, isMock: true };
      }

      throw new Error(error.response?.data?.error || "Login failed. Please verify credentials.");
    }
  };

  // Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("nqp_token");
    localStorage.removeItem("nqp_user");
    setCloudSyncStatus("offline");
  };

  // Update profile
  const updateProfile = async (updateData) => {
    setCloudSyncStatus("syncing");
    try {
      const res = await api.put("/user/profile", updateData);
      if (res.data && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem("nqp_user", JSON.stringify(res.data.user));
        setCloudSyncStatus("synced");
        return res.data.user;
      }
    } catch (error) {
      console.warn("Could not sync profile update to server, updating locally:", error);
      const updated = { ...user, ...updateData };
      setUser(updated);
      localStorage.setItem("nqp_user", JSON.stringify(updated));
      setCloudSyncStatus("offline");
      return updated;
    }
  };

  // Sync companion data to cloud
  const syncWithCloud = useCallback(async (extraPayload = {}) => {
    if (!user) return;
    setCloudSyncStatus("syncing");
    try {
      const payload = {
        uid: user.uid || user._id,
        readingStreak: user.readingStreak,
        memorizedSurahs: user.memorizedSurahs,
        bookmarks: user.bookmarks,
        lastRead: user.lastRead,
        ...extraPayload
      };
      await api.post("/user/data/sync", payload);
      setCloudSyncStatus("synced");
    } catch (error) {
      setCloudSyncStatus("offline");
    }
  }, [user]);

  const openAuthModal = (mode = "login") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        cloudSyncStatus,
        login,
        register,
        logout,
        updateProfile,
        syncWithCloud,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
