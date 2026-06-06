"use client";

import { useState } from "react";

export default function ContactsGHLPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/ghl/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Error ${res.status}`);
      }
      setStatus("success");
      setForm({ firstName: "", lastName: "", email: "", phone: "" });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-neutral-900">Add Contact to Email List</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manually add a contact to GoHighLevel and subscribe them to the newsletter.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-700">First Name</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              placeholder="Jane"
              className="w-full rounded-xl border-2 border-neutral-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-700">Last Name</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              placeholder="Doe"
              className="w-full rounded-xl border-2 border-neutral-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-700">Email <span className="text-red-500">*</span></label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="jane@example.com"
            className="w-full rounded-xl border-2 border-neutral-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-700">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+1 555 000 0000"
            className="w-full rounded-xl border-2 border-neutral-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>

        {status === "success" && (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm font-semibold text-green-700">
            ✓ Contact sent to GoHighLevel successfully.
          </div>
        )}

        {status === "error" && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading" || !form.email}
          className="w-full rounded-full bg-slate-950 px-4 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:bg-amber-500 hover:text-slate-950 disabled:opacity-50"
        >
          {status === "loading" ? "Sending..." : "Add to Email List"}
        </button>
      </form>
    </div>
  );
}
