import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Hart County Animal Rescue",
  description:
    "Terms and conditions for using the Hart County Animal Rescue website, making donations, and submitting adoption applications.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/terms`,
  },
};

export default function TermsPage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 px-4 py-24 text-white sm:px-6 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.2),transparent_30rem),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(30,41,59,0.96))]" />
        <div className="relative mx-auto max-w-4xl">
          <p className="mb-5 text-sm font-black uppercase tracking-[0.32em] text-amber-300">
            Our Agreement With You
          </p>
          <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl">
            Terms of Service
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200 sm:text-xl">
            By using the Hart County Animal Rescue website you agree to the
            following terms. Please read them carefully before donating,
            applying to adopt, or submitting any information.
          </p>
          <p className="mt-4 text-sm font-semibold text-slate-400">
            Effective Date: April 27, 2026
          </p>
        </div>
      </section>

      {/* Site Use */}
      <section className="bg-white px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-800">
              Using This Site
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              General conditions of use.
            </h2>
          </div>
          <div className="space-y-6 text-lg font-medium leading-8 text-slate-800">
            <p>
              This website is operated by Hart County Animal Rescue, a 501(c)(3)
              nonprofit organization based in Hartwell, Georgia. All content,
              including text, images, and logos, is the property of Hart County
              Animal Rescue unless otherwise noted.
            </p>
            <p>
              You may use this site for lawful purposes only. You agree not to
              misuse the site, attempt to gain unauthorized access to any part
              of it, or interfere with its operation.
            </p>
            <p>
              You must be at least 13 years of age to use this website. By
              submitting an adoption application, you confirm that you are at
              least 18 years old.
            </p>
          </div>
        </div>
      </section>

      {/* Donations & Adoptions */}
      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-300">
              Donations &amp; Adoptions
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-white">
              How contributions and applications work.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-amber-300/40 bg-white p-7 text-slate-950 shadow-xl shadow-black/30">
              <h3 className="text-2xl font-black text-slate-950">
                Donations
              </h3>
              <p className="mt-4 font-medium leading-7 text-slate-700">
                All donations made through this website are voluntary,
                non-refundable, and irrevocable. Donations are processed
                securely through PayPal. Hart County Animal Rescue is a
                tax-exempt 501(c)(3) organization; your contribution may be
                tax-deductible to the extent allowed by law.
              </p>
            </div>
            <div className="rounded-3xl border border-amber-300/40 bg-white p-7 text-slate-950 shadow-xl shadow-black/30">
              <h3 className="text-2xl font-black text-slate-950">
                Adoption Applications
              </h3>
              <p className="mt-4 font-medium leading-7 text-slate-700">
                Submitting an adoption application does not guarantee approval.
                Hart County Animal Rescue reserves the right to approve or deny
                any application at its sole discretion. Adoption fees are
                non-refundable once an animal has been placed in your care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Liability, Warranty, Governing Law */}
      <section className="bg-amber-50 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-800">
              Disclaimers
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              Limitation of liability.
            </h2>
            <div className="mt-6 space-y-4 text-lg font-medium leading-8 text-slate-800">
              <p>
                This website and its content are provided &ldquo;as is&rdquo;
                without warranties of any kind, either express or implied. Hart
                County Animal Rescue does not guarantee the accuracy,
                completeness, or timeliness of any information on this site.
              </p>
              <p>
                To the fullest extent permitted by law, Hart County Animal
                Rescue shall not be liable for any direct, indirect, incidental,
                or consequential damages arising from your use of this website
                or reliance on any information provided.
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-800">
              Governing Law
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              Jurisdiction &amp; disputes.
            </h2>
            <div className="mt-6 space-y-4 text-lg font-medium leading-8 text-slate-800">
              <p>
                These terms are governed by and construed in accordance with the
                laws of the State of Georgia. Any disputes arising from these
                terms or your use of this website shall be resolved in the
                courts of Hart County, Georgia.
              </p>
              <p>
                If any provision of these terms is found to be unenforceable,
                the remaining provisions will continue in full force and effect.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Changes & Contact */}
      <section className="bg-white px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-800">
            Updates
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
            We may update these terms.
          </h2>
          <p className="mt-6 text-lg font-medium leading-8 text-slate-800">
            Hart County Animal Rescue reserves the right to modify these terms
            at any time. Changes take effect immediately upon posting. Your
            continued use of the site after changes are posted constitutes
            acceptance of the updated terms.
          </p>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="mx-auto max-w-5xl rounded-3xl bg-slate-950 p-8 text-center text-white shadow-2xl shadow-slate-950/25 sm:p-12">
          <h2 className="text-4xl font-black tracking-tight">
            Have questions about these terms?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            We&apos;re here to help. Reach out and we&apos;ll get back to you as
            soon as possible.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="mailto:hartcountyanimalrescue@gmail.com"
              className="rounded-full bg-amber-400 px-7 py-3.5 text-base font-black text-slate-950 shadow-xl shadow-amber-950/30 transition hover:bg-amber-300"
            >
              Email Us
            </Link>
            <Link
              href="/privacy"
              className="rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-base font-black text-white backdrop-blur transition hover:bg-white hover:text-slate-950"
            >
              Privacy Policy
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
