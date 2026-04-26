"use client";

import { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";
import { relativeTime } from "@/lib/utils";

type Subscriber = {
  id: string;
  email: string;
  firstName: string | null;
  source: string | null;
  unsubscribed: boolean;
  createdAt: string;
};

const SOURCE_COLORS: Record<string, string> = {
  booking_form: "bg-green-100 text-green-800",
  donation_form: "bg-amber-100 text-amber-800",
  messenger_lead: "bg-purple-100 text-purple-800",
  manual: "bg-neutral-100 text-neutral-800",
};

export default function NewsletterClient({
  previewHtml,
  subscribers: initialSubscribers,
  activeCount: initialActive,
  unsubscribedCount: initialUnsub,
}: {
  previewHtml: string;
  subscribers: Subscriber[];
  activeCount: number;
  unsubscribedCount: number;
}) {
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [activeCount, setActiveCount] = useState(initialActive);
  const [unsubCount, setUnsubCount] = useState(initialUnsub);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ email: "", firstName: "", source: "manual" });
  const [addLoading, setAddLoading] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingDigest, setSendingDigest] = useState(false);
  const [flash, setFlash] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (flash) {
      const t = setTimeout(() => setFlash(null), 5000);
      return () => clearTimeout(t);
    }
  }, [flash]);

  async function refreshSubscribers() {
    const res = await fetch("/api/subscribers");
    if (res.ok) {
      const data: Subscriber[] = await res.json();
      setSubscribers(data);
      setActiveCount(data.filter((s) => !s.unsubscribed).length);
      setUnsubCount(data.filter((s) => s.unsubscribed).length);
    }
  }

  const allSources = useMemo(() => {
    const set = new Set<string>();
    subscribers.forEach((s) => { if (s.source) set.add(s.source); });
    return Array.from(set).sort();
  }, [subscribers]);

  const filtered = useMemo(() => {
    return subscribers.filter((s) => {
      if (sourceFilter && s.source !== sourceFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !s.email.toLowerCase().includes(q) &&
          !(s.firstName ?? "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [subscribers, search, sourceFilter]);

  function exportCSV() {
    const rows = filtered.map((s) => ({
      Email: s.email,
      "First Name": s.firstName ?? "",
      Source: s.source ?? "",
      Status: s.unsubscribed ? "Unsubscribed" : "Active",
      "Created At": new Date(s.createdAt).toLocaleDateString(),
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    const res = await fetch("/api/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    if (res.ok) {
      setShowAddModal(false);
      setAddForm({ email: "", firstName: "", source: "manual" });
      await refreshSubscribers();
      setFlash({ type: "success", message: "Subscriber added." });
    } else {
      setFlash({ type: "error", message: "Failed to add subscriber." });
    }
    setAddLoading(false);
  }

  async function handleSendTest() {
    setSendingTest(true);
    const res = await fetch("/api/admin/send-test-digest", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setFlash({ type: "success", message: `Test email sent to ${data.to}` });
    } else {
      setFlash({ type: "error", message: "Failed to send test email." });
    }
    setSendingTest(false);
  }

  async function handleSendDigest() {
    if (!confirm(`Send the weekly digest to ${activeCount} active subscribers?`)) return;
    setSendingDigest(true);
    const res = await fetch("/api/admin/send-digest", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setFlash({ type: "success", message: `Digest queued for ${data.count} subscribers.` });
    } else {
      setFlash({ type: "error", message: "Failed to queue digest." });
    }
    setSendingDigest(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this subscriber?")) return;
    const res = await fetch(`/api/subscribers/${id}`, { method: "DELETE" });
    if (res.ok) await refreshSubscribers();
  }

  async function toggleUnsubscribe(sub: Subscriber) {
    await fetch(`/api/subscribers/${sub.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unsubscribed: !sub.unsubscribed }),
    });
    await refreshSubscribers();
  }

  return (
    <div>
      {/* Flash */}
      {flash && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${
            flash.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {flash.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Newsletter</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {activeCount} active / {unsubCount} unsubscribed / {subscribers.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            {showPreview ? "Hide Preview" : "Preview Digest"}
          </button>
          <button
            onClick={handleSendTest}
            disabled={sendingTest}
            className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
          >
            {sendingTest ? "Sending..." : "Send Test"}
          </button>
          <button
            onClick={handleSendDigest}
            disabled={sendingDigest || activeCount === 0}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {sendingDigest ? "Queuing..." : "Send Digest"}
          </button>
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="mb-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-600">
            Email Preview
          </div>
          <iframe
            srcDoc={previewHtml}
            className="h-[600px] w-full border-0"
            sandbox="allow-same-origin"
            title="Digest preview"
          />
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search email, name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Sources</option>
          {allSources.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        {(search || sourceFilter) && (
          <button
            onClick={() => { setSearch(""); setSourceFilter(""); }}
            className="text-sm text-neutral-500 hover:text-neutral-700"
          >
            Clear filters
          </button>
        )}
        <div className="ml-auto flex gap-2">
          <button
            onClick={exportCSV}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Add Subscriber
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50">
            <tr>
              <th className="px-3 py-3 text-left font-medium text-neutral-600">Email</th>
              <th className="px-3 py-3 text-left font-medium text-neutral-600">Name</th>
              <th className="px-3 py-3 text-left font-medium text-neutral-600">Source</th>
              <th className="px-3 py-3 text-left font-medium text-neutral-600">Status</th>
              <th className="px-3 py-3 text-left font-medium text-neutral-600">Subscribed</th>
              <th className="px-3 py-3 text-left font-medium text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.map((s) => (
              <tr key={s.id} className="transition hover:bg-neutral-50">
                <td className="px-3 py-3 font-medium text-neutral-900">{s.email}</td>
                <td className="px-3 py-3 text-neutral-600">{s.firstName ?? "-"}</td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      SOURCE_COLORS[s.source ?? ""] ?? "bg-neutral-100 text-neutral-800"
                    }`}
                  >
                    {(s.source ?? "unknown").replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.unsubscribed
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {s.unsubscribed ? "Unsubscribed" : "Active"}
                  </span>
                </td>
                <td className="px-3 py-3 text-neutral-500">{relativeTime(s.createdAt)}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleUnsubscribe(s)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {s.unsubscribed ? "Resubscribe" : "Unsubscribe"}
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-neutral-400">
                  No subscribers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Subscriber Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-neutral-900">Add Subscriber</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <input
                type="email"
                placeholder="Email *"
                required
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="First name"
                value={addForm.firstName}
                onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <select
                value={addForm.source}
                onChange={(e) => setAddForm({ ...addForm, source: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="manual">Manual</option>
                <option value="booking_form">Booking Form</option>
                <option value="donation_form">Donation Form</option>
                <option value="messenger_lead">Messenger Lead</option>
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {addLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
