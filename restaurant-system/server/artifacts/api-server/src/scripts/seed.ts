import mongoose from "mongoose";
import User from "../models/User.js";
import Category from "../models/Category.js";
import MenuItem from "../models/MenuItem.js";
import Table from "../models/Table.js";
import Offer from "../models/Offer.js";

async function seed() {
  const uri = process.env["MONGO_URI"];
  if (!uri) throw new Error("MONGO_URI environment variable is required");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  // Seed admin user
  await User.deleteMany({});
  const admin = await User.create({
    name: "CRC Admin",
    email: "admin@crc.com",
    password: "password",
    role: "super_admin",
  });
  console.log(`Created admin user: ${admin.email}`);

  // Seed categories
  await Category.deleteMany({});
  const categories = await Category.insertMany([
    { name: "Biryani", slug: "biryani", description: "Aromatic rice dishes cooked with premium spices", sortOrder: 1 },
    { name: "Starters", slug: "starters", description: "Delicious appetizers and finger foods", sortOrder: 2 },
    { name: "Grills & BBQ", slug: "grills-bbq", description: "Char-grilled meats and tandoor specialties", sortOrder: 3 },
    { name: "Main Course", slug: "main-course", description: "Rich curries and gravies", sortOrder: 4 },
    { name: "Beverages", slug: "beverages", description: "Fresh mocktails and signature drinks", sortOrder: 5 },
    { name: "Desserts", slug: "desserts", description: "Indulgent sweet endings", sortOrder: 6 },
    { name: "Shawarma & Rolls", slug: "shawarma-rolls", description: "Street-style wraps and rolls", sortOrder: 7 },
  ]);
  const catMap: Record<string, string> = {};
  for (const c of categories) catMap[c.slug] = c._id.toString();
  console.log(`Seeded ${categories.length} categories`);

  // Seed menu items
  await MenuItem.deleteMany({});
  const items = await MenuItem.insertMany([
    { name: "Chicken Dilkush Biryani", slug: "chicken-dilkush-biryani", description: "Aromatic basmati rice layered with tender chicken pieces, slow-cooked with whole spices, saffron milk, and crispy fried onions.", category: catMap["biryani"], price: 320, isVeg: false, isBestseller: true, spicyLevel: "medium", preparationTime: 35, calories: 680, tags: ["signature", "rice", "biryani", "chicken"], ingredients: ["Basmati rice", "Chicken", "Saffron", "Fried onions", "Biryani masala", "Ghee"] },
    { name: "Chicken Majestic", slug: "chicken-majestic", description: "Crispy fried chicken tossed in a tangy, spicy curry leaf sauce.", category: catMap["starters"], price: 280, isVeg: false, isBestseller: true, spicyLevel: "hot", preparationTime: 20, calories: 520, tags: ["hyderabadi", "spicy", "starter"], ingredients: ["Chicken", "Curry leaves", "Ginger-garlic", "Green chillies", "Yogurt"] },
    { name: "Chicken 65", slug: "chicken-65", description: "Legendary Chennai-style deep-fried chicken marinated in fiery red spices.", category: catMap["starters"], price: 240, isVeg: false, isBestseller: false, spicyLevel: "hot", preparationTime: 18, calories: 480, tags: ["classic", "fried", "spicy"], ingredients: ["Chicken", "Red chilli", "Ginger", "Garlic", "Yogurt", "Cornflour"] },
    { name: "Kaju Nut Chicken", slug: "kaju-nut-chicken", description: "Succulent chicken cubes in a rich cashew nut gravy.", category: catMap["main-course"], price: 360, isVeg: false, isBestseller: false, spicyLevel: "mild", preparationTime: 25, calories: 620, tags: ["creamy", "cashew", "premium"], ingredients: ["Chicken", "Cashew nuts", "Cream", "Tomato", "Cardamom", "Saffron"] },
    { name: "Orange Mint Mojito", slug: "orange-mint-mojito", description: "Fresh-squeezed oranges, hand-crushed mint leaves with sparkling water.", category: catMap["beverages"], price: 120, isVeg: true, isBestseller: false, spicyLevel: "mild", preparationTime: 5, calories: 90, tags: ["mocktail", "refreshing", "citrus"], ingredients: ["Orange juice", "Mint", "Lime", "Sugar syrup", "Soda"] },
    { name: "Brownie with Ice Cream", slug: "brownie-with-ice-cream", description: "Warm dark chocolate fudge brownie with vanilla bean ice cream.", category: catMap["desserts"], price: 180, isVeg: true, isBestseller: true, spicyLevel: "mild", preparationTime: 10, calories: 550, tags: ["dessert", "chocolate", "bestseller"], ingredients: ["Dark chocolate", "Butter", "Eggs", "Vanilla ice cream"] },
    { name: "Kalmi Chicken Kabab", slug: "kalmi-chicken-kabab", description: "Tender chicken drumsticks marinated in cream, cheese, and spices, grilled in tandoor.", category: catMap["grills-bbq"], price: 340, isVeg: false, isBestseller: false, spicyLevel: "medium", preparationTime: 25, calories: 580, tags: ["tandoor", "kabab", "grill"], ingredients: ["Chicken drumsticks", "Cheese", "Cream", "Tandoori masala", "Lemon"] },
    { name: "Dragon Chicken", slug: "dragon-chicken", description: "Indo-Chinese crispy fried chicken tossed in fiery dragon sauce.", category: catMap["starters"], price: 300, isVeg: false, isBestseller: false, spicyLevel: "extra_hot", preparationTime: 20, calories: 510, tags: ["indo-chinese", "spicy", "crispy"], ingredients: ["Chicken", "Bell peppers", "Dragon sauce", "Spring onions", "Soy sauce"] },
    { name: "Chicken Tandoori", slug: "chicken-tandoori", description: "Half chicken marinated in tandoori masala, char-grilled in clay tandoor.", category: catMap["grills-bbq"], price: 390, isVeg: false, isBestseller: true, spicyLevel: "medium", preparationTime: 30, calories: 640, tags: ["tandoor", "classic", "grill"], ingredients: ["Whole chicken", "Yogurt", "Tandoori masala", "Lemon", "Mustard oil"] },
    { name: "CRC Special Shawarma Plate", slug: "crc-special-shawarma-plate", description: "Signature shawarma wrap with slow-roasted chicken, garlic sauce, pickled vegetables.", category: catMap["shawarma-rolls"], price: 220, isVeg: false, isBestseller: true, spicyLevel: "medium", preparationTime: 15, calories: 560, tags: ["signature", "shawarma", "wrap"], ingredients: ["Chicken", "Garlic sauce", "Pickled veggies", "Pita bread", "CRC spice mix"] },
    { name: "Death By Chocolate", slug: "death-by-chocolate", description: "Indulgent stack of brownie, hot fudge, chocolate ice cream, and chocolate shavings.", category: catMap["desserts"], price: 220, isVeg: true, isBestseller: false, spicyLevel: "mild", preparationTime: 8, calories: 720, tags: ["chocolate", "dessert", "indulgent"], ingredients: ["Chocolate brownie", "Chocolate ice cream", "Fudge sauce", "Choco chips"] },
    { name: "Blue Lagoon Mojito", slug: "blue-lagoon-mojito", description: "Electric-blue mocktail with blue curacao, lime, mint, and soda.", category: catMap["beverages"], price: 140, isVeg: true, isBestseller: true, spicyLevel: "mild", preparationTime: 5, calories: 110, tags: ["mocktail", "signature", "refreshing"], ingredients: ["Blue curacao syrup", "Lime", "Mint", "Soda", "Ice"] },
  ]);
  console.log(`Seeded ${items.length} menu items`);

  // Seed tables (1-15)
  await Table.deleteMany({});
  const tables = [];
  for (let i = 1; i <= 15; i++) {
    tables.push({ tableNumber: i, capacity: i <= 4 ? 2 : i <= 10 ? 4 : 6, status: "available" });
  }
  await Table.insertMany(tables);
  console.log(`Seeded ${tables.length} tables`);

  // Seed sample offer
  await Offer.deleteMany({});
  await Offer.create({
    title: "Weekend Special",
    description: "Get 20% off on all Biryani orders this weekend!",
    originalPrice: 500,
    discountedPrice: 400,
    discountPercentage: 20,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isFeatured: true,
    isActive: true,
  });
  console.log("Seeded offers");

  await mongoose.disconnect();
  console.log("Seeding complete!");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
