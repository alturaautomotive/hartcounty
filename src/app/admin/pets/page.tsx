import { getAllPets } from "@/lib/queries";
import { metaRow } from "@/lib/meta";
import Link from "next/link";
import EditablePetsTable from "./editable-pets-table";

export default async function AdminPetsPage() {
  const pets = await getAllPets();
  const validRows = pets.filter((pet) => metaRow(pet) !== null);
  const stats = {
    totalPets: pets.length,
    validFeedPets: validRows.length,
    skippedPets: pets.length - validRows.length,
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Manage Pets</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/pets/import"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Import CSV
          </Link>
          <a
            href="/api/pets/export"
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            Export CSV
          </a>
        </div>
      </div>

      <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-2 font-semibold">Meta Feed Stats</h2>
        <table className="min-w-full divide-y divide-neutral-200">
          <tbody className="divide-y divide-neutral-200">
            <tr><td className="py-2 pr-4 font-medium">Total Pets:</td><td>{stats.totalPets}</td></tr>
            <tr><td className="py-2 pr-4 font-medium">Valid for Feed:</td><td>{stats.validFeedPets}</td></tr>
            <tr><td className="py-2 pr-4 font-medium">Skipped (Invalid):</td><td className="text-red-600">{stats.skippedPets}</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-xs text-neutral-500">Check server console for Meta batch API logs/errors.</p>
      </div>

      <EditablePetsTable pets={pets} />

      <p className="mt-4 text-sm text-neutral-500">
        Total: {pets.length} pet{pets.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
