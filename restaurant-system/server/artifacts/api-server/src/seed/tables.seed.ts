import Table from "../models/Table.js";

export async function seedTables() {
  await Table.deleteMany({});
  const tables = Array.from({ length: 15 }, (_, i) => ({
    tableNumber: i + 1,
    capacity: i < 5 ? 2 : i < 10 ? 4 : 6,
    status: "available",
    occupancy: 0,
    reserved: false,
  }));
  const docs = await Table.insertMany(tables);
  console.log(`Seeded ${docs.length} tables`);
}
