import { Button, Container, Img, Section, Text } from "@react-email/components";
import { donatePageUrl, emailTheme, siteOrigin } from "../emailTheme";

const sans = { fontFamily: emailTheme.fontSans };

const styles = {
  section: {
    ...sans,
    textAlign: "center" as const,
    padding: "28px 24px",
    backgroundColor: emailTheme.surface,
    borderRadius: "16px",
    margin: "0 0 24px",
    border: `1px solid ${emailTheme.borderAmber}`,
    boxShadow: "0 12px 40px rgba(15, 23, 42, 0.05)",
  },
  badge: {
    ...sans,
    fontSize: "11px",
    fontWeight: 800,
    color: emailTheme.amber700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.22em",
    margin: "0 0 10px",
  },
  image: {
    borderRadius: "16px",
    objectFit: "cover" as const,
    margin: "0 auto 16px",
  },
  name: {
    ...sans,
    fontSize: "24px",
    fontWeight: 900,
    letterSpacing: "-0.02em",
    color: emailTheme.slate950,
    margin: "0 0 10px",
  },
  description: {
    ...sans,
    fontSize: "15px",
    color: emailTheme.textMuted,
    lineHeight: "1.65",
    margin: "0 0 22px",
  },
  row: {
    textAlign: "center" as const,
  },
  buttonPrimary: {
    ...sans,
    backgroundColor: emailTheme.amber400,
    color: emailTheme.slate950,
    borderRadius: "9999px",
    padding: "14px 26px",
    fontSize: "13px",
    fontWeight: 900,
    letterSpacing: "0.12em",
    textDecoration: "none",
    display: "inline-block",
    marginRight: "10px",
    marginBottom: "10px",
    boxShadow: "0 10px 30px rgba(251, 191, 36, 0.35)",
  },
  buttonGhost: {
    ...sans,
    backgroundColor: emailTheme.slate950,
    color: "#ffffff",
    borderRadius: "9999px",
    padding: "14px 26px",
    fontSize: "13px",
    fontWeight: 900,
    letterSpacing: "0.12em",
    textDecoration: "none",
    display: "inline-block",
    marginBottom: "10px",
  },
};

interface PetOfMonthProps {
  name: string;
  imageUrl: string;
  description: string;
  slug: string;
  baseUrl: string;
}

export function PetOfMonth({
  name,
  imageUrl,
  description,
  slug,
  baseUrl,
}: PetOfMonthProps) {
  const bookHref = `${siteOrigin(baseUrl)}/book/${slug}`;
  const donateHref = donatePageUrl(baseUrl);

  return (
    <Section style={styles.section}>
      <Text style={styles.badge}>Pet of the month</Text>
      <Img
        src={imageUrl}
        width="280"
        height="280"
        alt={name}
        style={styles.image}
      />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.description}>{description}</Text>
      <Container style={styles.row}>
        <Button href={bookHref} style={styles.buttonPrimary}>
          Meet {name}
        </Button>
        <Button href={donateHref} style={styles.buttonGhost}>
          Donate
        </Button>
      </Container>
    </Section>
  );
}
