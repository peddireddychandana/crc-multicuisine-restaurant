import Offer from "../models/Offer.js";

export async function seedOffers() {
  await Offer.deleteMany({});

  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + 2);

  const offers = [
    {
      title: "Weekend Family Feast",
      description: "Get 20% off on orders above ₹1000 every weekend. Perfect for family dining!",
      originalPrice: 1000,
      discountedPrice: 800,
      discountPercentage: 20,
      startDate: now,
      endDate,
      isFeatured: true,
      isActive: true,
    },
    {
      title: "Biryani Bonanza",
      description: "Order any two biryanis and get a complimentary Mojito of your choice.",
      originalPrice: 700,
      discountedPrice: 580,
      discountPercentage: 17,
      startDate: now,
      endDate,
      isFeatured: true,
      isActive: true,
    },
    {
      title: "Happy Hours Special",
      description: "15% off on all beverages and desserts between 3 PM – 6 PM daily.",
      originalPrice: 300,
      discountedPrice: 255,
      discountPercentage: 15,
      startDate: now,
      endDate,
      isFeatured: false,
      isActive: true,
    },
  ];

  const docs = await Offer.insertMany(offers);
  console.log(`Seeded ${docs.length} offers`);
}
