"use client";

import { requestPasswordResetAction } from "@/lib/actions";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setMessage("");
    setError("");

    const result = await requestPasswordResetAction(formData);
    if (result.success) {
      setMessage(result.message);
    } else {
      setError(result.error);
    }
    setPending(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-amber-300/40 bg-white p-8 shadow-2xl shadow-black/30">
        <p className="mb-3 text-center text-sm font-black uppercase tracking-[0.24em] text-amber-700">
          Admin Access
        </p>
        <h1 className="text-center text-3xl font-black text-slate-950">
          Reset your password
        </h1>
        <p className="mt-3 text-center text-sm font-medium leading-6 text-slate-600">
          Enter your admin email and we&apos;ll send a password reset link if
          the account exists.
        </p>

        {message && (
          <div className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-bold text-slate-800"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="admin@hcars.org"
              required
              className="w-full rounded-xl border-2 border-slate-400 bg-white px-3 py-2.5 text-sm font-semibold text-slate-950 placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-slate-950 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-amber-500 hover:text-slate-950 disabled:opacity-50"
          >
            {pending ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <Link
          href="/admin/login"
          className="mt-5 block text-center text-sm font-bold text-slate-700 underline decoration-amber-500 decoration-2 underline-offset-4 hover:text-amber-700"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
