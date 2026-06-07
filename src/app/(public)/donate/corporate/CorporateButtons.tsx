"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    paypal?: {
      Buttons: (opts: Record<string, unknown>) => { render: (el: string | HTMLElement) => void };
    };
  }
}

// Corporate PayPal plan IDs (Live)
const PLAN_IDS = {
  friend: "P-15M94943SH296651ENISNVQI",     // $500/mo — Shelter Friend
  champion: "P-16191915AE355120PNISNWHY",    // $1,500/mo — Community Champion
};

type Tier = "friend" | "champion" | "leader";

export default function CorporateButtons({ tier }: { tier: Tier }) {
  const [thankYou, setThankYou] = useState(false);
  const rendered = useRef(false);

  useEffect(() => {
    function renderButton() {
      if (!window.paypal || rendered.current) return;
      const container = document.getElementById(`corp-paypal-btn-${tier}`);
      if (!container) return;
      rendered.current = true;

      if (tier === "leader") {
        // Pack Leader — $6,000 one-time payment
        window.paypal.Buttons({
          style: { shape: "rect", color: "gold", label: "donate", layout: "horizontal" },
          createOrder: async () => {
            const res = await fetch("/api/paypal/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ amount: 6000, interval: "one-time" }),
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
      } else {
        // Shelter Friend ($500/mo) or Community Champion ($1,500/mo) — subscriptions
        const planId = PLAN_IDS[tier];
        window.paypal.Buttons({
          style: { shape: "rect", color: "gold", label: "subscribe", layout: "horizontal" },
          createSubscription: async () => {
            const res = await fetch("/api/paypal/subscriptions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ planId, interval: "monthly" }),
            });
            const data = await res.json();
            return data.id;
          },
          onApprove: async () => {
            setThankYou(true);
          },
        }).render(`#corp-paypal-btn-${tier}`);
      }
    }

    if (window.paypal) {
      renderButton();
    } else {
      const timer = setInterval(() => {
        if (window.paypal) { clearInterval(timer); renderButton(); }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [tier]);

  if (thankYou) return (
    <div className="text-center py-4">
      <p className="font-black text-emerald-700 text-lg">
        ✓ Partnership confirmed! We&apos;ll be in touch within 24 hours.
      </p>
      <p className="text-sm text-slate-500 mt-1">Check your email for confirmation from PayPal.</p>
    </div>
  );

  return <div id={`corp-paypal-btn-${tier}`} className="min-h-[45px]" />;
}
