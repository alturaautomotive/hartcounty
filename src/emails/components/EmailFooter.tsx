import { Container, Link, Text, Hr } from "@react-email/components";

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "24px",
    backgroundColor: "#FAF7F2",
    textAlign: "center" as const,
  },
  hr: {
    borderColor: "#E5E7EB",
    margin: "0 0 24px",
  },
  orgName: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#1A4F8A",
    margin: "0 0 4px",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  orgDetails: {
    fontSize: "12px",
    color: "#9CA3AF",
    margin: "0 0 16px",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  unsubscribe: {
    fontSize: "12px",
    color: "#9CA3AF",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  unsubscribeLink: {
    color: "#6B7280",
    textDecoration: "underline",
  },
};

interface EmailFooterProps {
  unsubscribeUrl: string;
}

export function EmailFooter({ unsubscribeUrl }: EmailFooterProps) {
  return (
    <Container style={styles.container}>
      <Hr style={styles.hr} />
      <Text style={styles.orgName}>Hart County Animal Rescue</Text>
      <Text style={styles.orgDetails}>
        501(c)(3) &middot; Hartwell, GA
      </Text>
      <Text style={styles.unsubscribe}>
        <Link href={unsubscribeUrl} style={styles.unsubscribeLink}>
          Unsubscribe
        </Link>{" "}
        from future emails
      </Text>
    </Container>
  );
}
