import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, role, company_id, first_name, last_name, phone, address, dui, companies(name)")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Ha ocurrido un error obteniendo al usuario:", error.message);
      return null;
    }
    return data;
  }

  useEffect(() => {
    let isMounted = true;

    const syncAuthState = async (currentSession) => {
      if (!isMounted) return;

      setSession(currentSession ?? null);

      if (!currentSession?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const p = await fetchProfile(currentSession.user.id);
      if (!isMounted) return;

      setProfile(p);
      setLoading(false);
    };

    const initializeAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      await syncAuthState(initialSession);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted) return;

      setSession(nextSession ?? null);

      if (event === "SIGNED_OUT" || !nextSession?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      setTimeout(async () => {
        if (!isMounted) return;
        const p = await fetchProfile(nextSession.user.id);
        if (!isMounted) return;
        setProfile(p);
        setLoading(false);
      }, 0);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    profile,
    role: profile?.role ?? null,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}