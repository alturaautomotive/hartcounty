"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    paypal?: {
      Buttons: (opts: Record<string, unknown>) => { render: (el: string | HTMLElement) => void };
    };
  }
}

const AMOUNTS = [25, 50, 100] as const;

const IMPACT: Record<number, string> = {
  25: "Covers vaccines for one pet",
  50: "Provides a month of food & care",
  100: "Sponsors a full medical checkup",
};

export default function DonateButtons() {
  const [thankYou, setThankYou] = useState(false);
  const rendered = useRef<Set<number>>(new Set());

  useEffect(() => {
    function renderButtons() {
      if (!window.paypal) return;

      for (const amt of AMOUNTS) {
        if (rendered.current.has(amt)) continue;
        const container = document.getElementById(`paypal-btn-${amt}`);
        if (!container) continue;
        rendered.current.add(amt);

        window.paypal.Buttons({
          style: { shape: "rect", color: "gold", label: "donate", layout: "horizontal" },
          createOrder: async () => {
            const res = await fetch("/api/paypal/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ amount: amt, interval: "one-time" }),
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
        }).render(`#paypal-btn-${amt}`);
      }
    }

    // PayPal SDK may load after this component mounts
    if (window.paypal) {
      renderButtons();
    } else {
      const timer = setInterval(() => {
        if (window.paypal) {
          clearInterval(timer);
          renderButtons();
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, []);

  if (thankYou) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xl shadow-slate-950/10">
        <h2 className="mb-2 text-2xl font-black text-emerald-800">Thank You!</h2>
        <p className="text-slate-600">
          Your donation helps us rescue, rehabilitate, and rehome animals in
          Hart County. We truly appreciate your support.
        </p>
        <button
          type="button"
          className="mt-4 rounded-full bg-slate-950 px-6 py-2.5 text-sm font-black uppercase tracking-[0.14em] text-white hover:bg-amber-500 hover:text-slate-950"
          onClick={() => setThankYou(false)}
        >
          Make Another Donation
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {AMOUNTS.map((amt) => (
        <div
          key={amt}
          className="rounded-3xl border border-amber-200/70 bg-white/90 p-6 shadow-xl shadow-slate-950/10 ring-1 ring-white/70 transition hover:-translate-y-1 hover:shadow-2xl"
        >
          <p className="mb-1 text-4xl font-black text-slate-950">${amt}</p>
          <p className="mb-4 text-sm font-semibold text-slate-600">{IMPACT[amt]}</p>
          <div id={`paypal-btn-${amt}`} className="min-h-[45px]" />
        </div>
      ))}
    </div>
  );
}
