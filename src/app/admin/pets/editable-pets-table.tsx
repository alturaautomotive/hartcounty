"use client";

import Image from "next/image";
import { useState } from "react";
import { updatePetFields, deletePet } from "@/lib/actions";
import { useRouter } from "next/navigation";

type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  ageCategory: string | null;
  sex: string | null;
  size: string | null;
  weight: string | null;
  color: string | null;
  description: string | null;
  status: string;
  price: number | null;
  imageUrl: string | null;
};

export default function EditablePetsTable({ pets }: { pets: Pet[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave(formData: FormData) {
    setSaving(true);
    const result = await updatePetFields(formData);
    setSaving(false);
    if (result.success) {
      setEditingId(null);
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  async function handleDelete(formData: FormData) {
    if (!confirm("Delete this pet? This cannot be undone.")) return;
    await deletePet(formData);
    router.refresh();
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50">
          <tr>
            <th className="px-3 py-3 text-left font-medium text-neutral-600">Name</th>
            <th className="px-3 py-3 text-left font-medium text-neutral-600">Species</th>
            <th className="px-3 py-3 text-left font-medium text-neutral-600">Breed</th>
            <th className="px-3 py-3 text-left font-medium text-neutral-600">Age</th>
            <th className="px-3 py-3 text-left font-medium text-neutral-600">Sex</th>
            <th className="px-3 py-3 text-left font-medium text-neutral-600">Size</th>
            <th className="px-3 py-3 text-left font-medium text-neutral-600">Status</th>
            <th className="px-3 py-3 text-left font-medium text-neutral-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {pets.map((pet) => {
            const isEditing = editingId === pet.id;

            if (isEditing) {
              return (
                <tr key={pet.id} className="bg-amber-50">
                  <td colSpan={8} className="p-3">
                    <form action={handleSave}>
                      <input type="hidden" name="id" value={pet.id} />
                      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-amber-200 bg-white p-3 sm:flex-row sm:items-center">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          {pet.imageUrl ? (
                            <Image
                              src={pet.imageUrl}
                              alt={pet.name}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs font-bold text-slate-500">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="grid flex-1 gap-3 sm:grid-cols-2">
                          <Field
                            label="Image URL"
                            name="imageUrl"
                            defaultValue={pet.imageUrl ?? ""}
                          />
                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-800">
                              Upload New Image
                            </label>
                            <input
                              name="imageFile"
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif"
                              className="w-full rounded-lg border-2 border-slate-400 bg-white px-2 py-1.5 text-xs font-semibold text-slate-950 file:mr-3 file:rounded-md file:border-0 file:bg-slate-950 file:px-3 file:py-1 file:text-xs file:font-bold file:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                            />
                            <p className="mt-1 text-xs font-medium text-slate-600">
                              JPG, PNG, GIF, or WebP. Max 5MB.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        <Field label="Name" name="name" defaultValue={pet.name} required />
                        <Field label="Species" name="species" defaultValue={pet.species} />
                        <Field label="Breed" name="breed" defaultValue={pet.breed ?? ""} />
                        <Field label="Age Category" name="ageCategory" defaultValue={pet.ageCategory ?? ""} />
                        <Field label="Sex" name="sex" defaultValue={pet.sex ?? ""} />
                        <Field label="Size" name="size" defaultValue={pet.size ?? ""} />
                        <Field label="Weight" name="weight" defaultValue={pet.weight ?? ""} />
                        <Field label="Color" name="color" defaultValue={pet.color ?? ""} />
                        <Field label="Price" name="price" defaultValue={pet.price?.toString() ?? ""} type="number" />
                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-800">Status</label>
                          <select
                            name="status"
                            defaultValue={pet.status}
                            className="w-full rounded-lg border-2 border-slate-400 bg-white px-2 py-1.5 text-xs font-semibold text-slate-950 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                          >
                            <option value="available">Available</option>
                            <option value="adopted">Adopted</option>
                            <option value="pending">Pending</option>
                            <option value="hold">On Hold</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-span-full mt-2">
                        <label className="mb-1 block text-xs font-bold text-slate-800">Description</label>
                        <textarea
                          name="description"
                          defaultValue={pet.description ?? ""}
                          placeholder="Add adoption notes, personality, care needs, or story"
                          rows={2}
                          className="w-full rounded-lg border-2 border-slate-400 bg-white px-2 py-1.5 text-xs font-semibold text-slate-950 placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                        />
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="submit"
                          disabled={saving}
                          className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </td>
                </tr>
              );
            }

            return (
              <tr key={pet.id}>
                <td className="px-3 py-3 font-medium">{pet.name}</td>
                <td className="px-3 py-3 text-neutral-500">{pet.species}</td>
                <td className="px-3 py-3 text-neutral-500">{pet.breed ?? "-"}</td>
                <td className="px-3 py-3 text-neutral-500">{pet.ageCategory ?? "-"}</td>
                <td className="px-3 py-3 text-neutral-500">{pet.sex ?? "-"}</td>
                <td className="px-3 py-3 text-neutral-500">{pet.size ?? "-"}</td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      pet.status === "available"
                        ? "bg-green-100 text-green-700"
                        : pet.status === "adopted"
                          ? "bg-purple-100 text-purple-700"
                          : pet.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    {pet.status}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingId(pet.id)}
                      className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <form action={handleDelete}>
                      <input type="hidden" name="id" value={pet.id} />
                      <button
                        type="submit"
                        className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
          {pets.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-neutral-400">
                No pets found. Import some via CSV.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-slate-800">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={label}
        required={required}
        type={type}
        step={type === "number" ? "0.01" : undefined}
        className="w-full rounded-lg border-2 border-slate-400 bg-white px-2 py-1.5 text-xs font-semibold text-slate-950 placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
      />
    </div>
  );
}
