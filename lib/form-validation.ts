export type FieldErrors = Record<string, string>;
export type FormResult = { success?: boolean; errors?: FieldErrors; error?: string; values?: Record<string, string> };
export type FormKind = "business" | "service" | "hours" | "profile" | "register" | "login" | "category" | "city" | "image";
export const textValue = (value: unknown) => typeof value === "string" ? value.trim() : "";
export function formFailure(errors: FieldErrors, error?: string): FormResult {
  return { success: false, errors, error };
}
export function imageError(value: unknown, required = false): string | undefined {
  if (value !== null && value !== undefined && !(value instanceof File)) return "Please select a valid image file.";
  if (!(value instanceof File) || !value.size) return required ? "Please select an image." : undefined;
  if (!value.type.startsWith("image/")) return "Only image files are allowed.";
  if (value.size > 5 * 1024 * 1024) return "Image must be smaller than 5 MB.";
}
export function validateForm(kind: FormKind, data: FormData): FieldErrors {
  const errors: FieldErrors = {};
  for (const name of ["name", "address", "description", "email", "phone", "categoryId", "cityId", "password", "newPassword", "confirmPassword", "icon", "notes", "color", "price", "duration"]) {
    const value = data.get(name);
    if (value !== null && typeof value !== "string") errors[name] = "Please enter a text value.";
  }
  const text = (name: string) => textValue(data.get(name));
  const required = (name: string, message: string) => { if (!text(name)) errors[name] = message; };
  const email = (isRequired: boolean) => {
    if (!text("email")) { if (isRequired) errors.email = "Email is required."; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text("email"))) errors.email = "Enter a valid email address.";
  };
  const phone = () => {
    const value = text("phone");
    if (value && (!/^\+?[\d\s()-]+$/.test(value) || value.replace(/\D/g, "").length < 6)) errors.phone = "Enter a valid phone number.";
  };
  if (kind === "business") {
    required("name", "Business name cannot be empty.");
    required("address", "Address cannot be empty.");
    required("categoryId", "Please select a category.");
    required("cityId", "Please select a city.");
    email(false); phone();
  }
  if (kind === "service") {
    required("name", "Service name cannot be empty.");
    for (const field of ["price", "duration"]) {
      const label = field === "price" ? "Price" : "Duration";
      const raw = text(field), number = Number(raw);
      if (!raw) errors[field] = `${label} is required.`;
      else if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw) || !Number.isFinite(number)) errors[field] = `${label} must be a valid number.`;
      else if (field === "duration" && (!Number.isInteger(number) || number > 2147483647)) errors[field] = "Duration must be a valid integer.";
      else if (field === "duration" && number <= 0) errors[field] = "Duration must be greater than 0.";
      else if (number < 0) errors[field] = "Price cannot be negative.";
    }
    if (text("color") && !/^#[\da-f]{6}$/i.test(text("color"))) errors.color = "Choose a valid color.";
  }
  if (["profile", "register", "login"].includes(kind)) {
    if (kind !== "login") required("name", "Name cannot be empty.");
    email(true);
    if (kind === "profile") phone();
    const passwordField = kind === "profile" ? "newPassword" : "password";
    const password = data.get(passwordField), confirmation = data.get("confirmPassword");
    const raw = typeof password === "string" ? password : "";
    const confirm = typeof confirmation === "string" ? confirmation : "";
    if (kind !== "profile" || raw || confirm) {
      if (!raw) errors[passwordField] = "Password is required.";
      else if (kind !== "login" && raw.length < 6) errors[passwordField] = "Password must be at least 6 characters long.";
      if (kind !== "login") {
        if (!confirm) errors.confirmPassword = "Please confirm your password.";
        else if (raw !== confirm) errors.confirmPassword = "Passwords do not match.";
      }
    }
    if (kind === "register" && !["CLIENT", "OWNER"].includes(text("role"))) errors.role = "Please select a valid account type.";
  }
  if (kind === "category" || kind === "city") required("name", `${kind === "city" ? "City" : "Category"} name cannot be empty.`);
  if (kind === "image" || (kind === "profile" && data.get("removeImage") !== "true")) {
    const error = imageError(data.get("image"), kind === "image");
    if (error) errors.image = error;
  }
  if (kind === "hours") {
    for (let day = 0; day < 7; day++) {
      if (data.get(`isOpen-${day}`) !== "on") continue;
      const start = text(`startTime-${day}`), end = text(`endTime-${day}`);
      const bs = text(`breakStart-${day}`), be = text(`breakEnd-${day}`);
      for (const [key, value, needed] of [["startTime", start, true], ["endTime", end, true], ["breakStart", bs, !!be], ["breakEnd", be, !!bs]] as const) {
        if (data.get(`${key}-${day}`) !== null && typeof data.get(`${key}-${day}`) !== "string") errors[`${key}-${day}`] = "Enter a valid time.";
        else if (!value && needed) errors[`${key}-${day}`] = "Please enter a time.";
        else if (value && !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) errors[`${key}-${day}`] = "Enter a valid time.";
      }
      if (start && end && start >= end) errors[`endTime-${day}`] = "Start time must be before end time.";
      if (bs && be && bs >= be) errors[`breakEnd-${day}`] = "Break start must be before break end.";
      if (bs && start && bs < start) errors[`breakStart-${day}`] = "Break must be within working hours.";
      if (be && end && be > end) errors[`breakEnd-${day}`] = "Break must be within working hours.";
    }
  }
  return errors;
}

export function validateRatings(values: Record<string, unknown>): FieldErrors {
  const errors: FieldErrors = {};
  for (const [key, value] of Object.entries(values)) {
    if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 5) errors[key] = "Choose an integer rating between 1 and 5.";
  }
  return errors;
}

export function validateReservationTimes(start: string, end: string): FieldErrors {
  const errors: FieldErrors = {};
  const startDate = new Date(start), endDate = new Date(end);
  if (!validReservationDate(start)) errors.startTime = "Please select a valid start date and time.";
  if (!validReservationDate(end)) errors.endTime = "Please select a valid end date and time.";
  if (!errors.startTime && startDate < new Date()) errors.startTime = "You cannot create a reservation in the past.";
  if (!errors.startTime && !errors.endTime && startDate >= endDate) errors.endTime = "Start time must be before end time.";
  return errors;
}

export function validReservationDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return false;
  const date = new Date(value.slice(0, 10));
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value.slice(0, 10) && Number.isFinite(new Date(value).getTime());
}
