import { createSubcontractorSchema, subcontractorIdSchema, updateSubcontractorSchema, } from "./subcontractor.schema.js";
import { archiveSubcontractor, createSubcontractor, deleteSubcontractor, getSubcontractorById, listSubcontractors, restoreSubcontractor, updateSubcontractor, } from "./subcontractor.service.js";
export async function createSubcontractorHandler(request, response, next) {
    try {
        const input = createSubcontractorSchema.parse(request.body);
        const subcontractor = await createSubcontractor(input);
        response.status(201).json({
            message: "Subcontractor created successfully.",
            data: subcontractor,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function listSubcontractorsHandler(request, response, next) {
    try {
        const includeArchived = request.query.includeArchived === "true";
        const subcontractors = await listSubcontractors(includeArchived);
        response.status(200).json({
            count: subcontractors.length,
            data: subcontractors,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getSubcontractorHandler(request, response, next) {
    try {
        const { subcontractorId } = subcontractorIdSchema.parse(request.params);
        const subcontractor = await getSubcontractorById(subcontractorId);
        if (!subcontractor) {
            response.status(404).json({
                message: "Subcontractor not found.",
            });
            return;
        }
        response.status(200).json({
            data: subcontractor,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function updateSubcontractorHandler(request, response, next) {
    try {
        const { subcontractorId } = subcontractorIdSchema.parse(request.params);
        const input = updateSubcontractorSchema.parse(request.body);
        const subcontractor = await updateSubcontractor(subcontractorId, input);
        if (!subcontractor) {
            response.status(404).json({
                message: "Subcontractor not found.",
            });
            return;
        }
        response.status(200).json({
            message: "Subcontractor updated successfully.",
            data: subcontractor,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function archiveSubcontractorHandler(request, response, next) {
    try {
        const { subcontractorId } = subcontractorIdSchema.parse(request.params);
        const subcontractor = await archiveSubcontractor(subcontractorId);
        if (!subcontractor) {
            response.status(404).json({
                message: "Subcontractor not found.",
            });
            return;
        }
        response.status(200).json({
            message: "Subcontractor archived successfully.",
            data: subcontractor,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function restoreSubcontractorHandler(request, response, next) {
    try {
        const { subcontractorId } = subcontractorIdSchema.parse(request.params);
        const subcontractor = await restoreSubcontractor(subcontractorId);
        if (!subcontractor) {
            response.status(404).json({
                message: "Subcontractor not found.",
            });
            return;
        }
        response.status(200).json({
            message: "Subcontractor restored successfully.",
            data: subcontractor,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function deleteSubcontractorHandler(request, response, next) {
    try {
        const { subcontractorId } = subcontractorIdSchema.parse(request.params);
        const deleted = await deleteSubcontractor(subcontractorId);
        if (!deleted) {
            response.status(404).json({
                message: "Subcontractor not found.",
            });
            return;
        }
        response.status(200).json({
            message: "Subcontractor deleted successfully.",
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=subcontractor.controller.js.map