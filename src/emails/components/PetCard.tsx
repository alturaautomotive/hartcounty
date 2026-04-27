import { Img, Link, Text } from "@react-email/components";
import { emailTheme, siteOrigin } from "../emailTheme";

const sans = { fontFamily: emailTheme.fontSans };

const styles = {
  container: {
    display: "inline-block" as const,
    width: "200px",
    verticalAlign: "top" as const,
    margin: "0 8px 16px",
    textAlign: "center" as const,
  },
  image: {
    borderRadius: "12px",
    objectFit: "cover" as const,
  },
  name: {
    ...sans,
    fontSize: "16px",
    fontWeight: 800,
    color: emailTheme.slate950,
    margin: "8px 0 2px",
  },
  details: {
    ...sans,
    fontSize: "12px",
    color: emailTheme.textSubtle,
    margin: "0 0 6px",
  },
  link: {
    ...sans,
    fontSize: "13px",
    fontWeight: 800,
    color: emailTheme.amber700,
    textDecoration: "none",
  },
};

interface PetCardProps {
  name: string;
  imageUrl: string | null;
  ageCategory?: string | null;
  size?: string | null;
  slug?: string;
  baseUrl: string;
}

export function PetCard({
  name,
  imageUrl,
  ageCategory,
  size,
  slug,
  baseUrl,
}: PetCardProps) {
  const details = [ageCategory, size].filter(Boolean).join(" · ");
  const origin = siteOrigin(baseUrl);
  const placeholder = `${origin}/placeholder-pet.png`;

  return (
    <div style={styles.container}>
      <Img
        src={imageUrl || placeholder}
        width="200"
        height="200"
        alt={name}
        style={styles.image}
      />
      <Text style={styles.name}>{name}</Text>
      {details && <Text style={styles.details}>{details}</Text>}
      {slug && (
        <Link href={`${origin}/book/${slug}`} style={styles.link}>
          Meet {name} &rarr;
        </Link>
      )}
    </div>
  );
}
