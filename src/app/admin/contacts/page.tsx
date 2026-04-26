"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { relativeTime } from "@/lib/utils";

type Contact = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  tags: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  messages: { id: string; body: string; sentAt: string }[];
};

const SOURCE_COLORS: Record<string, string> = {
  messenger_lead: "bg-purple-100 text-purple-800",
  messenger_message: "bg-blue-100 text-blue-800",
  manual: "bg-neutral-100 text-neutral-800",
};

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    source: "manual",
    notes: "",
  });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    setLoading(true);
    const res = await fetch("/api/contacts");
    if (res.ok) {
      setContacts(await res.json());
    }
    setLoading(false);
  }

  const allTags = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach((c) => c.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [contacts]);

  const allSources = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach((c) => set.add(c.source));
    return Array.from(set).sort();
  }, [contacts]);

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      if (sourceFilter && c.source !== sourceFilter) return false;
      if (tagFilter && !c.tags.includes(tagFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        const name = `${c.firstName ?? ""} ${c.lastName ?? ""}`.toLowerCase();
        const email = (c.email ?? "").toLowerCase();
        const phone = c.phone ?? "";
        if (!name.includes(q) && !email.includes(q) && !phone.includes(q))
          return false;
      }
      return true;
    });
  }, [contacts, search, sourceFilter, tagFilter]);

  function exportCSV() {
    const rows = filtered.map((c) => ({
      Name: `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim(),
      Email: c.email ?? "",
      Phone: c.phone ?? "",
      Source: c.source,
      Tags: c.tags.join(", "),
      Created: new Date(c.createdAt).toLocaleDateString(),
      Notes: c.notes ?? "",
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    if (res.ok) {
      setShowAddModal(false);
      setAddForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        source: "manual",
        notes: "",
      });
      await fetchContacts();
    }
    setAddLoading(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Contacts</h1>
        <div className="flex gap-2">
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
            Add Contact
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search name, email, phone..."
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
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Tags</option>
          {allTags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {(search || sourceFilter || tagFilter) && (
          <button
            onClick={() => {
              setSearch("");
              setSourceFilter("");
              setTagFilter("");
            }}
            className="text-sm text-neutral-500 hover:text-neutral-700"
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto text-sm text-neutral-500">
          {filtered.length} contact{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="px-3 py-3 text-left font-medium text-neutral-600">
                  Name
                </th>
                <th className="px-3 py-3 text-left font-medium text-neutral-600">
                  Email / Phone
                </th>
                <th className="px-3 py-3 text-left font-medium text-neutral-600">
                  Source
                </th>
                <th className="px-3 py-3 text-left font-medium text-neutral-600">
                  Tags
                </th>
                <th className="px-3 py-3 text-left font-medium text-neutral-600">
                  Created
                </th>
                <th className="px-3 py-3 text-left font-medium text-neutral-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="cursor-pointer transition hover:bg-neutral-50"
                  onClick={() =>
                    router.push(`/admin/inbox?contactId=${c.id}`)
                  }
                >
                  <td className="px-3 py-3 font-medium text-neutral-900">
                    {`${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() ||
                      "Unknown"}
                  </td>
                  <td className="px-3 py-3 text-neutral-600">
                    <div>{c.email}</div>
                    {c.phone && (
                      <div className="text-xs text-neutral-400">{c.phone}</div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        SOURCE_COLORS[c.source] ?? "bg-neutral-100 text-neutral-800"
                      }`}
                    >
                      {c.source.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((t) => (
                        <span
                          key={t}
                          className="inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-neutral-500">
                    {relativeTime(c.createdAt)}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/inbox?contactId=${c.id}`);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-8 text-center text-neutral-400"
                  >
                    No contacts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-neutral-900">
              Add Contact
            </h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First name"
                  value={addForm.firstName}
                  onChange={(e) =>
                    setAddForm({ ...addForm, firstName: e.target.value })
                  }
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={addForm.lastName}
                  onChange={(e) =>
                    setAddForm({ ...addForm, lastName: e.target.value })
                  }
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={addForm.email}
                onChange={(e) =>
                  setAddForm({ ...addForm, email: e.target.value })
                }
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={addForm.phone}
                onChange={(e) =>
                  setAddForm({ ...addForm, phone: e.target.value })
                }
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <select
                value={addForm.source}
                onChange={(e) =>
                  setAddForm({ ...addForm, source: e.target.value })
                }
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="manual">Manual</option>
                <option value="messenger_lead">Messenger Lead</option>
                <option value="messenger_message">Messenger Message</option>
              </select>
              <textarea
                placeholder="Notes"
                value={addForm.notes}
                onChange={(e) =>
                  setAddForm({ ...addForm, notes: e.target.value })
                }
                rows={2}
                className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
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
