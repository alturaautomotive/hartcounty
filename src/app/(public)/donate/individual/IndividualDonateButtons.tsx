"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    paypal?: {
      Buttons: (opts: Record<string, unknown>) => { render: (el: string | HTMLElement) => void };
    };
  }
}

const AMOUNTS = [25, 50, 100, 250] as const;
const IMPACT: Record<number, string> = {
  25: "Feeds a dog for a full week",
  50: "Covers vaccines for one dog",
  100: "Sponsors a dog's full care for one month",
  250: "Funds emergency vet care",
};

export default function IndividualDonateButtons() {
  const [thankYou, setThankYou] = useState(false);
  const rendered = useRef<Set<number>>(new Set());

  useEffect(() => {
    function renderButtons() {
      if (!window.paypal) return;
      for (const amt of AMOUNTS) {
        if (rendered.current.has(amt)) continue;
        const container = document.getElementById(`ind-paypal-btn-${amt}`);
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
        }).render(`#ind-paypal-btn-${amt}`);
      }
    }
    if (window.paypal) { renderButtons(); } else {
      const timer = setInterval(() => { if (window.paypal) { clearInterval(timer); renderButtons(); } }, 200);
      return () => clearInterval(timer);
    }
  }, []);

  if (thankYou) return (
    <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xl col-span-full">
      <h2 className="mb-2 text-2xl font-black text-emerald-800">Thank You! 🐾</h2>
      <p className="text-slate-600">Your gift directly feeds, heals, and saves a dog at Hart County Animal Rescue.</p>
      <button type="button" className="mt-4 rounded-full bg-slate-950 px-6 py-2.5 text-sm font-black uppercase tracking-widest text-white hover:bg-amber-500 hover:text-slate-950" onClick={() => setThankYou(false)}>Give Again</button>
    </div>
  );

  return (
    <>
      {AMOUNTS.map((amt) => (
        <div key={amt} className="rounded-2xl border border-amber-200/70 bg-white p-6 shadow-lg hover:-translate-y-1 transition">
          <p className="text-4xl font-black text-slate-950 mb-1">${amt}</p>
          <p className="text-sm font-semibold text-slate-600 mb-4">{IMPACT[amt]}</p>
          <div id={`ind-paypal-btn-${amt}`} className="min-h-[45px]" />
        </div>
      ))}
    </>
  );
}
