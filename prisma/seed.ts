import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import { readdirSync } from "fs";
import { join, resolve } from "path";

const dbPath = resolve(__dirname, "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const db = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const CATEGORIES = [
  { name: "T-Shirts", slug: "t-shirts", folder: "T-Shirts" },
  { name: "Hoodies", slug: "hoodies", folder: "Hoodies" },
  { name: "Sweaters", slug: "sweaters", folder: "Sweaters" },
  { name: "Golf T-Shirts", slug: "golf-t-shirts", folder: "Golf T-shirts" },
  { name: "Caps & Hats", slug: "caps-hats", folder: "Caps & Hats" },
  { name: "Bags", slug: "bags", folder: "Bags" },
  { name: "Mixed", slug: "mixed", folder: "Mixed" },
];

function getImages(folder: string): string[] {
  const dir = join(process.cwd(), "public", "images", "products");
  try {
    const all = readdirSync(dir);
    // Filter images that were in this folder based on the folder listing
    const sourceDir = join("/Users/siyandaedwana/Downloads/Netso", folder);
    try {
      const sourceFiles = readdirSync(sourceDir).map((f) => f.toLowerCase());
      return all
        .filter((f) => sourceFiles.includes(f.toLowerCase()))
        .map((f) => `/images/products/${f}`);
    } catch {
      return [];
    }
  } catch {
    return [];
  }
}

async function main() {
  console.log("Seeding database...");

  // Admin user
  const password = await bcrypt.hash("netso@admin2024", 10);
  await db.user.upsert({
    where: { email: "admin@netso.co.za" },
    update: {},
    create: {
      email: "admin@netso.co.za",
      password,
      name: "Netso Admin",
      role: "admin",
    },
  });
  console.log("✓ Admin user created");

  // Categories & Products
  for (const cat of CATEGORIES) {
    const category = await db.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug },
    });
    console.log(`✓ Category: ${cat.name}`);

    const images = getImages(cat.folder);
    console.log(`  Found ${images.length} images for ${cat.name}`);

    // Create one product per image (they can be updated later)
    let productIndex = 1;
    for (const imageUrl of images) {
      const productName = `${cat.name} Style ${productIndex}`;
      const slug = `${cat.slug}-style-${productIndex}-${Date.now()}-${productIndex}`;

      await db.product.create({
        data: {
          name: productName,
          slug,
          description: `Authentic Netso ${cat.name.toLowerCase()}. South African streetwear crafted with quality.`,
          price: 200,
          stock: 10,
          categoryId: category.id,
          featured: productIndex <= 2, // First 2 per category are featured
          images: { create: [{ url: imageUrl, order: 0 }] },
        },
      });
      productIndex++;
    }
    console.log(`  Created ${images.length} products`);
  }

  console.log("\n✅ Seed complete!");
  console.log("Admin login: admin@netso.co.za / netso@admin2024");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
