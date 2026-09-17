"use server";
import type { FormResult } from "@/lib/form-validation";

import { unstable_rethrow } from "next/navigation";
import { databaseFailure } from "@/lib/form-database-error";

import { textValue, formFailure } from "@/lib/form-validation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isActiveAdmin } from "@/lib/admin-auth";
import { getBusinessPublicPath } from "@/lib/business-url";
import { revalidatePath } from "next/cache";

export async function toggleUserActive(userId: string): Promise<FormResult> {
 try {

  const session = await auth();

  if (!session?.user) {
    return {
      error: "Unauthorized.",
    };
  }

  if (!(await isActiveAdmin())) {
    return {
      error: "Unauthorized.",
    };
  }

  if (session.user.id === userId) {
    return {
      error: "You cannot deactivate your own account.",
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      isActive: true,
    },
  });

  if (!user) {
    return {
      error: "User not found.",
    };
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isActive: !user.isActive,
    },
  });

  revalidatePath("/admin/users");

  return { success: true };
 } catch(error) { unstable_rethrow(error); return databaseFailure(error); }
}

export async function setBusinessSuspended(
  businessId: string,
  isSuspended: boolean
): Promise<FormResult> {
 try {

  if (!(await isActiveAdmin())) {
    return { error: "Unauthorized." };
  }

  if (
    typeof businessId !== "string" ||
    !businessId ||
    typeof isSuspended !== "boolean"
  ) {
    return { error: "Invalid business details." };
  }

  const business = await prisma.business.findUnique({
    where: {
      id: businessId,
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
    return { error: "Business not found." };
  }

  await prisma.business.update({
    where: {
      id: businessId,
    },
    data: {
      isSuspended,
    },
  });

  const publicPath = getBusinessPublicPath(
    business.category.name,
    business.publicId
  );

  revalidatePath("/admin/businesses");
  revalidatePath("/");
  revalidatePath("/businesses");
  revalidatePath(publicPath);
  revalidatePath(`${publicPath}/reserve`);
  revalidatePath("/dashboard/client/favorites");
  revalidatePath("/dashboard/client/reservations");
  revalidatePath("/dashboard/owner", "layout");
  revalidatePath(`/dashboard/owner/${businessId}`);

  return { success: true };
 } catch(error) { unstable_rethrow(error); return databaseFailure(error); }
}

export async function deleteAdminReview(reviewId: string): Promise<FormResult> {
 try {

  if (!(await isActiveAdmin())) {
    return { error: "Unauthorized." };
  }

  if (typeof reviewId !== "string" || !reviewId) {
    return { error: "Invalid review." };
  }

  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
    select: {
      businessId: true,
      business: {
        select: {
          publicId: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!review) {
    return { error: "Review not found." };
  }

  await prisma.review.deleteMany({
    where: {
      id: reviewId,
    },
  });

  const publicPath = getBusinessPublicPath(
    review.business.category.name,
    review.business.publicId
  );

  revalidatePath("/admin/reviews");
  revalidatePath("/businesses");
  revalidatePath(publicPath);
  revalidatePath(`/dashboard/owner/${review.businessId}`);
  revalidatePath("/dashboard/client/reservations");

  return { success: true };
 } catch(error) { unstable_rethrow(error); return databaseFailure(error); }
}

export async function createCategory(input: {
  name: string;
  icon?: string;
}): Promise<FormResult> {
  try {
    if (!(await isActiveAdmin())) {
      return { error: "Unauthorized." };
    }

    const name = textValue(input.name);
    const icon = textValue(input.icon) || null;

    if (!name) return formFailure({ name: "Category name cannot be empty." });

    const existing = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      return formFailure({ name: "A category with this name already exists." });
    }

    await prisma.category.create({
      data: {
        name,
        icon,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");
    revalidatePath("/businesses");

    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    return databaseFailure(error, "name", "A category with this name already exists.");
  }
}

export async function updateCategory(input: {
  id: string;
  name: string;
  icon?: string;
}): Promise<FormResult> {
  try {
    if (!(await isActiveAdmin())) {
      return { error: "Unauthorized." };
    }

    const id = textValue(input.id);
    const name = textValue(input.name);
    const icon = textValue(input.icon) || null;

    if (!id) return formFailure({}, "Category not found.");
    if (!name) return formFailure({ name: "Category name cannot be empty." });

    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      return { error: "Category not found." };
    }

    const duplicate = await prisma.category.findFirst({
      where: {
        id: {
          not: id,
        },
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
      },
    });

    if (duplicate) {
      return formFailure({ name: "A category with this name already exists." });
    }

    const businesses = await prisma.business.findMany({
      where: {
        categoryId: id,
      },
      select: {
        id: true,
        publicId: true,
      },
    });

    await prisma.category.update({
      where: {
        id,
      },
      data: {
        name,
        icon,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");
    revalidatePath("/businesses");
    revalidatePath("/dashboard/owner", "layout");

    for (const business of businesses) {
      revalidatePath(
        getBusinessPublicPath(name, business.publicId)
      );
      revalidatePath(`/dashboard/owner/${business.id}`);
    }

    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    return databaseFailure(error, "name", "A category with this name already exists.");
  }
}

export async function deleteCategory(categoryId: string): Promise<FormResult> {
 try {

  if (!(await isActiveAdmin())) {
    return { error: "Unauthorized." };
  }

  if (typeof categoryId !== "string" || !categoryId) {
    return { error: "Invalid category." };
  }

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      id: true,
      _count: {
        select: {
          businesses: true,
        },
      },
    },
  });

  if (!category) {
    return { error: "Category not found." };
  }

  if (category._count.businesses > 0) {
    return {
      error: `This category is used by ${
        category._count.businesses
      } ${
        category._count.businesses === 1
          ? "business"
          : "businesses"
      } and cannot be deleted.`,
    };
  }

  await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/businesses");

  return { success: true };
 } catch(error) { unstable_rethrow(error); return databaseFailure(error); }
}

export async function createCity(input: {
  name: string;
}): Promise<FormResult> {
  try {
    if (!(await isActiveAdmin())) {
      return { error: "Unauthorized." };
    }

    const name = textValue(input.name);

    if (!name) return formFailure({ name: "City name cannot be empty." });

    const existing = await prisma.city.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      return formFailure({ name: "A city with this name already exists." });
    }

    await prisma.city.create({
      data: {
        name,
      },
    });

    revalidatePath("/admin/cities");
    revalidatePath("/");
    revalidatePath("/businesses");

    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    return databaseFailure(error, "name", "A city with this name already exists.");
  }
}

export async function updateCity(input: {
  id: string;
  name: string;
}): Promise<FormResult> {
  try {
    if (!(await isActiveAdmin())) {
      return { error: "Unauthorized." };
    }

    const id = textValue(input.id);
    const name = textValue(input.name);

    if (!id) return formFailure({}, "City not found.");
    if (!name) return formFailure({ name: "City name cannot be empty." });

    const city = await prisma.city.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!city) {
      return { error: "City not found." };
    }

    const duplicate = await prisma.city.findFirst({
      where: {
        id: {
          not: id,
        },
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
      },
    });

    if (duplicate) {
      return formFailure({ name: "A city with this name already exists." });
    }

    await prisma.city.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });

    revalidatePath("/admin/cities");
    revalidatePath("/");
    revalidatePath("/businesses");
    revalidatePath("/dashboard/owner", "layout");

    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    return databaseFailure(error, "name", "A city with this name already exists.");
  }
}

export async function deleteCity(cityId: string): Promise<FormResult> {
 try {

  if (!(await isActiveAdmin())) {
    return { error: "Unauthorized." };
  }

  if (typeof cityId !== "string" || !cityId) {
    return { error: "Invalid city." };
  }

  const city = await prisma.city.findUnique({
    where: {
      id: cityId,
    },
    select: {
      id: true,
      _count: {
        select: {
          businesses: true,
        },
      },
    },
  });

  if (!city) {
    return { error: "City not found." };
  }

  if (city._count.businesses > 0) {
    return {
      error: `This city is used by ${
        city._count.businesses
      } ${
        city._count.businesses === 1
          ? "business"
          : "businesses"
      } and cannot be deleted.`,
    };
  }

  await prisma.city.delete({
    where: {
      id: cityId,
    },
  });

  revalidatePath("/admin/cities");
  revalidatePath("/");
  revalidatePath("/businesses");

  return { success: true };
 } catch(error) { unstable_rethrow(error); return databaseFailure(error); }
}