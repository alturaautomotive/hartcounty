"use server";

import prisma from "@/lib/prisma";
import { getResend } from "@/lib/resend";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import Papa from "papaparse";
import { createToken, verifyToken } from "./auth";
import { getAllAdminEmails } from "@/lib/queries";
import { z } from "zod";
import crypto from "crypto";
import type { SurveyAnswers } from "@/types/survey";
import type { Pet } from "@prisma/client";
import { uploadImageToSupabase } from "./supabase-storage";

const emailFrom = () =>
  process.env.RESEND_FROM_EMAIL ?? process.env.EMAIL_FROM ?? "noreply@hcars.org";
import { metaRow, updateMetaItem, deleteMetaItem, updateMetaBatch } from "./meta";

export type SurveyMatchesData = {
  name: string;
  email: string;
  matchIds: string[];
  matchNames: string[];
  matchSlugs: string[];
};

export type SurveyMatchesResult =
  | { success: true }
  | { success: false; error: string };

export async function getTopMatches(answers: SurveyAnswers) {
  const pets = await prisma.pet.findMany({
    where: { status: "available" },
  });

  const scored = pets.map((pet) => {
    let score = 0;

    // Compatibility flags
    if (answers.hasKids && (pet.goodWithKids ?? false)) score += 10;
    if (answers.hasKids && !(pet.goodWithKids ?? false)) score -= 10;
    if (answers.hasDogs && (pet.goodWithDogs ?? false)) score += 10;
    if (answers.hasDogs && !(pet.goodWithDogs ?? false)) score -= 10;
    if (answers.hasCats && (pet.goodWithCats ?? false)) score += 10;
    if (answers.hasCats && !(pet.goodWithCats ?? false)) score -= 10;

    // Size match
    if (answers.prefSize !== "any" && pet.size) {
      if (pet.size.toLowerCase() === answers.prefSize) score += 5;
      else score -= 2;
    }

    // Energy / activity level match
    if (pet.energyLevel) {
      if (pet.energyLevel.toLowerCase() === answers.activityLevel) score += 8;
      else score -= 2;
    }

    // Age match
    if (answers.prefAge !== "any" && pet.ageCategory) {
      if (pet.ageCategory.toLowerCase() === answers.prefAge) score += 5;
      else score -= 1;
    }

    // Home type bonus for large pets in large spaces
    if (
      (answers.homeType === "house_large_yard" || answers.homeType === "farm") &&
      pet.size?.toLowerCase() === "large"
    ) {
      score += 3;
    }
    if (answers.homeType === "apartment" && pet.size?.toLowerCase() === "large") {
      score -= 5;
    }

    return { pet, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5).map((s) => s.pet);
}

export async function sendSurveyMatches(
  data: SurveyMatchesData
): Promise<SurveyMatchesResult> {
  try {
    const matchList = data.matchNames
      .map((name, i) => `<li><a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/pets/${data.matchSlugs[i]}">${name}</a></li>`)
      .join("");

    const adminEmails = await getAllAdminEmails();

    if (process.env.RESEND_API_KEY) {
      try {
        await getResend().emails.send({
          from: emailFrom(),
          to: data.email,
          cc: ["shelter@hcars.org", ...adminEmails],
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

export async function sendMatchesToClient(data: {
  name: string;
  email: string;
  matchIds: string[];
  matchNames: string[];
  matchSlugs: string[];
}): Promise<SurveyMatchesResult> {
  try {
    const matchList = data.matchNames
      .map(
        (name, i) =>
          `<li><a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/pets/${data.matchSlugs[i]}">${name}</a></li>`
      )
      .join("");

    if (process.env.RESEND_API_KEY) {
      try {
        await getResend().emails.send({
          from: emailFrom(),
          to: data.email,
          subject: "Your Booking Matches from Hart County Animal Rescue",
          html: `
            <h2>Hi ${data.name}!</h2>
            <p>Thanks for your booking request! Based on your preferences, here are some pets we think you'll love:</p>
            <ol>${matchList}</ol>
            <p>We'll be in touch soon to confirm your visit. Hart County Animal Rescue</p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send matches email:", emailError);
      }
    } else {
      console.log(
        `Email stub: booking matches for ${data.email} — ${data.matchNames.join(", ")}`
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send matches:", error);
    return { success: false, error: "Failed to send email. Please try again." };
  }
}

export async function submitBookingWithMatches(
  petId: string,
  answers: SurveyAnswers,
  bookingData: { name: string; email: string; phone?: string; preferredDates?: string; message?: string }
): Promise<BookingResult> {
  const matches = await getTopMatches(answers);

  await sendMatchesToClient({
    name: bookingData.name,
    email: bookingData.email,
    matchIds: matches.map((p) => p.id),
    matchNames: matches.map((p) => p.name),
    matchSlugs: matches.map((p) => p.slug),
  });

  return await createBooking({ ...bookingData, petId });
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
    const adminEmails = await getAllAdminEmails();

    if (process.env.RESEND_API_KEY) {
      try {
        await getResend().emails.send({
          from: emailFrom(),
          to: "shelter@hcars.org",
          cc: adminEmails,
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

export type LoginResult = { success: true } | { success: false; error: string };

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  const session = token ? verifyToken(token) : null;
  if (!session) return null;

  return prisma.adminUser.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, role: true, name: true },
  });
}

async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("You must be signed in to manage this content.");
  }
  return admin;
}

async function requireSuperAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin || admin.role !== "super_admin") {
    throw new Error("Only the super admin can manage admin users.");
  }
  return admin;
}

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

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

  const token = createToken(
    user.id,
    user.email,
    user.role === "super_admin" ? "super_admin" : "manager"
  );
  const cookieStore = await cookies();
  cookieStore.set("admin-token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return { success: true };
}

export type ForgotPasswordResult =
  | { success: true; message: string }
  | { success: false; error: string };

export type ResetPasswordResult =
  | { success: true; message: string }
  | { success: false; error: string };

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.VERCEL_URL?.replace(/^/, "https://") ??
    "http://localhost:3000"
  );
}

function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function sendPasswordResetEmail(email: string, resetUrl: string) {
  if (process.env.RESEND_API_KEY) {
    await getResend().emails.send({
      from: emailFrom(),
      to: email,
      subject: "Reset your Hart County admin password",
      html: `
        <h2>Password Reset</h2>
        <p>Use the link below to reset your Hart County Animal Rescue admin password. This link expires in 1 hour.</p>
        <p><a href="${resetUrl}">Reset your password</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    });
  } else {
    console.log(`Password reset link for ${email}: ${resetUrl}`);
  }
}

export async function requestPasswordResetAction(
  formData: FormData
): Promise<ForgotPasswordResult> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { success: false, error: "Enter a valid email address." };
  }

  const genericMessage =
    "If that email belongs to an admin account, a reset link has been sent.";
  const email = parsed.data.email.toLowerCase();
  const user = await prisma.adminUser.findUnique({ where: { email } });

  if (!user) {
    return { success: true, message: genericMessage };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      adminId: user.id,
      expiresAt,
    },
  });

  const resetUrl = `${getBaseUrl()}/admin/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return {
      success: false,
      error: "We could not send the reset email. Please try again.",
    };
  }

  return { success: true, message: genericMessage };
}

export async function resetPasswordAction(
  formData: FormData
): Promise<ResetPasswordResult> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Enter a valid password.",
    };
  }

  const { token, password } = parsed.data;
  const tokenHash = hashResetToken(token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return {
      success: false,
      error: "This reset link is invalid or expired. Request a new one.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: resetToken.adminId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({
      where: {
        adminId: resetToken.adminId,
        usedAt: null,
        id: { not: resetToken.id },
      },
    }),
  ]);

  return {
    success: true,
    message: "Your password has been reset. You can sign in now.",
  };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin-token");
}

export async function createAdminUser(
  email: string,
  password: string,
  name?: string,
  role: "super_admin" | "manager" = "manager"
) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.adminUser.create({
    data: { email, passwordHash, name: name ?? null, role },
  });
}

const adminUserSchema = z.object({
  email: z.string().email(),
  name: z.string().max(100).optional(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["super_admin", "manager"]),
});

const updateAdminUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().max(100).optional(),
  password: z
    .string()
    .optional()
    .transform((value) => value?.trim() ?? "")
    .refine((value) => value.length === 0 || value.length >= 8, {
      message: "Password must be at least 8 characters.",
    }),
  role: z.enum(["super_admin", "manager"]),
});

export async function createAdminUserAction(
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireSuperAdmin();
    const parsed = adminUserSchema.safeParse({
      email: formData.get("email"),
      name: formData.get("name") || undefined,
      password: formData.get("password"),
      role: formData.get("role"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid admin user.",
      };
    }

    await createAdminUser(
      parsed.data.email.toLowerCase(),
      parsed.data.password,
      parsed.data.name,
      parsed.data.role
    );
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to create admin user:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create admin user.",
    };
  }
}

export async function updateAdminUserAction(
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireSuperAdmin();
    const parsed = updateAdminUserSchema.safeParse({
      id: formData.get("id"),
      email: formData.get("email"),
      name: formData.get("name") || undefined,
      password: formData.get("password") || "",
      role: formData.get("role"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid admin user.",
      };
    }

    const data: {
      email: string;
      name: string | null;
      role: "super_admin" | "manager";
      passwordHash?: string;
    } = {
      email: parsed.data.email.toLowerCase(),
      name: parsed.data.name?.trim() || null,
      role: parsed.data.role,
    };

    if (parsed.data.password) {
      data.passwordHash = await bcrypt.hash(parsed.data.password, 10);
    }

    await prisma.adminUser.update({
      where: { id: parsed.data.id },
      data,
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to update admin user:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update admin user.",
    };
  }
}

export async function deleteAdminUserAction(
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const currentAdmin = await requireSuperAdmin();
    const id = formData.get("id") as string | null;
    if (!id) return { success: false, error: "Missing user ID." };
    if (id === currentAdmin.id) {
      return { success: false, error: "You cannot delete your own account." };
    }

    await prisma.adminUser.delete({ where: { id } });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete admin user:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete admin user.",
    };
  }
}

// ─── Meta Catalog Sync Helpers ────────────────────────────────────────

async function syncMetaPet(catalogId: string, token: string, pet: Pet): Promise<void> {
  if (!catalogId || !token) {
    console.log("Meta sync skipped: env missing");
    return;
  }
  try {
    const row = metaRow(pet);
    if (row) await updateMetaItem(catalogId, token, row as unknown as Record<string, string>);
  } catch (e) {
    console.error("Meta update failed:", e);
  }
}

async function syncMetaDelete(catalogId: string, token: string, id: string): Promise<void> {
  if (!catalogId || !token) {
    console.log("Meta sync skipped: env missing");
    return;
  }
  try {
    await deleteMetaItem(catalogId, token, id);
  } catch (e) {
    console.error("Meta delete failed:", e);
  }
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
  try {
    await requireAdmin();
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

    const imageFile = formData.get("imageFile");
    const uploadedImageUrl = await uploadImageToSupabase(
      imageFile instanceof File ? imageFile : null,
      "pets"
    );
    if (uploadedImageUrl) {
      data.imageUrl = uploadedImageUrl;
    }

    const priceVal = formData.get("price");
    if (priceVal !== null) {
      const parsed = parseFloat(priceVal as string);
      data.price = isNaN(parsed) ? null : parsed;
      data.adoptionFee = data.price;
    }

    await prisma.pet.update({ where: { id }, data });

    const updatedPet = await prisma.pet.findUnique({ where: { id } });
    const catalogId = process.env.META_CATALOG_ID;
    const token = process.env.META_CATALOG_ACCESS_TOKEN;
    if (catalogId && token && updatedPet) {
      try {
        const row = metaRow(updatedPet);
        if (row) {
          await updateMetaItem(catalogId, token, row as unknown as Record<string, string>);
        }
      } catch (e) {
        console.error('Meta sync failed for pet', id, e);
      }
    }

    revalidatePath("/admin/pets");
    revalidatePath("/pets");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to update pet:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update pet.",
    };
  }
}

export async function updatePetStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  if (!id || !status) return;
  await prisma.pet.update({ where: { id }, data: { status } });

  const updatedPet = await prisma.pet.findUnique({ where: { id } });
  const catalogId = process.env.META_CATALOG_ID;
  const token = process.env.META_CATALOG_ACCESS_TOKEN;
  if (catalogId && token && updatedPet) {
    try {
      const row = metaRow(updatedPet);
      if (row) {
        await updateMetaItem(catalogId, token, row as unknown as Record<string, string>);
      }
    } catch (e) {
      console.error('Meta sync failed for pet', id, e);
    }
  }

  revalidatePath("/admin/pets");
  revalidatePath("/pets");
}

export async function deletePet(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;

  const catalogId = process.env.META_CATALOG_ID;
  const token = process.env.META_CATALOG_ACCESS_TOKEN;
  if (catalogId && token) {
    try {
      const pet = await prisma.pet.findUnique({ where: { id } });
      if (pet?.slug) await deleteMetaItem(catalogId, token, pet.slug);
    } catch (e) {
      console.error('Meta delete failed for pet', id, e);
    }
  }

  // Delete related bookings and donations first
  await prisma.bookingRequest.deleteMany({ where: { petId: id } });
  await prisma.donation.deleteMany({ where: { petId: id } });
  await prisma.pet.delete({ where: { id } });
  revalidatePath("/admin/pets");
  revalidatePath("/pets");
}

const teamMemberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required.").max(100),
  role: z.string().min(1, "Role is required.").max(100),
  bio: z.string().min(1, "Bio is required.").max(500),
  initials: z.string().max(6).optional(),
  imageUrl: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(false),
});

export async function saveTeamMemberAction(
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireAdmin();
    const parsed = teamMemberSchema.safeParse({
      id: formData.get("id") || undefined,
      name: formData.get("name"),
      role: formData.get("role"),
      bio: formData.get("bio"),
      initials: formData.get("initials") || undefined,
      imageUrl: formData.get("imageUrl") || undefined,
      sortOrder: formData.get("sortOrder") || 0,
      isActive: formData.get("isActive") === "on",
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid team member.",
      };
    }

    const imageFile = formData.get("imageFile");
    const uploadedImageUrl = await uploadImageToSupabase(
      imageFile instanceof File ? imageFile : null,
      "team"
    );
    const initials =
      parsed.data.initials?.trim().toUpperCase() || initialsFor(parsed.data.name);
    const data = {
      name: parsed.data.name.trim(),
      role: parsed.data.role.trim(),
      bio: parsed.data.bio.trim(),
      initials,
      imageUrl: uploadedImageUrl ?? (parsed.data.imageUrl?.trim() || null),
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
    };

    if (parsed.data.id) {
      await prisma.teamMember.update({
        where: { id: parsed.data.id },
        data,
      });
    } else {
      await prisma.teamMember.create({ data });
    }

    revalidatePath("/admin/team");
    revalidatePath("/about");
    return { success: true };
  } catch (error) {
    console.error("Failed to save team member:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save team member.",
    };
  }
}

export async function deleteTeamMemberAction(
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireAdmin();
    const id = formData.get("id") as string | null;
    if (!id) return { success: false, error: "Missing team member ID." };
    await prisma.teamMember.delete({ where: { id } });
    revalidatePath("/admin/team");
    revalidatePath("/about");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete team member:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete team member.",
    };
  }
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
  const slugs: string[] = [];

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
    slugs.push(slug);
    count++;
  }

  if (slugs.length) {
    const catalogId = process.env.META_CATALOG_ID;
    const token = process.env.META_CATALOG_ACCESS_TOKEN;
    if (catalogId && token) {
      try {
        const pets = await prisma.pet.findMany({ where: { slug: { in: slugs } } });
        const changes = pets.map(p => ({ method: 'UPDATE' as const, data: metaRow(p)! })).filter(c => c.data);
        await updateMetaBatch(catalogId, token, changes as unknown as { id: string; method: "UPDATE"; data: Record<string, string> }[]);
        console.log(`Synced ${changes.length} pets to Meta`);
      } catch (e) {
        console.error('Meta batch sync failed:', e);
      }
    }
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
