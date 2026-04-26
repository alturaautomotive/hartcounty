import { Container, Img, Text } from "@react-email/components";

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "32px 24px 24px",
    textAlign: "center" as const,
  },
  logo: {
    margin: "0 auto 16px",
  },
  title: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#1A4F8A",
    margin: "0 0 4px",
    fontFamily: "'Georgia', serif",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6B7280",
    margin: "0",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
};

interface EmailHeaderProps {
  baseUrl: string;
}

export function EmailHeader({ baseUrl }: EmailHeaderProps) {
  return (
    <Container style={styles.container}>
      <Img
        src={`${baseUrl}/logo.png`}
        width="80"
        height="80"
        alt="Hart County Animal Rescue"
        style={styles.logo}
      />
      <Text style={styles.title}>Hart County Animal Rescue</Text>
      <Text style={styles.subtitle}>Weekly Digest</Text>
    </Container>
  );
}
