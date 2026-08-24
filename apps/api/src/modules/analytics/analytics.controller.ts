import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { getBusinessOverview, getCustomerOverview, getProjectOverview } from "./analytics.service.js";

const idSchema = z.string().uuid();

export async function businessOverviewHandler(request: Request, response: Response, next: NextFunction) {
  try { response.json({ data: await getBusinessOverview(request.authUser!.id) }); } catch (error) { next(error); }
}

export async function projectOverviewHandler(request: Request, response: Response, next: NextFunction) {
  try {
    const id = idSchema.safeParse(request.params.projectId);
    if (!id.success) { response.status(400).json({ message: "Invalid project ID." }); return; }
    const data = await getProjectOverview(request.authUser!.id, id.data);
    if (!data) { response.status(404).json({ message: "Project not found." }); return; }
    response.json({ data });
  } catch (error) { next(error); }
}

export async function customerOverviewHandler(request: Request, response: Response, next: NextFunction) {
  try {
    const id = idSchema.safeParse(request.params.customerId);
    if (!id.success) { response.status(400).json({ message: "Invalid customer ID." }); return; }
    const data = await getCustomerOverview(request.authUser!.id, id.data);
    if (!data) { response.status(404).json({ message: "Customer not found." }); return; }
    response.json({ data });
  } catch (error) { next(error); }
}
