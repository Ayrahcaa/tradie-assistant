import { Redirect } from "expo-router";
import { useAuth } from "../auth/auth-context";
import { LoadingState } from "../components/ui";

export default function Index(){
  const { user, loading } = useAuth();
  if (loading) return <LoadingState />;
  return <Redirect href={user ? "/(tabs)" : "/(auth)/login"}/>;
}
