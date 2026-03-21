import { supabase } from "../supabaseClient";
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
import { getUserByEmail } from "../api/supabaseDb";

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
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);
  const [supabaseSession, setSupabaseSession] = useState(null);

  // Fully authenticated = user object exists AND has a role
  const isAuthenticated = !!user && !!user.role;

  // ─── Resolve an OAuth session against the DB ──────────────────────────────
  async function resolveOAuthUser(session) {
    const email = session.user.email;
    const uid = session.user.id;
    const meta = session.user.user_metadata || {};

    const { user: dbUser, error } = await getUserByEmail(email);

    if (error) {
      console.error("[AuthContext] DB lookup failed:", error.message);
    }

    if (dbUser && dbUser.role) {
      // Existing user with a role → fully authenticated
      setUser({
        id: dbUser.id,
        email: dbUser.email,
        full_name: dbUser.full_name,
        role: dbUser.role,
        supabase_uid: uid,
      });
      setNeedsRoleSelection(false);
    } else {
      // New OAuth user → needs to pick a role
      setUser({
        email,
        supabase_uid: uid,
        full_name: meta.full_name || meta.name || "",
      });
      setNeedsRoleSelection(true);
    }
  }

  // ─── Initialize auth on app load ──────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    let initialized = false;

    async function initAuth() {
      // 1. Try JWT auth first (email/password users)
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        try {
          const res = await getCurrentUser();
          if (mounted) {
            if (res.success && res.data) {
              setUser(res.data);
              setToken(savedToken);
            } else {
              localStorage.removeItem("token");
              setToken(null);
            }
          }
        } catch (e) {
          console.error("[AuthContext] JWT init error:", e);
          if (mounted) {
            localStorage.removeItem("token");
            setToken(null);
          }
        }
        if (mounted) setLoading(false);
        initialized = true;
        return;
      }

      // 2. No JWT token → try Supabase OAuth session
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session && mounted) {
          setSupabaseSession(data.session);
          await resolveOAuthUser(data.session);
        }
      } catch (e) {
        console.error("[AuthContext] Supabase session error:", e);
      }

      if (mounted) setLoading(false);
      initialized = true;
    }

    initAuth();

    // Listen for future Supabase auth events (OAuth redirect callback, sign-out)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        // Skip events that fire during initialization
        if (!initialized) return;
        // Skip if JWT auth is active
        if (localStorage.getItem("token")) return;

        if (event === "SIGNED_IN" && session) {
          setSupabaseSession(session);
          setLoading(true);
          await resolveOAuthUser(session);
          if (mounted) setLoading(false);
        } else if (event === "SIGNED_OUT") {
          setSupabaseSession(null);
          setUser(null);
          setNeedsRoleSelection(false);
        }
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Listen for logout events dispatched by api.js on 401
  useEffect(() => {
    const handle = () => logout();
    window.addEventListener("logout", handle);
    return () => window.removeEventListener("logout", handle);
  }, []);

  // ─── Email/password login (existing Flask backend — unchanged) ────────────
  async function login(email, password) {
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

    let message = res.message || "Login failed";
    if (res.reason === "invalid_credentials" || res.status === 401) {
      message = "Invalid email or password";
    } else if (res.reason === "network_error") {
      message = "Unable to connect to server. Please try again.";
    }

    return { success: false, message, reason: res.reason };
  }

  // ─── Register (existing Flask backend — unchanged) ────────────────────────
  async function register(userData) {
    const name = userData.name || userData.full_name || "";
    const email = userData.email || "";
    const password = userData.password || "";
    const phone = userData.phone || userData.phone_number || "";
    const role = userData.role || "";

    if (!name?.trim()) {
      return {
        success: false,
        reason: "validation_error",
        message: "Full name is required",
      };
    }
    if (!email?.trim()) {
      return {
        success: false,
        reason: "validation_error",
        message: "Email is required",
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        reason: "validation_error",
        message: "Please enter a valid email address",
      };
    }

    if (!password) {
      return {
        success: false,
        reason: "validation_error",
        message: "Password is required",
      };
    }
    if (password.length < 6) {
      return {
        success: false,
        reason: "validation_error",
        message: "Password must be at least 6 characters",
      };
    }
    if (!role || !["client", "barber", "salon"].includes(role)) {
      return {
        success: false,
        reason: "validation_error",
        message: "Invalid role selected",
      };
    }

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

      const reason = res.reason || "registration_failed";
      let message = res.message || "Registration failed";
      let redirect = null;

      if (reason === "conflict" || message.toLowerCase().includes("already")) {
        message = "Account already exists. Please sign in.";
        redirect = "/signin";
      } else if (reason === "network_error") {
        message = "Unable to connect to server. Please try again.";
      } else if (reason === "bad_request" || reason === "validation_error") {
        message =
          res.message || "Invalid input. Please check your information.";
      } else if (reason === "db_error" || reason === "server_error") {
        message = "Server error. Please try again later.";
      }

      return { success: false, reason, message, redirect };
    } catch (err) {
      return {
        success: false,
        reason: "unknown_error",
        message: "An unexpected error occurred. Please try again.",
      };
    }
  }

  // ─── Complete OAuth onboarding (called from SelectRole page) ──────────────
  function completeOAuthOnboarding(dbUser) {
    setUser({
      id: dbUser.id,
      email: dbUser.email,
      full_name: dbUser.full_name,
      role: dbUser.role,
      supabase_uid: dbUser.supabase_uid,
    });
    setNeedsRoleSelection(false);
  }

  // ─── Logout (handles both JWT and OAuth) ──────────────────────────────────
  const logout = useCallback(async () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setNeedsRoleSelection(false);
    setSupabaseSession(null);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore sign-out errors
    }
  }, []);

  // ─── Role-based redirect helper ───────────────────────────────────────────
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
    needsRoleSelection,
    supabaseSession,
    login,
    register,
    logout,
    getRoleRedirect,
    completeOAuthOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
