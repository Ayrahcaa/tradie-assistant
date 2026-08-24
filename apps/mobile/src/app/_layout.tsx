import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../auth/auth-context";
import { LoadingState } from "../components/ui";

function Routes() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState />;
  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Protected guard={!user}><Stack.Screen name="(auth)" /></Stack.Protected>
    <Stack.Protected guard={!!user}><Stack.Screen name="(tabs)"/><Stack.Screen name="projects"/><Stack.Screen name="customers"/><Stack.Screen name="expenses"/><Stack.Screen name="invoices"/><Stack.Screen name="subcontractors"/><Stack.Screen name="quotes"/><Stack.Screen name="outstanding"/><Stack.Screen name="settings"/></Stack.Protected>
  </Stack>;
}
export default function RootLayout() { const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } })); return <SafeAreaProvider><QueryClientProvider client={client}><AuthProvider><StatusBar style="dark"/><Routes/></AuthProvider></QueryClientProvider></SafeAreaProvider>; }
