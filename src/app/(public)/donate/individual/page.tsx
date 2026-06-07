"use client";
import IndividualDonateButtons from "./IndividualDonateButtons";
import IndividualMonthlyButtons from "./IndividualMonthlyButtons";

// Route: /donate/individual
// MOF/LOF retargeting destination — standalone emotional landing page for individuals

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

// ─── One-time donation tiers ──────────────────────────────────────────────────
const ONE_TIME_TIERS: { amount: number; label: string }[] = [
  { amount: 25, label: "Feeds a dog for a full week" },
  { amount: 50, label: "Covers vaccines for one dog" },
  { amount: 100, label: "Sponsors a dog's full care for one month" },
  { amount: 250, label: "Funds emergency vet care" },
];

// ─── Monthly subscription tiers ──────────────────────────────────────────────
const MONTHLY_TIERS: { amount: number; label: string }[] = [
  { amount: 10, label: "Covers daily meals for one dog" },
  { amount: 25, label: "Funds vaccines + monthly care" },
  { amount: 50, label: "Full sponsorship of a rescue dog" },
];

// ─── PayPal one-time donate button placeholder ────────────────────────────────
 — see src/app/(public)/donate/page.tsx for pattern
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
           — see src/app/(public)/donate/page.tsx for pattern
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
      {/* Placeholder shown until PayPal SDK loads */}
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

// ─── PayPal monthly subscription button placeholder ───────────────────────────
 — see src/app/(public)/donate/page.tsx for pattern
function PayPalSubscribeButton({ amount, id }: { amount: number; id: string }) {
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
           — see src/app/(public)/donate/page.tsx for pattern
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
export default function IndividualDonatePage() {
  return (
    <main className="w-full">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-slate-950 px-4 py-24 text-center sm:py-32">
        <p className="mb-4 text-xs font-black uppercase tracking-widest text-amber-400">
          Every Dollar Saves a Life
        </p>
        <h1 className="mx-auto mb-6 max-w-3xl text-4xl font-black uppercase leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          You Already Care.{" "}
          <span className="text-amber-400">That&rsquo;s Why You&rsquo;re Here.</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
          You don&rsquo;t have to adopt to make a difference. A few dollars from
          you today means a dog gets fed tomorrow, gets vetted this week, and
          gets a second chance this month.
        </p>
        <a
          href="#impact"
          className="inline-block rounded-full bg-amber-500 px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-950 transition hover:bg-amber-400 active:scale-95"
        >
          Choose Your Impact
        </a>
      </section>

      {/* ── STORY ────────────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-black uppercase tracking-tight text-slate-950 sm:text-4xl">
            What Happens Without You
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {/* Column 1 */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8">
              <div className="mb-4 text-4xl">🏥</div>
              <h3 className="mb-3 text-lg font-black uppercase tracking-widest text-slate-950">
                Vet Bills Go Unpaid
              </h3>
              <p className="text-sm leading-7 text-slate-600">
                Every dog that comes through our doors needs vaccines, flea
                treatment, and a health check. Without donations, we can&rsquo;t
                provide it.
              </p>
            </div>
            {/* Column 2 */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8">
              <div className="mb-4 text-4xl">💊</div>
              <h3 className="mb-3 text-lg font-black uppercase tracking-widest text-slate-950">
                Supplies Run Out
              </h3>
              <p className="text-sm leading-7 text-slate-600">
                Food, bedding, leashes, crates — none of it is free. Your
                donation keeps the shelter stocked and the dogs comfortable.
              </p>
            </div>
            {/* Column 3 */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8">
              <div className="mb-4 text-4xl">🏠</div>
              <h3 className="mb-3 text-lg font-black uppercase tracking-widest text-slate-950">
                Dogs Wait Longer
              </h3>
              <p className="text-sm leading-7 text-slate-600">
                A well-funded shelter is a faster-moving shelter. More resources
                means more adoptions, more lives saved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT TIERS ─────────────────────────────────────────────────── */}
      <section id="impact" className="bg-slate-50 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-black uppercase tracking-tight text-slate-950 sm:text-4xl">
            Here&rsquo;s What Your Gift Actually Does
          </h2>
          <p className="mx-auto mb-12 max-w-xl text-center text-slate-500">
            Pick the amount that works for you. Every single dollar goes directly
            to the dogs in our care.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ONE_TIME_TIERS.map((tier) => (
              <div
                key={tier.amount}
                className="flex flex-col justify-between rounded-2xl border border-amber-100 bg-white p-6 shadow-lg shadow-slate-950/5 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-6">
                  <p className="mb-1 text-4xl font-black text-slate-950">
                    ${tier.amount}
                  </p>
                  <p className="text-sm font-semibold leading-6 text-slate-600">
                    {tier.label}
                  </p>
                </div>
                <IndividualDonateButtons
                  amount={tier.amount}
                  id={`paypal-one-time-${tier.amount}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MONTHLY ──────────────────────────────────────────────────────── */}
      <section className="bg-amber-500 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-black uppercase tracking-tight text-slate-950 sm:text-4xl">
            Become a Monthly Guardian
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-base leading-8 text-slate-800 sm:text-lg">
            A recurring gift is the most powerful thing you can do. It lets us
            plan ahead, save more dogs, and never wonder if the lights stay on.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {MONTHLY_TIERS.map((tier) => (
              <div
                key={tier.amount}
                className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-xl shadow-slate-950/10 transition hover:-translate-y-1"
              >
                <div className="mb-6">
                  <p className="mb-1 text-4xl font-black text-slate-950">
                    ${tier.amount}
                    <span className="text-xl font-black text-slate-500">/mo</span>
                  </p>
                  <p className="text-sm font-semibold leading-6 text-slate-600">
                    {tier.label}
                  </p>
                </div>
                <IndividualMonthlyButtons
                  amount={tier.amount}
                  id={`paypal-monthly-${tier.amount}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EMOTIONAL CLOSE ───────────────────────────────────────────────── */}
      <section className="bg-slate-950 px-4 py-24 text-center sm:py-32">
        <blockquote className="mx-auto mb-6 max-w-2xl text-3xl font-black italic leading-tight text-amber-400 sm:text-4xl">
          &ldquo;They waited for someone. You showed up.&rdquo;
        </blockquote>
        <p className="mb-4 text-base font-semibold text-slate-300">
          Hart County Animal Rescue &mdash; Hartwell, GA &mdash; 501(c)3 Nonprofit
        </p>
        <p className="text-sm font-black uppercase tracking-widest text-slate-500">
          All donations are tax deductible
        </p>
      </section>
    </main>
  );
}
