"use client";

import { previewImportPets, importPets, type PreviewPet } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Step = "upload" | "preview" | "done";

export default function ImportPetsPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [preview, setPreview] = useState<PreviewPet[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  async function handlePreview(formData: FormData) {
    setPending(true);
    setError(null);

    const selectedFile = formData.get("file") as File | null;
    if (!selectedFile) {
      setError("No file selected.");
      setPending(false);
      return;
    }

    setFile(selectedFile);
    const res = await previewImportPets(formData);

    if (res.success) {
      setPreview(res.preview);
      setStep("preview");
    } else {
      setError(res.error);
    }
    setPending(false);
  }

  async function handleConfirmImport() {
    if (!file) return;
    setPending(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    const res = await importPets(formData);

    if (res.success) {
      setResultMessage(`Successfully imported ${res.count} pet(s).`);
      setStep("done");
      setTimeout(() => router.push("/admin/pets"), 2000);
    } else {
      setError(res.error);
    }
    setPending(false);
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Import Pets from CSV</h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {resultMessage && (
        <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {resultMessage}
        </div>
      )}

      {step === "upload" && (
        <div className="max-w-lg rounded-lg border border-neutral-200 bg-white p-6">
          <p className="mb-4 text-sm text-neutral-600">
            Upload a CSV file with pet data. Expected columns:
          </p>

          <div className="mb-6 overflow-x-auto rounded border border-neutral-200">
            <table className="w-full text-xs">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-neutral-600">CSV Column</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-600">Pet Field</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr><td className="px-3 py-1">title</td><td className="px-3 py-1">name</td></tr>
                <tr><td className="px-3 py-1">availability</td><td className="px-3 py-1">status</td></tr>
                <tr><td className="px-3 py-1">breed</td><td className="px-3 py-1">breed</td></tr>
                <tr><td className="px-3 py-1">age</td><td className="px-3 py-1">ageCategory</td></tr>
                <tr><td className="px-3 py-1">sex</td><td className="px-3 py-1">sex</td></tr>
                <tr><td className="px-3 py-1">size</td><td className="px-3 py-1">size</td></tr>
                <tr><td className="px-3 py-1">weight</td><td className="px-3 py-1">weight</td></tr>
                <tr><td className="px-3 py-1">color</td><td className="px-3 py-1">color</td></tr>
                <tr><td className="px-3 py-1">description</td><td className="px-3 py-1">description</td></tr>
                <tr><td className="px-3 py-1">price</td><td className="px-3 py-1">price / adoptionFee</td></tr>
                <tr><td className="px-3 py-1">image</td><td className="px-3 py-1">imageUrl</td></tr>
              </tbody>
            </table>
          </div>

          <form action={handlePreview}>
            <div className="mb-4">
              <label htmlFor="file" className="mb-1 block text-sm font-medium text-neutral-700">
                CSV File
              </label>
              <input
                id="file"
                name="file"
                type="file"
                accept=".csv"
                required
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-sm file:font-medium file:text-blue-700"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {pending ? "Parsing..." : "Preview Import"}
            </button>
          </form>
        </div>
      )}

      {step === "preview" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              Found <strong>{preview.length}</strong> pet(s) to import. Review below and confirm.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setStep("upload");
                  setPreview([]);
                  setFile(null);
                }}
                className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Back
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={pending}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                {pending ? "Importing..." : `Confirm Import (${preview.length})`}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600">#</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600">Species</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600">Breed</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600">Age</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600">Sex</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600">Size</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {preview.map((pet, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-xs text-neutral-400">{i + 1}</td>
                    <td className="px-3 py-2 font-medium">{pet.name}</td>
                    <td className="px-3 py-2 text-neutral-500">{pet.species}</td>
                    <td className="px-3 py-2 text-neutral-500">{pet.breed || "-"}</td>
                    <td className="px-3 py-2 text-neutral-500">{pet.ageCategory || "-"}</td>
                    <td className="px-3 py-2 text-neutral-500">{pet.sex || "-"}</td>
                    <td className="px-3 py-2 text-neutral-500">{pet.size || "-"}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          pet.status === "available"
                            ? "bg-green-100 text-green-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {pet.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-neutral-500">{pet.price || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="max-w-lg rounded-lg border border-neutral-200 bg-white p-6 text-center">
          <p className="text-lg font-semibold text-green-700">{resultMessage}</p>
          <p className="mt-2 text-sm text-neutral-500">Redirecting to pets list...</p>
        </div>
      )}
    </div>
  );
}
