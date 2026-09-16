import type { CookieOptions, NextFunction, Request, Response } from "express";
import { loginSchema, registerSchema, updateProfileSchema } from "./auth.schema.js";
import { invalidateSession, login, register, SESSION_COOKIE, SESSION_TTL_MS, updateProfile } from "./auth.service.js";
import { getRequestSessionToken } from "./auth.middleware.js";
import { prisma } from "../../lib/prisma.js";

function sessionCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
}

function setSessionCookie(response: Response, token: string, expiresAt: Date) {
  response.cookie(SESSION_COOKIE, token, {
    ...sessionCookieOptions(),
    maxAge: SESSION_TTL_MS,
    expires: expiresAt,
  });
}

function clearSessionCookie(response: Response) {
  response.clearCookie(SESSION_COOKIE, sessionCookieOptions());
}

function authResponseData(request: Request, result: { user: unknown; token: string; expiresAt: Date }) {
  // Native clients cannot reliably use browser cookie jars. They explicitly opt in
  // to receiving the same opaque session token and keep it in OS secure storage.
  return request.get("X-Client-Platform") === "mobile"
    ? { user: result.user, sessionToken: result.token, expiresAt: result.expiresAt }
    : { user: result.user };
}

export async function registerHandler(request: Request, response: Response, next: NextFunction) { try { const result = await register(registerSchema.parse(request.body)); setSessionCookie(response, result.token, result.expiresAt); response.status(201).json({ message: "Account created successfully.", data: authResponseData(request, result) }); } catch (error) { next(error); } }
export async function loginHandler(request: Request, response: Response, next: NextFunction) { try { const result = await login(loginSchema.parse(request.body)); setSessionCookie(response, result.token, result.expiresAt); response.json({ message: "Logged in successfully.", data: authResponseData(request, result) }); } catch (error) { next(error); } }
export async function logoutHandler(request: Request, response: Response, next: NextFunction) { try { await invalidateSession(getRequestSessionToken(request)); clearSessionCookie(response); response.json({ message: "Logged out successfully." }); } catch (error) { next(error); } }
export async function meHandler(request: Request, response: Response) { response.json({ data: { user: request.authUser } }); }
export async function updateProfileHandler(request: Request, response: Response, next: NextFunction) { try { const user = await updateProfile(request.authUser!.id, updateProfileSchema.parse(request.body)); response.json({ message: "Profile updated successfully.", data: { user } }); } catch (error) { next(error); } }
export async function logoutAllHandler(request: Request, response: Response, next: NextFunction) { try { await prisma.session.deleteMany({ where: { userId: request.authUser!.id } }); clearSessionCookie(response); response.json({ message: "All sessions logged out successfully." }); } catch (error) { next(error); } }
