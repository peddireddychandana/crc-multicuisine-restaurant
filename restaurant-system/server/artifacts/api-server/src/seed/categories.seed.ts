import Category from "../models/Category.js";

const categories = [
  { name: "Soups", slug: "soups", description: "Light and hearty soups to start your meal", sortOrder: 1 },
  { name: "Veg Starters", slug: "veg-starters", description: "Crispy and flavorful vegetarian appetizers", sortOrder: 2 },
  { name: "Non Veg Starters", slug: "non-veg-starters", description: "Irresistible chicken and meat starters", sortOrder: 3 },
  { name: "Biryanis", slug: "biryanis", description: "Aromatic rice dishes cooked with premium spices", sortOrder: 4 },
  { name: "Fried Rice & Noodles", slug: "fried-rice-noodles", description: "Wok-tossed Indo-Chinese classics", sortOrder: 5 },
  { name: "Shawarma", slug: "shawarma", description: "Street-style wraps and rolls", sortOrder: 6 },
  { name: "Desserts", slug: "desserts", description: "Indulgent sweet endings", sortOrder: 7 },
  { name: "Ice Creams", slug: "ice-creams", description: "Creamy frozen treats", sortOrder: 8 },
  { name: "Mojitos", slug: "mojitos", description: "Fresh and refreshing mocktails", sortOrder: 9 },
  { name: "Drinks", slug: "drinks", description: "Chilled beverages and milkshakes", sortOrder: 10 },
];

export async function seedCategories() {
  await Category.deleteMany({});
  const docs = await Category.insertMany(categories);
  console.log(`Seeded ${docs.length} categories`);
  return docs;
}
