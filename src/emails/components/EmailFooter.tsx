import { Container, Hr, Link, Text } from "@react-email/components";
import { donatePageUrl, emailTheme } from "../emailTheme";

const sans = { fontFamily: emailTheme.fontSans };

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "24px 8px 8px",
    textAlign: "center" as const,
  },
  hr: {
    borderColor: "rgba(251, 191, 36, 0.35)",
    margin: "0 0 20px",
  },
  donateLine: {
    ...sans,
    fontSize: "14px",
    fontWeight: 700,
    margin: "0 0 16px",
  },
  donateLink: {
    ...sans,
    color: emailTheme.amber700,
    fontWeight: 900,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    textDecoration: "none",
  },
  orgName: {
    ...sans,
    fontSize: "14px",
    fontWeight: 800,
    color: emailTheme.slate950,
    margin: "0 0 4px",
  },
  orgDetails: {
    ...sans,
    fontSize: "12px",
    color: emailTheme.textSubtle,
    margin: "0 0 16px",
  },
  unsubscribe: {
    ...sans,
    fontSize: "12px",
    color: emailTheme.textSubtle,
  },
  unsubscribeLink: {
    color: emailTheme.textMuted,
    textDecoration: "underline",
  },
};

interface EmailFooterProps {
  unsubscribeUrl: string;
  baseUrl?: string;
}

export function EmailFooter({ unsubscribeUrl, baseUrl = "" }: EmailFooterProps) {
  const donateHref = donatePageUrl(baseUrl);

  return (
    <Container style={styles.container}>
      <Hr style={styles.hr} />
      <Text style={styles.donateLine}>
        <Link href={donateHref} style={styles.donateLink}>
          Donate
        </Link>
        {" · "}
        <span style={{ color: emailTheme.textMuted, fontWeight: 600 }}>
          Support our 501(c)(3) mission
        </span>
      </Text>
      <Text style={styles.orgName}>Hart County Animal Rescue</Text>
      <Text style={styles.orgDetails}>501(c)(3) · Hartwell, GA</Text>
      <Text style={styles.unsubscribe}>
        <Link href={unsubscribeUrl} style={styles.unsubscribeLink}>
          Unsubscribe
        </Link>{" "}
        from future emails
      </Text>
    </Container>
  );
}
