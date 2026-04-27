import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Hart County Animal Rescue",
  description:
    "How Hart County Animal Rescue collects, uses, and protects your personal information when you visit our site, donate, or adopt.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 px-4 py-24 text-white sm:px-6 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.2),transparent_30rem),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(30,41,59,0.96))]" />
        <div className="relative mx-auto max-w-4xl">
          <p className="mb-5 text-sm font-black uppercase tracking-[0.32em] text-amber-300">
            Your Privacy Matters
          </p>
          <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl">
            Privacy Policy
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200 sm:text-xl">
            Hart County Animal Rescue is committed to protecting your personal
            information. This policy explains what we collect, why we collect it,
            and how we keep it safe.
          </p>
          <p className="mt-4 text-sm font-semibold text-slate-400">
            Effective Date: April 27, 2026
          </p>
        </div>
      </section>

      {/* Data Collection */}
      <section className="bg-white px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-800">
              What We Collect
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              Information you share with us.
            </h2>
          </div>
          <div className="space-y-6 text-lg font-medium leading-8 text-slate-800">
            <p>
              We collect personal information only when you voluntarily provide
              it. This includes your name, email address, phone number, and
              mailing address when you:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Submit an adoption or foster application</li>
              <li>Make a donation through our website or PayPal</li>
              <li>Subscribe to our email newsletter</li>
              <li>Contact us through our website forms or Facebook Messenger</li>
              <li>Book an appointment to visit our animals</li>
            </ul>
            <p>
              When you donate, payment processing is handled by PayPal. We do
              not store your credit card or bank account numbers on our servers.
              PayPal&apos;s handling of your data is governed by their own
              privacy policy.
            </p>
          </div>
        </div>
      </section>

      {/* How We Use & Cookies */}
      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-300">
              How We Use It
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-white">
              Your data serves the mission.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-amber-300/40 bg-white p-7 text-slate-950 shadow-xl shadow-black/30">
              <h3 className="text-2xl font-black text-slate-950">
                Communication
              </h3>
              <p className="mt-4 font-medium leading-7 text-slate-700">
                We use your contact information to process adoptions, send
                donation receipts, deliver our weekly digest, and respond to
                your inquiries.
              </p>
            </div>
            <div className="rounded-3xl border border-amber-300/40 bg-white p-7 text-slate-950 shadow-xl shadow-black/30">
              <h3 className="text-2xl font-black text-slate-950">
                No Selling or Sharing
              </h3>
              <p className="mt-4 font-medium leading-7 text-slate-700">
                We never sell, rent, or share your personal information with
                third parties for marketing purposes. Your data stays with us
                and our essential service providers.
              </p>
            </div>
            <div className="rounded-3xl border border-amber-300/40 bg-white p-7 text-slate-950 shadow-xl shadow-black/30">
              <h3 className="text-2xl font-black text-slate-950">
                Cookies &amp; Analytics
              </h3>
              <p className="mt-4 font-medium leading-7 text-slate-700">
                We use only essential cookies required for site functionality.
                We do not use tracking cookies or third-party advertising
                pixels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Your Rights & Security */}
      <section className="bg-amber-50 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-800">
              Your Rights
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              You are always in control.
            </h2>
            <div className="mt-6 space-y-4 text-lg font-medium leading-8 text-slate-800">
              <p>
                Regardless of where you live, you have the right to:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Request a copy of the personal data we hold about you</li>
                <li>Ask us to correct or delete your information</li>
                <li>Opt out of our email communications at any time</li>
                <li>Withdraw consent for data processing</li>
              </ul>
              <p>
                We honor all applicable data protection laws, including GDPR and
                CCPA rights. To exercise any of these rights, email us at the
                address below.
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-800">
              Security
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              We guard your data carefully.
            </h2>
            <div className="mt-6 space-y-4 text-lg font-medium leading-8 text-slate-800">
              <p>
                We use industry-standard security measures to protect your
                information. Our site is served over HTTPS, and we rely on
                trusted providers including Supabase for data storage, Resend
                for transactional email, and Meta for Messenger communications.
              </p>
              <p>
                While no system is 100% secure, we take every reasonable step to
                safeguard your data against unauthorized access, alteration, or
                disclosure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="mx-auto max-w-5xl rounded-3xl bg-slate-950 p-8 text-center text-white shadow-2xl shadow-slate-950/25 sm:p-12">
          <h2 className="text-4xl font-black tracking-tight">
            Questions about your privacy?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            We&apos;re happy to help. Reach out any time and we&apos;ll respond
            as quickly as we can.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="mailto:hartcountyanimalrescue@gmail.com"
              className="rounded-full bg-amber-400 px-7 py-3.5 text-base font-black text-slate-950 shadow-xl shadow-amber-950/30 transition hover:bg-amber-300"
            >
              Email Us
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-base font-black text-white backdrop-blur transition hover:bg-white hover:text-slate-950"
            >
              About the Rescue
            </Link>
          </div>
          <p className="mt-6 text-sm font-bold text-amber-200">
            Hart County Animal Rescue &middot; Hartwell, GA &middot; (706)
            680-6648
          </p>
        </div>
      </section>
    </main>
  );
}
