"use server";

import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import Papa from "papaparse";
import crypto from "crypto";
import { z } from "zod";

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

// ─── Admin Auth ──────────────────────────────────────────────────────

const TOKEN_SECRET = process.env.ADMIN_SECRET ?? "hart-county-admin-secret-key";

function createToken(userId: string, email: string): string {
  const payload = JSON.stringify({ userId, email, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const hmac = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
  return Buffer.from(payload).toString("base64") + "." + hmac;
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const [payloadB64, sig] = token.split(".");
    if (!payloadB64 || !sig) return null;
    const payload = Buffer.from(payloadB64, "base64").toString();
    const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
    if (sig !== expected) return null;
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    return { userId: data.userId, email: data.email };
  } catch {
    return null;
  }
}

export type LoginResult = { success: true } | { success: false; error: string };

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginAction(formData: FormData): Promise<LoginResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid email or password." };
  }

  const { email, password } = parsed.data;

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) {
    return { success: false, error: "Invalid email or password." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Invalid email or password." };
  }

  const token = createToken(user.id, user.email);
  const cookieStore = await cookies();
  cookieStore.set("admin-token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return { success: true };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin-token");
}

export async function createAdminUser(
  email: string,
  password: string,
  name?: string
) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.adminUser.create({
    data: { email, passwordHash, name: name ?? null },
  });
}

// ─── Pet Mutations ───────────────────────────────────────────────────

export async function updatePet(
  id: string,
  data: Record<string, unknown>
) {
  await prisma.pet.update({ where: { id }, data });
  revalidatePath("/admin/pets");
  revalidatePath("/pets");
}

export async function updatePetFields(formData: FormData): Promise<{ success: true } | { success: false; error: string }> {
  const id = formData.get("id") as string;
  if (!id) return { success: false, error: "Missing pet ID." };

  const data: Record<string, unknown> = {};
  const stringFields = ["name", "breed", "species", "ageCategory", "sex", "size", "weight", "color", "description", "status", "imageUrl", "specialNeeds", "energyLevel"];
  for (const field of stringFields) {
    const val = formData.get(field);
    if (val !== null) {
      data[field] = (val as string).trim() || null;
    }
  }
  // Non-nullable fields
  if (data.name === null) return { success: false, error: "Name is required." };
  if (data.species === null) data.species = "dog";
  if (data.status === null) data.status = "available";

  const priceVal = formData.get("price");
  if (priceVal !== null) {
    const parsed = parseFloat(priceVal as string);
    data.price = isNaN(parsed) ? null : parsed;
    data.adoptionFee = data.price;
  }

  await prisma.pet.update({ where: { id }, data });
  revalidatePath("/admin/pets");
  revalidatePath("/pets");
  return { success: true };
}

export async function updatePetStatus(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  if (!id || !status) return;
  await prisma.pet.update({ where: { id }, data: { status } });
  revalidatePath("/admin/pets");
  revalidatePath("/pets");
}

export async function deletePet(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;
  // Delete related bookings and donations first
  await prisma.bookingRequest.deleteMany({ where: { petId: id } });
  await prisma.donation.deleteMany({ where: { petId: id } });
  await prisma.pet.delete({ where: { id } });
  revalidatePath("/admin/pets");
  revalidatePath("/pets");
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type PreviewPet = {
  name: string;
  species: string;
  breed: string;
  ageCategory: string;
  sex: string;
  size: string;
  weight: string;
  color: string;
  description: string;
  status: string;
  price: string;
  imageUrl: string;
};

export type PreviewResult =
  | { success: true; preview: PreviewPet[] }
  | { success: false; error: string };

export async function previewImportPets(formData: FormData): Promise<PreviewResult> {
  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No file provided." };

  const text = await file.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });

  if (parsed.errors.length > 0) {
    return { success: false, error: `CSV parse error: ${parsed.errors[0].message}` };
  }

  const rows = parsed.data as Record<string, string>[];
  const preview: PreviewPet[] = [];

  for (const row of rows) {
    const name = (row.title ?? row.name ?? "").trim();
    if (!name) continue;

    preview.push({
      name,
      species: row.species?.trim() || "dog",
      breed: row.breed?.trim() || "",
      ageCategory: (row.age ?? row.ageCategory)?.trim() || "",
      sex: row.sex?.trim() || "",
      size: row.size?.trim() || "",
      weight: row.weight?.trim() || "",
      color: row.color?.trim() || "",
      description: row.description?.trim() || "",
      status: row.availability?.toLowerCase() === "adopted" ? "adopted" : "available",
      price: row.price?.trim() || "",
      imageUrl: (row.image ?? row.imageUrl)?.trim() || "",
    });
  }

  if (preview.length === 0) {
    return { success: false, error: "No valid rows found in CSV." };
  }

  return { success: true, preview };
}

export type ImportResult = { success: true; count: number } | { success: false; error: string };

export async function importPets(formData: FormData): Promise<ImportResult> {
  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No file provided." };

  const text = await file.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });

  if (parsed.errors.length > 0) {
    return { success: false, error: `CSV parse error: ${parsed.errors[0].message}` };
  }

  const rows = parsed.data as Record<string, string>[];
  let count = 0;

  for (const row of rows) {
    const name = (row.title ?? row.name ?? "").trim();
    if (!name) continue;

    const slug = toSlug(name);
    const status = row.availability?.toLowerCase() === "adopted" ? "adopted" : "available";

    await prisma.pet.upsert({
      where: { slug },
      update: {
        name,
        breed: row.breed?.trim() || null,
        ageCategory: (row.age ?? row.ageCategory)?.trim() || null,
        sex: row.sex?.trim() || null,
        size: row.size?.trim() || null,
        weight: row.weight?.trim() || null,
        color: row.color?.trim() || null,
        description: row.description?.trim() || null,
        status,
        price: row.price ? parseFloat(row.price) : null,
        imageUrl: (row.image ?? row.imageUrl)?.trim() || null,
        adoptionFee: row.price ? parseFloat(row.price) : null,
      },
      create: {
        slug,
        name,
        species: row.species?.trim() || "dog",
        breed: row.breed?.trim() || null,
        ageCategory: (row.age ?? row.ageCategory)?.trim() || null,
        sex: row.sex?.trim() || null,
        size: row.size?.trim() || null,
        weight: row.weight?.trim() || null,
        color: row.color?.trim() || null,
        description: row.description?.trim() || null,
        status,
        price: row.price ? parseFloat(row.price) : null,
        imageUrl: (row.image ?? row.imageUrl)?.trim() || null,
        adoptionFee: row.price ? parseFloat(row.price) : null,
      },
    });
    count++;
  }

  revalidatePath("/admin/pets");
  revalidatePath("/pets");
  return { success: true, count };
}

export async function getExportCsv(): Promise<string> {
  const pets = await prisma.pet.findMany({ orderBy: { name: "asc" } });
  const rows = pets.map((p) => ({
    title: p.name,
    availability: p.status === "adopted" ? "Adopted" : "Available",
    breed: p.breed ?? "",
    age: p.ageCategory ?? "",
    sex: p.sex ?? "",
    size: p.size ?? "",
    weight: p.weight ?? "",
    color: p.color ?? "",
    description: p.description ?? "",
    price: p.price ?? "",
    image: p.imageUrl ?? "",
  }));
  return Papa.unparse(rows);
}

export async function updateBookingStatus(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  if (!id || !status) return;
  await prisma.bookingRequest.update({ where: { id }, data: { status } });
  revalidatePath("/admin");
}
