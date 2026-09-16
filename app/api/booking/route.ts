import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

function parseTime12h(time: string): { hour: number; minute: number } | null {
  const m = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return null;
  let hour = parseInt(m[1], 10) % 12;
  if (m[3].toUpperCase() === "PM") hour += 12;
  return { hour, minute: parseInt(m[2], 10) };
}

// Minimal ICS for a 30-minute consultation, Eastern time
function buildIcs(ymd: string, time: string, name: string): string | null {
  const t = parseTime12h(time);
  const d = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!t || !d) return null;

  const pad = (n: number) => String(n).padStart(2, "0");
  const start = `${d[1]}${d[2]}${d[3]}T${pad(t.hour)}${pad(t.minute)}00`;
  const endMinutes = t.hour * 60 + t.minute + 30;
  const end = `${d[1]}${d[2]}${d[3]}T${pad(Math.floor(endMinutes / 60))}${pad(endMinutes % 60)}00`;
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Joshua Isaiah//Booking//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:booking-${Date.now()}@joshuaisaiah.art`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=America/New_York:${start}`,
    `DTEND;TZID=America/New_York:${end}`,
    "SUMMARY:Consultation — Joshua Isaiah",
    `DESCRIPTION:30-minute Google Meet consultation with Joshua Isaiah. The meeting link will be sent before the call.\\nQuestions: joshualharrington@gmail.com`,
    `ATTENDEE;CN=${name.replace(/[,;]/g, "")}:mailto:noreply@joshuaisaiah.art`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

async function sendEmail(payload: Record<string, unknown>) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as any).message || `Resend error ${res.status}`);
  }
}

export async function POST(request: Request) {
  try {
    const { date, dateYmd, time, name, phone, email, description } = await request.json();

    if (!date || !time || !name || !phone || !email || !description) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const bookingDate = new Date(date);
    const formattedDate = bookingDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Consultation Booking</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #888; width: 120px;">Date</td>
            <td style="padding: 8px 0; color: #333;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">Time</td>
            <td style="padding: 8px 0; color: #333;">${time} (30 minutes)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">Name</td>
            <td style="padding: 8px 0; color: #333;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">Phone</td>
            <td style="padding: 8px 0; color: #333;">${phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">Email</td>
            <td style="padding: 8px 0; color: #333;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888; vertical-align: top;">Description</td>
            <td style="padding: 8px 0; color: #333;">${description}</td>
          </tr>
        </table>
      </div>
    `;

    // Notify Joshua — this one must succeed for the booking to count
    await sendEmail({
      from: process.env.RESEND_FROM || "onboarding@resend.dev",
      to: "josh@plusntrust.org",
      reply_to: email,
      subject: `Consultation Booking: ${name} — ${formattedDate} at ${time}`,
      html: emailHtml,
    });

    // Confirmation to the client with a calendar invite — best effort
    try {
      const ics = dateYmd ? buildIcs(dateYmd, time, name) : null;
      const clientHtml = `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #18201c;">
          <h2 style="font-weight: 500; color: #284139;">You're booked.</h2>
          <p>Hi ${name},</p>
          <p>Your 30-minute consultation with Joshua Isaiah is confirmed for
          <strong>${formattedDate} at ${time}</strong> (Eastern). It'll be a Google Meet —
          the link will come your way before the call.</p>
          <p>The attached calendar file adds it to your calendar in one click.
          Need to reschedule? Just reply to this email.</p>
          <p style="margin-top: 28px;">— Joshua<br/>
          <a href="https://joshuaisaiah.art" style="color: #b86830;">joshuaisaiah.art</a></p>
        </div>
      `;
      await sendEmail({
        from: process.env.RESEND_FROM || "onboarding@resend.dev",
        to: email,
        reply_to: "josh@plusntrust.org",
        subject: `Confirmed: consultation with Joshua Isaiah — ${formattedDate}, ${time}`,
        html: clientHtml,
        ...(ics
          ? {
              attachments: [
                {
                  filename: "consultation.ics",
                  content: Buffer.from(ics).toString("base64"),
                },
              ],
            }
          : {}),
      });
    } catch (e) {
      // Don't fail the booking if the confirmation can't send
      console.error("Client confirmation email failed:", e);
    }

    // Analytics: count the conversion
    try {
      await (prisma as any).metric.create({
        data: { type: "booking", path: "/work#book" },
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to send booking request. Please try again." },
      { status: 500 }
    );
  }
}
