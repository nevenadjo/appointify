"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppToast } from "@/components/ui/ToastProvider";
import {
  FormValues,
  FormErrors,
  FormInput,
} from "@/components/forms/ValidatedForm";
import {
  validateForm,
  type FieldErrors,
} from "@/lib/form-validation";
import {
  updateProfile,
  submitProfileForm,
} from "@/lib/profile-actions";

type ProfileFormProps = {
  user: {
    name: string | null;
    email: string;
    phone: string | null;
    image: string | null;
  };
};

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();

  const [fallback, fallbackAction] = useActionState(
    submitProfileForm,
    {},
    "/dashboard/profile",
  );

  const formRef = useRef<HTMLFormElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  const [preview, setPreview] = useState<string>(
    user.image || "/uploads/avatar.png",
  );

  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const showToast = useAppToast();

  const clearToast = () => showToast("");

  function focusFirstFieldError(errors: FieldErrors) {
    const firstErrorName = Object.keys(errors)[0];

    if (!firstErrorName) return;

    requestAnimationFrame(() => {
      const form = formRef.current;

      if (!form) return;

      if (firstErrorName === "image") {
        imageInput.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        return;
      }

      const field = form.elements.namedItem(firstErrorName);

      if (
        field instanceof HTMLInputElement ||
        field instanceof HTMLSelectElement ||
        field instanceof HTMLTextAreaElement
      ) {
        field.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        field.focus({
          preventScroll: true,
        });
      }
    });
  }

  useEffect(() => {
    if (!fallback.error) return;

    errorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    errorRef.current?.focus({
      preventScroll: true,
    });
  }, [fallback.error]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setError("");
    clearToast();

    setErrors((current) => {
      const next = { ...current };
      delete next.image;
      return next;
    });

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      const next = {
        ...errors,
        image: "Only image files are allowed.",
      };

      setErrors(next);

      requestAnimationFrame(() => {
        imageInput.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const next = {
        ...errors,
        image: "Image must be smaller than 5 MB.",
      };

      setErrors(next);

      requestAnimationFrame(() => {
        imageInput.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });

      return;
    }

    setRemoveImage(false);
    setPreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setRemoveImage(true);

    setErrors((current) => {
      const next = { ...current };
      delete next.image;
      return next;
    });

    setPreview("/uploads/avatar.png");
    setError("");
    clearToast();
  }

  async function handleSubmit(formData: FormData) {
    setError("");
    clearToast();

    const next = validateForm("profile", formData);

    setErrors(next);

    if (Object.keys(next).length) {
      focusFirstFieldError(next);
      return;
    }

    setLoading(true);

    try {
      const result = await updateProfile(formData);
      const resultErrors = result.errors || {};

      setErrors(resultErrors);

      if (Object.keys(resultErrors).length) {
        focusFirstFieldError(resultErrors);
        return;
      }

      if (result?.error) {
        setError(result.error);

        requestAnimationFrame(() => {
          errorRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          errorRef.current?.focus({
            preventScroll: true,
          });
        });

        return;
      }

      if (result?.success) {
        showToast("Profile updated successfully.");
        router.refresh();
      }
    } catch {
      setError("Something went wrong.");

      requestAnimationFrame(() => {
        errorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        errorRef.current?.focus({
          preventScroll: true,
        });
      });
    } finally {
      setLoading(false);
    }
  }

  const inputClassName =
    "mt-2 min-h-11 w-full min-w-0 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

  return (
    <FormValues.Provider value={fallback.values || {}}>
      <FormErrors.Provider value={{ ...fallback.errors, ...errors }}>
        <form
          ref={formRef}
          action={fallbackAction}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();

            if (!loading) {
              void handleSubmit(new FormData(event.currentTarget));
            }
          }}
          className="mt-8 grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]"
        >
          <noscript>
            <label className="block">
              <input
                type="checkbox"
                name="removeImage"
                value="true"
              />
              Remove profile photo
            </label>
          </noscript>

          <FormInput
            type="hidden"
            name="removeImage"
            value={removeImage ? "true" : "false"}
          />

          <section
            aria-label="Profile photo"
            className="min-w-0 rounded-2xl border border-gray-200 bg-white p-6 text-center sm:p-8"
          >
            <div className="mx-auto w-fit rounded-full bg-[#FFF4E1]/50 p-2">
              <img
                src={preview}
                alt={
                  user.name
                    ? user.name + "'s profile photo"
                    : "Profile photo"
                }
                width={128}
                height={128}
                className={
                  "h-32 w-32 rounded-full object-cover " +
                  (preview === "/uploads/avatar.png" ? "opacity-30" : "")
                }
              />
            </div>

            {user.name && (
              <p className="mt-5 text-lg font-semibold text-gray-900 [overflow-wrap:anywhere]">
                {user.name}
              </p>
            )}

            <p className="mt-2 text-sm leading-6 text-gray-500 [overflow-wrap:anywhere]">
              {user.email}
            </p>

            <div className="mt-6 flex flex-col items-center gap-1">
              <noscript>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  aria-label="Choose profile photo"
                  className="max-w-full"
                />
              </noscript>

              <FormInput
                ref={imageInput}
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                aria-label="Choose profile photo"
                aria-describedby="photo-help"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => imageInput.current?.click()}
                className="min-h-11 w-full cursor-pointer rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-[#E9EAFF]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Change photo
              </button>

              {preview !== "/uploads/avatar.png" && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="min-h-11 cursor-pointer rounded-lg px-4 py-2 text-sm text-gray-500 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Remove photo
                </button>
              )}
            </div>

            <p
              id="photo-help"
              className="mt-4 text-xs leading-5 text-gray-500"
            >
              Image files. Maximum 5 MB.
            </p>
          </section>

          <section
            aria-labelledby="personal-information"
            className="min-w-0 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8"
          >
            <h2
              id="personal-information"
              className="text-xl font-semibold tracking-tight text-gray-900"
            >
              Personal information
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Update your contact and account details.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>

                <FormInput
                  id="name"
                  name="name"
                  defaultValue={user.name ?? ""}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>

                <FormInput
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={user.email}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone
                </label>

                <FormInput
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={user.phone ?? ""}
                  className={inputClassName}
                />
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Password
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Leave this blank if you don&apos;t want to change your
                password.
              </p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="min-w-0">
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    New password
                  </label>

                  <FormInput
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    className={inputClassName}
                  />
                </div>

                <div className="min-w-0">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm new password
                  </label>

                  <FormInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6">
              {(error || fallback.error) && (
                <p
                  id="profile-error"
                  ref={errorRef}
                  role="alert"
                  tabIndex={-1}
                  className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 outline-none"
                >
                  {error || fallback.error}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-11 w-full cursor-pointer rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {loading ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </section>
        </form>
      </FormErrors.Provider>
    </FormValues.Provider>
  );
}