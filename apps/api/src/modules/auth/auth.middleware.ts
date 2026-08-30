import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { hashSessionToken, SESSION_COOKIE } from "./auth.service.js";

function cookieValue(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

export function getRequestSessionToken(request: Request): string | null {
  const authorization = request.headers.authorization;
  if (authorization?.startsWith("Bearer ")) return authorization.slice(7).trim() || null;
  return cookieValue(request.headers.cookie, SESSION_COOKIE);
}

export async function requireAuth(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const token = getRequestSessionToken(request);
    if (!token) { response.status(401).json({ message: "Authentication required." }); return; }
    const tokenHash = hashSessionToken(token);
    const session = await prisma.session.findFirst({ where: { tokenHash, expiresAt: { gt: new Date() } }, include: { user: { select: { id: true, email: true, firstName: true, lastName: true, businessName: true, abn: true, phone: true, address: true, tradeType: true, gstRegistered: true, businessStructure: true, gstAccountingMethod: true, basFrequency: true, taxProfile: true, taxFinancialYear: true, otherTaxableIncome: true, additionalDeductions: true } } } });
    if (!session) {
      await prisma.session.deleteMany({ where: { tokenHash } });
      response.status(401).json({ message: "Your session is invalid or has expired." });
      return;
    }
    request.authUser = session.user;
    request.authSession = { id: session.id, expiresAt: session.expiresAt };
    if (Date.now() - session.lastUsedAt.getTime() > 5 * 60 * 1000) await prisma.session.update({ where: { id: session.id }, data: { lastUsedAt: new Date() } });
    next();
  } catch (error) { next(error); }
}
