import { Button, Container, Section, Text } from "@react-email/components";

const styles = {
  section: {
    textAlign: "center" as const,
    padding: "24px",
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    margin: "0 0 24px",
  },
  heading: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#1A4F8A",
    margin: "0 0 8px",
    fontFamily: "'Georgia', serif",
  },
  text: {
    fontSize: "14px",
    color: "#4B5563",
    lineHeight: "1.6",
    margin: "0 0 20px",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  button: {
    backgroundColor: "#F5A623",
    color: "#FFFFFF",
    borderRadius: "6px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: 700,
    textDecoration: "none",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
};

interface DonationCTAProps {
  baseUrl: string;
}

export function DonationCTA({ baseUrl }: DonationCTAProps) {
  return (
    <Section style={styles.section}>
      <Text style={styles.heading}>Help Us Save More Lives</Text>
      <Text style={styles.text}>
        Every dollar goes directly to medical care, food, and shelter for our
        animals. Your generosity makes rescue possible.
      </Text>
      <Container>
        <Button href={`${baseUrl}/donate`} style={styles.button}>
          Donate Now
        </Button>
      </Container>
    </Section>
  );
}
