"use server";

import { unstable_rethrow } from "next/navigation";
import { databaseFailure } from "@/lib/form-database-error";

import { validateForm, formFailure, type FormResult } from "@/lib/form-validation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendRegistrationConfirmationEmail } from "./email";

export async function registerUser(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
  role: string,
): Promise<FormResult & { userId?: string }> {
  try {
    name = typeof name === "string" ? name.trim() : "";
    email = typeof email === "string" ? email.trim() : "";
    const data = new FormData();
    for (const [key, value] of Object.entries({ name, email, password, confirmPassword, role })) {
      if (typeof value === "string") data.set(key, value);
    }
    const errors = validateForm("register", data);
    if (email && !errors.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) errors.email = "An account with this email already exists.";
    }
    if (Object.keys(errors).length) return formFailure(errors);
    if (role !== "CLIENT" && role !== "OWNER") return formFailure({ role: "Please select a valid account type." });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
      },
    });

    try {
      await sendRegistrationConfirmationEmail(user.email, user.name);
    } catch (error) {
      console.error("FAILED TO SEND REGISTRATION EMAIL", error);
    }

    return {
      success: true,
      userId: user.id,
    };
  } catch (error) {
    unstable_rethrow(error);
    return databaseFailure(error, "email", "An account with this email already exists.");
  }
}
