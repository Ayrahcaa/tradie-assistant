import { Router } from "express";
import { accountantExport, cashflow, createPayg, money, statement, tax, weekly } from "./financial.controller.js";
export const financialRouter = Router();
financialRouter.get("/money", money);
financialRouter.get("/tax-summary", tax);
financialRouter.get("/weekly-check", weekly);
financialRouter.get("/cashflow", cashflow);
financialRouter.get("/accountant-export.csv", accountantExport);
financialRouter.get("/subcontractors/:subcontractorId/statement", statement);
financialRouter.post("/payg-instalments", createPayg);
//# sourceMappingURL=financial.routes.js.map