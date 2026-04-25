"use client";

import { loginAction } from "@/lib/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError("");
    const result = await loginAction(formData);
    if (result.success) {
      router.push("/admin");
    } else {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-amber-300/40 bg-white p-8 shadow-2xl shadow-black/30">
        <h1 className="mb-6 text-center text-2xl font-black text-slate-950">
          Admin Login
        </h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-bold text-slate-800">
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

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-bold text-slate-800">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter admin password"
                required
                className="w-full rounded-xl border-2 border-slate-400 bg-white px-3 py-2.5 pr-16 text-sm font-semibold text-slate-950 placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-black uppercase tracking-[0.12em] text-slate-700 hover:text-amber-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-slate-950 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-amber-500 hover:text-slate-950 disabled:opacity-50"
          >
            {pending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <Link
          href="/admin/forgot-password"
          className="mt-5 block text-center text-sm font-bold text-slate-700 underline decoration-amber-500 decoration-2 underline-offset-4 hover:text-amber-700"
        >
          Forgot password?
        </Link>
      </div>
    </div>
  );
}
