"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    paypal?: {
      Buttons: (opts: Record<string, unknown>) => { render: (el: string | HTMLElement) => void };
    };
  }
}

type Tier = "friend" | "champion" | "leader";

const TIERS: { id: Tier; amount: number; label: string; type: "subscription" | "one-time" }[] = [
  { id: "friend", amount: 500, label: "$500/mo", type: "subscription" },
  { id: "champion", amount: 1500, label: "$1,500/mo", type: "subscription" },
  { id: "leader", amount: 6000, label: "$6,000", type: "one-time" },
];

export default function CorporateButtons({ tier }: { tier: Tier }) {
  const [thankYou, setThankYou] = useState(false);
  const rendered = useRef(false);
  const t = TIERS.find((x) => x.id === tier)!;

  useEffect(() => {
    function renderButton() {
      if (!window.paypal || rendered.current) return;
      const container = document.getElementById(`corp-paypal-btn-${tier}`);
      if (!container) return;
      rendered.current = true;

      if (t.type === "subscription") {
        window.paypal.Buttons({
          style: { shape: "rect", color: "gold", label: "subscribe", layout: "horizontal" },
          createSubscription: async () => {
            const res = await fetch("/api/paypal/subscriptions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ planId: process.env.NEXT_PUBLIC_MONTHLY_PLAN_ID, amount: t.amount, interval: "monthly" }),
            });
            const data = await res.json();
            return data.id;
          },
          onApprove: async () => { setThankYou(true); },
        }).render(`#corp-paypal-btn-${tier}`);
      } else {
        window.paypal.Buttons({
          style: { shape: "rect", color: "gold", label: "donate", layout: "horizontal" },
          createOrder: async () => {
            const res = await fetch("/api/paypal/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ amount: t.amount, interval: "one-time" }),
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
        }).render(`#corp-paypal-btn-${tier}`);
      }
    }
    if (window.paypal) { renderButton(); } else {
      const timer = setInterval(() => { if (window.paypal) { clearInterval(timer); renderButton(); } }, 200);
      return () => clearInterval(timer);
    }
  }, [tier, t]);

  if (thankYou) return (
    <div className="text-center py-4">
      <p className="font-black text-emerald-700 text-lg">✓ Partnership confirmed! We&apos;ll be in touch within 24 hours.</p>
    </div>
  );

  return <div id={`corp-paypal-btn-${tier}`} className="min-h-[45px]" />;
}
