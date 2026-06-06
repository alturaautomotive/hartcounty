import Papa from "papaparse";
import { getAllPets } from "@/lib/queries";
import { metaRow } from "@/lib/meta";
import type { MetaRow } from "@/lib/meta";

export async function GET() {
  const pets = await getAllPets();
  const rows = pets
    .map(metaRow)
    .filter((r): r is MetaRow => r !== null)
    .map(({ status, ...rest }) => ({
      ...rest,
      // Meta requires visibility field instead of status
      // valid values: active, archived, staging, public
      visibility: status === "available" ? "published" : "staging",
    }));

  const csv = Papa.unparse(rows, { header: true });

  return new Response(csv, {
    status: 200,
    headers: { "Content-Type": "text/csv; charset=utf-8" },
  });
}
