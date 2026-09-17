"use server";
import type { FormResult } from "@/lib/form-validation";

import { unstable_rethrow } from "next/navigation";
import { databaseFailure } from "@/lib/form-database-error";

import { validateForm, formFailure } from "@/lib/form-validation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getBusinessPublicPath } from "@/lib/business-url";

export async function createService(
  businessId: string,
  formData: FormData, redirectOnSuccess = true): Promise<FormResult> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "OWNER") {
      redirect("/login");
    }

    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: session.user.id,
      },
      include: {
        category: true,
      },
    });

    if (!business) {
      redirect("/dashboard/owner");
    }

    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const price = Number(formData.get("price"));
    const duration = Number(formData.get("duration"));
    const color = String(formData.get("color") || "").trim();

    const errors = validateForm("service", formData);
    if (Object.keys(errors).length) return formFailure(errors);

    await prisma.service.create({
      data: {
        businessId,
        name,
        description: description || null,
        price,
        duration,
        color: color || null,
        isActive: true,
      },
    });

    const publicPath = getBusinessPublicPath(
      business.category.name,
      business.publicId
    );

    revalidatePath(`/dashboard/owner/${businessId}`);
    revalidatePath(publicPath);
    revalidatePath(`${publicPath}/reserve`);

    if (redirectOnSuccess) redirect(`/dashboard/owner/${businessId}?notice=service_created`);
    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    return databaseFailure(error);
  }
}

export async function updateService(
  serviceId: string,
  formData: FormData, redirectOnSuccess = true): Promise<FormResult> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "OWNER") {
      redirect("/login");
    }

    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        business: {
          ownerId: session.user.id,
        },
      },
      include: {
        business: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!service) {
      redirect("/dashboard/owner");
    }

    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const price = Number(formData.get("price"));
    const duration = Number(formData.get("duration"));
    const color = String(formData.get("color") || "").trim();

    const errors = validateForm("service", formData);
    if (Object.keys(errors).length) return formFailure(errors);

    await prisma.service.update({
      where: {
        id: serviceId,
      },
      data: {
        name,
        description: description || null,
        price,
        duration,
        color: color || null,
      },
    });

    const publicPath = getBusinessPublicPath(
      service.business.category.name,
      service.business.publicId
    );

    revalidatePath(`/dashboard/owner/${service.businessId}`);
    revalidatePath(publicPath);
    revalidatePath(`${publicPath}/reserve`);

    if (redirectOnSuccess) redirect(`/dashboard/owner/${service.businessId}?notice=service_updated`);
    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    return databaseFailure(error);
  }
}

export async function toggleService(serviceId: string, redirectOnSuccess = true): Promise<FormResult> {
 try {

  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      business: {
        ownerId: session.user.id,
      },
    },
    include: {
      business: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!service) {
    redirect("/dashboard/owner");
  }

  await prisma.service.update({
    where: {
      id: serviceId,
    },
    data: {
      isActive: !service.isActive,
    },
  });

  const publicPath = getBusinessPublicPath(
    service.business.category.name,
    service.business.publicId
  );

  revalidatePath(`/dashboard/owner/${service.businessId}`);
  revalidatePath(publicPath);
  revalidatePath(`${publicPath}/reserve`);

  if (redirectOnSuccess) redirect(`/dashboard/owner/${service.businessId}`);
    return { success: true };
 } catch(error) { unstable_rethrow(error); return databaseFailure(error); }
}