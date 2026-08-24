import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from "react";
import { Platform } from "react-native";
import { apiRequest, setUnauthorizedHandler } from "../api/client";
import type { User } from "../types/api";
import { sessionStore } from "./session-store";

type Credentials = { email: string; password: string };
type Registration = Credentials & { firstName: string; lastName: string };
type AuthValue = { user: User | null; loading: boolean; login(input: Credentials): Promise<void>; register(input: Registration): Promise<void>; logout(): Promise<void>; refresh(): Promise<void> };
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const clearLocal = useCallback(async () => { await sessionStore.clear(); setUser(null); queryClient.clear(); }, [queryClient]);
  const refresh = useCallback(async () => {
    const token = await sessionStore.get();
    if (!token && Platform.OS !== "web") { setUser(null); setLoading(false); return; }
    try { const result = await apiRequest<{ user: User }>("/auth/me"); setUser(result.user); }
    catch { await clearLocal(); }
    finally { setLoading(false); }
  }, [clearLocal]);
  useEffect(() => { setUnauthorizedHandler(clearLocal); const timer = setTimeout(() => void refresh(), 0); return () => { clearTimeout(timer); setUnauthorizedHandler(undefined); }; }, [clearLocal, refresh]);
  async function authenticate(path: string, input: Credentials | Registration) {
    const result = await apiRequest<{ user: User; sessionToken?: string }>(path, { method: "POST", body: JSON.stringify(input) });
    if (Platform.OS !== "web" && !result.sessionToken) throw new Error("The server did not return a mobile session.");
    if (result.sessionToken) await sessionStore.set(result.sessionToken); queryClient.clear(); setUser(result.user);
  }
  async function logout() { try { await apiRequest("/auth/logout", { method: "POST" }); } finally { await clearLocal(); } }
  return <AuthContext.Provider value={{ user, loading, login: (v) => authenticate("/auth/login", v), register: (v) => authenticate("/auth/register", v), logout, refresh }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be used within AuthProvider"); return value; }
