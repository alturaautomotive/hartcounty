import { getAllPets } from "@/lib/queries";
import Link from "next/link";
import EditablePetsTable from "./editable-pets-table";

export default async function AdminPetsPage() {
  const pets = await getAllPets();

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

      <EditablePetsTable pets={pets} />

      <p className="mt-4 text-sm text-neutral-500">
        Total: {pets.length} pet{pets.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
