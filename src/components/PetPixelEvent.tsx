"use client";

import { useEffect } from "react";
import { trackPixelEvent } from "@/components/MetaPixel";

interface Props {
  petName: string;
  petId: string;
  breed?: string | null;
  adoptionFee?: number | null;
}

export default function PetPixelEvent({ petName, petId, breed, adoptionFee }: Props) {
  useEffect(() => {
    trackPixelEvent("ViewContent", {
      content_name: petName,
      content_ids: [petId],
      content_type: "product",
      content_category: breed ?? "Dog",
      value: adoptionFee ?? 150,
      currency: "USD",
    });
  }, [petName, petId, breed, adoptionFee]);

  return null;
}
