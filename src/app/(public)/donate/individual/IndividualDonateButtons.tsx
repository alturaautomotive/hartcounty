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

export default function IndividualDonateButtons({ amount, id }: Props) {
  const [thankYou, setThankYou] = useState(false);
  const rendered = useRef(false);

  useEffect(() => {
    function renderButton() {
      if (!window.paypal || rendered.current) return;
      const container = document.getElementById(id);
      if (!container) return;
      rendered.current = true;

      window.paypal.Buttons({
        style: { shape: "rect", color: "gold", label: "donate", layout: "horizontal" },
        createOrder: async () => {
          const res = await fetch("/api/paypal/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, interval: "one-time" }),
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
      <p className="text-sm font-black text-emerald-700">Thank you! 🐾</p>
    </div>
  );

  return <div id={id} className="min-h-[45px]" />;
}
