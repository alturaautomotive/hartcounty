import type { Pet } from "@prisma/client";

const DOMAIN = "hcars.org";
const BRAND = "Hart County Animal Rescue";

export function metaAvailability(pet: Pet): string {
  return pet.status.toLowerCase() === "available" ? "in stock" : "out of stock";
}

export function metaCondition(_pet: Pet): string {
  return "used";
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
  return `https://${DOMAIN}/pets/${pet.slug}`;
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

  // Validate link protocol
  try {
    const linkUrl = new URL(link);
    if (linkUrl.protocol !== "https:") {
      console.warn(`Skipped pet ${pet.id} (${pet.name || pet.slug}): non-HTTPS link`);
      return null;
    }
  } catch {
    console.warn(`Skipped pet ${pet.id} (${pet.name || pet.slug}): invalid link URL`);
    return null;
  }

  // Validate required fields
  if (!pet.id || !title) {
    console.warn(`Skipped pet ${pet.id} (${pet.name || pet.slug}): missing required id or title`);
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

/* ------------------------------------------------------------------ */
/*  Meta Catalog Batch API                                            */
/* ------------------------------------------------------------------ */

type MetaChange = {
  id: string;
  data?: Record<string, string>;
  method: "CREATE" | "UPDATE" | "DELETE";
};

type BatchResult = { success: boolean; errors?: unknown[] };

const GRAPH_API_VERSION = "v20.0";

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function updateMetaBatch(
  catalogId: string,
  accessToken: string,
  changes: MetaChange[],
): Promise<BatchResult> {
  const META_ROW_KEYS: ReadonlySet<string> = new Set<keyof MetaRow>([
    "id", "title", "description", "availability", "condition", "price",
    "link", "image_link", "brand", "product_type", "google_product_category",
    "age_group", "gender", "color", "custom_label_0", "custom_label_1",
    "custom_label_2", "custom_label_3", "status",
  ]);

  const validationErrors: unknown[] = [];

  const valid = changes.filter((c) => {
    if (!c.id) {
      validationErrors.push("Skipped batch item: missing id");
      console.warn("Skipped batch item: missing id");
      return false;
    }
    if (c.data) {
      const invalidKeys = Object.keys(c.data).filter((k) => !META_ROW_KEYS.has(k));
      if (invalidKeys.length > 0) {
        const msg = `Skipped batch item ${c.id}: invalid data keys: ${invalidKeys.join(", ")}`;
        validationErrors.push(msg);
        console.warn(msg);
        return false;
      }
    }
    return true;
  });

  if (valid.length === 0) {
    return validationErrors.length > 0
      ? { success: false, errors: validationErrors }
      : { success: true };
  }

  const payload = {
    item_type: "PRODUCT_ITEM",
    requests: valid.map((c) => ({
      method: c.method,
      data: c.data ?? { id: c.id },
    })),
  };

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${encodeURIComponent(catalogId)}/items_batch?access_token=${encodeURIComponent(accessToken)}`;

  let response: Response | undefined;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status < 500) break;
      if (attempt === 0) await delay(1000);
    } catch (err) {
      console.error("Meta batch fetch error:", err);
      if (attempt === 0) await delay(1000);
    }
  }

  if (!response) {
    return { success: false, errors: ["Network error after retry"] };
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error(`Meta batch API error ${response.status}: ${text}`);
    return { success: false, errors: [{ status: response.status, body: text }] };
  }

  const json = await response.json();
  const handles: { status?: string; errors?: unknown[] }[] =
    json.handles ?? [];

  const errors: unknown[] = [];
  for (const h of handles) {
    if (h.errors?.length) errors.push(...h.errors);
  }

  const success =
    handles.length > 0 &&
    handles.every((h) => h.status === "Completed" && !h.errors?.length);

  if (!success) {
    console.error("Meta batch incomplete:", JSON.stringify(errors));
  }

  return { success, errors: errors.length > 0 ? errors : undefined };
}

export async function updateMetaItem(
  catalogId: string,
  accessToken: string,
  data: Record<string, string>,
): Promise<BatchResult> {
  return updateMetaBatch(catalogId, accessToken, [
    { id: data.id, method: "UPDATE", data },
  ]);
}

export async function deleteMetaItem(
  catalogId: string,
  accessToken: string,
  id: string,
): Promise<BatchResult> {
  return updateMetaBatch(catalogId, accessToken, [
    { id, method: "DELETE", data: { id } },
  ]);
}
