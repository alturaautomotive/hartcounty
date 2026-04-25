import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createAdminUserAction,
  deleteAdminUserAction,
  updateAdminUserAction,
} from "@/lib/actions";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAdminUsers } from "@/lib/queries";

async function createAdminUserForm(formData: FormData) {
  "use server";
  await createAdminUserAction(formData);
}

async function updateAdminUserForm(formData: FormData) {
  "use server";
  await updateAdminUserAction(formData);
}

async function deleteAdminUserForm(formData: FormData) {
  "use server";
  await deleteAdminUserAction(formData);
}

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  const session = token ? verifyToken(token) : null;
  const currentUser = session
    ? await prisma.adminUser.findUnique({
        where: { id: session.userId },
        select: { id: true, role: true },
      })
    : null;

  if (!currentUser || currentUser.role !== "super_admin") {
    redirect("/admin");
  }

  const users = await getAdminUsers();

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-700">
          Super Admin Only
        </p>
        <h1 className="mt-2 text-2xl font-black text-slate-950">
          Admin Users
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-slate-600">
          Add managers, update staff login details, and decide who can manage
          admin accounts.
        </p>
      </div>

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-black text-slate-950">
          Add Admin User
        </h2>
        <UserForm action={createAdminUserForm} submitLabel="Add User" />
      </section>

      <section className="space-y-4">
        {users.map((user) => (
          <article
            key={user.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  {user.name || user.email}
                </h2>
                <p className="text-sm font-semibold text-slate-600">
                  {user.email}
                </p>
              </div>
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-amber-200">
                {user.role.replace("_", " ")}
              </span>
            </div>

            <UserForm
              action={updateAdminUserForm}
              submitLabel="Save User"
              user={user}
            />

            {user.id !== currentUser.id && (
              <form action={deleteAdminUserForm} className="mt-3">
                <input type="hidden" name="id" value={user.id} />
                <button
                  type="submit"
                  className="rounded-full bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-700"
                >
                  Delete User
                </button>
              </form>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}

function UserForm({
  action,
  submitLabel,
  user,
}: {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
}) {
  return (
    <form action={action} className="space-y-4">
      {user && <input type="hidden" name="id" value={user.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Name"
          name="name"
          defaultValue={user?.name ?? ""}
          placeholder="Staff member name"
        />
        <Field
          label="Email"
          name="email"
          type="email"
          defaultValue={user?.email ?? ""}
          placeholder="manager@hcars.org"
          required
        />
        <Field
          label={user ? "New Password" : "Password"}
          name="password"
          type="password"
          defaultValue=""
          placeholder={user ? "Leave blank to keep current" : "At least 8 characters"}
          required={!user}
        />
        <div>
          <label className="mb-1 block text-sm font-bold text-slate-800">
            Role
          </label>
          <select
            name="role"
            defaultValue={user?.role ?? "manager"}
            className="w-full rounded-xl border-2 border-slate-400 bg-white px-3 py-2 text-sm font-semibold text-slate-950 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
          >
            <option value="manager">Manager</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="rounded-full bg-slate-950 px-5 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-amber-500 hover:text-slate-950"
      >
        {submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder: string;
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
        placeholder={placeholder}
        required={required}
        minLength={type === "password" && required ? 8 : undefined}
        className="w-full rounded-xl border-2 border-slate-400 bg-white px-3 py-2 text-sm font-semibold text-slate-950 placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
      />
    </div>
  );
}
