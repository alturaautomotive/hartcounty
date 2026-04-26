import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { EmailHeader } from "./components/EmailHeader";
import { EmailFooter } from "./components/EmailFooter";
import { PetOfMonth } from "./components/PetOfMonth";
import { PetCard } from "./components/PetCard";
import { DonationCTA } from "./components/DonationCTA";
import { MonthlyShoutout } from "./components/MonthlyShoutout";

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
  weeklyDonorCount: number;
  weeklyDonationTotal: number;
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
  weeklyDonorCount: 12,
  weeklyDonationTotal: 1450,
  monthlyDonorFirstNames: ["Sarah", "Mike", "Jenny", "Tom", "Lisa"],
  unsubscribeUrl: "https://hcars.org/unsubscribe?token=preview",
  baseUrl: "https://hcars.org",
};

const styles = {
  body: {
    backgroundColor: "#FAF7F2",
    margin: "0",
    padding: "0",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "0 16px",
  },
  sectionHeading: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#1A4F8A",
    margin: "0 0 16px",
    textAlign: "center" as const,
    fontFamily: "'Georgia', serif",
  },
  section: {
    padding: "24px",
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    margin: "0 0 24px",
    textAlign: "center" as const,
  },
  statsRow: {
    width: "100%",
  },
  statColumn: {
    textAlign: "center" as const,
    padding: "16px",
  },
  statNumber: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#1A4F8A",
    margin: "0 0 4px",
    fontFamily: "'Georgia', serif",
  },
  statLabel: {
    fontSize: "12px",
    color: "#6B7280",
    margin: "0",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  adoptedBadge: {
    display: "inline-block" as const,
    backgroundColor: "#ECFDF5",
    color: "#065F46",
    fontSize: "11px",
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: "12px",
    margin: "4px 0 0",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  heroText: {
    fontSize: "16px",
    color: "#4B5563",
    lineHeight: "1.6",
    textAlign: "center" as const,
    margin: "0 0 24px",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
};

export default function WeeklyDigest({
  petOfMonth,
  recentlyAdopted = [],
  newArrivals = [],
  weeklyDonorCount = 0,
  weeklyDonationTotal = 0,
  monthlyDonorFirstNames = [],
  unsubscribeUrl = "",
  baseUrl = "",
}: WeeklyDigestProps) {
  const previewText = petOfMonth
    ? `Meet ${petOfMonth.name}, our Pet of the Month! Plus new arrivals and updates.`
    : "This week at Hart County Animal Rescue — new arrivals, happy tails, and more.";

  return (
    <Html>
      <Head>
        <title>Weekly Digest — Hart County Animal Rescue</title>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <EmailHeader baseUrl={baseUrl} />

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
            </Section>
          )}

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
            </Section>
          )}

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

          {/* Weekly Stats */}
          <Section style={styles.section}>
            <Text style={styles.sectionHeading}>This Week by the Numbers</Text>
            <Row style={styles.statsRow}>
              <Column style={styles.statColumn}>
                <Text style={styles.statNumber}>{weeklyDonorCount}</Text>
                <Text style={styles.statLabel}>Donors</Text>
              </Column>
              <Column style={styles.statColumn}>
                <Text style={styles.statNumber}>
                  ${weeklyDonationTotal.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Raised</Text>
              </Column>
              <Column style={styles.statColumn}>
                <Text style={styles.statNumber}>{newArrivals.length}</Text>
                <Text style={styles.statLabel}>New Arrivals</Text>
              </Column>
              <Column style={styles.statColumn}>
                <Text style={styles.statNumber}>
                  {recentlyAdopted.length}
                </Text>
                <Text style={styles.statLabel}>Adopted</Text>
              </Column>
            </Row>
          </Section>

          {/* Donation CTA */}
          <DonationCTA baseUrl={baseUrl} />

          {/* Monthly Shoutout */}
          {monthlyDonorFirstNames.length > 0 && (
            <MonthlyShoutout donorFirstNames={monthlyDonorFirstNames} />
          )}

          {/* Footer */}
          <EmailFooter unsubscribeUrl={unsubscribeUrl} />
        </Container>
      </Body>
    </Html>
  );
}

WeeklyDigest.PreviewProps = defaultProps;
