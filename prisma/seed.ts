import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import Papa from "papaparse";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL || "file:./dev.db",
});

// Hardcoded CSV data (mapped from PET-V2-TEST-Sheet1.csv format)
const csvData = `title,availability,breed,age,sex,size,weight,color,description,price,image
Buddy,Available,Labrador Retriever,Adult,Male,Large,65 lbs,Yellow,"Friendly and energetic Lab who loves to play fetch.",150,
Max,Available,German Shepherd,Young,Male,Large,70 lbs,Black and Tan,"Loyal and intelligent. Great with families.",200,
Bella,Adopted,Golden Retriever,Puppy,Female,Medium,35 lbs,Golden,"Sweet puppy looking for her forever home.",250,
Luna,Available,Beagle,Adult,Female,Medium,25 lbs,Tricolor,"Curious and merry. Loves long walks.",125,
Charlie,Available,Bulldog,Senior,Male,Medium,50 lbs,White and Brindle,"Calm and gentle. Perfect couch companion.",100,
Daisy,Available,Poodle Mix,Young,Female,Small,15 lbs,White,"Hypoallergenic and playful. Great for apartments.",175,
Rocky,Available,Boxer,Adult,Male,Large,60 lbs,Fawn,"Energetic and fun-loving. Needs an active family.",150,
Sadie,Available,Husky,Young,Female,Large,45 lbs,Gray and White,"Beautiful and spirited. Loves the outdoors.",200,
Cooper,Available,Dachshund,Adult,Male,Small,12 lbs,Red,"Loyal little guy with a big personality.",125,
Molly,Available,Border Collie Mix,Young,Female,Medium,40 lbs,Black and White,"Smart and eager to please. Very trainable.",175`;

const teamMembers = [
  {
    name: "Hart County Volunteers",
    role: "Rescue Team",
    bio: "The neighbors who answer calls, clean kennels, drive dogs, and keep tails wagging.",
    initials: "HC",
    sortOrder: 1,
  },
  {
    name: "Foster Coordinator",
    role: "Home Placement",
    bio: "Matches dogs with safe foster homes so they can decompress and get ready for adoption.",
    initials: "FC",
    sortOrder: 2,
  },
  {
    name: "Spay/Neuter Program Lead",
    role: "Community Care",
    bio: "Helps local families access affordable care before a small problem becomes a crisis.",
    initials: "SN",
    sortOrder: 3,
  },
  {
    name: "Adoption Volunteers",
    role: "Meet-and-Greets",
    bio: "Gets to know each dog and each family so every adoption starts with trust.",
    initials: "AD",
    sortOrder: 4,
  },
];

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  console.log("Seeding database...");

  const parsed = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
  });

  for (const row of parsed.data as Record<string, string>[]) {
    const name = row.title?.trim() || "Unknown";
    const slug = toSlug(name);
    const status =
      row.availability?.toLowerCase() === "adopted" ? "adopted" : "available";

    await prisma.pet.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        name,
        species: "dog",
        breed: row.breed?.trim() || null,
        ageCategory: row.age?.trim() || null,
        sex: row.sex?.trim() || null,
        size: row.size?.trim() || null,
        weight: row.weight?.trim() || null,
        color: row.color?.trim() || null,
        description: row.description?.trim() || null,
        status,
        price: row.price ? parseFloat(row.price) : null,
        imageUrl: row.image?.trim() || null,
        goodWithKids: false,
        goodWithDogs: false,
        goodWithCats: false,
        houseTrained: false,
        spayedNeutered: false,
        vaccinated: false,
        microchipped: false,
        energyLevel: "medium",
        specialNeeds: null,
        adoptionFee: row.price ? parseFloat(row.price) : null,
      },
    });

    console.log(`  Upserted pet: ${name} (${slug})`);
  }

  // Create sample admin user
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.adminUser.upsert({
    where: { email: "admin@hcars.org" },
    update: {
      role: "super_admin",
    },
    create: {
      email: "admin@hcars.org",
      passwordHash,
      name: "Admin",
      role: "super_admin",
    },
  });
  console.log("  Created admin user: admin@hcars.org (password: admin123)");

  for (const member of teamMembers) {
    await prisma.teamMember.upsert({
      where: { id: `seed-${member.initials.toLowerCase()}` },
      update: member,
      create: {
        id: `seed-${member.initials.toLowerCase()}`,
        ...member,
      },
    });
    console.log(`  Upserted team member: ${member.name}`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
