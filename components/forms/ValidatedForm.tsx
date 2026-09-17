"use client";

import {
  createContext,
  useEffect,
  useContext,
  useId,
  useActionState,
  useState,
  useRef,
  startTransition,
  type ComponentProps,
  type ReactNode,
} from "react";
import {
  validateForm,
  type FieldErrors,
  type FormKind,
  type FormResult,
} from "@/lib/form-validation";
import { unstable_rethrow } from "next/navigation";

export const FormPending = createContext(false);
export const FormValues = createContext<Record<string, string>>({});
export const FormErrors = createContext<FieldErrors>({});
export const ClearFieldError = createContext<(name: string) => void>(() => {});

export function FieldError({ name }: { name: string }) {
  const errors = useContext(FormErrors);

  return errors[name] ? (
    <p role="alert" className="mt-1 text-sm text-red-600">
      {errors[name]}
    </p>
  ) : null;
}

export function useFieldError(name?: string) {
  const errors = useContext(FormErrors);
  const id = useId();
  const error = name ? errors[name] : undefined;

  return {
    error,
    id,
    feedback: error ? (
      <p id={id} role="alert" className="mt-1 text-sm text-red-600">
        {error}
      </p>
    ) : null,
  };
}

export function FormInput(props: ComponentProps<"input">) {
  const { error, id, feedback } = useFieldError(props.name);
  const values = useContext(FormValues);
  const saved = props.name ? values[props.name] : undefined;

  return (
    <>
      <input
        {...props}
        {...(saved !== undefined &&
        props.value === undefined &&
        props.type !== "file"
          ? props.type === "checkbox"
            ? { defaultChecked: saved === "on" }
            : { defaultValue: saved }
          : {})}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={
          [props["aria-describedby"], error ? id : ""]
            .filter(Boolean)
            .join(" ") || undefined
        }
        className={`${props.className || ""} ${
          error ? "!border-red-400" : ""
        }`}
      />
      {feedback}
    </>
  );
}

export function FormSelect(props: ComponentProps<"select">) {
  const { error, id, feedback } = useFieldError(props.name);
  const values = useContext(FormValues);
  const saved = props.name ? values[props.name] : undefined;

  return (
    <>
      <select
        {...props}
        {...(saved !== undefined && props.value === undefined
          ? { defaultValue: saved }
          : {})}
        aria-invalid={!!error}
        aria-describedby={error ? id : props["aria-describedby"]}
        className={`${props.className || ""} ${
          error ? "!border-red-400" : ""
        }`}
      />
      {feedback}
    </>
  );
}

export function FormTextarea(props: ComponentProps<"textarea">) {
  const { error, id, feedback } = useFieldError(props.name);
  const values = useContext(FormValues);
  const saved = props.name ? values[props.name] : undefined;

  return (
    <>
      <textarea
        {...props}
        {...(saved !== undefined && props.value === undefined
          ? { defaultValue: saved }
          : {})}
        aria-invalid={!!error}
        aria-describedby={error ? id : props["aria-describedby"]}
        className={`${props.className || ""} ${
          error ? "!border-red-400" : ""
        }`}
      />
      {feedback}
    </>
  );
}

export default function ValidatedForm({
  action,
  kind,
  children,
  className,
  pageAction,
  permalink,
  onSuccess,
  onPendingChange,
}: {
  action: (data: FormData) => Promise<FormResult | void>;
  pageAction?: (
    previous: FormResult,
    data: FormData
  ) => Promise<FormResult>;
  onPendingChange?: (pending: boolean) => void;
  permalink?: string;
  onSuccess?: () => void;
  kind: FormKind;
  children: ReactNode;
  className?: string;
}) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const inFlight = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  function focusFirstError(errors: FieldErrors) {
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

  const [state, dispatch, pending] = useActionState(
    pageAction ||
      (async (
        _previous: FormResult,
        data: FormData
      ): Promise<FormResult> => {
        try {
          const result = await action(data);
          const resultErrors = result?.errors || {};

          setErrors(resultErrors);
          setFormError(result?.error || "");

          if (Object.keys(resultErrors).length) {
            focusFirstError(resultErrors);
          }

          if (result?.success) {
            onSuccess?.();
          }

          return result || {};
        } catch (error) {
          unstable_rethrow(error);

          setFormError("Something went wrong. Please try again.");

          return {
            success: false,
            error: "Something went wrong. Please try again.",
          };
        } finally {
          inFlight.current = false;
        }
      }),
    {},
    permalink
  );

  useEffect(() => {
    onPendingChange?.(pending);
  }, [pending, onPendingChange]);

  useEffect(() => {
    if (!pending) {
      inFlight.current = false;
    }
  }, [pending, state]);

  return (
    <FormPending.Provider value={pending}>
      <FormValues.Provider value={state.values || {}}>
        <FormErrors.Provider value={{ ...state.errors, ...errors }}>
          <ClearFieldError.Provider
            value={(name) =>
              setErrors((current) => {
                const next = { ...current };
                next[name] = "";
                return next;
              })
            }
          >
            <form
              ref={formRef}
              noValidate
              className={className}
              action={dispatch}
              aria-busy={pending}
              onChange={(event) => {
                const target = event.target;

                if (
                  !(
                    target instanceof HTMLInputElement ||
                    target instanceof HTMLSelectElement ||
                    target instanceof HTMLTextAreaElement
                  )
                ) {
                  return;
                }

                const next = validateForm(
                  kind,
                  new FormData(event.currentTarget)
                );

                if (!next[target.name]) {
                  setErrors((current) => {
                    const result = { ...current };
                    result[target.name] = "";
                    return result;
                  });
                }
              }}
              onSubmit={(event) => {
                event.preventDefault();

                if (inFlight.current) return;

                const data = new FormData(event.currentTarget);
                const next = validateForm(kind, data);

                setFormError("");
                setErrors(next);

                if (Object.keys(next).length) {
                  focusFirstError(next);
                  return;
                }

                inFlight.current = true;

                startTransition(() => dispatch(data));
              }}
            >
              {(formError || state.error) && (
                <p role="alert" className="text-sm text-red-600">
                  {formError || state.error}
                </p>
              )}

              {children}
            </form>
          </ClearFieldError.Provider>
        </FormErrors.Provider>
      </FormValues.Provider>
    </FormPending.Provider>
  );
}