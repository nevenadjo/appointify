"use server";
import type { FormResult } from "@/lib/form-validation";

import { unstable_rethrow } from "next/navigation";
import { databaseFailure } from "@/lib/form-database-error";

import { validateForm, formFailure } from "@/lib/form-validation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { generateBusinessPublicId } from "@/lib/business-public-id";
import { getBusinessPublicPath } from "@/lib/business-url";

async function getUniqueBusinessPublicId() {
  while (true) {
    const publicId = generateBusinessPublicId();

    const existingBusiness = await prisma.business.findUnique({
      where: {
        publicId,
      },
      select: {
        id: true,
      },
    });

    if (!existingBusiness) {
      return publicId;
    }
  }
}

export async function createBusiness(formData: FormData, redirectOnSuccess = true): Promise<FormResult> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "OWNER") {
      redirect("/login");
    }

    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const cityId = String(formData.get("cityId") || "");
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const categoryId = String(formData.get("categoryId") || "");
    const acceptsCards = formData.get("acceptsCards") === "on";

    const errors = validateForm("business", formData);
    const [category, city] = await Promise.all([
      categoryId ? prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } }) : null,
      cityId ? prisma.city.findUnique({ where: { id: cityId }, select: { id: true } }) : null,
    ]);
    if (categoryId && !category) errors.categoryId = "Selected category is invalid.";
    if (cityId && !city) errors.cityId = "Selected city is invalid.";
    if (Object.keys(errors).length) return formFailure(errors);

    const publicId = await getUniqueBusinessPublicId();

    const business = await prisma.business.create({
      data: {
        ownerId: session.user.id,
        categoryId,
        cityId,
        publicId,
        name,
        description: description || null,
        address,
        phone: phone || null,
        email: email || null,
        acceptsCards,
      },
    });

    revalidatePath("/dashboard/owner");
    revalidatePath("/businesses");
    revalidatePath("/");

    if (redirectOnSuccess) redirect(`/dashboard/owner/${business.id}?notice=business_created`);
    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    return databaseFailure(error);
  }
}

export async function updateBusiness(businessId: string, formData: FormData, redirectOnSuccess = true): Promise<FormResult> {
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
    const address = String(formData.get("address") || "").trim();
    const cityId = String(formData.get("cityId") || "");
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const categoryId = String(formData.get("categoryId") || "");
    const acceptsCards = formData.get("acceptsCards") === "on";

    const errors = validateForm("business", formData);
    const [category, city] = await Promise.all([
      categoryId ? prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } }) : null,
      cityId ? prisma.city.findUnique({ where: { id: cityId }, select: { id: true } }) : null,
    ]);
    if (categoryId && !category) errors.categoryId = "Selected category is invalid.";
    if (cityId && !city) errors.cityId = "Selected city is invalid.";
    if (Object.keys(errors).length) return formFailure(errors);

    const oldPublicPath = getBusinessPublicPath(
      business.category.name,
      business.publicId,
    );

    const updatedBusiness = await prisma.business.update({
      where: {
        id: businessId,
      },
      data: {
        category: {
          connect: {
            id: categoryId,
          },
        },
        city: {
          connect: {
            id: cityId,
          },
        },
        name,
        description: description || null,
        address,
        phone: phone || null,
        email: email || null,
        acceptsCards,
      },
      include: {
        category: true,
      },
    });

    const newPublicPath = getBusinessPublicPath(
      updatedBusiness.category.name,
      updatedBusiness.publicId,
    );

    revalidatePath("/dashboard/owner");
    revalidatePath(`/dashboard/owner/${businessId}`);
    revalidatePath("/");
    revalidatePath("/businesses");
    revalidatePath(oldPublicPath);
    revalidatePath(`${oldPublicPath}/reserve`);
    revalidatePath(newPublicPath);
    revalidatePath(`${newPublicPath}/reserve`);
    revalidatePath("/dashboard/client/favorites");
    revalidatePath("/dashboard/client/reservations");

    if (redirectOnSuccess) redirect(`/dashboard/owner/${businessId}?notice=business_updated`);
    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    return databaseFailure(error);
  }
}

export async function toggleBusiness(businessId: string, redirectOnSuccess = true): Promise<FormResult> {
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

  await prisma.business.update({
    where: {
      id: businessId,
    },
    data: {
      isActive: !business.isActive,
    },
  });

  const publicPath = getBusinessPublicPath(
    business.category.name,
    business.publicId,
  );

  revalidatePath("/dashboard/owner", "layout");
  revalidatePath(`/dashboard/owner/${businessId}`);
  revalidatePath("/businesses");
  revalidatePath("/");
  revalidatePath(publicPath);
  revalidatePath(`${publicPath}/reserve`);
  revalidatePath("/dashboard/client/favorites");
  revalidatePath("/dashboard/client/reservations");

  if (redirectOnSuccess) redirect(`/dashboard/owner/${businessId}`);
    return { success: true };
 } catch(error) { unstable_rethrow(error); return databaseFailure(error); }
}

export async function updateWorkingHours(
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

    const errors = validateForm("hours", formData);
    if (Object.keys(errors).length) return formFailure(errors);
    await prisma.$transaction(async (tx) => {
      for (let day = 0; day < 7; day++) {
        const isOpen = formData.get(`isOpen-${day}`) === "on";
        const startTime = String(formData.get(`startTime-${day}`) || "");
        const endTime = String(formData.get(`endTime-${day}`) || "");
        const breakStart = String(formData.get(`breakStart-${day}`) || "");
        const breakEnd = String(formData.get(`breakEnd-${day}`) || "");

        await tx.workingHour.upsert({
          where: {
            businessId_dayOfWeek: {
              businessId,
              dayOfWeek: day,
            },
          },
          update: {
            isOpen,
            startTime: isOpen && startTime ? startTime : null,
            endTime: isOpen && endTime ? endTime : null,
            breakStart: isOpen && breakStart ? breakStart : null,
            breakEnd: isOpen && breakEnd ? breakEnd : null,
          },
          create: {
            businessId,
            dayOfWeek: day,
            isOpen,
            startTime: isOpen && startTime ? startTime : null,
            endTime: isOpen && endTime ? endTime : null,
            breakStart: isOpen && breakStart ? breakStart : null,
            breakEnd: isOpen && breakEnd ? breakEnd : null,
          },
        });
      }

    });

    const publicPath = getBusinessPublicPath(
      business.category.name,
      business.publicId,
    );

    revalidatePath(`/dashboard/owner/${businessId}`);
    revalidatePath(publicPath);
    revalidatePath(`${publicPath}/reserve`);

    if (redirectOnSuccess) redirect(`/dashboard/owner/${businessId}?notice=hours_updated`);
    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    return databaseFailure(error);
  }
}

export async function addBusinessImage(businessId: string, formData: FormData): Promise<FormResult> {
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
      return formFailure({}, "Business not found.");
    }

    const file = formData.get("image");

    const errors = validateForm("image", formData);
    if (Object.keys(errors).length) return formFailure(errors);
    if (!(file instanceof File)) return formFailure({ image: "Please select an image." });

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `${randomUUID()}.${extension}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "businesses");

    await mkdir(uploadDir, {
      recursive: true,
    });

    const filePath = path.join(uploadDir, fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/businesses/${fileName}`;

    await prisma.businessImage.create({
      data: {
        businessId,
        imageUrl,
      },
    });

    const publicPath = getBusinessPublicPath(
      business.category.name,
      business.publicId,
    );

    revalidatePath(`/dashboard/owner/${businessId}`);
    revalidatePath(publicPath);

    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    return databaseFailure(error);
  }
}

export async function deleteBusinessImage(imageId: string): Promise<FormResult> {
 try {

  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  const image = await prisma.businessImage.findFirst({
    where: {
      id: imageId,
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

  if (!image) {
    return formFailure({}, "Image not found.");
  }

  const filePath = path.join(process.cwd(), "public", image.imageUrl);

  try {
    await unlink(filePath);
  } catch {}

  await prisma.businessImage.delete({
    where: {
      id: imageId,
    },
  });

  const publicPath = getBusinessPublicPath(
    image.business.category.name,
    image.business.publicId,
  );

  revalidatePath(`/dashboard/owner/${image.business.id}`);
  revalidatePath(publicPath);

 return { success: true };
 } catch(error) { unstable_rethrow(error); return databaseFailure(error); }
}
