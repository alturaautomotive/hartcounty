"use client";

import { useState } from "react";
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
  petFee,
  petVaccinated,
  petSpayedNeutered,
}: {
  petId: string;
  petName: string;
  petSlug: string;
  petFee?: number | null;
  petVaccinated?: boolean;
  petSpayedNeutered?: boolean;
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
      <div className="rounded-2xl border border-success-200 bg-success-50 p-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-success-600"
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
        <h2 className="mb-2 text-xl font-bold text-neutral-900">
          Thank you!
        </h2>
        <p className="mb-6 text-neutral-600">
          Your meet-and-greet request for{" "}
          <span className="font-semibold">{petName}</span> has been submitted.
          We&apos;ll be in touch soon to confirm your visit.
        </p>
        <a
          href={`/pets/${petSlug}`}
          className="inline-block rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          Back to {petName}
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
    >
      {serverError && (
        <div
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {serverError}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-sm font-medium text-neutral-700"
        >
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          {...register("name")}
          className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
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
          className="mb-1 block text-sm font-medium text-neutral-700"
        >
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          aria-invalid={errors.email ? "true" : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-xs text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="phone"
          className="mb-1 block text-sm font-medium text-neutral-700"
        >
          Phone <span className="text-neutral-400">(optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          {...register("phone")}
          className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="preferredDates"
          className="mb-1 block text-sm font-medium text-neutral-700"
        >
          Preferred Dates{" "}
          <span className="text-neutral-400">(optional)</span>
        </label>
        <input
          id="preferredDates"
          type="text"
          placeholder="e.g., Weekends, April 28-30"
          {...register("preferredDates")}
          className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-1 block text-sm font-medium text-neutral-700"
        >
          Message <span className="text-neutral-400">(optional)</span>
        </label>
        <textarea
          id="message"
          rows={4}
          placeholder="Tell us about your home, experience with pets, or any questions..."
          {...register("message")}
          className="w-full resize-y rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Submit Booking Request"}
      </button>
    </form>
  );
}
