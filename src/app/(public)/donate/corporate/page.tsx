"use client";
import CorporateButtons from "./CorporateButtons";

// Route: /donate/corporate
// Corporate sponsorship landing page — bold, professional, warm
// TODO: Wire PayPal SDK — see src/app/(public)/donate/page.tsx for pattern

import { useEffect, useRef, useState } from "react";

// ─── PayPal type declarations (matches existing pattern) ──────────────────────
declare global {
  interface Window {
    paypal?: {
      Buttons: (
        opts: Record<string, unknown>
      ) => { render: (el: string | HTMLElement) => void };
    };
  }
}

// ─── PayPal subscription button placeholder ───────────────────────────────────
// TODO: Wire PayPal SDK — see src/app/(public)/donate/page.tsx for pattern
function PayPalSubscribeButton({
  amount,
  id,
  interval = "monthly",
}: {
  amount: number;
  id: string;
  interval?: "monthly" | "quarterly";
}) {
  const rendered = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function tryRender() {
      if (!window.paypal || rendered.current) return;
      const container = document.getElementById(id);
      if (!container) return;
      rendered.current = true;
      setReady(true);

      window.paypal
        .Buttons({
          style: {
            shape: "pill",
            color: "gold",
            label: "subscribe",
            layout: "horizontal",
          },
          // TODO: Wire PayPal SDK — see src/app/(public)/donate/page.tsx for pattern
          createSubscription: async () => {
            const res = await fetch("/api/paypal/subscriptions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                planId: process.env.NEXT_PUBLIC_MONTHLY_PLAN_ID,
                amount,
                interval,
              }),
            });
            const data = await res.json();
            return data.id;
          },
          onApprove: async (data: { subscriptionID: string }) => {
            await fetch(`/api/paypal/subscriptions/${data.subscriptionID}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
            });
          },
        })
        .render(`#${id}`);
    }

    if (window.paypal) {
      tryRender();
    } else {
      const timer = setInterval(() => {
        if (window.paypal) {
          clearInterval(timer);
          tryRender();
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [amount, id, interval]);

  return (
    <div>
      {!ready && (
        <button
          type="button"
          className="w-full rounded-full bg-amber-400 px-6 py-3 text-sm font-black uppercase tracking-widest text-slate-950 transition hover:bg-amber-300 active:scale-95"
        >
          Donate with PayPal
        </button>
      )}
      <div id={id} className="min-h-[45px]" />
    </div>
  );
}

// ─── PayPal one-time donate button (for Pack Leader quarterly) ────────────────
// TODO: Wire PayPal SDK — see src/app/(public)/donate/page.tsx for pattern
function PayPalDonateButton({ amount, id }: { amount: number; id: string }) {
  const rendered = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function tryRender() {
      if (!window.paypal || rendered.current) return;
      const container = document.getElementById(id);
      if (!container) return;
      rendered.current = true;
      setReady(true);

      window.paypal
        .Buttons({
          style: {
            shape: "pill",
            color: "gold",
            label: "donate",
            layout: "horizontal",
          },
          // TODO: Wire PayPal SDK — see src/app/(public)/donate/page.tsx for pattern
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
          },
        })
        .render(`#${id}`);
    }

    if (window.paypal) {
      tryRender();
    } else {
      const timer = setInterval(() => {
        if (window.paypal) {
          clearInterval(timer);
          tryRender();
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [amount, id]);

  return (
    <div>
      {!ready && (
        <button
          type="button"
          className="w-full rounded-full bg-amber-400 px-6 py-3 text-sm font-black uppercase tracking-widest text-slate-950 transition hover:bg-amber-300 active:scale-95"
        >
          Donate with PayPal
        </button>
      )}
      <div id={id} className="min-h-[45px]" />
    </div>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────
export default function CorporateDonatePage() {
  return (
    <main className="w-full">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-slate-950 px-4 py-24 text-center sm:py-32">
        <p className="mb-4 text-xs font-black uppercase tracking-widest text-amber-400">
          Corporate Giving Program
        </p>
        <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-black uppercase leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          Your Company Can Save Lives.{" "}
          <span className="text-amber-400">
            And Your Team Will Love You For It.
          </span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
          Partnering with Hart County Animal Rescue isn&rsquo;t just good karma
          — it&rsquo;s great culture. Show your team what your company stands
          for.
        </p>
        <a
          href="#tiers"
          className="inline-block rounded-full bg-amber-500 px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-950 transition hover:bg-amber-400 active:scale-95"
        >
          See Partnership Tiers
        </a>
      </section>

      {/* ── WHY SECTION ──────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-black uppercase tracking-tight text-slate-950 sm:text-4xl">
            Why Companies Partner With Us
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {/* Column 1 */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="mb-3 text-lg font-black uppercase tracking-widest text-slate-950">
                Employee Culture
              </h3>
              <p className="text-sm leading-7 text-slate-600">
                Studies show employees are more engaged when their company gives
                back. Pet visits to your office? That&rsquo;s a meeting everyone
                looks forward to.
              </p>
            </div>
            {/* Column 2 */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <span className="text-2xl">📣</span>
              </div>
              <h3 className="mb-3 text-lg font-black uppercase tracking-widest text-slate-950">
                Brand Visibility
              </h3>
              <p className="text-sm leading-7 text-slate-600">
                Your logo on our site, our social channels, and our events.
                15,000+ followers and a deeply engaged community.
              </p>
            </div>
            {/* Column 3 */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="mb-3 text-lg font-black uppercase tracking-widest text-slate-950">
                Real Impact
              </h3>
              <p className="text-sm leading-7 text-slate-600">
                You&rsquo;ll know exactly which dogs your company helped. We
                send monthly reports with updates, photos, and adoption stories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PARTNERSHIP TIERS ────────────────────────────────────────────── */}
      <section id="tiers" className="bg-slate-50 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-black uppercase tracking-tight text-slate-950 sm:text-4xl">
            Choose Your Partnership Level
          </h2>
          <p className="mx-auto mb-14 max-w-xl text-center text-slate-500">
            Every tier is a real partnership — not just a logo placement. We
            show up for you the way you show up for us.
          </p>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* ── TIER 1: Shelter Friend ─────────────────────────────────── */}
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-md shadow-slate-950/5">
              <div className="mb-6">
                <p className="mb-1 text-xs font-black uppercase tracking-widest text-slate-400">
                  Shelter Friend
                </p>
                <p className="mb-1 text-4xl font-black text-slate-950">
                  $500
                  <span className="text-xl font-black text-slate-500">/mo</span>
                </p>
              </div>
              <ul className="mb-8 flex-1 space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-amber-500">✓</span>
                  Company name + logo on HCARS website
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-amber-500">✓</span>
                  Monthly social media shoutout
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-amber-500">✓</span>
                  Certificate of appreciation
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-amber-500">✓</span>
                  Annual impact report
                </li>
              </ul>
              <PayPalSubscribeButton
                amount={500}
                id="paypal-corporate-500"
                interval="monthly"
              />
            </div>

            {/* ── TIER 2: Community Champion (MOST POPULAR) ─────────────── */}
            <div className="relative flex flex-col rounded-2xl border-2 border-amber-500 bg-white p-8 shadow-xl shadow-amber-500/10">
              {/* Most Popular badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-slate-950 shadow-md">
                  Most Popular
                </span>
              </div>
              <div className="mb-6 mt-2">
                <p className="mb-1 text-xs font-black uppercase tracking-widest text-amber-600">
                  Community Champion
                </p>
                <p className="mb-1 text-4xl font-black text-slate-950">
                  $1,500
                  <span className="text-xl font-black text-slate-500">/mo</span>
                </p>
              </div>
              <ul className="mb-8 flex-1 space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-amber-500">✓</span>
                  Everything in Shelter Friend
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-amber-500">✓</span>
                  Quarterly pet visit to your office{" "}
                  <span className="text-slate-400">
                    (1 hour — we bring the dogs + snacks for staff and pets)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-amber-500">✓</span>
                  Co-branded social content featuring your team
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-amber-500">✓</span>
                  Featured in our monthly newsletter{" "}
                  <span className="text-slate-400">(2,000+ subscribers)</span>
                </li>
              </ul>
              <PayPalSubscribeButton
                amount={1500}
                id="paypal-corporate-1500"
                interval="monthly"
              />
            </div>

            {/* ── TIER 3: Pack Leader ───────────────────────────────────── */}
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-slate-950 p-8 shadow-md shadow-slate-950/20">
              <div className="mb-6">
                <p className="mb-1 text-xs font-black uppercase tracking-widest text-amber-400">
                  Pack Leader
                </p>
                <p className="mb-1 text-4xl font-black text-white">
                  $6,000
                  <span className="text-xl font-black text-slate-400">
                    /quarter
                  </span>
                </p>
              </div>
              <ul className="mb-8 flex-1 space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-amber-400">✓</span>
                  Everything in Community Champion
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-amber-400">✓</span>
                  Monthly pet visits to your office{" "}
                  <span className="text-slate-500">(once per month, 1 hour)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-amber-400">✓</span>
                  Dedicated rescue story featuring a dog your company
                  &ldquo;sponsored&rdquo;
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-amber-400">✓</span>
                  Logo on all HCARS event materials
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-amber-400">✓</span>
                  Named sponsorship of one kennel{" "}
                  <span className="text-slate-500">
                    (&ldquo;The [Company Name] Suite&rdquo;)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-amber-400">✓</span>
                  Priority contact with shelter director
                </li>
              </ul>
              <PayPalDonateButton
                amount={6000}
                id="paypal-corporate-6000"
              />
              <p className="mt-3 text-center text-xs text-slate-500">
                Billed quarterly — contact us to set up recurring
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CUSTOM ───────────────────────────────────────────────────────── */}
      <section className="bg-amber-500 px-4 py-20 text-center sm:py-24">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-3xl font-black uppercase tracking-tight text-slate-950 sm:text-4xl">
            Need Something Custom?
          </h2>
          <p className="mb-8 text-base leading-8 text-slate-800 sm:text-lg">
            Every business is different. Reach out and we&rsquo;ll build a
            partnership that works for your goals.
          </p>
          <a
            href="mailto:rescue@hcaradopt.com"
            className="inline-block rounded-full bg-slate-950 px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:bg-slate-800 active:scale-95"
          >
            rescue@hcaradopt.com
          </a>
        </div>
      </section>

      {/* ── IMPACT CLOSE ─────────────────────────────────────────────────── */}
      <section className="bg-slate-950 px-4 py-24 text-center sm:py-32">
        <p className="mx-auto mb-6 max-w-3xl text-2xl font-black text-white sm:text-3xl lg:text-4xl">
          15 dogs currently available.{" "}
          <span className="text-amber-400">
            Your company could help all of them.
          </span>
        </p>
        <p className="text-base font-semibold text-slate-400">
          Hart County Animal Rescue &mdash; 501(c)3 &mdash; EIN available upon
          request
        </p>
      </section>
    </main>
  );
}
