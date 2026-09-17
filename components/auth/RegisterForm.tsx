"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  FormErrors,
  FormInput,
  FieldError,
} from "@/components/forms/ValidatedForm";
import {
  validateForm,
  type FieldErrors,
  type FormResult,
} from "@/lib/form-validation";
import { authInputClass, authButtonClass } from "./AuthShell";

export default function RegisterForm({
  action,
}: {
  action: (formData: FormData) => Promise<FormResult>;
}) {
  const [fields, setFields] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "CLIENT",
  });

  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  function focusFirstFieldError(errors: FieldErrors) {
    const firstErrorName = Object.keys(errors)[0];

    if (!firstErrorName) return;

    requestAnimationFrame(() => {
      const form = formRef.current;

      if (!form) return;

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

  const [state, formAction, pending] = useActionState(
    async (_previous: FormResult, formData: FormData) => {
      const result = await action(formData);
      const resultErrors = result.errors || {};

      setErrors(resultErrors);

      if (Object.keys(resultErrors).length) {
        focusFirstFieldError(resultErrors);
      }

      return result;
    },
    { error: "" },
  );

  useEffect(() => {
    if (!state.error) return;

    errorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    errorRef.current?.focus({
      preventScroll: true,
    });
  }, [state.error]);

  return (
    <FormErrors.Provider value={errors}>
      <form
        ref={formRef}
        noValidate
        action={formAction}
        onSubmit={(event) => {
          const next = validateForm(
            "register",
            new FormData(event.currentTarget),
          );

          setErrors(next);

          if (Object.keys(next).length) {
            event.preventDefault();
            focusFirstFieldError(next);
          }
        }}
        className="mt-6 space-y-4"
      >
        {state.error && (
          <p
            id="register-error"
            ref={errorRef}
            role="alert"
            tabIndex={-1}
            className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 outline-none"
          >
            {state.error}
          </p>
        )}

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
            value={fields.name}
            onChange={(event) =>
              setFields({
                ...fields,
                name: event.target.value,
              })
            }
            type="text"
            required
            className={authInputClass}
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
            value={fields.email}
            onChange={(event) =>
              setFields({
                ...fields,
                email: event.target.value,
              })
            }
            type="email"
            autoComplete="email"
            required
            className={authInputClass}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>

          <FormInput
            id="password"
            name="password"
            value={fields.password}
            onChange={(event) =>
              setFields({
                ...fields,
                password: event.target.value,
              })
            }
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            className={authInputClass}
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm password
          </label>

          <FormInput
            id="confirmPassword"
            name="confirmPassword"
            value={fields.confirmPassword}
            onChange={(event) =>
              setFields({
                ...fields,
                confirmPassword: event.target.value,
              })
            }
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            className={authInputClass}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700">
            I want to
          </p>

          <FieldError name="role" />

          <div className="mt-2 space-y-2">
            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-600 transition-colors hover:border-gray-300 has-checked:border-[#c7c3e2] has-checked:bg-[#E9EAFF]/40 has-checked:text-gray-900 focus-within:ring-2 focus-within:ring-[#d2cfea]">
              <FormInput
                className="h-4 w-4 accent-[#635d83]"
                type="radio"
                name="role"
                value="CLIENT"
                checked={fields.role === "CLIENT"}
                onChange={() =>
                  setFields({
                    ...fields,
                    role: "CLIENT",
                  })
                }
              />

              <span>Book appointments</span>
            </label>

            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-600 transition-colors hover:border-gray-300 has-checked:border-[#c7c3e2] has-checked:bg-[#E9EAFF]/40 has-checked:text-gray-900 focus-within:ring-2 focus-within:ring-[#d2cfea]">
              <FormInput
                className="h-4 w-4 accent-[#635d83]"
                type="radio"
                name="role"
                value="OWNER"
                checked={fields.role === "OWNER"}
                onChange={() =>
                  setFields({
                    ...fields,
                    role: "OWNER",
                  })
                }
              />

              <span>Offer services</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className={`${authButtonClass} disabled:cursor-wait disabled:opacity-60`}
        >
          {pending ? "Creating account..." : "Create account"}
        </button>
      </form>
    </FormErrors.Provider>
  );
}