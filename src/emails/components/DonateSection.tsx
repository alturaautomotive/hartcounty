import { Button, Link, Section, Text } from "@react-email/components";
import { donatePageUrl, emailTheme } from "../emailTheme";

const sans = { fontFamily: emailTheme.fontSans };

const styles = {
  card: {
    ...sans,
    textAlign: "center" as const,
    padding: "28px 24px",
    backgroundColor: emailTheme.surface,
    borderRadius: "16px",
    margin: "0 0 24px",
    border: `1px solid ${emailTheme.borderAmber}`,
    boxShadow: "0 12px 40px rgba(15, 23, 42, 0.06)",
  },
  ribbon: {
    ...sans,
    textAlign: "center" as const,
    padding: "28px 20px",
    backgroundColor: emailTheme.slate950,
    borderRadius: "16px",
    margin: "0 0 24px",
  },
  inlineWrap: {
    ...sans,
    textAlign: "center" as const,
    padding: "16px 12px 8px",
    margin: "0 0 16px",
  },
  kicker: {
    ...sans,
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
    color: emailTheme.amber700,
    margin: "0 0 10px",
  },
  kickerLight: {
    ...sans,
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
    color: emailTheme.amber200,
    margin: "0 0 10px",
  },
  title: {
    ...sans,
    fontSize: "22px",
    fontWeight: 900,
    letterSpacing: "-0.02em",
    color: emailTheme.slate950,
    margin: "0 0 10px",
    lineHeight: "1.2",
  },
  titleLight: {
    ...sans,
    fontSize: "22px",
    fontWeight: 900,
    letterSpacing: "-0.02em",
    color: "#ffffff",
    margin: "0 0 10px",
    lineHeight: "1.2",
  },
  body: {
    ...sans,
    fontSize: "15px",
    lineHeight: "1.65",
    color: emailTheme.textMuted,
    margin: "0 0 22px",
  },
  bodyLight: {
    ...sans,
    fontSize: "15px",
    lineHeight: "1.65",
    color: "#cbd5e1",
    margin: "0 0 22px",
  },
  buttonPrimary: {
    ...sans,
    backgroundColor: emailTheme.amber400,
    color: emailTheme.slate950,
    borderRadius: "9999px",
    padding: "14px 28px",
    fontSize: "13px",
    fontWeight: 900,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    textDecoration: "none",
    display: "inline-block",
    boxShadow: "0 10px 30px rgba(251, 191, 36, 0.35)",
  },
  inlineText: {
    ...sans,
    fontSize: "14px",
    lineHeight: "1.6",
    color: emailTheme.textMuted,
    margin: "0 0 12px",
  },
  inlineLink: {
    ...sans,
    fontSize: "13px",
    fontWeight: 900,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: emailTheme.amber700,
    textDecoration: "none",
  },
};

export type DonateSectionVariant = "card" | "ribbon" | "inline";

interface DonateSectionProps {
  baseUrl: string;
  variant: DonateSectionVariant;
  title?: string;
  description?: string;
  buttonText?: string;
  kicker?: string;
}

export function DonateSection({
  baseUrl,
  variant,
  title,
  description,
  buttonText = "Donate now",
  kicker,
}: DonateSectionProps) {
  const href = donatePageUrl(baseUrl);

  if (variant === "inline") {
    return (
      <Section style={styles.inlineWrap}>
        <Text style={styles.inlineText}>
          {description ??
            "Your gift funds vaccines, food, and medical care for animals in Hart County."}{" "}
          <Link href={href} style={styles.inlineLink}>
            {buttonText} →
          </Link>
        </Text>
      </Section>
    );
  }

  if (variant === "ribbon") {
    return (
      <Section style={styles.ribbon}>
        {kicker != null && kicker !== "" && (
          <Text style={styles.kickerLight}>{kicker}</Text>
        )}
        <Text style={styles.titleLight}>
          {title ?? "Help us save more lives"}
        </Text>
        <Text style={styles.bodyLight}>
          {description ??
            "Every dollar goes directly to rescue, medical care, and rehoming. Tap below to give in seconds."}
        </Text>
        <Button href={href} style={styles.buttonPrimary}>
          {buttonText}
        </Button>
      </Section>
    );
  }

  return (
    <Section style={styles.card}>
      {kicker != null && kicker !== "" && (
        <Text style={styles.kicker}>{kicker}</Text>
      )}
      <Text style={styles.title}>{title ?? "Support our rescue"}</Text>
      <Text style={styles.body}>
        {description ??
          "Choose a one-time gift or monthly membership on our secure donate page. Thank you for standing with Hart County animals."}
      </Text>
      <Button href={href} style={styles.buttonPrimary}>
        {buttonText}
      </Button>
    </Section>
  );
}
