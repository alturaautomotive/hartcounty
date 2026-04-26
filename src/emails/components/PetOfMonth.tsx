import { Button, Container, Img, Section, Text } from "@react-email/components";

const styles = {
  section: {
    textAlign: "center" as const,
    padding: "24px",
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    margin: "0 0 24px",
  },
  badge: {
    fontSize: "11px",
    fontWeight: 800,
    color: "#F5A623",
    textTransform: "uppercase" as const,
    letterSpacing: "0.12em",
    margin: "0 0 8px",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  image: {
    borderRadius: "12px",
    objectFit: "cover" as const,
    margin: "0 auto 16px",
  },
  name: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#1A4F8A",
    margin: "0 0 8px",
    fontFamily: "'Georgia', serif",
  },
  description: {
    fontSize: "14px",
    color: "#4B5563",
    lineHeight: "1.6",
    margin: "0 0 20px",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  button: {
    backgroundColor: "#E26D5C",
    color: "#FFFFFF",
    borderRadius: "6px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: 700,
    textDecoration: "none",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
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
  return (
    <Section style={styles.section}>
      <Text style={styles.badge}>Pet of the Month</Text>
      <Img
        src={imageUrl}
        width="280"
        height="280"
        alt={name}
        style={styles.image}
      />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.description}>{description}</Text>
      <Container>
        <Button href={`${baseUrl}/book/${slug}`} style={styles.button}>
          Meet {name}
        </Button>
      </Container>
    </Section>
  );
}
