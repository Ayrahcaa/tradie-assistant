import type { NextFunction, Request, Response } from "express";
import { loginSchema, registerSchema, updateProfileSchema } from "./auth.schema.js";
import { invalidateSession, login, register, SESSION_COOKIE, SESSION_TTL_MS, updateProfile } from "./auth.service.js";
import { getRequestSessionToken } from "./auth.middleware.js";
import { prisma } from "../../lib/prisma.js";

function setSessionCookie(response: Response, token: string, expiresAt: Date) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader("Set-Cookie", `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}; Expires=${expiresAt.toUTCString()}${secure}`);
}
function clearSessionCookie(response: Response) { const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""; response.setHeader("Set-Cookie", `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`); }

export async function registerHandler(request: Request, response: Response, next: NextFunction) { try { const result = await register(registerSchema.parse(request.body)); setSessionCookie(response, result.token, result.expiresAt); response.status(201).json({ message: "Account created successfully.", data: { user: result.user } }); } catch (error) { next(error); } }
export async function loginHandler(request: Request, response: Response, next: NextFunction) { try { const result = await login(loginSchema.parse(request.body)); setSessionCookie(response, result.token, result.expiresAt); response.json({ message: "Logged in successfully.", data: { user: result.user } }); } catch (error) { next(error); } }
export async function logoutHandler(request: Request, response: Response, next: NextFunction) { try { await invalidateSession(getRequestSessionToken(request)); clearSessionCookie(response); response.json({ message: "Logged out successfully." }); } catch (error) { next(error); } }
export async function meHandler(request: Request, response: Response) { response.json({ data: { user: request.authUser } }); }
export async function updateProfileHandler(request: Request, response: Response, next: NextFunction) { try { const user = await updateProfile(request.authUser!.id, updateProfileSchema.parse(request.body)); response.json({ message: "Profile updated successfully.", data: { user } }); } catch (error) { next(error); } }
export async function logoutAllHandler(request: Request, response: Response, next: NextFunction) { try { await prisma.session.deleteMany({ where: { userId: request.authUser!.id } }); clearSessionCookie(response); response.json({ message: "All sessions logged out successfully." }); } catch (error) { next(error); } }
