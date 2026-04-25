import type { Pet } from "@prisma/client";

const DOMAIN = "hcars.org";
const BRAND = "Hart County Animal Rescue";

export function metaAvailability(pet: Pet): string {
  return pet.status === "available" ? "in stock" : "out of stock";
}

export function metaCondition(_pet: Pet): string {
  return "new";
}

export function metaPrice(pet: Pet): string {
  let amt = pet.adoptionFee ?? pet.price ?? 1.0;
  amt = Math.max(1.0, amt);
  return `${amt.toFixed(2)} USD`;
}

export function metaTitle(pet: Pet): string {
  return `${pet.name} – ${pet.ageCategory ?? ""} ${pet.sex ?? ""} ${pet.species ?? ""} ${pet.breed ?? ""}`.trim();
}

export function metaDescription(pet: Pet): string {
  if (pet.description) {
    const stripped = pet.description
      .replace(/<[^>]*>/g, "")
      .replace(/(https?:\/\/[^\s]+)/g, "")
      .trim();
    if (stripped.length > 0) return stripped;
  }

  const traits: string[] = [];
  if (pet.goodWithKids) traits.push("kids");
  if (pet.goodWithDogs) traits.push("dogs");
  if (pet.goodWithCats) traits.push("cats");
  const traitStr = traits.length > 0 ? ` Good with: ${traits.join(", ")}.` : "";
  return `${metaTitle(pet)}.${traitStr}`;
}

export function metaLink(pet: Pet): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? `https://${DOMAIN}`;
  return `${base}/pets/${pet.slug}`;
}

export function metaImageLink(pet: Pet): string | null {
  if (!pet.imageUrl) return null;
  try {
    const url = new URL(pet.imageUrl);
    if (url.protocol === "https:" && url.hostname.endsWith(DOMAIN)) {
      return pet.imageUrl;
    }
  } catch {
    // invalid URL
  }
  return null;
}

function mapAgeGroup(ageCategory: string | null): string {
  if (!ageCategory) return "adult";
  const lower = ageCategory.toLowerCase();
  if (lower === "puppy" || lower === "kitten") return "newborn";
  return "adult";
}

export interface MetaRow {
  id: string;
  title: string;
  description: string;
  availability: string;
  condition: string;
  price: string;
  link: string;
  image_link: string;
  brand: string;
  product_type: string;
  google_product_category: string;
  age_group: string;
  gender: string;
  color: string;
  custom_label_0: string;
  custom_label_1: string;
  custom_label_2: string;
  custom_label_3: string;
  status: string;
}

export function metaRow(pet: Pet): MetaRow | null {
  const title = metaTitle(pet);
  const description = metaDescription(pet);
  const price = metaPrice(pet);
  const link = metaLink(pet);
  const imageLink = metaImageLink(pet);

  // Validate link domain
  try {
    const linkUrl = new URL(link);
    if (!linkUrl.hostname.endsWith(DOMAIN)) {
      console.warn(`Skipped pet ${pet.id}: link domain invalid (${linkUrl.hostname})`);
      return null;
    }
  } catch {
    console.warn(`Skipped pet ${pet.id}: invalid link URL`);
    return null;
  }

  // Validate required fields
  if (!pet.id || !title) {
    console.warn(`Skipped pet ${pet.id}: missing required id or title`);
    return null;
  }

  // Build traits summary
  const traits: string[] = [];
  if (pet.goodWithKids) traits.push("good with kids: true");
  if (pet.goodWithDogs) traits.push("good with dogs: true");
  if (pet.goodWithCats) traits.push("good with cats: true");

  return {
    id: pet.id,
    title,
    description,
    availability: metaAvailability(pet),
    condition: metaCondition(pet),
    price,
    link,
    image_link: imageLink ?? "",
    brand: BRAND,
    product_type: `Pets > ${pet.species ?? "Pet"} > ${pet.ageCategory ?? "Unknown"}`,
    google_product_category: "Animals & Pet Supplies > Live Animals",
    age_group: mapAgeGroup(pet.ageCategory),
    gender: pet.sex ?? "",
    color: pet.color ?? "",
    custom_label_0: pet.species ?? "",
    custom_label_1: pet.breed ?? "",
    custom_label_2: pet.size ?? "",
    custom_label_3: traits.join(", "),
    status: pet.status,
  };
}
