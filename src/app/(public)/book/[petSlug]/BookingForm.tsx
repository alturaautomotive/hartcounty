"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import type { Pet } from "@/generated/prisma/client";
import PetCard from "@/components/PetCard";
import { steps, stepSchemas } from "@/types/survey";
import type { SurveyAnswers } from "@/types/survey";
import { getTopMatches, submitBookingWithMatches } from "@/lib/actions";

const TOTAL_STEPS = steps.length;

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
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<SurveyAnswers>>({});
  const [matches, setMatches] = useState<Pet[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const showResults = step === TOTAL_STEPS;

  async function handleStepSubmit(data: Record<string, unknown>) {
    const updated = { ...answers, ...data } as Partial<SurveyAnswers>;
    setAnswers(updated);

    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      setLoadingMatches(true);
      const matched = await getTopMatches(updated as SurveyAnswers);
      startTransition(() => {
        setMatches(matched);
        setLoadingMatches(false);
        setStep(TOTAL_STEPS);
      });
    }
  }

  function handleBack() {
    if (showResults) {
      setStep(TOTAL_STEPS - 1);
    } else if (step > 0) {
      setStep(step - 1);
    }
  }

  if (loadingMatches || isPending) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20">
        <svg
          className="h-10 w-10 animate-spin text-amber-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <p className="mt-4 text-lg font-bold text-slate-700">Finding your perfect matches...</p>
      </div>
    );
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
        <h2 className="mb-2 text-xl font-black text-slate-950">
          Thank you!
        </h2>
        <p className="mb-6 text-slate-600">
          Your meet-and-greet request for{" "}
          <span className="font-semibold">{petName}</span> has been submitted.
          We&apos;ll be in touch soon to confirm your visit.
        </p>

        {matches.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-4 text-lg font-black text-slate-950">Your Top Matches</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          </div>
        )}

        <a
          href={`/pets/${petSlug}`}
          className="inline-block rounded-full bg-slate-950 px-6 py-2.5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-amber-500 hover:text-slate-950"
        >
          Back to {petName}
        </a>
      </div>
    );
  }

  if (showResults) {
    return (
      <ResultsWithBooking
        petId={petId}
        petName={petName}
        matches={matches}
        answers={answers as SurveyAnswers}
        onBack={handleBack}
        serverError={serverError}
        onSubmit={async (values: BookingFormValues) => {
          setServerError(null);
          const result = await submitBookingWithMatches(petId, answers as SurveyAnswers, {
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
        }}
      />
    );
  }

  return (
    <div>
      {/* Progress bar */}
      <div
        className="mb-8"
        role="progressbar"
        aria-valuenow={step + 1}
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-label={`Step ${step + 1} of ${TOTAL_STEPS}`}
      >
        <div className="mb-2 flex justify-between text-sm font-bold text-slate-600">
          <span>Step {step + 1} of {TOTAL_STEPS}</span>
          <span>{Math.round(((step + 1) / TOTAL_STEPS) * 100)}%</span>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-amber-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      <StepForm
        key={step}
        stepIndex={step}
        defaultValues={answers}
        onSubmit={handleStepSubmit}
        onBack={handleBack}
      />
    </div>
  );
}

function StepForm({
  stepIndex,
  defaultValues,
  onSubmit,
  onBack,
}: {
  stepIndex: number;
  defaultValues: Partial<SurveyAnswers>;
  onSubmit: (data: Record<string, unknown>) => void;
  onBack: () => void;
}) {
  const currentStep = steps[stepIndex];
  const schema = stepSchemas[stepIndex];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      [currentStep.field]: defaultValues[currentStep.field] ?? (currentStep.type === "boolean" ? undefined : ""),
    },
  });

  const fieldValue = watch(currentStep.field);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-950/10 ring-1 ring-white/70"
    >
      <div>
        <h2 className="text-3xl font-black text-slate-950">{currentStep.title}</h2>
        <p className="mt-2 leading-7 text-slate-600">{currentStep.description}</p>
      </div>

      {currentStep.type === "boolean" ? (
        <div className="flex gap-4">
          {[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => setValue(currentStep.field, opt.value, { shouldValidate: true })}
              className={`flex-1 rounded-xl border-2 py-4 text-center text-lg font-semibold transition ${
                fieldValue === opt.value
                  ? "border-slate-950 bg-slate-950 text-amber-200 shadow-lg shadow-slate-950/20"
                  : "border-slate-200 bg-white text-slate-700 hover:border-amber-400"
              }`}
              aria-pressed={fieldValue === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {currentStep.options.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition ${
                fieldValue === opt.value
                  ? "border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/20"
                  : "border-slate-200 bg-white hover:border-amber-400"
              }`}
            >
              <input
                type="radio"
                value={opt.value}
                {...register(currentStep.field)}
                className="sr-only"
              />
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                  fieldValue === opt.value
                    ? "border-amber-400 bg-amber-400"
                    : "border-slate-300"
                }`}
              >
                {fieldValue === opt.value && (
                  <span className="h-2 w-2 rounded-full bg-slate-950" />
                )}
              </span>
              <span className="font-semibold">{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {!!(errors as Record<string, unknown>)[currentStep.field] && (
        <p className="text-sm text-red-600" role="alert">
          Please make a selection to continue.
        </p>
      )}

      <div className="flex gap-3">
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 transition hover:border-amber-400"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          className="flex-1 rounded-full bg-slate-950 py-3 text-center text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-amber-500 hover:text-slate-950"
        >
          {stepIndex === TOTAL_STEPS - 1 ? "See My Matches" : "Next"}
        </button>
      </div>
    </form>
  );
}

function ResultsWithBooking({
  petId,
  petName,
  matches,
  answers,
  onBack,
  serverError,
  onSubmit,
}: {
  petId: string;
  petName: string;
  matches: Pet[];
  answers: SurveyAnswers;
  onBack: () => void;
  serverError: string | null;
  onSubmit: (values: BookingFormValues) => Promise<void>;
}) {
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

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black text-slate-950">
          Top matches including {petName}
        </h2>
        <p className="mt-3 text-slate-600">
          {matches.length > 0
            ? "Based on your answers, here are the pets we think you'll love."
            : "We couldn't find a strong match right now, but you can still book a visit!"}
        </p>
      </div>

      {matches.length > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-950/10 ring-1 ring-white/70"
      >
        <h3 className="text-xl font-black text-slate-950">
          Book a Meet-and-Greet with {petName}
        </h3>

        {serverError && (
          <div
            className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200"
            role="alert"
          >
            {serverError}
          </div>
        )}

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
            {...register("name")}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-950 transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
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
            {...register("email")}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-950 transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
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
            className="mb-1 block text-sm font-bold text-slate-700"
          >
            Phone <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            {...register("phone")}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-950 transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="preferredDates"
            className="mb-1 block text-sm font-bold text-slate-700"
          >
            Preferred Dates{" "}
            <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="preferredDates"
            type="text"
            placeholder="e.g., Weekends, April 28-30"
            {...register("preferredDates")}
            className="w-full rounded-xl border border-slate-400 px-4 py-2.5 text-sm font-medium text-slate-950 placeholder:font-semibold placeholder:text-slate-600 transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
          />
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

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 transition hover:border-amber-400"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-full bg-slate-950 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-amber-500 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit Booking Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
