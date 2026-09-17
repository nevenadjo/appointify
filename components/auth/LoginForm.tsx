"use client";

import { useActionState, useState } from "react";
import { FormErrors, FormInput } from "@/components/forms/ValidatedForm";
import { validateForm, type FieldErrors, type FormResult } from "@/lib/form-validation";
import { authInputClass, authButtonClass } from "./AuthShell";

export default function LoginForm({ action, initialError }: {
  action: (formData: FormData) => Promise<FormResult>;
  initialError: string | null;
}) {
  const [fields, setFields] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, formAction, pending] = useActionState(
    async (_previous: FormResult, formData: FormData) => { const result = await action(formData); setErrors(result.errors || {}); return result; },
    { error: initialError || "" },
  );
  return (
    <FormErrors.Provider value={errors}><form noValidate action={formAction} onSubmit={(event) => { const next = validateForm("login", new FormData(event.currentTarget)); setErrors(next); if (Object.keys(next).length) event.preventDefault(); }} className="mt-6 space-y-4">
      {state.error && <p id="login-error" role="alert" className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{state.error}</p>}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <FormInput id="email" name="email" type="email" autoComplete="email" required value={fields.email} onChange={event => setFields({ ...fields, email: event.target.value })} aria-invalid={!!state.error} aria-describedby={state.error ? "login-error" : undefined} className={authInputClass} />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <FormInput id="password" name="password" type="password" autoComplete="current-password" required value={fields.password} onChange={event => setFields({ ...fields, password: event.target.value })} aria-invalid={!!state.error} aria-describedby={state.error ? "login-error" : undefined} className={authInputClass} />
      </div>
      <button type="submit" disabled={pending} className={`${authButtonClass} disabled:cursor-wait disabled:opacity-60`}>{pending ? "Signing in..." : "Sign in"}</button>
    </form></FormErrors.Provider>
  );
}
