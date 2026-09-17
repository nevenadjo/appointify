"use server";

import { unstable_rethrow } from "next/navigation";
import { databaseFailure } from "@/lib/form-database-error";

import { validateForm, formFailure, type FormResult } from "@/lib/form-validation";
import bcrypt from "bcryptjs";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateProfile(formData: FormData): Promise<FormResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      redirect("/login");
    }

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();

    const newPassword = String(
      formData.get("newPassword") || ""
    );

    const removeImage =
      formData.get("removeImage") === "true";

    const errors = validateForm("profile", formData);
    if (email && !errors.email) {
      const existingUser = await prisma.user.findFirst({ where: { email, NOT: { id: session.user.id } } });
      if (existingUser) errors.email = "An account with this email already exists.";
    }
    if (Object.keys(errors).length) return formFailure(errors);

    const currentUser = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        image: true,
      },
    });

    let imageUrl = currentUser?.image ?? null;

    if (removeImage) {
      imageUrl = null;
    } else {
      const image = formData.get("image");

      if (image instanceof File && image.size > 0) {
        const extension =
          image.name.split(".").pop()?.toLowerCase() || "jpg";

        const fileName = `${randomUUID()}.${extension}`;

        const uploadDir = path.join(
          process.cwd(),
          "public",
          "uploads",
          "profiles"
        );

        await mkdir(uploadDir, { recursive: true });

        const filePath = path.join(
          uploadDir,
          fileName
        );

        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);

        await writeFile(filePath, buffer);

        imageUrl = `/uploads/profiles/${fileName}`;
      }
    }

    const data: {
      name: string;
      email: string;
      phone: string | null;
      image: string | null;
      passwordHash?: string;
    } = {
      name,
      email,
      phone: phone || null,
      image: imageUrl,
    };

    if (newPassword) {
      data.passwordHash = await bcrypt.hash(
        newPassword,
        12
      );
    }

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data,
    });

    return {
      success: true,
    };
  } catch (error) {
    unstable_rethrow(error);
    return databaseFailure(error, "email", "An account with this email already exists.");
  }
}
// Native form fallback shares the same authorization, validation and update action.
export async function submitProfileForm(_previous: FormResult, data: FormData): Promise<FormResult> {
  const result = await updateProfile(data);
  if (result.success) redirect("/dashboard/profile?notice=profile_updated");
  return { ...result, values: { name: String(data.get("name") || ""), email: String(data.get("email") || ""), phone: String(data.get("phone") || "") } };
}
