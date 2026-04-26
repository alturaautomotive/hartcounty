"use client";

import { useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Papa from "papaparse";

type Donation = {
  id: string;
  amount: number;
  name: string | null;
  email: string | null;
  interval: string;
  petName: string | null;
  petSlug: string | null;
  paypalTransactionId: string | null;
  createdAt: string;
};

type TopPet = {
  petId: string;
  petName: string;
  petSlug: string;
  total: number;
  count: number;
};

type Stats = {
  allTimeTotal: number;
  allTimeCount: number;
  monthTotal: number;
  monthCount: number;
  weekTotal: number;
  weekCount: number;
  recurringCount: number;
  topPets: TopPet[];
};

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function DonationsClient({
  donations,
  stats,
}: {
  donations: Donation[];
  stats: Stats;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const search = searchParams.get("search") ?? "";
  const typeFilter = searchParams.get("type") ?? "";
  const petFilter = searchParams.get("pet") ?? "";
  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";

  const fromDate = dateFrom ? new Date(dateFrom + "T00:00:00") : null;
  const toDate = dateTo ? new Date(dateTo + "T23:59:59") : null;

  const updateParams = useCallback(
    (newParams: Record<string, string>) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      Object.entries(newParams).forEach(([k, v]) =>
        v ? params.set(k, v) : params.delete(k)
      );
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const allPets = useMemo(() => {
    const set = new Map<string, string>();
    donations.forEach((d) => {
      if (d.petSlug && d.petName) set.set(d.petSlug, d.petName);
    });
    return Array.from(set.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [donations]);

  const filtered = useMemo(() => {
    return donations.filter((d) => {
      if (fromDate && new Date(d.createdAt) < fromDate) return false;
      if (toDate && new Date(d.createdAt) > toDate) return false;
      if (typeFilter && d.interval !== typeFilter) return false;
      if (petFilter && d.petSlug !== petFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const name = (d.name ?? "").toLowerCase();
        const email = (d.email ?? "").toLowerCase();
        const txn = (d.paypalTransactionId ?? "").toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !txn.includes(q))
          return false;
      }
      return true;
    });
  }, [donations, search, typeFilter, petFilter, fromDate, toDate]);

  function exportCSV() {
    const rows = filtered.map((d) => ({
      Amount: d.amount,
      Name: d.name ?? "",
      Email: d.email ?? "",
      Type: d.interval,
      Pet: d.petName ?? "",
      "Transaction ID": d.paypalTransactionId ?? "",
      Date: new Date(d.createdAt).toLocaleDateString(),
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Donations</h1>
        <button
          onClick={exportCSV}
          className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          Export CSV
        </button>
      </div>

      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="All-Time" value={fmt(stats.allTimeTotal)} sub={`${stats.allTimeCount} donations`} />
        <StatCard label="This Month" value={fmt(stats.monthTotal)} sub={`${stats.monthCount} donations`} />
        <StatCard label="This Week" value={fmt(stats.weekTotal)} sub={`${stats.weekCount} donations`} />
        <StatCard label="Recurring" value={String(stats.recurringCount)} sub="monthly donors" />
      </div>

      {/* Top Pet Sponsorships */}
      {stats.topPets.length > 0 && (
        <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">Top Pet Sponsorships</h2>
          <div className="flex flex-wrap gap-3">
            {stats.topPets.map((p) => (
              <Link
                key={p.petId}
                href={`/pets/${p.petSlug}`}
                className="rounded-lg bg-amber-50 px-3 py-2 text-sm hover:bg-amber-100"
              >
                <span className="font-medium text-neutral-900">{p.petName}</span>
                <span className="ml-2 text-neutral-500">
                  {fmt(p.total)} ({p.count})
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search name, email, txn..."
          value={search}
          onChange={(e) => updateParams({ search: e.target.value })}
          className="w-64 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={typeFilter}
          onChange={(e) => updateParams({ type: e.target.value })}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="one-time">One-Time</option>
          <option value="monthly">Monthly</option>
        </select>
        <select
          value={petFilter}
          onChange={(e) => updateParams({ pet: e.target.value })}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Pets</option>
          {allPets.map(([slug, name]) => (
            <option key={slug} value={slug}>
              {name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => updateParams({ dateFrom: e.target.value })}
          title="From date"
          className="w-36 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => updateParams({ dateTo: e.target.value })}
          title="To date"
          className="w-36 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        {(search || typeFilter || petFilter || dateFrom || dateTo) && (
          <button
            onClick={() =>
              updateParams({ search: "", type: "", pet: "", dateFrom: "", dateTo: "" })
            }
            className="text-sm text-neutral-500 hover:text-neutral-700"
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto text-sm text-neutral-500">
          {filtered.length} donation{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50">
            <tr>
              <th className="px-3 py-3 text-left font-medium text-neutral-600">Amount</th>
              <th className="px-3 py-3 text-left font-medium text-neutral-600">Donor</th>
              <th className="px-3 py-3 text-left font-medium text-neutral-600">Email</th>
              <th className="px-3 py-3 text-left font-medium text-neutral-600">Type</th>
              <th className="px-3 py-3 text-left font-medium text-neutral-600">Pet</th>
              <th className="px-3 py-3 text-left font-medium text-neutral-600">Txn ID</th>
              <th className="px-3 py-3 text-left font-medium text-neutral-600">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.map((d) => (
              <tr key={d.id} className="transition hover:bg-neutral-50">
                <td className="px-3 py-3 font-medium text-neutral-900">
                  {fmt(d.amount)}
                </td>
                <td className="px-3 py-3 text-neutral-700">
                  {d.name ?? "Anonymous"}
                </td>
                <td className="px-3 py-3 text-neutral-600">
                  {d.email ?? "-"}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      d.interval === "monthly"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {d.interval}
                  </span>
                </td>
                <td className="px-3 py-3">
                  {d.petSlug ? (
                    <Link
                      href={`/pets/${d.petSlug}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {d.petName}
                    </Link>
                  ) : (
                    <span className="text-neutral-400">General</span>
                  )}
                </td>
                <td className="px-3 py-3 font-mono text-xs text-neutral-500">
                  {d.paypalTransactionId ?? "-"}
                </td>
                <td className="px-3 py-3 text-neutral-500">
                  {new Date(d.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-neutral-400"
                >
                  No donations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-neutral-900">{value}</p>
      <p className="mt-0.5 text-xs text-neutral-400">{sub}</p>
    </div>
  );
}
