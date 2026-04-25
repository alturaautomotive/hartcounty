"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    paypal?: {
      Buttons: (opts: Record<string, unknown>) => { render: (el: string | HTMLElement) => void };
    };
  }
}

export default function SponsorButton({
  petId,
  petName,
}: {
  petId: string;
  petName: string;
}) {
  const [thankYou, setThankYou] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);

  useEffect(() => {
    function renderButton() {
      if (!window.paypal || rendered.current || !containerRef.current) return;
      rendered.current = true;

      window.paypal.Buttons({
        style: { shape: "rect", color: "gold", label: "donate", layout: "horizontal" },
        createOrder: async () => {
          const res = await fetch("/api/paypal/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 25, interval: "one-time", petId }),
          });
          const data = await res.json();
          return data.id;
        },
        onApprove: async (data: { orderID: string }) => {
          await fetch(`/api/paypal/orders/${data.orderID}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ interval: "one-time" }),
          });
          setThankYou(true);
        },
      }).render(containerRef.current);
    }

    if (window.paypal) {
      renderButton();
    } else {
      const timer = setInterval(() => {
        if (window.paypal) {
          clearInterval(timer);
          renderButton();
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [petId]);

  if (thankYou) {
    return (
      <div className="flex-1 rounded-full border-2 border-emerald-400 bg-emerald-50 py-3 text-center text-sm font-black text-emerald-800">
        Thank you for sponsoring {petName}!
      </div>
    );
  }

  return (
    <div className="flex-1">
      <p className="mb-2 text-center text-sm font-black uppercase tracking-[0.14em] text-amber-700">
        Sponsor {petName} - $25
      </p>
      <div ref={containerRef} className="min-h-[45px]" />
    </div>
  );
}
