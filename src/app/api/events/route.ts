import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const events = await db.event.findMany({
    where: { active: true, date: { gte: new Date() } },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, date, endDate, venue, city, imageUrl, ticketPrice, totalTickets } = body;

  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now();

  const event = await db.event.create({
    data: {
      title,
      slug,
      description,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      venue,
      city: city || "Johannesburg",
      imageUrl: imageUrl || "",
      ticketPrice: parseFloat(ticketPrice),
      totalTickets: parseInt(totalTickets),
    },
  });

  return NextResponse.json(event);
}
