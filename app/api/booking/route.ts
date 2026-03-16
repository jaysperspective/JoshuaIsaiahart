import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { date, time, name, phone, email, description } = await request.json();

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

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "onboarding@resend.dev",
        to: "josh@plusntrust.org",
        reply_to: email,
        subject: `Consultation Booking: ${name} — ${formattedDate} at ${time}`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.error("Resend error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to send booking request. Please try again." },
      { status: 500 }
    );
  }
}
