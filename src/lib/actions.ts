"use server";

import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

export type SurveyMatchesData = {
  name: string;
  email: string;
  matchIds: string[];
  matchNames: string[];
};

export type SurveyMatchesResult =
  | { success: true }
  | { success: false; error: string };

export async function sendSurveyMatches(
  data: SurveyMatchesData
): Promise<SurveyMatchesResult> {
  try {
    const matchList = data.matchNames
      .map((name, i) => `<li><a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/pets">${name}</a></li>`)
      .join("");

    if (process.env.SMTP_HOST) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "1025"),
          secure: false,
          auth:
            process.env.SMTP_USER && process.env.SMTP_PASS
              ? {
                  user: process.env.SMTP_USER,
                  pass: process.env.SMTP_PASS,
                }
              : undefined,
        });

        await transporter.sendMail({
          from: process.env.EMAIL_FROM ?? "noreply@hcars.org",
          to: data.email,
          cc: "shelter@hcars.org",
          subject: "Your Pet Matches from Hart County Animal Rescue",
          html: `
            <h2>Hi ${data.name}!</h2>
            <p>Here are the pets we matched for you:</p>
            <ol>${matchList}</ol>
            <p>Visit us to schedule a meet-and-greet!</p>
            <p>Hart County Animal Rescue</p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send survey matches email:", emailError);
      }
    } else {
      console.log(
        `Email stub: survey matches for ${data.email} — ${data.matchNames.join(", ")}`
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send survey matches:", error);
    return { success: false, error: "Failed to send email. Please try again." };
  }
}

export type BookingData = {
  petId: string;
  name: string;
  email: string;
  phone?: string;
  preferredDates?: string;
  message?: string;
};

export type BookingResult =
  | { success: true; bookingId: string }
  | { success: false; error: string };

export async function createBooking(data: BookingData): Promise<BookingResult> {
  try {
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

    const pet = await prisma.pet.findUnique({ where: { id: data.petId } });

    // Send notification email
    if (process.env.SMTP_HOST) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "1025"),
          secure: false,
          auth:
            process.env.SMTP_USER && process.env.SMTP_PASS
              ? {
                  user: process.env.SMTP_USER,
                  pass: process.env.SMTP_PASS,
                }
              : undefined,
        });

        await transporter.sendMail({
          from: process.env.EMAIL_FROM ?? "noreply@hcars.org",
          to: "shelter@hcars.org",
          subject: `New Meet-and-Greet Request: ${pet?.name ?? "Unknown Pet"}`,
          html: `
            <h2>New Meet-and-Greet Booking</h2>
            <p><strong>Pet:</strong> ${pet?.name ?? "Unknown"} (${pet?.breed ?? "N/A"})</p>
            <p><strong>Visitor:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ""}
            ${data.preferredDates ? `<p><strong>Preferred Dates:</strong> ${data.preferredDates}</p>` : ""}
            ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ""}
            <p><strong>Booking ID:</strong> ${booking.id}</p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send booking email:", emailError);
      }
    } else {
      console.log(`Email stub: new booking for petId ${data.petId}`);
    }

    return { success: true, bookingId: booking.id };
  } catch (error) {
    console.error("Failed to create booking:", error);
    return { success: false, error: "Failed to submit booking request. Please try again." };
  }
}
