import { getDashboardData } from "@/lib/queries";
import { updateBookingStatus } from "@/lib/actions";

export default async function AdminDashboard() {
  const data = await getDashboardData();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Dashboard</h1>

      {/* Stats cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Pets" value={data.petCount} />
        <StatCard label="Available" value={data.availableCount} />
        <StatCard label="Adopted" value={data.adoptedCount} />
        <StatCard label="Bookings" value={data.bookingCount} />
        <StatCard label="Donations" value={data.donationCount} />
        <StatCard label="Total Donated" value={`$${data.totalDonated.toFixed(2)}`} />
      </div>

      {/* Recent Bookings */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-neutral-800">Recent Bookings</h2>
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Email</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Pet</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.recentBookings.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3">{b.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{b.email}</td>
                  <td className="px-4 py-3">{b.pet.name}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateBookingStatus} className="flex gap-1">
                      <input type="hidden" name="id" value={b.id} />
                      <select
                        name="status"
                        defaultValue={b.status}
                        className="rounded border border-neutral-300 px-2 py-1 text-xs"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        type="submit"
                        className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                      >
                        Update
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {data.recentBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-neutral-400">
                    No bookings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Donations */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-neutral-800">Recent Donations</h2>
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Donor</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Pet</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.recentDonations.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-3">{d.name ?? "Anonymous"}</td>
                  <td className="px-4 py-3 font-medium">${d.amount.toFixed(2)}</td>
                  <td className="px-4 py-3">{d.pet?.name ?? "General"}</td>
                  <td className="px-4 py-3 text-neutral-500">{d.interval}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {data.recentDonations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-neutral-400">
                    No donations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? "bg-neutral-100 text-neutral-800"}`}>
      {status}
    </span>
  );
}
