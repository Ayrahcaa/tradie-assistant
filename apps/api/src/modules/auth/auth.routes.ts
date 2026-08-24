import { Router } from "express";
import { loginHandler, logoutAllHandler, logoutHandler, meHandler, registerHandler, updateProfileHandler } from "./auth.controller.js";
import { requireAuth } from "./auth.middleware.js";

export const authRouter = Router();
authRouter.post("/register", registerHandler);
authRouter.post("/login", loginHandler);
authRouter.post("/logout", logoutHandler);
authRouter.get("/me", requireAuth, meHandler);
authRouter.patch("/profile", requireAuth, updateProfileHandler);
authRouter.post("/logout-all", requireAuth, logoutAllHandler);
