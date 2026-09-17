import { formFailure, type FormResult } from "./form-validation";

export function databaseFailure(error: unknown, uniqueField?: string, duplicateMessage?: string): FormResult {
  const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
  if (code === "P2002" && uniqueField) return formFailure({ [uniqueField]: duplicateMessage || "This value is already in use." });
  if (code === "P2003" || code === "P2025") return formFailure({}, "The selected resource no longer exists. Please refresh and try again.");
  console.error("Form database operation failed", error);
  return formFailure({}, "Something went wrong. Please try again.");
}
