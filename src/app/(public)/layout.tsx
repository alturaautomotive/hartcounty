import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pets", label: "Pets" },
  { href: "/match", label: "Find Your Match" },
];

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-neutral-900"
          >
            Hart County Animal Rescue
          </Link>

          <div className="flex items-center gap-6">
            <ul className="hidden items-center gap-5 sm:flex">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/donate"
              className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
              aria-label="Donate to Hart County Animal Rescue"
            >
              Donate
            </Link>
          </div>
        </nav>
      </header>

      {children}

      {/* Sticky donate button */}
      <Link
        href="/donate"
        className="fixed top-4 right-4 z-50 rounded-lg bg-green-500 px-6 py-3 text-white shadow-lg transition hover:bg-green-600 md:top-6 md:right-6"
        aria-label="Donate Now"
      >
        Donate Now
      </Link>
    </>
  );
}
