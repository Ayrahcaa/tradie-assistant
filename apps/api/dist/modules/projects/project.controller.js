import { archiveProject, createProject, deleteProject, getProjectById, listProjects, updateProject, } from "./project.service.js";
import { createProjectSchema, projectIdSchema, projectStatusSchema, updateProjectSchema, } from "./project.schema.js";
export async function createProjectHandler(request, response, next) {
    try {
        const parsedBody = createProjectSchema.safeParse(request.body);
        if (!parsedBody.success) {
            response.status(400).json({
                message: "Invalid project data.",
                errors: parsedBody.error.flatten(),
            });
            return;
        }
        const project = await createProject(request.authUser.id, parsedBody.data);
        response.status(201).json({
            message: "Project created successfully.",
            data: project,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function listProjectsHandler(request, response, next) {
    try {
        const rawStatus = request.query.status;
        let status;
        if (typeof rawStatus === "string") {
            const parsedStatus = projectStatusSchema.safeParse(rawStatus);
            if (!parsedStatus.success) {
                response.status(400).json({
                    message: "Status must be ACTIVE, COMPLETED or ARCHIVED.",
                });
                return;
            }
            status = parsedStatus.data;
        }
        const projects = await listProjects(request.authUser.id, status);
        response.status(200).json({
            count: projects.length,
            data: projects,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getProjectHandler(request, response, next) {
    try {
        const parsedParams = projectIdSchema.safeParse(request.params);
        if (!parsedParams.success) {
            response.status(400).json({
                message: "Invalid project ID.",
                errors: parsedParams.error.flatten(),
            });
            return;
        }
        const project = await getProjectById(request.authUser.id, parsedParams.data.projectId);
        if (!project) {
            response.status(404).json({
                message: "Project not found.",
            });
            return;
        }
        response.status(200).json({
            data: project,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function updateProjectHandler(request, response, next) {
    try {
        const parsedParams = projectIdSchema.safeParse(request.params);
        if (!parsedParams.success) {
            response.status(400).json({
                message: "Invalid project ID.",
                errors: parsedParams.error.flatten(),
            });
            return;
        }
        const parsedBody = updateProjectSchema.safeParse(request.body);
        if (!parsedBody.success) {
            response.status(400).json({
                message: "Invalid project update.",
                errors: parsedBody.error.flatten(),
            });
            return;
        }
        const project = await updateProject(request.authUser.id, parsedParams.data.projectId, parsedBody.data);
        if (!project) {
            response.status(404).json({
                message: "Project not found.",
            });
            return;
        }
        response.status(200).json({
            message: "Project updated successfully.",
            data: project,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function archiveProjectHandler(request, response, next) {
    try {
        const parsedParams = projectIdSchema.safeParse(request.params);
        if (!parsedParams.success) {
            response.status(400).json({
                message: "Invalid project ID.",
                errors: parsedParams.error.flatten(),
            });
            return;
        }
        const project = await archiveProject(request.authUser.id, parsedParams.data.projectId);
        if (!project) {
            response.status(404).json({
                message: "Project not found.",
            });
            return;
        }
        response.status(200).json({
            message: "Project archived successfully.",
            data: project,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function deleteProjectHandler(request, response, next) {
    try {
        const parsedParams = projectIdSchema.safeParse(request.params);
        if (!parsedParams.success) {
            response.status(400).json({
                message: "Invalid project ID.",
                errors: parsedParams.error.flatten(),
            });
            return;
        }
        const deleted = await deleteProject(request.authUser.id, parsedParams.data.projectId);
        if (!deleted) {
            response.status(404).json({
                message: "Project not found.",
            });
            return;
        }
        response.status(200).json({
            message: "Project deleted permanently.",
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=project.controller.js.map