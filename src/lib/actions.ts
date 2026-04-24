"use server";

import prisma from "@/lib/prisma";

export async function createBooking(data: {
  petId: string;
  name: string;
  email: string;
  phone?: string;
  preferredDates?: string;
  message?: string;
}) {
  const booking = await prisma.bookingRequest.create({
    data: {
      petId: data.petId,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      preferredDates: data.preferredDates ?? null,
      message: data.message ?? null,
    },
  });

  return booking;
}
