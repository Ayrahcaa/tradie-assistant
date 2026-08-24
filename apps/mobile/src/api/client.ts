import { sessionStore } from "../auth/session-store";
import { Platform } from "react-native";

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(/\/$/, "");
export class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }
let unauthorizedHandler: (() => void | Promise<void>) | undefined;
export const setUnauthorizedHandler = (handler: typeof unauthorizedHandler) => { unauthorizedHandler = handler; };

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await sessionStore.get();
  const isForm = typeof FormData !== "undefined" && init.body instanceof FormData;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: init.signal ?? controller.signal,
      credentials: Platform.OS === "web" ? "include" : undefined,
      headers: { Accept: "application/json", ...(Platform.OS === "web" ? {} : { "X-Client-Platform": "mobile" }), ...(isForm ? {} : { "Content-Type": "application/json" }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw new ApiError(`The API at ${API_URL} did not respond. Check EXPO_PUBLIC_API_URL and make sure the API is running.`, 0);
    throw new ApiError(`Unable to connect to the API at ${API_URL}.`, 0);
  } finally {
    clearTimeout(timeout);
  }
  const body = await response.json().catch(() => null) as { message?: string; data?: T } | null;
  if (!response.ok) {
    if (response.status === 401 && token) await unauthorizedHandler?.();
    throw new ApiError(body?.message ?? "Something went wrong. Please try again.", response.status);
  }
  return (body?.data ?? body) as T;
}
export const get = <T>(path: string) => apiRequest<T>(path);
export const post = <T>(path: string, data?: unknown) => apiRequest<T>(path, { method: "POST", body: data === undefined ? undefined : JSON.stringify(data) });
export const patch = <T>(path: string, data: unknown) => apiRequest<T>(path, { method: "PATCH", body: JSON.stringify(data) });
