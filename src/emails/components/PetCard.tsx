import { Img, Link, Text } from "@react-email/components";

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
    fontSize: "16px",
    fontWeight: 700,
    color: "#1A4F8A",
    margin: "8px 0 2px",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  details: {
    fontSize: "12px",
    color: "#6B7280",
    margin: "0 0 6px",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  link: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#E26D5C",
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

  return (
    <div style={styles.container}>
      <Img
        src={imageUrl || `${baseUrl}/placeholder-pet.png`}
        width="200"
        height="200"
        alt={name}
        style={styles.image}
      />
      <Text style={styles.name}>{name}</Text>
      {details && <Text style={styles.details}>{details}</Text>}
      {slug && (
        <Link href={`${baseUrl}/book/${slug}`} style={styles.link}>
          Meet {name} &rarr;
        </Link>
      )}
    </div>
  );
}
