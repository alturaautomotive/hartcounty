import Link from "next/link";
import Script from "next/script";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/pets", label: "Pets" },
  { href: "/match", label: "Find Your Match" },
];

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  return (
    <div className="flex min-h-screen flex-col">
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD&intent=capture`}
        strategy="beforeInteractive"
      />
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD&vault=true&intent=subscription`}
        strategy="beforeInteractive"
        data-namespace="paypalSubscriptions"
      />

      <header className="sticky top-0 z-40 border-b border-amber-200/30 bg-slate-950/95 shadow-2xl shadow-slate-950/20 backdrop-blur">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className="text-lg font-black tracking-tight text-white sm:text-xl"
          >
            Hart County <span className="text-amber-300">Animal Rescue</span>
          </Link>

          <div className="flex items-center gap-6">
            <ul className="hidden items-center gap-5 sm:flex">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:text-amber-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/donate"
              className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-black uppercase tracking-[0.16em] text-slate-950 shadow-lg shadow-amber-950/30 transition hover:bg-amber-300"
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
        className="fixed right-4 bottom-4 z-50 rounded-full border border-amber-200 bg-slate-950 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-amber-200 shadow-2xl shadow-slate-950/30 transition hover:bg-slate-900 md:right-6 md:bottom-6"
        aria-label="Donate Now"
      >
        Donate Now
      </Link>

      <footer className="mt-auto border-t border-slate-200/50 bg-white/50 py-8 text-center text-xs text-slate-600 backdrop-blur">
        &copy; 2026 Hart County Animal Rescue.{" "}
        <Link href="/privacy" className="underline hover:text-amber-600">
          Privacy Policy
        </Link>{" "}
        |{" "}
        <Link href="/terms" className="underline hover:text-amber-600">
          Terms
        </Link>
        . All rights reserved.
      </footer>
    </div>
  );
}
