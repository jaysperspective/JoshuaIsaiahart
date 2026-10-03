import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorized } from "@/app/lib/admin-auth";

interface PrintCustomer {
  title: string;
  name: string;
  email: string;
  amountCents: number;
  purchasedAt: string;
}

// GET /api/shop/customers  (admin) → downloadable CSV ledger of fine-art print
// buyers (name + email + what they bought). The data lives in the Sovereign
// payment app (paid print sales); we pull it server-to-server and format the CSV
// here so the download lives alongside shop management in the admin.
export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) return unauthorized();

  const apiBase = process.env.SOVEREIGN_API_BASE;
  const secret = process.env.SOVEREIGN_INTERNAL_SECRET;
  if (!apiBase || !secret) {
    return NextResponse.json({ error: "Export is not configured" }, { status: 503 });
  }

  let rows: PrintCustomer[];
  try {
    const res = await fetch(`${apiBase}/shop/customers`, {
      headers: { "x-internal-secret": secret },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Sovereign responded ${res.status}`);
    rows = await res.json();
  } catch (e) {
    console.error("Failed to fetch print customers:", e);
    return NextResponse.json({ error: "Could not load customers" }, { status: 502 });
  }

  // Escape a cell for CSV, including a guard against spreadsheet formula injection.
  const cell = (v: unknown) => {
    let s = String(v ?? "");
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const header = ["Name", "Email", "Print", "Amount (USD)", "Purchased"];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        cell(r.name),
        cell(r.email),
        cell(r.title),
        cell((r.amountCents / 100).toFixed(2)),
        cell((r.purchasedAt || "").replace("T", " ").replace(/\.\d+Z?$/, "").replace("Z", "")),
      ].join(",")
    );
  }
  const csv = lines.join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="print-customers-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
