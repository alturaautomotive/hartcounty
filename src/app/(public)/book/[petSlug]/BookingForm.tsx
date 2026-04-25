"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { createBooking } from "@/lib/actions";

const bookingSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().max(20).optional(),
  preferredDates: z.string().max(200).optional(),
  message: z.string().max(1000).optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function BookingForm({
  petId,
  petName,
  petSlug,
  similarPetsHref,
}: {
  petId: string;
  petName: string;
  petSlug: string;
  similarPetsHref: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      preferredDates: "",
      message: "",
    },
  });

  async function onSubmit(values: BookingFormValues) {
    setServerError(null);
    const result = await createBooking({
      petId,
      name: values.name,
      email: values.email,
      phone: values.phone || undefined,
      preferredDates: values.preferredDates || undefined,
      message: values.message || undefined,
    });

    if (result.success) {
      setSubmitted(true);
    } else {
      setServerError(result.error);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xl shadow-slate-950/10">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-emerald-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-black text-slate-950">
          Request received.
        </h2>
        <p className="mx-auto mb-6 max-w-lg leading-7 text-slate-600">
          Your meet-and-greet request for{" "}
          <span className="font-semibold">{petName}</span> has been submitted.
          We&apos;ll be in touch soon to confirm your visit.
        </p>
        <div className="mx-auto mb-6 max-w-lg rounded-2xl bg-amber-50 p-4 text-left ring-1 ring-amber-200">
          <p className="text-sm font-black text-amber-900">Next step</p>
          <p className="mt-1 text-sm leading-6 text-amber-800">
            Please watch your email and phone for a confirmation. Visits are by
            arrangement, so your requested time is not final until a volunteer
            confirms it.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={`/pets/${petSlug}`}
            className="inline-block rounded-full bg-slate-950 px-6 py-2.5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-amber-500 hover:text-slate-950"
          >
            Back to {petName}
          </Link>
          <Link
            href={similarPetsHref}
            className="inline-block rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-black uppercase tracking-[0.14em] text-slate-800 transition hover:border-amber-500 hover:text-amber-700"
          >
            See Similar Pets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-950/10 ring-1 ring-white/70"
    >
      <div className="rounded-2xl bg-slate-950 p-5 text-white">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
          Appointment request
        </p>
        <h2 className="text-xl font-black text-white">
          Schedule your visit with {petName}
        </h2>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-300">
          Share your contact details and preferred visit window. We&apos;ll
          follow up to confirm an appointment.
        </p>
      </div>

      {serverError && (
        <div
          className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200"
          role="alert"
        >
          {serverError}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
        <label
          htmlFor="name"
          className="mb-1 block text-sm font-bold text-slate-700"
        >
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          {...register("name")}
          className="w-full rounded-xl border border-slate-400 px-4 py-2.5 text-sm font-medium text-slate-950 placeholder:font-semibold placeholder:text-slate-500 transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
          aria-invalid={errors.name ? "true" : undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-xs text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-bold text-slate-700"
        >
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register("email")}
          className="w-full rounded-xl border border-slate-400 px-4 py-2.5 text-sm font-medium text-slate-950 placeholder:font-semibold placeholder:text-slate-500 transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
          aria-invalid={errors.email ? "true" : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-xs text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
        <label
          htmlFor="phone"
          className="mb-1 block text-sm font-bold text-slate-700"
        >
          Phone <span className="text-slate-400">(optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="(706) 555-1234"
          {...register("phone")}
          className="w-full rounded-xl border border-slate-400 px-4 py-2.5 text-sm font-medium text-slate-950 placeholder:font-semibold placeholder:text-slate-500 transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="preferredDates"
          className="mb-1 block text-sm font-bold text-slate-700"
        >
          Preferred Dates <span className="text-slate-400">(optional)</span>
        </label>
        <input
          id="preferredDates"
          type="text"
          placeholder="e.g., Saturday morning or weekday afternoons"
          {...register("preferredDates")}
          className="w-full rounded-xl border border-slate-400 px-4 py-2.5 text-sm font-medium text-slate-950 placeholder:font-semibold placeholder:text-slate-600 transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
        />
      </div>
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-1 block text-sm font-bold text-slate-700"
        >
          Message <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          id="message"
          rows={4}
          placeholder="Tell us about your home, experience with pets, or any questions..."
          {...register("message")}
          className="w-full resize-y rounded-xl border border-slate-400 px-4 py-2.5 text-sm font-medium text-slate-950 placeholder:font-semibold placeholder:text-slate-600 transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-amber-400 py-3.5 text-sm font-black uppercase tracking-[0.14em] text-slate-950 shadow-lg shadow-amber-950/20 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sending Request..." : `Request Visit With ${petName}`}
      </button>

      <p className="text-center text-xs font-semibold leading-5 text-slate-500">
        We respect your privacy. Your information is only used to coordinate
        this meet-and-greet.
      </p>
    </form>
  );
}
