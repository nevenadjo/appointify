"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publicBusinessWhere } from "@/lib/business-visibility";
import { getBusinessPublicPath } from "@/lib/business-url";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(businessId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "CLIENT") {
    redirect("/login");
  }

  const business = await prisma.business.findFirst({
    where: {
      id: businessId,
      ...publicBusinessWhere,
    },
    select: {
      id: true,
      publicId: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!business) {
    throw new Error("Business is not available.");
  }

  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_businessId: {
        userId: session.user.id,
        businessId,
      },
    },
  });

  if (existingFavorite) {
    await prisma.favorite.delete({
      where: {
        id: existingFavorite.id,
      },
    });
  } else {
    await prisma.favorite.create({
      data: {
        userId: session.user.id,
        businessId,
      },
    });
  }

  const publicPath = getBusinessPublicPath(
    business.category.name,
    business.publicId
  );

  revalidatePath(publicPath);
  revalidatePath("/dashboard/client/favorites");

  return {
    isFavorite: !existingFavorite,
  };
}