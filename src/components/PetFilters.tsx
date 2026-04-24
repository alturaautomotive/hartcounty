"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const speciesOptions = ["dog", "cat", "rabbit", "bird", "other"];
const sizeOptions = ["small", "medium", "large"];
const ageOptions = ["baby", "young", "adult", "senior"];

export default function PetFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/pets?${params.toString()}`);
    },
    [router, searchParams]
  );

  const toggleFilter = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get(key) === "true") {
        params.delete(key);
      } else {
        params.set(key, "true");
      }
      router.push(`/pets?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={searchParams.get("species") ?? ""}
        onChange={(e) => updateFilter("species", e.target.value)}
        className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700"
        aria-label="Filter by species"
      >
        <option value="">All Species</option>
        {speciesOptions.map((s) => (
          <option key={s} value={s} className="capitalize">
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("size") ?? ""}
        onChange={(e) => updateFilter("size", e.target.value)}
        className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700"
        aria-label="Filter by size"
      >
        <option value="">All Sizes</option>
        {sizeOptions.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("ageCategory") ?? ""}
        onChange={(e) => updateFilter("ageCategory", e.target.value)}
        className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700"
        aria-label="Filter by age"
      >
        <option value="">All Ages</option>
        {ageOptions.map((a) => (
          <option key={a} value={a}>
            {a.charAt(0).toUpperCase() + a.slice(1)}
          </option>
        ))}
      </select>

      {[
        { key: "goodWithKids", label: "Good with Kids" },
        { key: "goodWithDogs", label: "Good with Dogs" },
        { key: "goodWithCats", label: "Good with Cats" },
        { key: "houseTrained", label: "House Trained" },
      ].map(({ key, label }) => (
        <button
          key={key}
          onClick={() => toggleFilter(key)}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
            searchParams.get(key) === "true"
              ? "border-primary-600 bg-primary-50 text-primary-700"
              : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400"
          }`}
          aria-pressed={searchParams.get(key) === "true"}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
