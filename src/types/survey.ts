import { z } from "zod/v4";

export type SurveyAnswers = {
  hasKids: boolean;
  hasDogs: boolean;
  hasCats: boolean;
  homeType: string;
  activityLevel: string;
  prefSize: string;
  prefAge: string;
};

export const stepSchemas = [
  z.object({ hasKids: z.boolean() }),
  z.object({ hasDogs: z.boolean() }),
  z.object({ hasCats: z.boolean() }),
  z.object({
    homeType: z.enum(["apartment", "house_small_yard", "house_large_yard", "farm"]),
  }),
  z.object({
    activityLevel: z.enum(["low", "medium", "high"]),
  }),
  z.object({
    prefSize: z.enum(["small", "medium", "large", "any"]),
  }),
  z.object({
    prefAge: z.enum(["baby", "young", "adult", "senior", "any"]),
  }),
] as const;

export type StepSchema = (typeof stepSchemas)[number];

export const steps = [
  {
    title: "Do you have children?",
    description: "This helps us find pets that are great with kids.",
    field: "hasKids" as const,
    type: "boolean" as const,
  },
  {
    title: "Do you have dogs?",
    description: "We'll match you with pets that get along with other dogs.",
    field: "hasDogs" as const,
    type: "boolean" as const,
  },
  {
    title: "Do you have cats?",
    description: "We'll find pets that are comfortable around cats.",
    field: "hasCats" as const,
    type: "boolean" as const,
  },
  {
    title: "What type of home do you have?",
    description: "Your living space matters for finding the right fit.",
    field: "homeType" as const,
    type: "select" as const,
    options: [
      { value: "apartment", label: "Apartment / Condo" },
      { value: "house_small_yard", label: "House with Small Yard" },
      { value: "house_large_yard", label: "House with Large Yard" },
      { value: "farm", label: "Farm / Rural Property" },
    ],
  },
  {
    title: "How active is your lifestyle?",
    description: "We'll match energy levels to your daily routine.",
    field: "activityLevel" as const,
    type: "select" as const,
    options: [
      { value: "low", label: "Low - Relaxed & easy-going" },
      { value: "medium", label: "Medium - Regular walks & play" },
      { value: "high", label: "High - Running, hiking & outdoors" },
    ],
  },
  {
    title: "What size pet do you prefer?",
    description: "Choose a size that fits your space and lifestyle.",
    field: "prefSize" as const,
    type: "select" as const,
    options: [
      { value: "small", label: "Small (under 25 lbs)" },
      { value: "medium", label: "Medium (25-60 lbs)" },
      { value: "large", label: "Large (60+ lbs)" },
      { value: "any", label: "No preference" },
    ],
  },
  {
    title: "What age range do you prefer?",
    description: "Each age has its own charm and needs.",
    field: "prefAge" as const,
    type: "select" as const,
    options: [
      { value: "baby", label: "Baby (under 1 year)" },
      { value: "young", label: "Young (1-3 years)" },
      { value: "adult", label: "Adult (3-7 years)" },
      { value: "senior", label: "Senior (7+ years)" },
      { value: "any", label: "No preference" },
    ],
  },
] as const;
