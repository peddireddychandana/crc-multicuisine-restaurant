import MenuItem from "../models/MenuItem.js";
import Category from "../models/Category.js";

export async function seedMenuItems() {
  const categories = await Category.find();
  const catMap: Record<string, string> = {};
  for (const c of categories) catMap[c.slug] = c._id.toString();

  await MenuItem.deleteMany({});

  const items = [
    // 🥣 SOUPS
    { name: "Chicken Clear Soup", slug: "chicken-clear-soup", description: "Light and delicate chicken broth", category: catMap["soups"], price: 170, isVeg: false, isBestseller: false, spicyLevel: "mild", preparationTime: 10, calories: 120, tags: ["soup", "chicken", "clear"] },
    { name: "Chicken Dragon Soup", slug: "chicken-dragon-soup", description: "Spicy dragon-style soup with fiery flavors", category: catMap["soups"], price: 170, isVeg: false, isBestseller: true, spicyLevel: "hot", preparationTime: 12, calories: 140, tags: ["soup", "spicy", "dragon"] },
    { name: "Chicken Hot & Sour Soup", slug: "chicken-hot-sour-soup", description: "Classic hot and sour with chicken", category: catMap["soups"], price: 170, isVeg: false, isBestseller: false, spicyLevel: "hot", preparationTime: 12, calories: 130, tags: ["soup", "hot-sour", "chinese"] },
    { name: "Chicken Lemon Coriander Soup", slug: "chicken-lemon-coriander-soup", description: "Refreshing lemon-infused soup with chicken", category: catMap["soups"], price: 170, isVeg: false, isBestseller: false, spicyLevel: "mild", preparationTime: 10, calories: 110, tags: ["soup", "lemon", "refreshing"] },
    { name: "Chicken Manchow Soup", slug: "chicken-manchow-soup", description: "Indo-Chinese manchow with crispy noodles", category: catMap["soups"], price: 170, isVeg: false, isBestseller: true, spicyLevel: "medium", preparationTime: 12, calories: 150, tags: ["soup", "manchow", "indo-chinese"] },

    // 🥗 VEG STARTERS
    { name: "Baby Corn Manchurian", slug: "baby-corn-manchurian", description: "Crispy baby corn in tangy Manchurian sauce", category: catMap["veg-starters"], price: 250, isVeg: true, isBestseller: false, spicyLevel: "medium", preparationTime: 15, calories: 320, tags: ["veg", "manchurian", "indo-chinese"] },
    { name: "Babycorn 65", slug: "babycorn-65", description: "South Indian style spicy babycorn 65", category: catMap["veg-starters"], price: 260, isVeg: true, isBestseller: false, spicyLevel: "hot", preparationTime: 15, calories: 340, tags: ["veg", "65", "spicy"] },
    { name: "Butter Garlic Babycorn", slug: "butter-garlic-babycorn", description: "Tender babycorn sauteed in rich butter garlic", category: catMap["veg-starters"], price: 290, isVeg: true, isBestseller: false, spicyLevel: "mild", preparationTime: 14, calories: 380, tags: ["veg", "butter-garlic", "babycorn"] },
    { name: "Butter Garlic Mushroom", slug: "butter-garlic-mushroom", description: "Juicy mushrooms in aromatic butter garlic sauce", category: catMap["veg-starters"], price: 290, isVeg: true, isBestseller: true, spicyLevel: "mild", preparationTime: 14, calories: 360, tags: ["veg", "butter-garlic", "mushroom"] },
    { name: "Chilli Babycorn", slug: "chilli-babycorn", description: "Indo-Chinese chilli babycorn with peppers", category: catMap["veg-starters"], price: 260, isVeg: true, isBestseller: false, spicyLevel: "hot", preparationTime: 14, calories: 330, tags: ["veg", "chilli", "indo-chinese"] },
    { name: "Chilli Gobi", slug: "chilli-gobi", description: "Crispy cauliflower in spicy chilli sauce", category: catMap["veg-starters"], price: 250, isVeg: true, isBestseller: true, spicyLevel: "hot", preparationTime: 14, calories: 310, tags: ["veg", "chilli", "gobi"] },
    { name: "Hong Kong Gobi", slug: "hong-kong-gobi", description: "Cauliflower in Hong Kong style sauce", category: catMap["veg-starters"], price: 280, isVeg: true, isBestseller: false, spicyLevel: "medium", preparationTime: 15, calories: 340, tags: ["veg", "hong-kong", "gobi"] },
    { name: "Mushroom 65", slug: "mushroom-65", description: "Spicy South Indian style mushroom 65", category: catMap["veg-starters"], price: 290, isVeg: true, isBestseller: false, spicyLevel: "hot", preparationTime: 14, calories: 330, tags: ["veg", "65", "mushroom"] },
    { name: "Mushroom Manchurian", slug: "mushroom-manchurian", description: "Mushroom in classic Manchurian gravy", category: catMap["veg-starters"], price: 290, isVeg: true, isBestseller: false, spicyLevel: "medium", preparationTime: 15, calories: 340, tags: ["veg", "manchurian", "mushroom"] },
    { name: "Paneer 65", slug: "paneer-65", description: "Crispy paneer cubes marinated in spiced yogurt", category: catMap["veg-starters"], price: 320, isVeg: true, isBestseller: true, spicyLevel: "medium", preparationTime: 15, calories: 400, tags: ["veg", "65", "paneer"] },
    { name: "Paneer Majestic", slug: "paneer-majestic", description: "Premium paneer in rich masala with cashews", category: catMap["veg-starters"], price: 340, isVeg: true, isBestseller: true, spicyLevel: "medium", preparationTime: 16, calories: 450, tags: ["veg", "paneer", "majestic"] },
    { name: "Crispy Corn", slug: "crispy-corn", description: "Golden crispy corn kernels with herbs", category: catMap["veg-starters"], price: 260, isVeg: true, isBestseller: true, spicyLevel: "mild", preparationTime: 12, calories: 380, tags: ["veg", "crispy", "corn"] },

    // 🍗 NON-VEG STARTERS
    { name: "Chicken 65", slug: "chicken-65", description: "Iconic spicy South Indian fried chicken", category: catMap["non-veg-starters"], price: 320, isVeg: false, isBestseller: true, spicyLevel: "hot", preparationTime: 18, calories: 480, tags: ["chicken", "65", "spicy"] },
    { name: "Chicken 555", slug: "chicken-555", description: "Fiery five-spice marinated crispy chicken", category: catMap["non-veg-starters"], price: 340, isVeg: false, isBestseller: false, spicyLevel: "hot", preparationTime: 18, calories: 500, tags: ["chicken", "555", "spicy"] },
    { name: "Chicken Majestic", slug: "chicken-majestic", description: "Premium chicken in rich royal masala", category: catMap["non-veg-starters"], price: 360, isVeg: false, isBestseller: true, spicyLevel: "medium", preparationTime: 20, calories: 520, tags: ["chicken", "majestic", "premium"] },
    { name: "Chicken Manchurian", slug: "chicken-manchurian", description: "Classic Indo-Chinese Manchurian chicken", category: catMap["non-veg-starters"], price: 350, isVeg: false, isBestseller: false, spicyLevel: "medium", preparationTime: 18, calories: 510, tags: ["chicken", "manchurian", "indo-chinese"] },
    { name: "Chicken Lollipop", slug: "chicken-lollipop", description: "Frenched chicken wings in fiery coating", category: catMap["non-veg-starters"], price: 340, isVeg: false, isBestseller: true, spicyLevel: "hot", preparationTime: 20, calories: 490, tags: ["chicken", "lollipop", "crispy"] },
    { name: "Chicken Drumsticks", slug: "chicken-drumsticks", description: "Juicy drumsticks marinated in signature spices", category: catMap["non-veg-starters"], price: 360, isVeg: false, isBestseller: false, spicyLevel: "medium", preparationTime: 22, calories: 560, tags: ["chicken", "drumsticks", "grilled"] },
    { name: "Kalmi Chicken Kabab", slug: "kalmi-chicken-kabab", description: "Tender half-leg marinated in aromatic spices", category: catMap["non-veg-starters"], price: 420, isVeg: false, isBestseller: true, spicyLevel: "medium", preparationTime: 25, calories: 580, tags: ["chicken", "kabab", "tandoor"] },
    { name: "Red Charcoal Chicken Kabab", slug: "red-charcoal-chicken-kabab", description: "Smoky red charcoal-grilled kabab pieces", category: catMap["non-veg-starters"], price: 440, isVeg: false, isBestseller: true, spicyLevel: "medium", preparationTime: 25, calories: 600, tags: ["chicken", "kabab", "charcoal"] },
    { name: "Mint Mustard Chicken", slug: "mint-mustard-chicken", description: "Herb-marinated chicken in fresh mint mustard", category: catMap["non-veg-starters"], price: 420, isVeg: false, isBestseller: false, spicyLevel: "mild", preparationTime: 22, calories: 540, tags: ["chicken", "mint", "mustard"] },
    { name: "Kaju Nut Chicken", slug: "kaju-nut-chicken", description: "Premium chicken with roasted cashew coating", category: catMap["non-veg-starters"], price: 390, isVeg: false, isBestseller: false, spicyLevel: "medium", preparationTime: 20, calories: 620, tags: ["chicken", "kaju", "premium"] },
    { name: "Chicken Tikka", slug: "chicken-tikka", description: "Classic tandoor-grilled marinated chicken cubes", category: catMap["non-veg-starters"], price: 420, isVeg: false, isBestseller: true, spicyLevel: "medium", preparationTime: 25, calories: 540, tags: ["chicken", "tikka", "tandoor"] },
    { name: "Chicken Tandoori", slug: "chicken-tandoori", description: "Whole chicken marinated in tandoori masala", category: catMap["non-veg-starters"], price: 480, isVeg: false, isBestseller: true, spicyLevel: "medium", preparationTime: 30, calories: 640, tags: ["chicken", "tandoori", "grill"] },
    { name: "Chicken Pepper Fry", slug: "chicken-pepper-fry", description: "Bold black pepper chicken dry fry", category: catMap["non-veg-starters"], price: 370, isVeg: false, isBestseller: false, spicyLevel: "hot", preparationTime: 18, calories: 500, tags: ["chicken", "pepper", "dry-fry"] },
    { name: "Dragon Chicken", slug: "dragon-chicken", description: "Fiery dragon-style crispy chicken", category: catMap["non-veg-starters"], price: 360, isVeg: false, isBestseller: true, spicyLevel: "extra_hot", preparationTime: 18, calories: 510, tags: ["chicken", "dragon", "spicy"] },

    // 🍛 BIRYANIS
    { name: "Chicken Dum Biryani", slug: "chicken-dum-biryani", description: "Slow-cooked dum biryani with tender chicken", category: catMap["biryanis"], price: 280, isVeg: false, isBestseller: true, spicyLevel: "medium", preparationTime: 35, calories: 680, tags: ["biryani", "chicken", "dum"] },
    { name: "Chicken Dilkush Biryani", slug: "chicken-dilkush-biryani", description: "Special heart-warming biryani with aromatic spices", category: catMap["biryanis"], price: 320, isVeg: false, isBestseller: true, spicyLevel: "medium", preparationTime: 35, calories: 700, tags: ["biryani", "chicken", "dilkush"] },
    { name: "Chicken Tikka Biryani", slug: "chicken-tikka-biryani", description: "Biryani loaded with smoky tikka chicken", category: catMap["biryanis"], price: 340, isVeg: false, isBestseller: true, spicyLevel: "medium", preparationTime: 35, calories: 720, tags: ["biryani", "chicken", "tikka"] },
    { name: "Chicken Fry Piece Biryani", slug: "chicken-fry-piece-biryani", description: "Biryani with crispy fried chicken pieces", category: catMap["biryanis"], price: 340, isVeg: false, isBestseller: false, spicyLevel: "medium", preparationTime: 35, calories: 740, tags: ["biryani", "chicken", "fry-piece"] },
    { name: "Chicken Boneless Biryani", slug: "chicken-boneless-biryani", description: "Tender boneless chicken in fragrant basmati", category: catMap["biryanis"], price: 360, isVeg: false, isBestseller: true, spicyLevel: "medium", preparationTime: 35, calories: 700, tags: ["biryani", "chicken", "boneless"] },
    { name: "Mutton Biryani", slug: "mutton-biryani", description: "Slow-cooked mutton in dum style biryani", category: catMap["biryanis"], price: 420, isVeg: false, isBestseller: true, spicyLevel: "hot", preparationTime: 45, calories: 780, tags: ["biryani", "mutton", "dum"] },
    { name: "Special Family Pack Biryani", slug: "special-family-pack-biryani", description: "XL family portion with mixed chicken pieces", category: catMap["biryanis"], price: 899, isVeg: false, isBestseller: true, spicyLevel: "medium", preparationTime: 45, calories: 1500, tags: ["biryani", "family-pack", "special"] },

    // 🍜 FRIED RICE & NOODLES
    { name: "Veg Fried Rice", slug: "veg-fried-rice", description: "Indo-Chinese fried rice with fresh vegetables", category: catMap["fried-rice-noodles"], price: 220, isVeg: true, isBestseller: false, spicyLevel: "mild", preparationTime: 14, calories: 420, tags: ["fried-rice", "veg", "indo-chinese"] },
    { name: "Egg Fried Rice", slug: "egg-fried-rice", description: "Classic fried rice with scrambled egg", category: catMap["fried-rice-noodles"], price: 240, isVeg: false, isBestseller: false, spicyLevel: "mild", preparationTime: 14, calories: 450, tags: ["fried-rice", "egg", "classic"] },
    { name: "Chicken Fried Rice", slug: "chicken-fried-rice", description: "Wok-tossed fried rice with chicken", category: catMap["fried-rice-noodles"], price: 280, isVeg: false, isBestseller: true, spicyLevel: "medium", preparationTime: 15, calories: 520, tags: ["fried-rice", "chicken", "wok"] },
    { name: "Schezwan Chicken Fried Rice", slug: "schezwan-chicken-fried-rice", description: "Fiery Schezwan sauce chicken fried rice", category: catMap["fried-rice-noodles"], price: 320, isVeg: false, isBestseller: true, spicyLevel: "extra_hot", preparationTime: 16, calories: 540, tags: ["fried-rice", "chicken", "schezwan"] },
    { name: "Veg Noodles", slug: "veg-noodles", description: "Stir-fried noodles with fresh vegetables", category: catMap["fried-rice-noodles"], price: 220, isVeg: true, isBestseller: false, spicyLevel: "mild", preparationTime: 14, calories: 400, tags: ["noodles", "veg", "indo-chinese"] },
    { name: "Egg Noodles", slug: "egg-noodles", description: "Tossed noodles with egg", category: catMap["fried-rice-noodles"], price: 240, isVeg: false, isBestseller: false, spicyLevel: "mild", preparationTime: 14, calories: 430, tags: ["noodles", "egg", "classic"] },
    { name: "Chicken Noodles", slug: "chicken-noodles", description: "Wok noodles with chicken strips", category: catMap["fried-rice-noodles"], price: 280, isVeg: false, isBestseller: true, spicyLevel: "medium", preparationTime: 15, calories: 500, tags: ["noodles", "chicken", "wok"] },
    { name: "Mixed Noodles", slug: "mixed-noodles", description: "Chef special mixed noodles with egg and chicken", category: catMap["fried-rice-noodles"], price: 340, isVeg: false, isBestseller: true, spicyLevel: "medium", preparationTime: 16, calories: 560, tags: ["noodles", "mixed", "special"] },

    // 🌯 SHAWARMA
    { name: "CRC Special Shawarma Plate", slug: "crc-special-shawarma-plate", description: "Signature shawarma plate with garlic sauce and fries", category: catMap["shawarma"], price: 260, isVeg: false, isBestseller: true, spicyLevel: "medium", preparationTime: 15, calories: 560, tags: ["shawarma", "signature", "plate"] },
    { name: "Chicken Shawarma Roll", slug: "chicken-shawarma-roll", description: "Freshly rolled chicken shawarma wrap", category: catMap["shawarma"], price: 180, isVeg: false, isBestseller: true, spicyLevel: "medium", preparationTime: 12, calories: 450, tags: ["shawarma", "roll", "wrap"] },
    { name: "Rumali Shawarma", slug: "rumali-shawarma", description: "Shawarma wrapped in thin rumali roti", category: catMap["shawarma"], price: 220, isVeg: false, isBestseller: true, spicyLevel: "medium", preparationTime: 13, calories: 480, tags: ["shawarma", "rumali", "special"] },

    // 🍰 DESSERTS
    { name: "Brownie with Ice Cream", slug: "brownie-with-ice-cream", description: "Warm chocolate brownie with vanilla ice cream scoop", category: catMap["desserts"], price: 220, isVeg: true, isBestseller: true, spicyLevel: "mild", preparationTime: 10, calories: 550, tags: ["dessert", "brownie", "ice-cream"] },
    { name: "Death By Chocolate", slug: "death-by-chocolate", description: "Intense multi-layer chocolate indulgence", category: catMap["desserts"], price: 260, isVeg: true, isBestseller: true, spicyLevel: "mild", preparationTime: 8, calories: 720, tags: ["dessert", "chocolate", "indulgent"] },

    // 🍦 ICE CREAMS
    { name: "Vanilla Ice Cream", slug: "vanilla-ice-cream", description: "Classic creamy vanilla ice cream", category: catMap["ice-creams"], price: 120, isVeg: true, isBestseller: false, spicyLevel: "mild", preparationTime: 3, calories: 250, tags: ["ice-cream", "vanilla", "classic"] },
    { name: "Chocolate Ice Cream", slug: "chocolate-ice-cream", description: "Rich dark chocolate ice cream", category: catMap["ice-creams"], price: 140, isVeg: true, isBestseller: false, spicyLevel: "mild", preparationTime: 3, calories: 300, tags: ["ice-cream", "chocolate", "rich"] },
    { name: "Butterscotch Ice Cream", slug: "butterscotch-ice-cream", description: "Sweet caramel butterscotch ice cream", category: catMap["ice-creams"], price: 140, isVeg: true, isBestseller: false, spicyLevel: "mild", preparationTime: 3, calories: 320, tags: ["ice-cream", "butterscotch", "sweet"] },
    { name: "Putu Ice Cream", slug: "putu-ice-cream", description: "Traditional putu with creamy ice cream", category: catMap["ice-creams"], price: 220, isVeg: true, isBestseller: true, spicyLevel: "mild", preparationTime: 5, calories: 400, tags: ["ice-cream", "putu", "traditional"] },
    { name: "Sundae Special", slug: "sundae-special", description: "Layered ice cream sundae with toppings", category: catMap["ice-creams"], price: 260, isVeg: true, isBestseller: true, spicyLevel: "mild", preparationTime: 5, calories: 520, tags: ["ice-cream", "sundae", "special"] },

    // 🥤 MOJITOS
    { name: "Orange Mint Mojito", slug: "orange-mint-mojito", description: "Fresh orange juice with mint and soda", category: catMap["mojitos"], price: 180, isVeg: true, isBestseller: true, spicyLevel: "mild", preparationTime: 5, calories: 90, tags: ["mojito", "orange", "mint"] },
    { name: "Blue Lagoon Mojito", slug: "blue-lagoon-mojito", description: "Blue curacao flavored tropical mojito", category: catMap["mojitos"], price: 190, isVeg: true, isBestseller: false, spicyLevel: "mild", preparationTime: 5, calories: 110, tags: ["mojito", "blue", "tropical"] },
    { name: "Virgin Mojito", slug: "virgin-mojito", description: "Classic lime mint refresher", category: catMap["mojitos"], price: 170, isVeg: true, isBestseller: true, spicyLevel: "mild", preparationTime: 4, calories: 80, tags: ["mojito", "virgin", "classic"] },
    { name: "Watermelon Mojito", slug: "watermelon-mojito", description: "Fresh watermelon with mint and soda", category: catMap["mojitos"], price: 190, isVeg: true, isBestseller: false, spicyLevel: "mild", preparationTime: 5, calories: 95, tags: ["mojito", "watermelon", "fresh"] },

    // 🥛 DRINKS
    { name: "Oreo Milkshake", slug: "oreo-milkshake", description: "Thick creamy Oreo cookies milkshake", category: catMap["drinks"], price: 220, isVeg: true, isBestseller: true, spicyLevel: "mild", preparationTime: 6, calories: 480, tags: ["milkshake", "oreo", "creamy"] },
    { name: "Chocolate Milkshake", slug: "chocolate-milkshake", description: "Rich chocolate thick shake", category: catMap["drinks"], price: 220, isVeg: true, isBestseller: false, spicyLevel: "mild", preparationTime: 5, calories: 450, tags: ["milkshake", "chocolate", "rich"] },
    { name: "Strawberry Milkshake", slug: "strawberry-milkshake", description: "Fresh strawberry flavored milkshake", category: catMap["drinks"], price: 220, isVeg: true, isBestseller: false, spicyLevel: "mild", preparationTime: 5, calories: 430, tags: ["milkshake", "strawberry", "fresh"] },
    { name: "Soft Drinks", slug: "soft-drinks", description: "Assorted chilled soft drinks", category: catMap["drinks"], price: 60, isVeg: true, isBestseller: false, spicyLevel: "mild", preparationTime: 2, calories: 150, tags: ["drink", "soft-drink", "chilled"] },
  ];

  const docs = await MenuItem.insertMany(items);
  console.log(`Seeded ${docs.length} menu items`);
}
