import Image from "next/image";
import { getAllTeamMembers } from "@/lib/queries";
import { deleteTeamMemberAction, saveTeamMemberAction } from "@/lib/actions";

async function saveTeamMemberForm(formData: FormData) {
  "use server";
  await saveTeamMemberAction(formData);
}

async function deleteTeamMemberForm(formData: FormData) {
  "use server";
  await deleteTeamMemberAction(formData);
}

export default async function AdminTeamPage() {
  const members = await getAllTeamMembers();

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-700">
          Public About Page
        </p>
        <h1 className="mt-2 text-2xl font-black text-slate-950">
          Team Members
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-slate-600">
          Add, edit, reorder, and hide the team cards shown on the About page.
        </p>
      </div>

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-black text-slate-950">
          Add Team Member
        </h2>
        <TeamMemberForm />
      </section>

      <section className="space-y-4">
        {members.map((member) => (
          <article
            key={member.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-4">
              <TeamAvatar
                imageUrl={member.imageUrl}
                initials={member.initials}
                name={member.name}
              />
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  {member.name}
                </h2>
                <p className="text-sm font-bold text-amber-700">
                  {member.role}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {member.isActive ? "Visible" : "Hidden"} · Sort{" "}
                  {member.sortOrder}
                </p>
              </div>
            </div>

            <TeamMemberForm member={member} />

            <form action={deleteTeamMemberForm} className="mt-3">
              <input type="hidden" name="id" value={member.id} />
              <button
                type="submit"
                className="rounded-full bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-700"
              >
                Delete Member
              </button>
            </form>
          </article>
        ))}

        {members.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-semibold text-slate-500">
            No team members yet.
          </div>
        )}
      </section>
    </div>
  );
}

function TeamMemberForm({
  member,
}: {
  member?: {
    id: string;
    name: string;
    role: string;
    bio: string;
    initials: string;
    imageUrl: string | null;
    sortOrder: number;
    isActive: boolean;
  };
}) {
  return (
    <form action={saveTeamMemberForm} className="space-y-4">
      {member && <input type="hidden" name="id" value={member.id} />}
      <input type="hidden" name="imageUrl" value={member?.imageUrl ?? ""} />

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" name="name" defaultValue={member?.name} required />
        <Field label="Role" name="role" defaultValue={member?.role} required />
        <Field
          label="Initials"
          name="initials"
          defaultValue={member?.initials}
          placeholder="Auto if blank"
        />
        <Field
          label="Sort Order"
          name="sortOrder"
          defaultValue={String(member?.sortOrder ?? 0)}
          type="number"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-slate-800">
          Bio
        </label>
        <textarea
          name="bio"
          defaultValue={member?.bio ?? ""}
          placeholder="Warm one-line bio"
          required
          rows={3}
          className="w-full rounded-xl border-2 border-slate-400 bg-white px-3 py-2 text-sm font-semibold text-slate-950 placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <label className="mb-1 block text-sm font-bold text-slate-800">
            Optional Photo
          </label>
          <input
            name="imageFile"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="w-full rounded-xl border-2 border-slate-400 bg-white px-3 py-2 text-sm font-semibold text-slate-950 file:mr-3 file:rounded-md file:border-0 file:bg-slate-950 file:px-3 file:py-1 file:text-xs file:font-bold file:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
          />
        </div>
        <label className="flex items-center gap-2 rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-800">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={member?.isActive ?? true}
            className="h-4 w-4 accent-slate-950"
          />
          Visible
        </label>
      </div>

      <button
        type="submit"
        className="rounded-full bg-slate-950 px-5 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-amber-500 hover:text-slate-950"
      >
        {member ? "Save Changes" : "Add Member"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue = "",
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold text-slate-800">
        {label}
      </label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder ?? label}
        required={required}
        className="w-full rounded-xl border-2 border-slate-400 bg-white px-3 py-2 text-sm font-semibold text-slate-950 placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
      />
    </div>
  );
}

function TeamAvatar({
  imageUrl,
  initials,
  name,
}: {
  imageUrl: string | null;
  initials: string;
  name: string;
}) {
  return (
    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-950 text-sm font-black text-amber-200">
      {imageUrl ? (
        <Image src={imageUrl} alt={name} fill sizes="64px" className="object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
