import { Section, Text } from "@react-email/components";
import { emailTheme } from "../emailTheme";

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
  heading: {
    ...sans,
    fontSize: "20px",
    fontWeight: 900,
    letterSpacing: "-0.02em",
    color: emailTheme.slate950,
    margin: "0 0 8px",
  },
  subtitle: {
    ...sans,
    fontSize: "13px",
    color: emailTheme.textSubtle,
    margin: "0 0 12px",
  },
  names: {
    ...sans,
    fontSize: "14px",
    color: emailTheme.textMuted,
    lineHeight: "1.8",
    margin: "0",
  },
};

interface MonthlyShoutoutProps {
  donorFirstNames: string[];
}

export function MonthlyShoutout({ donorFirstNames }: MonthlyShoutoutProps) {
  return (
    <Section style={styles.section}>
      <Text style={styles.heading}>Thank you, donors!</Text>
      <Text style={styles.subtitle}>
        This month&apos;s generous supporters:
      </Text>
      <Text style={styles.names}>{donorFirstNames.join(" \u00B7 ")}</Text>
    </Section>
  );
}
