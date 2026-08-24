import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../api/auth";
export const authQueryKey = ["auth", "me"] as const;
export function useCurrentUser() { return useQuery({ queryKey: authQueryKey, queryFn: getCurrentUser, staleTime: 60_000, retry: false }); }
