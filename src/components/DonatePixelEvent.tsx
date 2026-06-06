"use client";

import { useEffect } from "react";
import { trackPixelEvent } from "@/components/MetaPixel";

export default function DonatePixelEvent() {
  useEffect(() => {
    trackPixelEvent("InitiateCheckout", {
      content_category: "Donation",
      currency: "USD",
    });
  }, []);

  return null;
}
