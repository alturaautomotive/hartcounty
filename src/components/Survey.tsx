"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useRouter, useSearchParams } from "next/navigation";
import type { Pet } from "@/generated/prisma/client";
import PetCard from "@/components/PetCard";
import { steps, stepSchemas } from "@/types/survey";
import type { SurveyAnswers } from "@/types/survey";
import { sendSurveyMatches } from "@/lib/actions";

const TOTAL_STEPS = steps.length;

function computeMatches(pets: Pet[], answers: SurveyAnswers): Pet[] {
  const scored = pets.map((pet) => {
    let score = 0;

    // Compatibility flags
    if (answers.hasKids && pet.goodWithKids) score += 10;
    if (answers.hasKids && !pet.goodWithKids) score -= 10;
    if (answers.hasDogs && pet.goodWithDogs) score += 10;
    if (answers.hasDogs && !pet.goodWithDogs) score -= 10;
    if (answers.hasCats && pet.goodWithCats) score += 10;
    if (answers.hasCats && !pet.goodWithCats) score -= 10;

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

const emailSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Please enter a valid email"),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export default function Survey({ initialPets }: { initialPets: Pet[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialStep = Math.min(
    Math.max(0, parseInt(searchParams.get("step") ?? "0", 10)),
    TOTAL_STEPS
  );

  const [step, setStep] = useState(initialStep);
  const [answers, setAnswers] = useState<Partial<SurveyAnswers>>({});
  const [matches, setMatches] = useState<Pet[]>([]);
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const showResults = step === TOTAL_STEPS;

  function goToStep(next: number) {
    setStep(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", String(next));
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  function handleStepSubmit(data: Record<string, unknown>) {
    const updated = { ...answers, ...data } as Partial<SurveyAnswers>;
    setAnswers(updated);

    if (step < TOTAL_STEPS - 1) {
      goToStep(step + 1);
    } else {
      // Final step - compute matches
      const matched = computeMatches(initialPets, updated as SurveyAnswers);
      setMatches(matched);
      goToStep(TOTAL_STEPS);
    }
  }

  function handleBack() {
    if (step > 0) goToStep(step - 1);
  }

  if (showResults) {
    return (
      <Results
        matches={matches}
        onRestart={() => {
          setAnswers({});
          setMatches([]);
          setEmailSent(false);
          goToStep(0);
        }}
        emailSent={emailSent}
        emailSending={emailSending}
        onEmailSubmit={async (data: EmailFormValues) => {
          setEmailSending(true);
          await sendSurveyMatches({
            name: data.name,
            email: data.email,
            matchIds: matches.map((p) => p.id),
            matchNames: matches.map((p) => p.name),
          });
          setEmailSent(true);
          setEmailSending(false);
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Progress bar */}
      <div className="mb-8" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-label={`Step ${step + 1} of ${TOTAL_STEPS}`}>
        <div className="mb-2 flex justify-between text-sm text-neutral-500">
          <span>Step {step + 1} of {TOTAL_STEPS}</span>
          <span>{Math.round(((step + 1) / TOTAL_STEPS) * 100)}%</span>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary-600" : "bg-neutral-200"
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">{currentStep.title}</h2>
        <p className="mt-1 text-neutral-500">{currentStep.description}</p>
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
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
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
                  ? "border-primary-600 bg-primary-50"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
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
                    ? "border-primary-600 bg-primary-600"
                    : "border-neutral-300"
                }`}
              >
                {fieldValue === opt.value && (
                  <span className="h-2 w-2 rounded-full bg-white" />
                )}
              </span>
              <span className="font-medium text-neutral-800">{opt.label}</span>
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
            className="rounded-xl border border-neutral-300 px-6 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          className="flex-1 rounded-xl bg-primary-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          {stepIndex === TOTAL_STEPS - 1 ? "See My Matches" : "Next"}
        </button>
      </div>
    </form>
  );
}

function Results({
  matches,
  onRestart,
  emailSent,
  emailSending,
  onEmailSubmit,
}: {
  matches: Pet[];
  onRestart: () => void;
  emailSent: boolean;
  emailSending: boolean;
  onEmailSubmit: (data: EmailFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-neutral-900">Your Top Matches</h2>
        <p className="mt-2 text-neutral-500">
          {matches.length > 0
            ? "Based on your answers, here are the pets we think you'll love."
            : "We couldn't find a strong match right now. Browse all available pets or try again!"}
        </p>
      </div>

      {matches.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <a
            href="/pets"
            className="inline-block rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
          >
            Browse All Pets
          </a>
        </div>
      )}

      {/* Email results form */}
      {matches.length > 0 && !emailSent && (
        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-lg font-semibold text-neutral-900">
            Email these matches to yourself
          </h3>
          <p className="mb-4 text-sm text-neutral-500">
            We'll send you a summary so you can review later.
          </p>
          <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-3">
            <div>
              <input
                {...register("name")}
                placeholder="Your name"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div>
              <input
                {...register("email")}
                type="email"
                placeholder="Your email"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={emailSending}
              className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
            >
              {emailSending ? "Sending..." : "Send My Matches"}
            </button>
          </form>
        </div>
      )}

      {emailSent && (
        <div className="mx-auto mt-6 max-w-md rounded-lg bg-success-50 p-4 text-center text-sm font-medium text-success-700">
          Your matches have been sent! Check your inbox.
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={onRestart}
          className="text-sm font-medium text-primary-600 underline transition hover:text-primary-700"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}
