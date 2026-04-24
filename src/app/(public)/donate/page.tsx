import DonateButtons from "./DonateButtons";

export const metadata = {
  title: "Donate - Hart County Animal Rescue",
  description:
    "Support Hart County Animal Rescue with a one-time donation. Every dollar helps us rescue, rehabilitate, and rehome animals.",
};

export default function DonatePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-neutral-900">
          Support Our Rescue
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-neutral-600">
          Every donation directly funds the care, medical treatment, and
          rehoming of animals in Hart County. Choose an amount below to make a
          difference today.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-center text-xl font-semibold text-neutral-800">
          One-Time Donation
        </h2>
        <DonateButtons />
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8">
        <h2 className="mb-4 text-xl font-semibold text-neutral-800">
          Your Impact
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="pb-2 font-semibold text-neutral-700">Amount</th>
                <th className="pb-2 font-semibold text-neutral-700">What It Provides</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              <tr>
                <td className="py-2 font-medium text-neutral-900">$25</td>
                <td className="py-2 text-neutral-600">Vaccines &amp; preventive care for one pet</td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-neutral-900">$50</td>
                <td className="py-2 text-neutral-600">One month of food &amp; daily care</td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-neutral-900">$100</td>
                <td className="py-2 text-neutral-600">Full medical checkup &amp; spay/neuter</td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-neutral-900">$250+</td>
                <td className="py-2 text-neutral-600">Emergency surgery or critical care</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
