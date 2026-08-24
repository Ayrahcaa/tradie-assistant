import { Router } from "express";
import { businessOverviewHandler, customerOverviewHandler, projectOverviewHandler } from "./analytics.controller.js";
export const analyticsRouter = Router();
analyticsRouter.get("/overview", businessOverviewHandler);
analyticsRouter.get("/projects/:projectId", projectOverviewHandler);
analyticsRouter.get("/customers/:customerId", customerOverviewHandler);
//# sourceMappingURL=analytics.routes.js.map