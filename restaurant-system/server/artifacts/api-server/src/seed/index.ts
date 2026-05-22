import mongoose from "mongoose";
import { seedCategories } from "./categories.seed.js";
import { seedMenuItems } from "./menu.seed.js";
import { seedOffers } from "./offers.seed.js";
import { seedTables } from "./tables.seed.js";

async function runSeed() {
  const uri = process.env["MONGO_URI"];
  if (!uri) throw new Error("MONGO_URI required");
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
  await seedCategories();
  await seedMenuItems();
  await seedOffers();
  await seedTables();
  await mongoose.disconnect();
  console.log("Seeding complete!");
}

runSeed().catch((err) => {
  console.error(err);
  process.exit(1);
});
