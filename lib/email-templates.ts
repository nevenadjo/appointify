import { formatPrice } from "@/lib/currency";
type Appointment = {
  businessName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
};

type PricedAppointment = Appointment & { price: number };
type Client = { clientName?: string | null };
type Tone = "green" | "red" | "amber";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

function greeting(name?: string | null) {
  return `<p style="margin:0 0 12px;color:#17232b;font-size:16px;line-height:26px;">Hello${name?.trim() ? ` ${escapeHtml(name.trim())}` : ""},</p>`;
}

function paragraph(text: string) {
  return `<p style="margin:0 0 20px;color:#52616b;font-size:15px;line-height:25px;">${escapeHtml(text)}</p>`;
}

function details(rows: [string, string][]) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;margin:24px 0;background:#f6f8f7;border:1px solid #e3e9e6;border-radius:12px;">
    ${rows.map(([label, value]) => `<tr>
      <td style="width:30%;padding:13px 16px;border-bottom:1px solid #e3e9e6;color:#61716b;font-size:13px;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:13px 16px;border-bottom:1px solid #e3e9e6;color:#17232b;font-size:14px;font-weight:600;line-height:22px;overflow-wrap:anywhere;">${escapeHtml(value)}</td>
    </tr>`).join("")}
  </table>`;
}

function appointmentDetails(data: Appointment & { price?: number }, clientName?: string | null) {
  const rows: [string, string][] = [
    ["Business", data.businessName], ["Service", data.serviceName],
    ["Date", data.date], ["Time", `${data.startTime} – ${data.endTime}`],
  ];
  if (clientName) rows.unshift(["Client", clientName]);
  if (data.price !== undefined) {
    rows.push(["Price", formatPrice(data.price)]);
  }
  return details(rows) + `<p style="margin:-12px 0 24px;font-size:12px;line-height:20px;color:#728079;">All appointment times are shown in Belgrade time.</p>`;
}

function emailLayout({ title, preview, label, content, tone = "green" }: {
  title: string; preview: string; label: string; content: string; tone?: Tone;
}) {
  const colors = {
    green: { background: "#e8f4ed", text: "#236747" },
    red: { background: "#fceceb", text: "#a53631" },
    amber: { background: "#fff4d9", text: "#88601a" },
  }[tone];
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f0f3f1;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(preview)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f3f1;"><tr><td align="center" style="padding:32px 12px;">
    <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e1e7e3;border-radius:18px;overflow:hidden;">
      <tr><td style="padding:26px 28px;background:#172d26;border-bottom:4px solid #c9dfad;">
        <p style="margin:0;color:#ffffff;font-size:25px;letter-spacing:-1px;font-weight:700;">Appointify<span style="color:#c9dfad;">.</span></p>
        <p style="margin:7px 0 0;color:#c0d0c7;font-size:12px;letter-spacing:1px;">A LITTLE MORE TIME FOR YOU</p>
      </td></tr>
      <tr><td style="padding:30px 28px;">
        <span style="display:inline-block;padding:6px 11px;border-radius:20px;background:${colors.background};color:${colors.text};font-size:11px;line-height:16px;font-weight:700;letter-spacing:1px;">${escapeHtml(label.toUpperCase())}</span>
        <h1 style="margin:18px 0 22px;color:#17232b;font-size:28px;line-height:36px;letter-spacing:-0.6px;">${escapeHtml(title)}</h1>
        ${content}
        <p style="margin:28px 0 0;color:#17232b;font-size:14px;line-height:23px;">Thank you for choosing Appointify.<br><strong>The Appointify team</strong></p>
      </td></tr>
      <tr><td style="padding:22px 28px;background:#fafbf9;border-top:1px solid #e8ece9;">
        <p style="margin:0;color:#718078;font-size:12px;line-height:20px;">Need help? Contact us at <a href="mailto:admin@appointify.com" style="color:#236747;text-decoration:underline;">admin@appointify.com</a>.</p>
        <p style="margin:7px 0 0;color:#87928b;font-size:11px;line-height:18px;">This is an automatic notification from Appointify.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

export function registrationConfirmationEmail(name?: string | null) {
  return {
    subject: "Welcome to Appointify",
    html: emailLayout({
      title: "Welcome to Appointify.", label: "You're all set", preview: "Your account is ready. Make time for what matters.",
      content: greeting(name) + paragraph("Your account has been successfully created. We're happy to have you here.") +
        paragraph("Use Appointify to discover services, manage appointments and keep your plans in one place.") +
        `<div style="padding:20px;background:#f1f6ed;border-left:3px solid #8cab70;border-radius:8px;">${paragraph("Your next step: open Appointify and explore your dashboard.")}</div>`,
    }),
  };
}

export function reservationConfirmationEmail(data: PricedAppointment & Client) {
  return {
    subject: `Reservation confirmed - ${data.businessName}`,
    html: emailLayout({
      title: "Your appointment is confirmed.", label: "Confirmed", preview: `You're booked at ${data.businessName} on ${data.date}.`,
      content: greeting(data.clientName) + paragraph("Everything is booked. Here are the details of your upcoming appointment.") + appointmentDetails(data) +
        paragraph("You can view and manage this reservation in My Reservations on Appointify."),
    }),
  };
}

export function newReservationOwnerEmail(data: PricedAppointment & Client & { ownerName?: string | null }) {
  return {
    subject: `New reservation - ${data.businessName}`,
    html: emailLayout({
      title: "A new booking just arrived.", label: "New reservation", preview: `${data.clientName || "A client"} booked ${data.serviceName}.`,
      content: greeting(data.ownerName) + paragraph("You have received a new reservation. The client has also received a confirmation email.") + appointmentDetails(data, data.clientName || "Client") +
        paragraph("Open your business dashboard to view your schedule and reservation details."),
    }),
  };
}

export function cancellationEmail(data: PricedAppointment & Client & { recipientName?: string | null; forOwner: boolean }) {
  return {
    subject: data.forOwner ? `Reservation canceled by client - ${data.businessName}` : `Reservation cancellation - ${data.businessName}`,
    html: emailLayout({
      title: data.forOwner ? "A client canceled their booking." : "Your reservation is canceled.",
      label: "Canceled", tone: "red", preview: `Cancellation confirmed for ${data.serviceName} on ${data.date}.`,
      content: greeting(data.recipientName) + paragraph(data.forOwner ? "The client canceled the following reservation. Your schedule has been updated." : "Your reservation has been successfully canceled. The business has been notified.") +
        appointmentDetails(data, data.forOwner ? data.clientName || "Client" : undefined),
    }),
  };
}

export function ownerCancellationEmail(data: PricedAppointment & Client & { reason: string }) {
  return {
    subject: `Reservation canceled by ${data.businessName}`,
    html: emailLayout({
      title: "An update to your appointment.", label: "Canceled by business", tone: "red", preview: `${data.businessName} canceled your appointment. See the reason below.`,
      content: greeting(data.clientName) + paragraph("Unfortunately, the business has canceled your reservation. We're sorry for the change to your plans.") + appointmentDetails(data) +
        `<div style="padding:18px 20px;border-left:3px solid #c76962;border-radius:8px;background:#fdf1ef;"><p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#a53631;">REASON FOR CANCELLATION</p><p style="margin:0;color:#633c39;font-size:14px;line-height:23px;">${escapeHtml(data.reason).replace(/\r?\n/g, "<br>")}</p></div>` +
        paragraph("Open Appointify to find another appointment that works for you."),
    }),
  };
}

export function reservationReminderEmail(data: Appointment & Client) {
  return {
    subject: `Reminder: your upcoming appointment - ${data.businessName}`,
    html: emailLayout({
      title: "Your appointment is coming up.", label: "A friendly reminder", tone: "amber", preview: `${data.serviceName} at ${data.businessName}, ${data.date} at ${data.startTime}.`,
      content: greeting(data.clientName) + paragraph("A quick reminder about your upcoming appointment. Here is everything you need to know.") + appointmentDetails(data) +
        paragraph("Plans changed? Manage your reservation in Appointify before the appointment starts."),
    }),
  };
}

export function reviewReminderEmail(data: Client & { businessName: string; serviceName: string }) {
  return {
    subject: `How was your experience at ${data.businessName}?`,
    html: emailLayout({
      title: "How did it go?", label: "Share your experience", preview: `Tell us about your visit to ${data.businessName}.`,
      content: greeting(data.clientName) + paragraph("We hope you enjoyed your recent appointment. Your feedback helps others choose a service with confidence.") +
        details([["Business", data.businessName], ["Service", data.serviceName]]) +
        `<div style="padding:20px;background:#f1f6ed;border-left:3px solid #8cab70;border-radius:8px;">${paragraph("To leave a review, open My Reservations in Appointify and find your completed appointment.")}</div>`,
    }),
  };
}