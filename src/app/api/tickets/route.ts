import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateTicketCode } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { eventId, buyerName, buyerEmail, quantity } = body;

  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const available = event.totalTickets - event.soldTickets;
  if (available < quantity) {
    return NextResponse.json({ error: "Not enough tickets available" }, { status: 400 });
  }

  const totalPrice = event.ticketPrice * quantity;
  const ticketCode = generateTicketCode();

  const ticket = await db.ticket.create({
    data: {
      eventId,
      buyerName,
      buyerEmail,
      quantity,
      totalPrice,
      ticketCode,
    },
  });

  await db.event.update({
    where: { id: eventId },
    data: { soldTickets: { increment: quantity } },
  });

  return NextResponse.json(ticket);
}
