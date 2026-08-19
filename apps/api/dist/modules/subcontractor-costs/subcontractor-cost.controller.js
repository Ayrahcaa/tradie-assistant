import { cancelSubcontractorCost, createSubcontractorCost, deleteSubcontractorCost, getSubcontractorCostById, listSubcontractorCosts, updateSubcontractorCost, } from "./subcontractor-cost.service.js";
import { createSubcontractorCostSchema, subcontractorCostIdSchema, updateSubcontractorCostSchema, } from "./subcontractor-cost.schema.js";
export async function createSubcontractorCostHandler(request, response, next) {
    try {
        const parsed = createSubcontractorCostSchema.safeParse(request.body);
        if (!parsed.success) {
            response.status(400).json({
                message: "Invalid subcontractor cost data.",
                errors: parsed.error.flatten(),
            });
            return;
        }
        const cost = await createSubcontractorCost(parsed.data);
        response.status(201).json({
            message: "Subcontractor project cost created successfully.",
            data: cost,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function listSubcontractorCostsHandler(request, response, next) {
    try {
        const subcontractorId = typeof request.query.subcontractorId === "string"
            ? request.query.subcontractorId
            : undefined;
        const projectId = typeof request.query.projectId === "string"
            ? request.query.projectId
            : undefined;
        const costs = await listSubcontractorCosts(subcontractorId, projectId);
        response.status(200).json({
            count: costs.length,
            data: costs,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getSubcontractorCostHandler(request, response, next) {
    try {
        const parsed = subcontractorCostIdSchema.safeParse(request.params);
        if (!parsed.success) {
            response.status(400).json({
                message: "Invalid subcontractor cost ID.",
            });
            return;
        }
        const cost = await getSubcontractorCostById(parsed.data.costId);
        if (!cost) {
            response.status(404).json({
                message: "Subcontractor cost not found.",
            });
            return;
        }
        response.status(200).json({
            data: cost,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function updateSubcontractorCostHandler(request, response, next) {
    try {
        const params = subcontractorCostIdSchema.safeParse(request.params);
        if (!params.success) {
            response.status(400).json({
                message: "Invalid subcontractor cost ID.",
            });
            return;
        }
        const body = updateSubcontractorCostSchema.safeParse(request.body);
        if (!body.success) {
            response.status(400).json({
                message: "Invalid subcontractor cost update.",
                errors: body.error.flatten(),
            });
            return;
        }
        const cost = await updateSubcontractorCost(params.data.costId, body.data);
        if (!cost) {
            response.status(404).json({
                message: "Subcontractor cost not found.",
            });
            return;
        }
        response.status(200).json({
            message: "Subcontractor cost updated successfully.",
            data: cost,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function cancelSubcontractorCostHandler(request, response, next) {
    try {
        const parsed = subcontractorCostIdSchema.safeParse(request.params);
        if (!parsed.success) {
            response.status(400).json({
                message: "Invalid subcontractor cost ID.",
            });
            return;
        }
        const cost = await cancelSubcontractorCost(parsed.data.costId);
        if (!cost) {
            response.status(404).json({
                message: "Subcontractor cost not found.",
            });
            return;
        }
        response.status(200).json({
            message: "Subcontractor cost cancelled.",
            data: cost,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function deleteSubcontractorCostHandler(request, response, next) {
    try {
        const parsed = subcontractorCostIdSchema.safeParse(request.params);
        if (!parsed.success) {
            response.status(400).json({
                message: "Invalid subcontractor cost ID.",
            });
            return;
        }
        const deleted = await deleteSubcontractorCost(parsed.data.costId);
        if (!deleted) {
            response.status(404).json({
                message: "Subcontractor cost not found.",
            });
            return;
        }
        response.status(200).json({
            message: "Subcontractor cost deleted successfully.",
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=subcontractor-cost.controller.js.map