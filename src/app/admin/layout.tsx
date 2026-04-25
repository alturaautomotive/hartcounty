import Link from "next/link";
import { cookies } from "next/headers";
import { logoutAction } from "@/lib/actions";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pets", label: "Pets" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/pets/import", label: "Import CSV" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  const session = token ? verifyToken(token) : null;
  const user = session
    ? await prisma.adminUser.findUnique({
        where: { id: session.userId },
        select: { email: true, role: true },
      })
    : null;

  // Unauthenticated users: proxy.ts redirects non-login admin routes to /admin/login.
  // This fallback only renders for /admin/login itself.
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-neutral-200 bg-white">
        <div className="px-4 py-5">
          <Link href="/admin" className="text-lg font-bold text-neutral-900">
            HCARS Admin
          </Link>
          <p className="mt-1 text-xs text-neutral-500">{user.email}</p>
          <p className="mt-1 text-xs font-semibold capitalize text-amber-700">
            {user.role.replace("_", " ")}
          </p>
        </div>

        <nav className="mt-2 space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
            >
              {item.label}
            </Link>
          ))}

          {user.role === "super_admin" && (
            <Link
              href="/admin/users"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
            >
              Admin Users
            </Link>
          )}

          <a
            href="/api/pets/export"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
          >
            Export CSV
          </a>
        </nav>

        <div className="mt-auto border-t border-neutral-200 p-4">
          <form
            action={async () => {
              "use server";
              await logoutAction();
              redirect("/admin/login");
            }}
          >
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Sign Out
            </button>
          </form>

          <Link
            href="/"
            className="mt-2 block text-center text-xs text-neutral-500 hover:text-neutral-700"
          >
            Back to site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
