"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    paypal?: {
      Buttons: (opts: Record<string, unknown>) => { render: (el: string | HTMLElement) => void };
    };
  }
}

const PLANS = [
  { amount: 10, label: "$10/mo", impact: "Keeps one dog fed all month" },
  { amount: 25, label: "$25/mo", impact: "Covers care + vaccines monthly" },
  { amount: 50, label: "$50/mo", impact: "Sponsors a dog's full monthly care" },
];

export default function IndividualMonthlyButtons() {
  const [thankYou, setThankYou] = useState(false);
  const rendered = useRef<Set<number>>(new Set());

  useEffect(() => {
    function renderButtons() {
      if (!window.paypal) return;
      for (const plan of PLANS) {
        if (rendered.current.has(plan.amount)) continue;
        const container = document.getElementById(`ind-monthly-btn-${plan.amount}`);
        if (!container) continue;
        rendered.current.add(plan.amount);
        window.paypal.Buttons({
          style: { shape: "rect", color: "gold", label: "subscribe", layout: "horizontal" },
          createSubscription: async () => {
            const res = await fetch("/api/paypal/subscriptions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ planId: process.env.NEXT_PUBLIC_MONTHLY_PLAN_ID, amount: plan.amount, interval: "monthly" }),
            });
            const data = await res.json();
            return data.id;
          },
          onApprove: async () => { setThankYou(true); },
        }).render(`#ind-monthly-btn-${plan.amount}`);
      }
    }
    if (window.paypal) { renderButtons(); } else {
      const timer = setInterval(() => { if (window.paypal) { clearInterval(timer); renderButtons(); } }, 200);
      return () => clearInterval(timer);
    }
  }, []);

  if (thankYou) return (
    <div className="rounded-3xl bg-slate-950 text-white p-8 text-center col-span-full">
      <h2 className="text-2xl font-black mb-2">Welcome, Monthly Guardian! 🐾</h2>
      <p className="text-slate-300">Your recurring gift means these dogs never go without. Thank you.</p>
    </div>
  );

  return (
    <>
      {PLANS.map((plan) => (
        <div key={plan.amount} className="rounded-2xl bg-white/10 border border-white/20 p-6 hover:-translate-y-1 transition">
          <p className="text-3xl font-black text-white mb-1">{plan.label}</p>
          <p className="text-sm text-slate-200 mb-4">{plan.impact}</p>
          <div id={`ind-monthly-btn-${plan.amount}`} className="min-h-[45px]" />
        </div>
      ))}
    </>
  );
}
