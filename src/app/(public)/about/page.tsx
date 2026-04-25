import Link from "next/link";
import Image from "next/image";
import { getActiveTeamMembers } from "@/lib/queries";
import MembershipBanner from "@/components/MembershipBanner";

const workBlocks = [
  {
    title: "We pull dogs in distress",
    text: "We step in for dogs facing hard situations, regardless of age, breed, or how easy they may be to place.",
  },
  {
    title: "We fully vet every animal",
    text: "Every dog is spayed or neutered, vaccinated, microchipped, and on preventatives before adoption.",
  },
  {
    title: "We serve our community",
    text: "We help with low-cost spay and neuter options, plus emergency support for families who need a hand.",
  },
];

const stats = [
  { value: "1,000+", label: "Lives saved" },
  { value: "100%", label: "Volunteer-run" },
  { value: "$85/$70", label: "Low-cost spay/neuter" },
  { value: "94%", label: "Recommended on Facebook" },
];

export const metadata = {
  title: "About Us | Hart County Animal Rescue",
  description:
    "Learn about Hart County Animal Rescue, a volunteer-run, no-kill rescue serving Hartwell, GA and the Lake Hartwell community.",
};

export default async function AboutPage() {
  const teamMembers = await getActiveTeamMembers();

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden bg-slate-950 px-4 py-24 text-white sm:px-6 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.2),transparent_30rem),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(30,41,59,0.96))]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-5 text-sm font-black uppercase tracking-[0.32em] text-amber-300">
              About Hart County Animal Rescue
            </p>
            <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl">
              We&apos;re your neighbors, and we&apos;re saving lives.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200 sm:text-xl">
              We&apos;re a fully volunteer-run, no-kill rescue rooted in
              Hartwell, GA, on Lake Hartwell. We are proud to serve this
              community, one dog, one family, and one second chance at a time.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/adopt"
                className="rounded-full bg-amber-400 px-7 py-3.5 text-base font-black text-slate-950 shadow-xl shadow-amber-950/30 transition hover:bg-amber-300"
              >
                Adopt a Dog
              </Link>
              <Link
                href="/donate"
                className="rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-base font-black text-white backdrop-blur transition hover:bg-white hover:text-slate-950"
              >
                Support Our Mission
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-200/30 bg-white/10 p-4 shadow-2xl shadow-slate-950/40 backdrop-blur">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-900">
              <Image
                src="/about/volunteers-with-dog.png"
                alt="Hart County Animal Rescue volunteers with a dog outside the shelter"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-800">
              Who We Are
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              Built by volunteers. Powered by neighbors.
            </h2>
          </div>
          <div className="space-y-6 text-lg font-medium leading-8 text-slate-800">
            <p>
              Hart County Animal Rescue is a 501(c)(3) volunteer-run rescue
              with zero paid staff. Every dollar we raise goes directly to the
              animals, so every gift becomes food, medicine, shelter, or care.
            </p>
            <p>
              We were founded to pull dogs from high-risk situations at the
              county shelter, fully vet them, and place them in loving homes.
              With spay and neuter, vaccines, microchips, and preventatives, we
              give each dog the fresh start they deserve.
            </p>
            <p className="rounded-3xl border border-amber-400 bg-slate-950 p-6 text-2xl font-black leading-9 text-white shadow-2xl shadow-slate-950/20">
              Together, we&apos;ve helped save more than 1,000 lives, and the
              next one starts with someone choosing to adopt, foster, or give.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-300">
              How We Work
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-white">
              Simple work. Real results.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {workBlocks.map((block) => (
              <div
                key={block.title}
                className="rounded-3xl border border-amber-300/40 bg-white p-7 text-slate-950 shadow-xl shadow-black/30"
              >
                <h3 className="text-2xl font-black text-slate-950">
                  {block.title}
                </h3>
                <p className="mt-4 font-medium leading-7 text-slate-700">{block.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 bg-amber-50">
        <div className="mx-auto max-w-4xl">
          <MembershipBanner />
        </div>
      </section>

      <section className="bg-amber-50 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-800">
              Our Commitment
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              We stay for the whole story.
            </h2>
            <p className="mt-6 text-2xl font-black leading-10 text-slate-950">
              Hart County Animal Rescue is a no-kill rescue. Every animal that
              comes through our doors gets the love and care they are due,
              regardless of how long it takes.
            </p>
            <p className="mt-5 text-lg font-medium leading-8 text-slate-800">
              That promise is why we need adopters, donors, fosters, and
              volunteers who believe every adoption changes two lives.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-950 bg-slate-950 p-4 shadow-2xl shadow-slate-950/30">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-900">
              <Image
                src="/about/volunteer-comforting-dog.png"
                alt="A rescue volunteer comforting a dog inside the shelter"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-300">
              Meet The Team
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-white">
              The people behind the rescue.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <article
                key={member.name}
                className="rounded-3xl border border-white/10 bg-white p-6 text-slate-950 shadow-xl shadow-black/30"
              >
                <div className="relative mb-5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-slate-950 text-base font-black text-amber-200">
                  {member.imageUrl ? (
                    <Image
                      src={member.imageUrl}
                      alt={member.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    member.initials
                  )}
                </div>
                <h3 className="text-xl font-black text-slate-950">
                  {member.name}
                </h3>
                <p className="mt-1 text-sm font-black uppercase tracking-[0.14em] text-amber-700">
                  {member.role}
                </p>
                <p className="mt-4 font-medium leading-7 text-slate-700">{member.bio}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-amber-400 px-4 py-12 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-slate-950 bg-slate-950 p-6 text-center shadow-xl shadow-slate-950/30"
            >
              <p className="text-4xl font-black text-amber-300">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-black uppercase tracking-[0.16em] text-slate-300">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-800">
            Community First
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
            Lake Hartwell is the heart of this work.
          </h2>
          <p className="mt-6 text-lg font-medium leading-8 text-slate-800">
            We are here for the people of Hart County, too. When a pet owner
            cannot pay for care, or when spay and neuter costs are out of
            reach, we do what neighbors do: we help where we can, and we keep
            families and pets together whenever possible.
          </p>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="mx-auto max-w-5xl rounded-3xl bg-slate-950 p-8 text-center text-white shadow-2xl shadow-slate-950/25 sm:p-12">
          <h2 className="text-4xl font-black tracking-tight">
            Ready to change a life?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            Whether you adopt, donate, foster, or share our work, you help give
            one more dog a safe place to land.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/adopt"
              className="rounded-full bg-amber-400 px-7 py-3.5 text-base font-black text-slate-950 shadow-xl shadow-amber-950/30 transition hover:bg-amber-300"
            >
              Adopt a Dog
            </Link>
            <Link
              href="/donate"
              className="rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-base font-black text-white backdrop-blur transition hover:bg-white hover:text-slate-950"
            >
              Support Our Mission
            </Link>
          </div>
          <p className="mt-6 text-sm font-bold text-amber-200">
            We&apos;re appointment-based. All visits are by arrangement. Call us
            at (706) 680-6648.
          </p>
        </div>
      </section>
    </main>
  );
}
