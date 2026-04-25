import DonateButtons from "./DonateButtons";
import MonthlyButtons from "./MonthlyButtons";

export const metadata = {
  title: "Donate or Subscribe Monthly - Hart County Animal Rescue",
  description:
    "Support with one-time donations or $25/mo memberships. Every contribution funds pet care, vaccines, and community rescues.",
};

export default function DonatePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <section className="mb-12 text-center">
        <p className="mb-4 text-sm font-black uppercase tracking-[0.28em] text-amber-700">
          Premier giving circle
        </p>
        <h1 className="mb-4 text-5xl font-black tracking-tight text-slate-950">
          Support Our Rescue
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-600">
          Every donation directly funds the care, medical treatment, and
          rehoming of animals in Hart County. Choose an amount below to make a
          difference today.
        </p>
      </section>

      <section id="monthly-membership" className="mb-12">
        <h2 className="mb-6 text-center text-xl font-black text-slate-900">
          Become a Monthly Member
        </h2>
        <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-600 text-center mb-8">
          Join for $25/mo to support one pet each month, vaccines, and others by
          committing to our community and its pets.
        </p>
        <MonthlyButtons />
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-center text-xl font-black text-slate-900">
          One-Time Donation
        </h2>
        <DonateButtons />
      </section>

      <section className="rounded-3xl border border-amber-200/70 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/20">
        <h2 className="mb-4 text-2xl font-black text-white">
          Your Impact
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-amber-200/30">
                <th className="pb-3 font-black uppercase tracking-[0.14em] text-amber-200">Amount</th>
                <th className="pb-3 font-black uppercase tracking-[0.14em] text-amber-200">What It Provides</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              <tr>
                <td className="py-3 font-black text-white">$25</td>
                <td className="py-3 text-slate-300">Vaccines &amp; preventive care for one pet</td>
              </tr>
              <tr>
                <td className="py-3 font-black text-white">$50</td>
                <td className="py-3 text-slate-300">One month of food &amp; daily care</td>
              </tr>
              <tr>
                <td className="py-3 font-black text-white">$100</td>
                <td className="py-3 text-slate-300">Full medical checkup &amp; spay/neuter</td>
              </tr>
              <tr>
                <td className="py-3 font-black text-white">$250+</td>
                <td className="py-3 text-slate-300">Emergency surgery or critical care</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
