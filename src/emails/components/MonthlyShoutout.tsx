import { Section, Text } from "@react-email/components";

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
  subtitle: {
    fontSize: "13px",
    color: "#6B7280",
    margin: "0 0 12px",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  names: {
    fontSize: "14px",
    color: "#4B5563",
    lineHeight: "1.8",
    margin: "0",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
};

interface MonthlyShoutoutProps {
  donorFirstNames: string[];
}

export function MonthlyShoutout({ donorFirstNames }: MonthlyShoutoutProps) {
  return (
    <Section style={styles.section}>
      <Text style={styles.heading}>Thank You, Donors!</Text>
      <Text style={styles.subtitle}>
        This month&apos;s generous supporters:
      </Text>
      <Text style={styles.names}>{donorFirstNames.join(" \u00B7 ")}</Text>
    </Section>
  );
}
