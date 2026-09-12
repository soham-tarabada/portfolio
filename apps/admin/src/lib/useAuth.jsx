import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { auth, refreshSession, setAccessToken } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("checking");
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;

    refreshSession()
      .then(() => auth.me())
      .then((payload) => {
        if (cancelled) return;
        setUser(payload.user);
        setStatus("authenticated");
      })
      .catch(() => {
        if (cancelled) return;
        setAccessToken(null);
        setStatus("anonymous");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const payload = await auth.login(email, password);
    setAccessToken(payload.accessToken);
    setUser(payload.user);
    setStatus("authenticated");
    return payload.user;
  }, []);

  const signOut = useCallback(async () => {
    await auth.logout().catch(() => {});
    setAccessToken(null);
    setUser(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo(() => ({ status, user, signIn, signOut }), [status, user, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
