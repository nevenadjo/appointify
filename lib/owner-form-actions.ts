"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createBusiness, updateBusiness, updateWorkingHours } from "./business-actions";
import { createService, updateService } from "./service-actions";
import { formFailure, type FormResult } from "./form-validation";

export async function getOwnerFormData(kind: string, businessId?: string, serviceId?: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") return { error: "Unauthorized." };
  const business = businessId ? await prisma.business.findFirst({ where: { id: businessId, ownerId: session.user.id }, include: { workingHours: true } }) : null;
  if (businessId && !business) return { error: "Business not found." };
  if (!businessId && kind !== "business") return { error: "Business not found." };
  const service = serviceId ? await prisma.service.findFirst({ where: { id: serviceId, businessId: business?.id, business: { ownerId: session.user.id } } }) : null;
  if (serviceId && !service) return { error: "Service not found." };
  const [categories, cities] = kind === "business" ? await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }), prisma.city.findMany({ orderBy: { name: "asc" } }),
  ]) : [[], []];
  return { business, service, categories, cities };
}

export async function submitOwnerForm(kind: string, businessId: string | undefined, serviceId: string | undefined, _previous: FormResult, data: FormData): Promise<FormResult> {
  if (!data.has("acceptsCards")) data.set("acceptsCards", "");
  for (let day = 0; day < 7; day++) if (!data.has(`isOpen-${day}`)) data.set(`isOpen-${day}`, "");
  let result: FormResult;
  if (kind === "business") result = businessId ? await updateBusiness(businessId, data) : await createBusiness(data);
  else if (kind === "service" && businessId) result = serviceId ? await updateService(serviceId, data) : await createService(businessId, data);
  else if (kind === "hours" && businessId) result = await updateWorkingHours(businessId, data);
  else return formFailure({}, "Form not found.");
  // Only non-sensitive text is returned for progressive-enhancement rerenders.
  return { ...result, values: Object.fromEntries([...data.entries()].filter(([key, value]) => typeof value === "string" && !key.startsWith("$ACTION_")).map(([key, value]) => [key, String(value)])) };
}
