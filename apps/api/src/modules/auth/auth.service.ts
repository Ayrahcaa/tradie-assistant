import { createHash, randomBytes } from "node:crypto";
import { HttpError } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { hashPassword, verifyPassword } from "./password.js";
import type { AuthUser } from "./auth.types.js";
import type { LoginInput, RegisterInput, UpdateProfileInput } from "./auth.schema.js";

export const SESSION_COOKIE = "tradie_session";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const safeUserSelect = { id: true, email: true, firstName: true, lastName: true, businessName: true, abn: true, phone: true, address: true, tradeType: true, gstRegistered: true, businessStructure: true, gstAccountingMethod: true, basFrequency: true, taxProfile: true, taxFinancialYear: true, otherTaxableIncome: true, additionalDeductions: true } as const;
const dummyPasswordHash = hashPassword("invalid-credential-timing-value");
export const hashSessionToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const session = await prisma.session.create({ data: { userId, tokenHash: hashSessionToken(token), expiresAt } });
  return { token, session };
}

export async function register(input: RegisterInput): Promise<{ user: AuthUser; token: string; expiresAt: Date }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existing) throw new HttpError(409, "An account with this email already exists.");
  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({ data: { firstName: input.firstName, lastName: input.lastName, email: input.email, businessName: input.businessName || null, passwordCredential: { create: { passwordHash } } }, select: safeUserSelect });
  const { token, session } = await createSession(user.id);
  return { user, token, expiresAt: session.expiresAt };
}

export async function login(input: LoginInput): Promise<{ user: AuthUser; token: string; expiresAt: Date }> {
  const account = await prisma.user.findUnique({ where: { email: input.email }, include: { passwordCredential: true } });
  const valid = await verifyPassword(input.password, account?.passwordCredential?.passwordHash ?? await dummyPasswordHash);
  if (!account || !valid) throw new HttpError(401, "Invalid email or password.");
  const { token, session } = await createSession(account.id);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: account.id }, select: safeUserSelect });
  return { user, token, expiresAt: session.expiresAt };
}

export async function invalidateSession(token: string | null): Promise<void> {
  if (!token) return;
  await prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<AuthUser> {
  return prisma.user.update({ where: { id: userId }, data: input, select: safeUserSelect });
}
