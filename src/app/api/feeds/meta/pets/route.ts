import Papa from "papaparse";
import { getAllPets } from "@/lib/queries";
import { metaRow } from "@/lib/meta";
import type { MetaRow } from "@/lib/meta";

export async function GET() {
  const pets = await getAllPets();
  const rows = pets.map(metaRow).filter((r): r is MetaRow => r !== null);
  const csv = Papa.unparse(rows, { header: true });

  return new Response(csv, {
    status: 200,
    headers: { "Content-Type": "text/csv; charset=utf-8" },
  });
}
