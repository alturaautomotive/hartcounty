"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    paypal?: {
      Buttons: (opts: Record<string, unknown>) => { render: (el: string | HTMLElement) => void };
    };
  }
}

interface Props {
  amount: number;
  id: string;
}

export default function IndividualMonthlyButtons({ amount, id }: Props) {
  const [thankYou, setThankYou] = useState(false);
  const rendered = useRef(false);

  useEffect(() => {
    function renderButton() {
      if (!window.paypal || rendered.current) return;
      const container = document.getElementById(id);
      if (!container) return;
      rendered.current = true;

      window.paypal.Buttons({
        style: { shape: "rect", color: "gold", label: "subscribe", layout: "horizontal" },
        createSubscription: async () => {
          const res = await fetch("/api/paypal/subscriptions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              planId: process.env.NEXT_PUBLIC_MONTHLY_PLAN_ID,
              amount,
              interval: "monthly",
            }),
          });
          const data = await res.json();
          return data.id;
        },
        onApprove: async () => {
          setThankYou(true);
        },
      }).render(`#${id}`);
    }

    if (window.paypal) { renderButton(); } else {
      const timer = setInterval(() => {
        if (window.paypal) { clearInterval(timer); renderButton(); }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [amount, id]);

  if (thankYou) return (
    <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-center">
      <p className="text-sm font-black text-emerald-700">Welcome, Monthly Guardian! 🐾</p>
    </div>
  );

  return <div id={id} className="min-h-[45px]" />;
}
