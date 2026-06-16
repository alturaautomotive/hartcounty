"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadPayPalSubscriptionSdk,
  type PayPalNamespace,
} from "@/lib/paypal-client";

export default function SponsorButton({
  petId,
  petName,
}: {
  petId: string;
  petName: string;
}) {
  const [thankYou, setThankYou] = useState(false);
  const [isMonthly, setIsMonthly] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);

  useEffect(() => {
    let cancelled = false;
    rendered.current = false;
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    function renderButton(paypal: PayPalNamespace) {
      if (cancelled || rendered.current || !containerRef.current) return;
      rendered.current = true;

      paypal.Buttons({
        style: {
          shape: "rect",
          color: "gold",
          label: isMonthly ? "subscribe" : "donate",
          layout: "horizontal",
        },
        ...(isMonthly
          ? {
              createSubscription: async () => {
                const res = await fetch("/api/paypal/subscriptions", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ petId }),
                });
                const data = await res.json();
                return data.id;
              },
            }
          : {
              createOrder: async () => {
                const res = await fetch("/api/paypal/orders", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    amount: 25,
                    interval: "one-time",
                    petId,
                  }),
                });
                const data = await res.json();
                return data.id;
              },
            }),
        onApprove: async (data: { orderID?: string; subscriptionID?: string }) => {
          const id = isMonthly ? data.subscriptionID : data.orderID;
          if (!id) {
            throw new Error("PayPal approval did not include a transaction ID");
          }
          const endpoint = isMonthly ? "subscriptions" : "orders";
          const res = await fetch(`/api/paypal/${endpoint}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ interval: isMonthly ? "monthly" : "one-time" }),
          });
          if (!res.ok) {
            throw new Error("Failed to record PayPal transaction");
          }
          setThankYou(true);
        },
      }).render(containerRef.current);
    }

    if (isMonthly) {
      loadPayPalSubscriptionSdk()
        .then(renderButton)
        .catch((err) => console.error("Failed to load PayPal subscriptions:", err));
      return () => {
        cancelled = true;
      };
    } else if (window.paypal) {
      renderButton(window.paypal);
    } else {
      const timer = setInterval(() => {
        if (window.paypal) {
          clearInterval(timer);
          renderButton(window.paypal);
        }
      }, 200);
      return () => {
        cancelled = true;
        clearInterval(timer);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [petId, isMonthly]);

  if (thankYou) {
    return (
      <div className="flex-1 rounded-full border-2 border-emerald-400 bg-emerald-50 py-3 text-center text-sm font-black text-emerald-800">
        Thank you for {isMonthly ? "monthly support of" : "sponsoring"} {petName}!
      </div>
    );
  }

  return (
    <div className="flex-1">
      <p className="mb-2 text-center text-sm font-black uppercase tracking-[0.14em] text-amber-700">
        Sponsor {isMonthly ? "Monthly" : "One-time"} - $25
      </p>
      <div className="mb-3 flex items-center justify-center gap-3">
        <span
          className={`text-xs font-bold ${!isMonthly ? "text-slate-950" : "text-slate-400"}`}
        >
          One-time
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isMonthly}
          onClick={() => setIsMonthly((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            isMonthly ? "bg-amber-400" : "bg-slate-300"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${
              isMonthly ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span
          className={`text-xs font-bold ${isMonthly ? "text-slate-950" : "text-slate-400"}`}
        >
          Monthly
        </span>
      </div>
      <div ref={containerRef} className="min-h-[45px]" />
    </div>
  );
}
