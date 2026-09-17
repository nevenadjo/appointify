"use client";

import { useId, useState } from "react";
import Modal from "@/components/ui/Modal";
import { useAppToast } from "@/components/ui/ToastProvider";
import BookingForm from "./BookingForm";
import BookingSummary, {
  type BookingSummaryProps,
} from "./BookingSummary";

export default function BookAppointmentButton({
  href,
  businessHref,
  businessId,
  serviceId,
  isAuthenticated,
  ...summary
}: BookingSummaryProps & {
  href: string;
  businessHref: string;
  businessId: string;
  serviceId: string;
  isAuthenticated: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const titleId = useId();
  const showToast = useAppToast();

  return (
    <>
      <a
        href={href}
        aria-haspopup="dialog"
        onClick={(event) => {
          if (
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          )
            return;

          event.preventDefault();
          setOpen(true);
        }}
        className="mt-4 block rounded-xl bg-gray-900 px-3 py-3 text-center text-sm font-medium text-white hover:bg-gray-700 focus-visible:outline-indigo-500"
      >
        Book appointment
      </a>

      {open && (
        <Modal
          pending={pending}
          titleId={titleId}
          onClose={() => setOpen(false)}
        >
          <h1
            id={titleId}
            className="pr-10 text-2xl font-semibold tracking-tight"
          >
            Book appointment
          </h1>

          <BookingSummary {...summary} />

          {isAuthenticated ? (
            <BookingForm
              onPendingChange={setPending}
              businessId={businessId}
              serviceId={serviceId}
              serviceDuration={summary.duration}
              onSuccess={() => {
                setPending(false);
                setOpen(false);
                showToast("Appointment booked successfully.");
              }}
            />
          ) : (
            <div className="mt-6">
              <h2 className="text-base font-medium text-gray-900">
                Sign in to book
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                You need to sign in or create an account before booking this
                appointment.
              </p>

              <a
                href={`/login?callbackUrl=${encodeURIComponent(businessHref)}`}
                className="mt-5 flex min-h-11 w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Sign in to continue
              </a>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}