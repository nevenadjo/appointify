import Link from "next/link";
import AuthShell, { authLinkClass } from "@/components/auth/AuthShell";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/auth/RegisterForm";
import { registerUser } from "@/lib/auth-actions";
import { validateForm, formFailure } from "@/lib/form-validation";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
}) {
  const { callbackUrl } = await searchParams;

  const safeCallbackUrl =
    callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : null;

  async function handleRegister(formData: FormData) {
    "use server";

    const errors = validateForm("register", formData);
    if (Object.keys(errors).length) return formFailure(errors);

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");
    const role = String(formData.get("role") || "CLIENT");

    const result = await registerUser(
      name,
      email,
      password,
      confirmPassword,
      role,
    );

    if (!result.success) return result;

    redirect(
      safeCallbackUrl
        ? `/login?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`
        : "/login",
    );
  }

  return (
    <AuthShell>
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
        Create account
      </h1>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        Create your Appointify account.
      </p>

      <RegisterForm action={handleRegister} />

      <p className="mt-6 text-center text-sm leading-6 text-gray-500">
        Already have an account?{" "}
        <Link
          href={
            safeCallbackUrl
              ? `/login?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`
              : "/login"
          }
          className={authLinkClass}
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}