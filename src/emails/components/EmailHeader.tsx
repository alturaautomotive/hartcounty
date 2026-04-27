import { Container, Img, Text } from "@react-email/components";
import { emailTheme, siteOrigin } from "../emailTheme";

const sans = { fontFamily: emailTheme.fontSans };

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "32px 24px 20px",
    textAlign: "center" as const,
  },
  logo: {
    margin: "0 auto 16px",
    display: "block",
  },
  title: {
    ...sans,
    fontSize: "26px",
    fontWeight: 900,
    letterSpacing: "-0.03em",
    color: emailTheme.slate950,
    margin: "0 0 6px",
  },
  titleAccent: {
    color: emailTheme.amber700,
  },
  subtitle: {
    ...sans,
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
    color: emailTheme.textSubtle,
    margin: "0",
  },
};

interface EmailHeaderProps {
  baseUrl: string;
}

/** Bump when replacing `public/logo.png` so clients don’t reuse a stale cached image. */
const LOGO_CACHE_KEY = "shelter-seal-2026";

export function EmailHeader({ baseUrl }: EmailHeaderProps) {
  const logoSrc = baseUrl.trim()
    ? `${siteOrigin(baseUrl)}/logo.png?v=${LOGO_CACHE_KEY}`
    : `/static/logo.png?v=${LOGO_CACHE_KEY}`;

  return (
    <Container style={styles.container}>
      <Img
        src={logoSrc}
        width="110"
        height="110"
        alt="Hart County Animal Rescue"
        style={styles.logo}
      />
      <Text style={styles.title}>
        Hart County{" "}
        <span style={styles.titleAccent}>Animal Rescue</span>
      </Text>
      <Text style={styles.subtitle}>Weekly digest</Text>
    </Container>
  );
}
