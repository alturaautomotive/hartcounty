import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { EmailHeader } from "./components/EmailHeader";
import { EmailFooter } from "./components/EmailFooter";
import { PetOfMonth } from "./components/PetOfMonth";
import { PetCard } from "./components/PetCard";
import { DonateSection } from "./components/DonateSection";
import { MonthlyShoutout } from "./components/MonthlyShoutout";
import { getPublicSiteUrl } from "@/lib/site-url";
import { donatePageUrl, emailTheme } from "./emailTheme";

const previewSiteUrl = getPublicSiteUrl();

interface WeeklyDigestProps {
  petOfMonth?: {
    name: string;
    imageUrl: string;
    description: string;
    slug: string;
  };
  recentlyAdopted: { name: string; imageUrl: string | null }[];
  newArrivals: {
    name: string;
    imageUrl: string | null;
    ageCategory: string | null;
    size: string | null;
    slug: string;
  }[];
  monthlyDonorFirstNames: string[];
  unsubscribeUrl: string;
  baseUrl: string;
}

const defaultProps: WeeklyDigestProps = {
  petOfMonth: {
    name: "Buddy",
    imageUrl: "https://placedog.net/500/500?random",
    description:
      "Buddy is a sweet 3-year-old lab mix who loves belly rubs and long walks. He's great with kids and other dogs!",
    slug: "buddy",
  },
  recentlyAdopted: [
    { name: "Luna", imageUrl: "https://placedog.net/200/200?id=1" },
    { name: "Max", imageUrl: "https://placedog.net/200/200?id=2" },
  ],
  newArrivals: [
    {
      name: "Daisy",
      imageUrl: "https://placedog.net/200/200?id=3",
      ageCategory: "Puppy",
      size: "Small",
      slug: "daisy",
    },
    {
      name: "Rocky",
      imageUrl: "https://placedog.net/200/200?id=4",
      ageCategory: "Adult",
      size: "Large",
      slug: "rocky",
    },
  ],
  monthlyDonorFirstNames: ["Sarah", "Mike", "Jenny", "Tom", "Lisa"],
  unsubscribeUrl: `${previewSiteUrl}/api/unsubscribe?token=preview`,
  baseUrl: previewSiteUrl,
};

const sans = { fontFamily: emailTheme.fontSans };

const styles = {
  body: {
    ...sans,
    backgroundColor: emailTheme.background,
    margin: "0",
    padding: "0 0 32px",
    color: emailTheme.text,
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "0 16px",
  },
  sectionHeading: {
    ...sans,
    fontSize: "20px",
    fontWeight: 900,
    letterSpacing: "-0.02em",
    color: emailTheme.slate950,
    margin: "0 0 16px",
    textAlign: "center" as const,
  },
  section: {
    padding: "24px",
    backgroundColor: emailTheme.surface,
    borderRadius: "16px",
    margin: "0 0 24px",
    textAlign: "center" as const,
    border: `1px solid ${emailTheme.borderAmber}`,
    boxShadow: "0 12px 40px rgba(15, 23, 42, 0.05)",
  },
  adoptedBadge: {
    ...sans,
    display: "inline-block" as const,
    backgroundColor: emailTheme.successBg,
    color: emailTheme.successText,
    fontSize: "11px",
    fontWeight: 800,
    padding: "4px 10px",
    borderRadius: "9999px",
    margin: "6px 0 0",
  },
  heroText: {
    ...sans,
    fontSize: "16px",
    color: emailTheme.textMuted,
    lineHeight: "1.65",
    textAlign: "center" as const,
    margin: "0",
  },
  heroDonate: {
    ...sans,
    marginTop: "20px",
    textAlign: "center" as const,
  },
  heroDonateLink: {
    ...sans,
    fontSize: "13px",
    fontWeight: 900,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: emailTheme.amber700,
    textDecoration: "none",
  },
};

export default function WeeklyDigest({
  petOfMonth,
  recentlyAdopted = [],
  newArrivals = [],
  monthlyDonorFirstNames = [],
  unsubscribeUrl = "",
  baseUrl = "",
}: WeeklyDigestProps) {
  const previewText = petOfMonth
    ? `Meet ${petOfMonth.name}, our Pet of the Month! Plus new arrivals and updates.`
    : "This week at Hart County Animal Rescue — new arrivals, happy tails, and more.";

  const donateHref = donatePageUrl(baseUrl);

  return (
    <Html>
      <Head>
        <title>Weekly Digest — Hart County Animal Rescue</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <EmailHeader baseUrl={baseUrl} />

          <DonateSection
            baseUrl={baseUrl}
            variant="inline"
            description="Give today to fund food, vaccines, and medical care for animals in Hart County."
            buttonText="Donate"
          />

          {/* Pet of the Month or generic hero */}
          {petOfMonth ? (
            <PetOfMonth
              name={petOfMonth.name}
              imageUrl={petOfMonth.imageUrl}
              description={petOfMonth.description}
              slug={petOfMonth.slug}
              baseUrl={baseUrl}
            />
          ) : (
            <Section style={styles.section}>
              <Text style={styles.heroText}>
                Here&apos;s what&apos;s been happening at the rescue this week.
              </Text>
              <div style={styles.heroDonate}>
                <Link href={donateHref} style={styles.heroDonateLink}>
                  Donate now →
                </Link>
              </div>
            </Section>
          )}

          <DonateSection
            baseUrl={baseUrl}
            variant="card"
            kicker="Direct impact"
            title="Your donation makes a difference"
            description="One-time gifts and $25/month memberships keep our shelter running. It only takes a minute."
            buttonText="Give securely"
          />

          {/* Recently Adopted */}
          {recentlyAdopted.length > 0 && (
            <Section style={styles.section}>
              <Text style={styles.sectionHeading}>Happy Tails!</Text>
              <div style={{ textAlign: "center" }}>
                {recentlyAdopted.map((pet) => (
                  <div
                    key={pet.name}
                    style={{
                      display: "inline-block",
                      margin: "0 8px 12px",
                      textAlign: "center",
                    }}
                  >
                    <PetCard
                      name={pet.name}
                      imageUrl={pet.imageUrl}
                      baseUrl={baseUrl}
                    />
                    <span style={styles.adoptedBadge}>Adopted!</span>
                  </div>
                ))}
              </div>
              <DonateSection
                baseUrl={baseUrl}
                variant="inline"
                description="Celebrate these wins by helping the next animal off the street."
                buttonText="Donate"
              />
            </Section>
          )}

          <DonateSection
            baseUrl={baseUrl}
            variant="ribbon"
            kicker="Premier giving"
            title="Stand with Hart County animals"
            description="Join neighbors who chip in each week—your support keeps tails wagging and bellies full."
            buttonText="Donate now"
          />

          {/* New Arrivals */}
          {newArrivals.length > 0 && (
            <Section style={styles.section}>
              <Text style={styles.sectionHeading}>New Arrivals</Text>
              <div style={{ textAlign: "center" }}>
                {newArrivals.map((pet) => (
                  <PetCard
                    key={pet.slug}
                    name={pet.name}
                    imageUrl={pet.imageUrl}
                    ageCategory={pet.ageCategory}
                    size={pet.size}
                    slug={pet.slug}
                    baseUrl={baseUrl}
                  />
                ))}
              </div>
            </Section>
          )}

          <DonateSection
            baseUrl={baseUrl}
            variant="card"
            kicker="Every dollar counts"
            title="Ready to give?"
            description="Visit our donate page to choose an amount or start a monthly membership in a few taps."
            buttonText="Open donate page"
          />

          {/* Monthly Shoutout */}
          {monthlyDonorFirstNames.length > 0 && (
            <MonthlyShoutout donorFirstNames={monthlyDonorFirstNames} />
          )}

          <DonateSection
            baseUrl={baseUrl}
            variant="inline"
            description="Prefer to give later? Bookmark our donate page—same secure link, whenever you&apos;re ready."
            buttonText="Donate"
          />

          {/* Footer */}
          <EmailFooter
            unsubscribeUrl={unsubscribeUrl}
            baseUrl={baseUrl}
          />
        </Container>
      </Body>
    </Html>
  );
}

WeeklyDigest.PreviewProps = defaultProps;
