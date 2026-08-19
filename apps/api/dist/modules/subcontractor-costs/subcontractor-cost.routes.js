import { Router } from "express";
import { cancelSubcontractorCostHandler, createSubcontractorCostHandler, deleteSubcontractorCostHandler, getSubcontractorCostHandler, listSubcontractorCostsHandler, updateSubcontractorCostHandler, } from "./subcontractor-cost.controller.js";
export const subcontractorCostRouter = Router();
subcontractorCostRouter.get("/", listSubcontractorCostsHandler);
subcontractorCostRouter.get("/:costId", getSubcontractorCostHandler);
subcontractorCostRouter.post("/", createSubcontractorCostHandler);
subcontractorCostRouter.patch("/:costId", updateSubcontractorCostHandler);
subcontractorCostRouter.patch("/:costId/cancel", cancelSubcontractorCostHandler);
subcontractorCostRouter.delete("/:costId", deleteSubcontractorCostHandler);
//# sourceMappingURL=subcontractor-cost.routes.js.map