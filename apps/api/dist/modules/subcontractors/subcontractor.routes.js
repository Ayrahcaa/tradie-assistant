import { Router } from "express";
import { archiveSubcontractorHandler, createSubcontractorHandler, deleteSubcontractorHandler, getSubcontractorHandler, listSubcontractorsHandler, restoreSubcontractorHandler, updateSubcontractorHandler, } from "./subcontractor.controller.js";
export const subcontractorRouter = Router();
subcontractorRouter.get("/", listSubcontractorsHandler);
subcontractorRouter.post("/", createSubcontractorHandler);
subcontractorRouter.get("/:subcontractorId", getSubcontractorHandler);
subcontractorRouter.patch("/:subcontractorId", updateSubcontractorHandler);
subcontractorRouter.patch("/:subcontractorId/archive", archiveSubcontractorHandler);
subcontractorRouter.patch("/:subcontractorId/restore", restoreSubcontractorHandler);
subcontractorRouter.delete("/:subcontractorId", deleteSubcontractorHandler);
//# sourceMappingURL=subcontractor.routes.js.map