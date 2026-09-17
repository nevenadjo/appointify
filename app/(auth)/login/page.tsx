import { validateForm, formFailure } from "@/lib/form-validation";
import Link from "next/link";
import AuthShell, {
  authLinkClass,
  GoogleLogo,
} from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import { CredentialsSignin } from "next-auth";
import { signIn } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string | string[];
    callbackUrl?: string;
  }>;
}) {
  const { error, callbackUrl } = await searchParams;
  const errorMessage =
    error === "account_deactivated"
      ? "Your account has been deactivated. Please contact the administrator at admin@appointify.com."
      : error === "credentials"
        ? "Invalid email or password."
        : null;

  const safeCallbackUrl =
    callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : null;

  const redirectTo = safeCallbackUrl
    ? `/post-login?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`
    : "/post-login";

  return (
    <AuthShell>
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
        Sign in
      </h1>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        Sign in to your Appointify account.
      </p>

      <LoginForm
        initialError={errorMessage}
        action={async (formData) => {
          "use server";
          const errors = validateForm("login", formData);
          if (Object.keys(errors).length) return formFailure(errors);
          try {
            await signIn("credentials", {
              email: formData.get("email"),
              password: formData.get("password"),
              redirectTo,
            });
          } catch (error) {
            if (error instanceof CredentialsSignin) {
              return {
                error:
                  error.code === "account_deactivated"
                    ? "Your account has been deactivated. Please contact the administrator at admin@appointify.com."
                    : "Invalid email or password.",
              };
            }
            throw error;
          }
          return { error: "" };
        }}
      />

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />

        <span className="text-xs text-gray-400">or</span>

        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <form
        action={async () => {
          "use server";

          await signIn("google", {
            redirectTo,
          });
        }}
      >
        <button
          type="submit"
          className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8b86bc]"
        >
          <GoogleLogo />
          Continue with Google
        </button>
      </form>

      <p className="mt-6 text-center text-sm leading-6 text-gray-500">
        Don&apos;t have an account?{" "}
        <Link
  href={
    safeCallbackUrl
      ? `/register?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`
      : "/register"
  }
  className={authLinkClass}
>
  Create one
</Link>
      </p>
    </AuthShell>
  );
}
