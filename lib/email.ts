import nodemailer from "nodemailer";
import {
  cancellationEmail,
  newReservationOwnerEmail,
  ownerCancellationEmail,
  registrationConfirmationEmail,
  reservationConfirmationEmail,
  reservationReminderEmail,
  reviewReminderEmail,
} from "./email-templates";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  return transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject,
    html,
  });
}

export async function sendRegistrationConfirmationEmail(
  to: string,
  name?: string | null,
) {
  const email = registrationConfirmationEmail(name);

  return sendEmail({
    to,
    subject: email.subject,
    html: email.html,
  });
}

export async function sendReservationConfirmationEmail({
  to,
  clientName,
  businessName,
  serviceName,
  date,
  startTime,
  endTime,
  price,
}: {
  to: string;
  clientName?: string | null;
  businessName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}) {
  const email = reservationConfirmationEmail({
    clientName,
    businessName,
    serviceName,
    date,
    startTime,
    endTime,
    price,
  });

  return sendEmail({
    to,
    subject: email.subject,
    html: email.html,
  });
}

export async function sendNewReservationOwnerEmail({
  to,
  ownerName,
  clientName,
  businessName,
  serviceName,
  date,
  startTime,
  endTime,
  price,
}: {
  to: string;
  ownerName?: string | null;
  clientName?: string | null;
  businessName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}) {
  const email = newReservationOwnerEmail({
    ownerName,
    clientName,
    businessName,
    serviceName,
    date,
    startTime,
    endTime,
    price,
  });

  return sendEmail({
    to,
    subject: email.subject,
    html: email.html,
  });
}

export async function sendClientCancellationEmail({
  to,
  recipientName,
  clientName,
  businessName,
  serviceName,
  date,
  startTime,
  endTime,
  price,
  forOwner,
}: {
  to: string;
  recipientName?: string | null;
  clientName?: string | null;
  businessName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  forOwner: boolean;
}) {
  const email = cancellationEmail({
    recipientName,
    clientName,
    businessName,
    serviceName,
    date,
    startTime,
    endTime,
    price,
    forOwner,
  });

  return sendEmail({
    to,
    subject: email.subject,
    html: email.html,
  });
}

export async function sendOwnerCancellationEmail({
  to,
  clientName,
  businessName,
  serviceName,
  date,
  startTime,
  endTime,
  price,
  reason,
}: {
  to: string;
  clientName?: string | null;
  businessName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  reason: string;
}) {
  const email = ownerCancellationEmail({
    clientName,
    businessName,
    serviceName,
    date,
    startTime,
    endTime,
    price,
    reason,
  });

  return sendEmail({
    to,
    subject: email.subject,
    html: email.html,
  });
}

export async function sendReservationReminderEmail({
  to,
  clientName,
  businessName,
  serviceName,
  date,
  startTime,
  endTime,
}: {
  to: string;
  clientName?: string | null;
  businessName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
}) {
  const email = reservationReminderEmail({
    clientName,
    businessName,
    serviceName,
    date,
    startTime,
    endTime,
  });

  return sendEmail({
    to,
    subject: email.subject,
    html: email.html,
  });
}

export async function sendReviewReminderEmail({
  to,
  clientName,
  businessName,
  serviceName,
}: {
  to: string;
  clientName?: string | null;
  businessName: string;
  serviceName: string;
}) {
  const email = reviewReminderEmail({
    clientName,
    businessName,
    serviceName,
  });

  return sendEmail({
    to,
    subject: email.subject,
    html: email.html,
  });
}