"use client";

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
                <tr key={pet.id} className="bg-blue-50/50">
                  <td colSpan={8} className="p-3">
                    <form action={handleSave}>
                      <input type="hidden" name="id" value={pet.id} />
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
                        <Field label="Image URL" name="imageUrl" defaultValue={pet.imageUrl ?? ""} />
                        <div>
                          <label className="mb-1 block text-xs font-medium text-neutral-600">Status</label>
                          <select
                            name="status"
                            defaultValue={pet.status}
                            className="w-full rounded border border-neutral-300 px-2 py-1.5 text-xs"
                          >
                            <option value="available">Available</option>
                            <option value="adopted">Adopted</option>
                            <option value="pending">Pending</option>
                            <option value="hold">On Hold</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-span-full mt-2">
                        <label className="mb-1 block text-xs font-medium text-neutral-600">Description</label>
                        <textarea
                          name="description"
                          defaultValue={pet.description ?? ""}
                          rows={2}
                          className="w-full rounded border border-neutral-300 px-2 py-1.5 text-xs"
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
      <label className="mb-1 block text-xs font-medium text-neutral-600">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        type={type}
        step={type === "number" ? "0.01" : undefined}
        className="w-full rounded border border-neutral-300 px-2 py-1.5 text-xs"
      />
    </div>
  );
}
