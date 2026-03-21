import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  login as apiLogin,
  register as apiRegister,
  getCurrentUser,
} from "../api/authApi";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  // Restore session on app load
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        const res = await getCurrentUser();
        if (res.success) {
          setUser(res.data);
          setToken(savedToken);
        } else {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Listen for logout events (e.g., from token expiration/401 response)
  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener("logout", handleLogout);
    return () => window.removeEventListener("logout", handleLogout);
  }, []);

  /**
   * Login user with email and password
   */
  async function login(email, password) {
    // Frontend validation
    if (!email?.trim()) {
      return { success: false, message: "Email is required" };
    }
    if (!password) {
      return { success: false, message: "Password is required" };
    }
    if (password.length < 6) {
      return {
        success: false,
        message: "Password must be at least 6 characters",
      };
    }

    const res = await apiLogin(email, password);

    if (res.success && res.data?.token) {
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    }

    // Handle specific errors
    let message = res.message || "Login failed";
    if (res.reason === "invalid_credentials" || res.status === 401) {
      message = "Invalid email or password";
    } else if (res.reason === "network_error") {
      message = "Unable to connect to server. Please try again.";
    }

    return { success: false, message, reason: res.reason };
  }

  /**
   * Register new user
   * Returns { success, user?, message?, reason?, redirect? }
   * Components handle their own loading/error UI state.
   */
  async function register(userData) {
    // Normalize field names (frontend uses various names)
    const name = userData.name || userData.full_name || "";
    const email = userData.email || "";
    const password = userData.password || "";
    const phone = userData.phone || userData.phone_number || "";
    const role = userData.role || "";

    // Frontend validation
    if (!name?.trim()) {
      return { success: false, reason: "validation_error", message: "Full name is required" };
    }
    if (!email?.trim()) {
      return { success: false, reason: "validation_error", message: "Email is required" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, reason: "validation_error", message: "Please enter a valid email address" };
    }

    if (!password) {
      return { success: false, reason: "validation_error", message: "Password is required" };
    }
    if (password.length < 6) {
      return { success: false, reason: "validation_error", message: "Password must be at least 6 characters" };
    }
    if (!role || !["client", "barber", "salon"].includes(role)) {
      return { success: false, reason: "validation_error", message: "Invalid role selected" };
    }

    // Map frontend field names to backend API format
    const registrationData = {
      email: email.trim(),
      password: password,
      full_name: name.trim(),
      phone_number: phone.trim() || null,
      role: role,
    };

    try {
      const res = await apiRegister(registrationData);

      if (res.success && res.data?.token) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }

      // Handle specific error reasons
      const reason = res.reason || "registration_failed";
      let message = res.message || "Registration failed";
      let redirect = null;

      if (reason === "conflict" || message.toLowerCase().includes("already")) {
        message = "Account already exists. Please sign in.";
        redirect = "/signin";
      } else if (reason === "network_error") {
        message = "Unable to connect to server. Please try again.";
      } else if (reason === "bad_request" || reason === "validation_error") {
        message = res.message || "Invalid input. Please check your information.";
      } else if (reason === "db_error" || reason === "server_error") {
        message = "Server error. Please try again later.";
      }

      return { success: false, reason, message, redirect };
    } catch (err) {
      return { success: false, reason: "unknown_error", message: "An unexpected error occurred. Please try again." };
    }
  }

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Get redirect path based on role
   */
  function getRoleRedirect(role) {
    const redirects = {
      client: "/home",
      barber: "/barber-dashboard",
      salon: "/salon-dashboard",
    };
    return redirects[role] || "/home";
  }

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    getRoleRedirect,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
