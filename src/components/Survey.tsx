"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useRouter, useSearchParams } from "next/navigation";
import type { Pet } from "@prisma/client";
import PetCard from "@/components/PetCard";
import { steps, stepSchemas } from "@/types/survey";
import type { SurveyAnswers } from "@/types/survey";
import { sendSurveyMatches, getTopMatches } from "@/lib/actions";

const TOTAL_STEPS = steps.length;

const emailSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Please enter a valid email"),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export default function Survey() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initialStep = Math.min(
    Math.max(0, parseInt(searchParams.get("step") ?? "0", 10)),
    TOTAL_STEPS
  );

  const [step, setStep] = useState(initialStep);
  const [answers, setAnswers] = useState<Partial<SurveyAnswers>>({});
  const [matches, setMatches] = useState<Pet[]>([]);
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const showResults = step === TOTAL_STEPS;

  function goToStep(next: number) {
    setStep(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", String(next));
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  async function handleStepSubmit(data: Record<string, unknown>) {
    const updated = { ...answers, ...data } as Partial<SurveyAnswers>;
    setAnswers(updated);

    if (step < TOTAL_STEPS - 1) {
      goToStep(step + 1);
    } else {
      // Final step - fetch matches from server
      setLoadingMatches(true);
      const matched = await getTopMatches(updated as SurveyAnswers);
      startTransition(() => {
        setMatches(matched);
        setLoadingMatches(false);
        goToStep(TOTAL_STEPS);
      });
    }
  }

  function handleBack() {
    if (step > 0) goToStep(step - 1);
  }

  if (loadingMatches || isPending) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-20">
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
            matchSlugs: matches.map((p) => p.slug),
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
        <h2 className="text-4xl font-black text-slate-950">Your Top Matches</h2>
        <p className="mt-3 text-slate-600">
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
            className="inline-block rounded-full bg-slate-950 px-6 py-3 font-black uppercase tracking-[0.14em] text-white transition hover:bg-amber-500 hover:text-slate-950"
          >
            Browse All Pets
          </a>
        </div>
      )}

      {/* Email results form */}
      {matches.length > 0 && !emailSent && (
        <div className="mx-auto mt-10 max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/10">
          <h3 className="mb-1 text-lg font-black text-slate-950">
            Email these matches to yourself
          </h3>
          <p className="mb-4 text-sm text-slate-600">
            We'll send you a summary so you can review later.
          </p>
          <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-3">
            <div>
              <input
                {...register("name")}
                placeholder="Your name"
                className="w-full rounded-xl border border-slate-400 px-3 py-2 text-sm font-medium text-slate-950 placeholder:font-semibold placeholder:text-slate-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
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
                className="w-full rounded-xl border border-slate-400 px-3 py-2 text-sm font-medium text-slate-950 placeholder:font-semibold placeholder:text-slate-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={emailSending}
              className="w-full rounded-full bg-slate-950 py-2.5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-amber-500 hover:text-slate-950 disabled:opacity-50"
            >
              {emailSending ? "Sending..." : "Send My Matches"}
            </button>
          </form>
        </div>
      )}

      {emailSent && (
        <div className="mx-auto mt-6 max-w-md rounded-2xl bg-emerald-50 p-4 text-center text-sm font-bold text-emerald-800 ring-1 ring-emerald-200">
          Your matches have been sent! Check your inbox.
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={onRestart}
          className="text-sm font-bold text-slate-700 underline decoration-amber-500 decoration-2 underline-offset-4 transition hover:text-amber-700"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}
