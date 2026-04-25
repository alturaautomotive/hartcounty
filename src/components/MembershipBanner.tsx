import Link from "next/link";

export default function MembershipBanner() {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 px-6 py-8 shadow-xl sm:px-10 sm:py-10">
      <h3 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
        Join Monthly Supporters
      </h3>
      <p className="mt-3 max-w-2xl text-lg font-medium leading-8 text-slate-700">
        For just $25/month, you provide vaccines, preventive care, and daily
        essentials for one pet in our rescue. Monthly supporters make it possible
        to plan ahead and save more lives.
      </p>
      <Link
        href="/donate#monthly-membership"
        className="mt-6 inline-block rounded-full bg-amber-400 px-7 py-3.5 text-base font-black text-slate-950 shadow-xl shadow-amber-950/30 transition hover:bg-amber-300"
      >
        Become a Monthly Supporter
      </Link>
    </div>
  );
}
