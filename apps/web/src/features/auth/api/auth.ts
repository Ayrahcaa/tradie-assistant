import { API_URL, apiFetch } from "../../../shared/api/http";
import type { CurrentUser, LoginInput, RegisterInput, UpdateProfileInput } from "../types/auth";

async function message(response: Response, fallback: string) { const body: unknown = await response.json().catch(() => null); return body && typeof body === "object" && "message" in body && typeof body.message === "string" ? body.message : fallback; }
async function submit(path: string, method: string, body?: unknown) { const response = await apiFetch(`${API_URL}${path}`, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined }); if (!response.ok) throw new Error(await message(response, "Authentication request failed.")); return response; }
export async function getCurrentUser(): Promise<CurrentUser | null> { const response = await apiFetch(`${API_URL}/auth/me`); if (response.status === 401) return null; if (!response.ok) throw new Error(await message(response, "Unable to restore your session.")); return ((await response.json()) as { data: { user: CurrentUser } }).data.user; }
export async function login(input: LoginInput) { const response = await submit("/auth/login", "POST", input); return ((await response.json()) as { data: { user: CurrentUser } }).data.user; }
export async function register(input: RegisterInput) { const response = await submit("/auth/register", "POST", input); return ((await response.json()) as { data: { user: CurrentUser } }).data.user; }
export async function logout() { await submit("/auth/logout", "POST"); }
export async function updateProfile(input: UpdateProfileInput) { const response = await submit("/auth/profile", "PATCH", input); return ((await response.json()) as { data: { user: CurrentUser } }).data.user; }
