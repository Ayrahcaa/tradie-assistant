import type { NextFunction, Request, Response } from "express";

import {
  createSubcontractorSchema,
  subcontractorIdSchema,
  updateSubcontractorSchema,
} from "./subcontractor.schema.js";

import {
  archiveSubcontractor,
  createSubcontractor,
  deleteSubcontractor,
  getSubcontractorById,
  listSubcontractors,
  restoreSubcontractor,
  updateSubcontractor,
} from "./subcontractor.service.js";

export async function createSubcontractorHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = createSubcontractorSchema.parse(request.body);

    const subcontractor = await createSubcontractor(request.authUser!.id, input);

    response.status(201).json({
      message: "Subcontractor created successfully.",
      data: subcontractor,
    });
  } catch (error) {
    next(error);
  }
}

export async function listSubcontractorsHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const includeArchived = request.query.includeArchived === "true";

    const subcontractors = await listSubcontractors(request.authUser!.id, includeArchived);

    response.status(200).json({
      count: subcontractors.length,
      data: subcontractors,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSubcontractorHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { subcontractorId } = subcontractorIdSchema.parse(request.params);

    const subcontractor = await getSubcontractorById(request.authUser!.id, subcontractorId);

    if (!subcontractor) {
      response.status(404).json({
        message: "Subcontractor not found.",
      });

      return;
    }

    response.status(200).json({
      data: subcontractor,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSubcontractorHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { subcontractorId } = subcontractorIdSchema.parse(request.params);

    const input = updateSubcontractorSchema.parse(request.body);

    const subcontractor = await updateSubcontractor(request.authUser!.id, subcontractorId, input);

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
  } catch (error) {
    next(error);
  }
}

export async function archiveSubcontractorHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { subcontractorId } = subcontractorIdSchema.parse(request.params);

    const subcontractor = await archiveSubcontractor(request.authUser!.id, subcontractorId);

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
  } catch (error) {
    next(error);
  }
}

export async function restoreSubcontractorHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { subcontractorId } = subcontractorIdSchema.parse(request.params);

    const subcontractor = await restoreSubcontractor(request.authUser!.id, subcontractorId);

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
  } catch (error) {
    next(error);
  }
}

export async function deleteSubcontractorHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { subcontractorId } = subcontractorIdSchema.parse(request.params);

    const deleted = await deleteSubcontractor(request.authUser!.id, subcontractorId);

    if (!deleted) {
      response.status(404).json({
        message: "Subcontractor not found.",
      });

      return;
    }

    response.status(200).json({
      message: "Subcontractor deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}
