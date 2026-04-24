"use client";

export default function SponsorButton({
  petId,
  petName,
}: {
  petId: string;
  petName: string;
}) {
  return (
    <button
      type="button"
      className="flex-1 rounded-xl border-2 border-green-500 py-3 text-center text-sm font-semibold text-green-600 transition hover:bg-green-50"
      aria-label={`Sponsor ${petName}`}
      onClick={() => {
        console.log(`[PayPal Sponsor Stub] petId: ${petId}`);
        alert(
          `Thank you for your interest in sponsoring ${petName}! PayPal integration coming soon.`
        );
      }}
    >
      Sponsor {petName}
    </button>
  );
}
