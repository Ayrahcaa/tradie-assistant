import { Router } from "express";
import { archiveProjectHandler, createProjectHandler, deleteProjectHandler, getProjectHandler, listProjectsHandler, updateProjectHandler, } from "./project.controller.js";
export const projectRouter = Router();
projectRouter.get("/", listProjectsHandler);
projectRouter.get("/:projectId", getProjectHandler);
projectRouter.post("/", createProjectHandler);
projectRouter.patch("/:projectId", updateProjectHandler);
projectRouter.patch("/:projectId/archive", archiveProjectHandler);
projectRouter.delete("/:projectId", deleteProjectHandler);
//# sourceMappingURL=project.routes.js.map