import { supabase } from "../supabaseClient";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { getUserByUid, createUserWithRole } from "../api/supabaseDb";

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
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);

  // Prevent onAuthStateChange from double-resolving during login/register
  const handlingAuthRef = useRef(false);

  // Fully authenticated = Supabase session + DB user with role
  const isAuthenticated = !!session && !!user && !!user.role;

  // ─── Resolve Supabase session → DB user lookup / auto-creation ────────────
  async function resolveUser(authSession) {
    const uid = authSession.user.id;
    const email = authSession.user.email;
    const meta = authSession.user.user_metadata || {};

    // 1. Check if user record already exists in our DB
    const { user: dbUser } = await getUserByUid(uid);

    if (dbUser && dbUser.role) {
      setUser({
        id: dbUser.id,
        email: dbUser.email,
        full_name: dbUser.full_name,
        role: dbUser.role,
      });
      setNeedsRoleSelection(false);
      return;
    }

    // 2. No DB record — check user_metadata for role (set during email/password signup)
    const metaRole = meta.role;
    if (metaRole && ["client", "barber", "salon"].includes(metaRole)) {
      const { user: newUser } = await createUserWithRole({
        supabaseUid: uid,
        email,
        fullName: meta.full_name || meta.name || "",
        role: metaRole,
        phone: meta.phone || null,
      });

      if (newUser) {
        setUser({
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role,
        });
        setNeedsRoleSelection(false);
        return;
      }
    }

    // 3. No role info (Google OAuth new user) → role selection page
    setUser({
      email,
      supabase_uid: uid,
      full_name: meta.full_name || meta.name || "",
    });
    setNeedsRoleSelection(true);
  }

  // ─── Initialize auth + listen for session changes ─────────────────────────
  useEffect(() => {
    let mounted = true;
    let initialized = false;

    async function init() {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session && mounted) {
          setSession(data.session);
          await resolveUser(data.session);
        }
      } catch (e) {
        console.error("[AuthContext] Init error:", e);
      }
      if (mounted) setLoading(false);
      initialized = true;
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, authSession) => {
        if (!mounted || !initialized) return;
        // Skip if login/register is actively handling auth
        if (handlingAuthRef.current) return;

        if (event === "SIGNED_IN" && authSession) {
          setSession(authSession);
          setLoading(true);
          await resolveUser(authSession);
          if (mounted) setLoading(false);
        } else if (event === "TOKEN_REFRESHED" && authSession) {
          setSession(authSession);
        } else if (event === "SIGNED_OUT") {
          setSession(null);
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

  // ─── Email/password login via Supabase ────────────────────────────────────
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

    handlingAuthRef.current = true;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const msg =
          error.message === "Invalid login credentials"
            ? "Invalid email or password"
            : error.message;
        return { success: false, message: msg };
      }

      if (data.session) {
        setSession(data.session);
        await resolveUser(data.session);
        return { success: true };
      }

      return { success: false, message: "Login failed. Please try again." };
    } catch (err) {
      return {
        success: false,
        message: "An unexpected error occurred. Please try again.",
      };
    } finally {
      handlingAuthRef.current = false;
    }
  }

  // ─── Email/password register via Supabase ─────────────────────────────────
  async function register(userData) {
    const name = userData.name || userData.full_name || "";
    const email = userData.email || "";
    const password = userData.password || "";
    const phone = userData.phone || userData.phone_number || "";
    const role = userData.role || "";

    // Validation
    if (!name?.trim()) {
      return { success: false, message: "Full name is required" };
    }
    if (!email?.trim()) {
      return { success: false, message: "Email is required" };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: "Please enter a valid email address" };
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
    if (!role || !["client", "barber", "salon"].includes(role)) {
      return { success: false, message: "Invalid role selected" };
    }

    handlingAuthRef.current = true;

    try {
      // 1. Create Supabase Auth user with metadata
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            role,
            phone: phone.trim() || null,
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes("already")) {
          return {
            success: false,
            message: "Account already exists. Please sign in.",
            redirect: "/signin",
          };
        }
        return { success: false, message: error.message };
      }

      // 2. Auto-confirm ON → session available → create DB record immediately
      if (data.session) {
        setSession(data.session);

        const { user: dbUser, error: dbError } = await createUserWithRole({
          supabaseUid: data.user.id,
          email: email.trim(),
          fullName: name.trim(),
          role,
          phone: phone.trim() || null,
        });

        if (dbUser) {
          setUser({
            id: dbUser.id,
            email: dbUser.email,
            full_name: dbUser.full_name,
            role: dbUser.role,
          });
          setNeedsRoleSelection(false);
          return { success: true, user: dbUser };
        }

        if (dbError) {
          console.error(
            "[AuthContext] DB insert after signup failed:",
            dbError.message,
          );
          // Fallback: resolveUser will attempt auto-creation from metadata
          await resolveUser(data.session);
          return { success: true };
        }
      }

      // 3. Email confirmation required
      if (data.user && !data.session) {
        return {
          success: true,
          needsConfirmation: true,
          message: "Please check your email to confirm your account.",
        };
      }

      return {
        success: false,
        message: "Registration failed. Please try again.",
      };
    } catch (err) {
      return {
        success: false,
        message: "An unexpected error occurred. Please try again.",
      };
    } finally {
      handlingAuthRef.current = false;
    }
  }

  // ─── Complete OAuth onboarding (called from SelectRole page) ──────────────
  function completeOAuthOnboarding(dbUser) {
    setUser({
      id: dbUser.id,
      email: dbUser.email,
      full_name: dbUser.full_name,
      role: dbUser.role,
    });
    setNeedsRoleSelection(false);
  }

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setUser(null);
    setSession(null);
    setNeedsRoleSelection(false);
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
    session,
    isAuthenticated,
    loading,
    needsRoleSelection,
    login,
    register,
    logout,
    getRoleRedirect,
    completeOAuthOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
