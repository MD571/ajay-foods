// ─── Shared Data Layer ────────────────────────────────────────────────────────
// Admin edits are stored in localStorage and read by all customer-facing pages.
// Each page falls back to DEFAULT_* constants if nothing is stored.

export interface AdminPackage {
  id: string
  tag: "VEG" | "NON-VEG"
  name: string
  tagline: string
  price: number
  popular: boolean
  ideal: string
  includes: string[]
  choiceGroups?: ChoiceGroup[]
  // Fixed visual styling — not editable by admin
  color: string
  lightColor: string
  textColor: string
  badgeColor: string
  image: string
  alt: string
}

export interface AdminMenuItem {
  id: string
  name: string
  diet: "veg" | "non-veg"
  price: number
  desc: string
  popular: boolean
  available: boolean
}

export interface AdminMenuSection {
  id: string
  label: string
  emoji: string
  desc: string
  items: AdminMenuItem[]
}

export interface AdminExtraItem {
  id: string
  name: string
  price: number
  diet: "veg" | "non-veg"
  emoji: string
  popular: boolean
  available: boolean
}

export interface AdminExtraCategory {
  id: string
  label: string
  emoji: string
  desc: string
  items: AdminExtraItem[]
}

export interface ChoiceGroup {
  id: string       // e.g. "dal", "iguru", "biryani"
  label: string    // e.g. "Dal (pick 1)"
  pick: number     // how many to pick
  options: string[]// the available choices
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────
const KEYS = {
  packages:   "ajayfoods_packages_v2",   // bumped: adds choiceGroups
  menu:       "ajayfoods_menu_v1",
  extras:     "ajayfoods_extras_v1",
  adminPin:   "ajayfoods_admin_pin",
}

// ─── Default Packages ─────────────────────────────────────────────────────────
export const DEFAULT_PACKAGES: AdminPackage[] = [
  {
    id: "veg-basic", tag: "VEG", name: "Veg Basic", tagline: "Simple & Wholesome",
    price: 100, popular: false, ideal: "Ideal for 50–200 guests",
    includes: ["White Rice (Unlimited)", "Sambar + Rasam + Curd", "1 Dal (Papu) — your choice", "1 Iguru / Vepudu — your choice", "1 Pachadi / Chutney — your choice", "1 Thalimpu (Stir-fry) — your choice", "Papad"],
    choiceGroups: [
      { id: "dal", label: "Dal / Papu (pick 1)", pick: 1, options: [
        "Kandi Pappu (Toor Dal)", "Pesara Pappu (Moong Dal)", "Senaga Pappu (Chana Dal)",
        "Tomato Pappu", "Dosakaya Papu (Yellow Cucumber Dal)", "Mudda Pappu (Plain Toor Dal)",
        "Palakura Pappu (Spinach Dal)", "Gongura Pappu (Sorrel Dal)",
      ]},
      { id: "iguru", label: "Iguru / Vepudu (pick 1)", pick: 1, options: [
        "Aloo Vepudu (Potato Stir-fry)", "Beans Vepudu", "Cabbage Vepudu",
        "Gutti Vankaya (Stuffed Brinjal)", "Bendakaya Vepudu (Okra)",
        "Beerakaya Vepudu (Ridge Gourd)", "Thotakura Vepudu (Amaranth)",
        "Anapakaya Vepudu (Bottle Gourd)", "Gummadikaya Vepudu (Pumpkin)",
        "Munagakaya Vepudu (Drumstick)",
      ]},
      { id: "pachadi", label: "Pachadi / Chutney (pick 1)", pick: 1, options: [
        "Gongura Pachadi", "Tomato Pachadi", "Coconut Chutney",
        "Perugu Pachadi (Curd Chutney)", "Peanut Chutney",
        "Allam Pachadi (Ginger Chutney)", "Vankaya Pachadi (Brinjal)",
        "Dosakaya Pachadi (Yellow Cucumber)",
      ]},
      { id: "thalimpu", label: "Thalimpu / Stir-fry (pick 1)", pick: 1, options: [
        "Aloo Thalimpu", "Beans Thalimpu", "Cabbage Vepudu",
        "Vankaya Vepudu (Brinjal)", "Goru Chikkudu Vepudu (Cluster Beans)",
        "Kakara Vepudu (Bitter Gourd)", "Sorakkaya Vepudu (Ash Gourd)",
      ]},
    ],
    color: "from-[#2d6a4f] to-[#40916c]", lightColor: "bg-[#d8f3dc]", textColor: "text-[#1b4332]",
    badgeColor: "bg-green-100 text-green-800",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80", alt: "Vegetarian thali",
  },
  {
    id: "veg-premium", tag: "VEG", name: "Veg Premium", tagline: "Rich & Flavourful",
    price: 140, popular: true, ideal: "Ideal for weddings & functions",
    includes: ["White Rice + Pulihora / Ghee Rice", "Sambar + Rasam + Curd", "2 Dals — your choice", "2 Iguru / Vepudu — your choice", "2 Pachadis / Chutneys — your choice", "2 Thalimpu (Stir-fries) — your choice", "1 Sweet Dish", "Papad"],
    choiceGroups: [
      { id: "dal", label: "Dal / Papu (pick 2)", pick: 2, options: [
        "Kandi Pappu (Toor Dal)", "Pesara Pappu (Moong Dal)", "Senaga Pappu (Chana Dal)",
        "Tomato Pappu", "Dosakaya Papu (Yellow Cucumber Dal)", "Mudda Pappu (Plain Toor Dal)",
        "Palakura Pappu (Spinach Dal)", "Gongura Pappu (Sorrel Dal)",
      ]},
      { id: "iguru", label: "Iguru / Vepudu (pick 2)", pick: 2, options: [
        "Aloo Vepudu (Potato Stir-fry)", "Beans Vepudu", "Cabbage Vepudu",
        "Gutti Vankaya (Stuffed Brinjal)", "Bendakaya Vepudu (Okra)",
        "Beerakaya Vepudu (Ridge Gourd)", "Thotakura Vepudu (Amaranth)",
        "Anapakaya Vepudu (Bottle Gourd)", "Gummadikaya Vepudu (Pumpkin)",
        "Munagakaya Vepudu (Drumstick)",
      ]},
      { id: "pachadi", label: "Pachadi / Chutney (pick 2)", pick: 2, options: [
        "Gongura Pachadi", "Tomato Pachadi", "Coconut Chutney",
        "Perugu Pachadi (Curd Chutney)", "Peanut Chutney",
        "Allam Pachadi (Ginger Chutney)", "Vankaya Pachadi (Brinjal)",
        "Dosakaya Pachadi (Yellow Cucumber)",
      ]},
      { id: "thalimpu", label: "Thalimpu / Stir-fry (pick 2)", pick: 2, options: [
        "Aloo Thalimpu", "Beans Thalimpu", "Cabbage Vepudu",
        "Vankaya Vepudu (Brinjal)", "Goru Chikkudu Vepudu (Cluster Beans)",
        "Kakara Vepudu (Bitter Gourd)", "Sorakkaya Vepudu (Ash Gourd)",
      ]},
    ],
    color: "from-[#e9c46a] to-[#f4a261]", lightColor: "bg-[#fff3cd]", textColor: "text-[#5c3d11]",
    badgeColor: "bg-yellow-100 text-yellow-800",
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80", alt: "Indian vegetarian spread",
  },
  {
    id: "non-veg-basic", tag: "NON-VEG", name: "Non-Veg Basic", tagline: "Classic Biryani Feast",
    price: 150, popular: false, ideal: "Ideal for 30–150 guests",
    includes: ["Biryani (7 variants to choose)", "Sambar", "Gongura Pachadi", "Perugu (Curd) Chutney", "Raita", "Plates & Service Included"],
    choiceGroups: [
      { id: "biryani", label: "Biryani Variant (pick 1)", pick: 1, options: [
        "Chicken Biryani — Ambur Dum Style", "Chicken Biryani — Hyderabadi Style",
        "Mutton Biryani", "Prawn Biryani", "Fish Biryani", "Egg Biryani", "Veg Biryani",
      ]},
    ],
    color: "from-[#8B4513] to-[#b5601e]", lightColor: "bg-[#fce8d8]", textColor: "text-[#4a1a05]",
    badgeColor: "bg-red-100 text-red-800",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80", alt: "Chicken biryani",
  },
  {
    id: "non-veg-premium", tag: "NON-VEG", name: "Non-Veg Premium", tagline: "Grand Celebration Feast",
    price: 180, popular: false, ideal: "Ideal for grand celebrations",
    includes: ["Biryani — your choice of variant", "Main Curry — your choice", "Sambar", "Gongura Pachadi + Curd Chutney", "Raita", "Plates & Service Included"],
    choiceGroups: [
      { id: "biryani", label: "Biryani Variant (pick 1)", pick: 1, options: [
        "Chicken Biryani — Ambur Dum Style", "Chicken Biryani — Hyderabadi Style",
        "Mutton Biryani", "Prawn Biryani", "Fish Biryani", "Egg Biryani", "Veg Biryani",
      ]},
      { id: "curry", label: "Main Curry (pick 1)", pick: 1, options: [
        "Chicken Curry", "Mutton Curry", "Gongura Chicken", "Gongura Mutton",
        "Fish Curry", "Prawn Curry", "Egg Masala",
      ]},
    ],
    color: "from-[#3d1a07] to-[#6b2d0f]", lightColor: "bg-[#f5ddd0]", textColor: "text-[#2a0f03]",
    badgeColor: "bg-red-100 text-red-800",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80", alt: "Indian non-veg feast",
  },
]

// ─── Default Menu Sections ────────────────────────────────────────────────────
export const DEFAULT_MENU_SECTIONS: AdminMenuSection[] = [
  {
    id: "rice-biryani", label: "Rice & Biryani", emoji: "🍛",
    desc: "Aromatic slow-cooked specialties — the heart of Telugu feasts",
    items: [
      { id: "ambur-biryani",  name: "Ambur Dum Biryani",   diet: "non-veg", price: 150, desc: "Slow-cooked dum biryani with whole spices and tender chicken",  popular: true,  available: true },
      { id: "mutton-biryani", name: "Mutton Biryani",       diet: "non-veg", price: 180, desc: "Rich, flavourful mutton biryani with fragrant basmati rice",     popular: true,  available: true },
      { id: "prawn-biryani",  name: "Prawn Biryani",        diet: "non-veg", price: 180, desc: "Coastal-style biryani with juicy prawns and aromatic spices",    popular: false, available: true },
      { id: "veg-biryani",    name: "Veg Biryani",          diet: "veg",     price: 80,  desc: "Mixed vegetable dum biryani with saffron and fried onions",      popular: true,  available: true },
      { id: "pulihora",       name: "Pulihora",              diet: "veg",     price: 15,  desc: "Tangy tamarind rice tempered with curry leaves and peanuts",     popular: false, available: true },
      { id: "ghee-rice",      name: "Ghee Rice",             diet: "veg",     price: 40,  desc: "Fragrant basmati rice cooked in pure ghee with whole spices",    popular: false, available: true },
      { id: "white-rice",     name: "White Rice",            diet: "veg",     price: 0,   desc: "Steamed plain rice — unlimited serving with any package",        popular: false, available: true },
    ],
  },
  {
    id: "curries", label: "Curries & Gravies", emoji: "🍲",
    desc: "Rich, slow-cooked gravies with authentic Andhra masalas",
    items: [
      { id: "mutton-curry",    name: "Mutton Curry",          diet: "non-veg", price: 150, desc: "Tender mutton pieces in a bold, spiced Andhra-style gravy",    popular: true,  available: true },
      { id: "gongura-mutton",  name: "Gongura Mutton",        diet: "non-veg", price: 160, desc: "Iconic mutton curry made with tangy sorrel leaves",            popular: true,  available: true },
      { id: "gongura-chicken", name: "Gongura Chicken",       diet: "non-veg", price: 110, desc: "Tangy chicken curry with the signature gongura punch",         popular: false, available: true },
      { id: "fish-curry",      name: "Fish Curry",            diet: "non-veg", price: 120, desc: "Coastal-style fish curry with fresh tamarind and spices",      popular: true,  available: true },
      { id: "prawn-curry",     name: "Prawn Curry",           diet: "non-veg", price: 150, desc: "Coconut-based prawn curry with curry leaves",                  popular: false, available: true },
      { id: "egg-curry",       name: "Egg Curry",             diet: "non-veg", price: 60,  desc: "Soft-boiled eggs in a rich, spiced onion-tomato gravy",        popular: false, available: true },
      { id: "paneer-butter",   name: "Paneer Butter Masala",  diet: "veg",     price: 90,  desc: "Creamy tomato-based gravy with soft paneer cubes",             popular: true,  available: true },
      { id: "dal-tadka",       name: "Dal Tadka",             diet: "veg",     price: 30,  desc: "Yellow lentils tempered with cumin, garlic, and dried chilli", popular: false, available: true },
      { id: "chana-masala",    name: "Chana Masala",          diet: "veg",     price: 45,  desc: "Spiced chickpea curry with tangy tomatoes and coriander",      popular: false, available: true },
      { id: "dosakaya-papu",   name: "Dosakaya Papu",         diet: "veg",     price: 15,  desc: "Comforting yellow cucumber dal — a Telugu home essential",     popular: false, available: true },
    ],
  },
  {
    id: "starters", label: "Starters & Snacks", emoji: "🍗",
    desc: "Crispy, flavourful bites to kick-start your event",
    items: [
      { id: "apollo-fish",     name: "Apollo Fish",       diet: "non-veg", price: 75,  desc: "Crispy fried fish tossed in aromatic spices and curry leaves",  popular: true,  available: true },
      { id: "chicken-fry",     name: "Chicken Fry",       diet: "non-veg", price: 75,  desc: "Marinated chicken fried to golden perfection",                  popular: true,  available: true },
      { id: "chicken-65",      name: "Chicken 65",        diet: "non-veg", price: 80,  desc: "Restaurant-style spicy deep-fried chicken",                     popular: true,  available: true },
      { id: "chicken-tikka",   name: "Chicken Tikka",     diet: "non-veg", price: 85,  desc: "Grilled chicken marinated in tandoori spices",                  popular: false, available: true },
      { id: "fish-fry",        name: "Fish Fry",          diet: "non-veg", price: 90,  desc: "Whole fish marinated in red masala and pan-fried crispy",       popular: true,  available: true },
      { id: "mutton-fry",      name: "Mutton Fry",        diet: "non-veg", price: 100, desc: "Dry-cooked mutton with whole spices",                           popular: false, available: true },
      { id: "prawn-fry",       name: "Prawn Fry",         diet: "non-veg", price: 120, desc: "Crispy fried prawns with lemon and pepper",                     popular: false, available: true },
      { id: "mirchi-bajji",    name: "Mirchi Bajji",      diet: "veg",     price: 25,  desc: "Stuffed green chilli fritters — an Andhra classic",            popular: true,  available: true },
      { id: "veg-pakora",      name: "Veg Pakora",        diet: "veg",     price: 30,  desc: "Crunchy mixed vegetable fritters in spiced gram flour batter", popular: false, available: true },
      { id: "paneer-tikka",    name: "Paneer Tikka",      diet: "veg",     price: 70,  desc: "Marinated paneer cubes grilled to a perfect char",             popular: true,  available: true },
      { id: "gobi-manchurian", name: "Gobi Manchurian",   diet: "veg",     price: 50,  desc: "Crispy cauliflower tossed in Indo-Chinese sauce",              popular: false, available: true },
    ],
  },
  {
    id: "sweets", label: "Sweets & Desserts", emoji: "🍮",
    desc: "Traditional Telugu sweets to complete the feast",
    items: [
      { id: "semya-payasam",  name: "Semya Payasam",  diet: "veg", price: 30, desc: "Creamy vermicelli pudding with cardamom and cashews",        popular: true,  available: true },
      { id: "rice-payasam",   name: "Rice Payasam",   diet: "veg", price: 30, desc: "Classic rice kheer with milk, sugar, and cardamom",         popular: false, available: true },
      { id: "bobbatlu",       name: "Bobbatlu",       diet: "veg", price: 25, desc: "Sweet flatbread stuffed with chana dal and jaggery",        popular: true,  available: true },
      { id: "gulab-jamun",    name: "Gulab Jamun",    diet: "veg", price: 25, desc: "Soft milk-solid dumplings soaked in rose-flavoured syrup",  popular: true,  available: true },
      { id: "pootharekulu",   name: "Pootharekulu",   diet: "veg", price: 30, desc: "Paper-thin rice wafer filled with jaggery and nuts",        popular: true,  available: true },
      { id: "suji-halwa",     name: "Suji Halwa",     diet: "veg", price: 25, desc: "Semolina pudding with ghee, dry fruits, and saffron",       popular: false, available: true },
      { id: "boondi-laddu",   name: "Boondi Laddu",   diet: "veg", price: 20, desc: "Besan pearls fried and bound with sugar syrup",             popular: false, available: true },
      { id: "medu-vada",      name: "Medu Vada",      diet: "veg", price: 20, desc: "Crispy savoury doughnuts served with chutney and sambar",   popular: true,  available: true },
    ],
  },
  {
    id: "thalimpu", label: "Thalimpu & Dal", emoji: "🥬",
    desc: "Traditional stir-fries and comforting lentil dishes",
    items: [
      { id: "aloo-thalimpu",   name: "Aloo Thalimpu",   diet: "veg", price: 15, desc: "Tempered potatoes with mustard seeds and curry leaves",   popular: false, available: true },
      { id: "beans-thalimpu",  name: "Beans Thalimpu",  diet: "veg", price: 15, desc: "Stir-fried beans with turmeric and coconut",              popular: false, available: true },
      { id: "cabbage-vepudu",  name: "Cabbage Vepudu",  diet: "veg", price: 15, desc: "Cabbage stir-fry with green chillies and curry leaves",   popular: false, available: true },
      { id: "kandi-pappu",     name: "Kandi Pappu",     diet: "veg", price: 15, desc: "Classic toor dal with tamarind and traditional tempering", popular: true, available: true },
      { id: "tomato-pappu",    name: "Tomato Pappu",    diet: "veg", price: 15, desc: "Tangy tomato dal with fresh coriander",                   popular: false, available: true },
    ],
  },
  {
    id: "pachadi", label: "Pachadi & Chutneys", emoji: "🫙",
    desc: "The soul of Telugu cuisine — bold chutneys and pickles",
    items: [
      { id: "gongura-pachadi", name: "Gongura Pachadi", diet: "veg", price: 0, desc: "Tangy sorrel leaf chutney — the pride of Andhra cuisine", popular: true,  available: true },
      { id: "tomato-pachadi",  name: "Tomato Pachadi",  diet: "veg", price: 0, desc: "Roasted tomato chutney with garlic and chilli",           popular: false, available: true },
      { id: "coconut-chutney", name: "Coconut Chutney", diet: "veg", price: 0, desc: "Fresh coconut chutney with green chilli and ginger",      popular: false, available: true },
      { id: "perugu-pachadi",  name: "Perugu Pachadi",  diet: "veg", price: 0, desc: "Creamy yoghurt chutney with cucumber and coriander",      popular: false, available: true },
      { id: "peanut-chutney",  name: "Peanut Chutney",  diet: "veg", price: 0, desc: "Roasted peanut chutney with red chillies",               popular: false, available: true },
    ],
  },
  {
    id: "beverages", label: "Beverages", emoji: "☕",
    desc: "Refreshing drinks to accompany the meal",
    items: [
      { id: "filter-coffee",  name: "Filter Coffee",    diet: "veg", price: 15, desc: "Traditional South Indian drip coffee with decoction",   popular: true,  available: true },
      { id: "buttermilk",     name: "Buttermilk",       diet: "veg", price: 10, desc: "Chilled spiced buttermilk — the perfect digestive",      popular: true,  available: true },
      { id: "masala-chai",    name: "Masala Chai",      diet: "veg", price: 10, desc: "Ginger and cardamom spiced tea with full-cream milk",    popular: false, available: true },
      { id: "sweet-lassi",    name: "Sweet Lassi",      diet: "veg", price: 20, desc: "Thick yoghurt-based drink with sugar and rose water",    popular: false, available: true },
      { id: "fresh-lime",     name: "Fresh Lime Juice", diet: "veg", price: 15, desc: "Freshly squeezed lime with sugar, salt, or soda",       popular: false, available: true },
      { id: "coconut-water",  name: "Tender Coconut",   diet: "veg", price: 30, desc: "Fresh coconut water served in the shell",               popular: false, available: true },
    ],
  },
]

// ─── Default Extra Categories (for /order page) ───────────────────────────────
export const DEFAULT_EXTRA_CATEGORIES: AdminExtraCategory[] = [
  {
    id: "starters", label: "Starters", emoji: "🍗", desc: "Perfect to serve at the start of your event",
    items: [
      { id: "apollo-fish",     name: "Apollo Fish",      price: 75,  diet: "non-veg", emoji: "🐟", popular: true,  available: true },
      { id: "chicken-fry",     name: "Chicken Fry",      price: 75,  diet: "non-veg", emoji: "🍗", popular: true,  available: true },
      { id: "chicken-65",      name: "Chicken 65",       price: 80,  diet: "non-veg", emoji: "🍗", popular: true,  available: true },
      { id: "chicken-tikka",   name: "Chicken Tikka",    price: 85,  diet: "non-veg", emoji: "🍢", popular: false, available: true },
      { id: "fish-fry",        name: "Fish Fry",         price: 90,  diet: "non-veg", emoji: "🐟", popular: true,  available: true },
      { id: "mutton-fry",      name: "Mutton Fry",       price: 100, diet: "non-veg", emoji: "🥩", popular: false, available: true },
      { id: "prawn-fry",       name: "Prawn Fry",        price: 120, diet: "non-veg", emoji: "🦐", popular: false, available: true },
      { id: "mirchi-bajji",    name: "Mirchi Bajji",     price: 25,  diet: "veg",     emoji: "🌶️",popular: true,  available: true },
      { id: "veg-pakora",      name: "Veg Pakora",       price: 30,  diet: "veg",     emoji: "🥙", popular: false, available: true },
      { id: "paneer-tikka",    name: "Paneer Tikka",     price: 70,  diet: "veg",     emoji: "🧀", popular: true,  available: true },
      { id: "gobi-manchurian", name: "Gobi Manchurian",  price: 50,  diet: "veg",     emoji: "🥦", popular: false, available: true },
    ],
  },
  {
    id: "curries", label: "Extra Curries", emoji: "🍲", desc: "Add rich gravies to your meal",
    items: [
      { id: "mutton-curry",    name: "Mutton Curry",         price: 150, diet: "non-veg", emoji: "🥘", popular: true,  available: true },
      { id: "gongura-mutton",  name: "Gongura Mutton",       price: 160, diet: "non-veg", emoji: "🍲", popular: true,  available: true },
      { id: "gongura-chicken", name: "Gongura Chicken",      price: 110, diet: "non-veg", emoji: "🍗", popular: false, available: true },
      { id: "fish-curry",      name: "Fish Curry",           price: 120, diet: "non-veg", emoji: "🐟", popular: true,  available: true },
      { id: "prawn-curry",     name: "Prawn Curry",          price: 150, diet: "non-veg", emoji: "🦐", popular: false, available: true },
      { id: "egg-curry",       name: "Egg Curry",            price: 60,  diet: "non-veg", emoji: "🥚", popular: false, available: true },
      { id: "paneer-butter",   name: "Paneer Butter Masala", price: 90,  diet: "veg",     emoji: "🧀", popular: true,  available: true },
      { id: "dal-tadka",       name: "Dal Tadka",            price: 30,  diet: "veg",     emoji: "🫕", popular: false, available: true },
      { id: "chana-masala",    name: "Chana Masala",         price: 45,  diet: "veg",     emoji: "🫘", popular: false, available: true },
    ],
  },
  {
    id: "sweets", label: "Sweets", emoji: "🍮", desc: "End the feast on a sweet note",
    items: [
      { id: "semya-payasam", name: "Semya Payasam", price: 30, diet: "veg", emoji: "🍮", popular: true,  available: true },
      { id: "rice-payasam",  name: "Rice Payasam",  price: 30, diet: "veg", emoji: "🍚", popular: false, available: true },
      { id: "bobbatlu",      name: "Bobbatlu",      price: 25, diet: "veg", emoji: "🫓", popular: true,  available: true },
      { id: "gulab-jamun",   name: "Gulab Jamun",   price: 25, diet: "veg", emoji: "🟤", popular: true,  available: true },
      { id: "pootharekulu",  name: "Pootharekulu",  price: 30, diet: "veg", emoji: "📜", popular: true,  available: true },
      { id: "suji-halwa",    name: "Suji Halwa",    price: 25, diet: "veg", emoji: "🥣", popular: false, available: true },
      { id: "boondi-laddu",  name: "Boondi Laddu",  price: 20, diet: "veg", emoji: "🟡", popular: false, available: true },
      { id: "medu-vada",     name: "Medu Vada",     price: 20, diet: "veg", emoji: "🍩", popular: true,  available: true },
    ],
  },
  {
    id: "rice", label: "Extra Rice", emoji: "🍛", desc: "More rice & biryani options",
    items: [
      { id: "mutton-biryani", name: "Mutton Biryani", price: 180, diet: "non-veg", emoji: "🍛", popular: true,  available: true },
      { id: "prawn-biryani",  name: "Prawn Biryani",  price: 180, diet: "non-veg", emoji: "🦐", popular: false, available: true },
      { id: "veg-biryani",    name: "Veg Biryani",    price: 80,  diet: "veg",     emoji: "🫕", popular: true,  available: true },
      { id: "pulihora",       name: "Pulihora",        price: 15,  diet: "veg",     emoji: "🍋", popular: false, available: true },
      { id: "ghee-rice",      name: "Ghee Rice",       price: 40,  diet: "veg",     emoji: "✨", popular: false, available: true },
    ],
  },
  {
    id: "beverages", label: "Beverages", emoji: "☕", desc: "Drinks & refreshments",
    items: [
      { id: "filter-coffee", name: "Filter Coffee",    price: 15, diet: "veg", emoji: "☕", popular: true,  available: true },
      { id: "buttermilk",    name: "Buttermilk",       price: 10, diet: "veg", emoji: "🥛", popular: true,  available: true },
      { id: "masala-chai",   name: "Masala Chai",      price: 10, diet: "veg", emoji: "🍵", popular: false, available: true },
      { id: "sweet-lassi",   name: "Sweet Lassi",      price: 20, diet: "veg", emoji: "🥤", popular: false, available: true },
      { id: "fresh-lime",    name: "Fresh Lime Juice", price: 15, diet: "veg", emoji: "🍋", popular: false, available: true },
      { id: "coconut-water", name: "Tender Coconut",   price: 30, diet: "veg", emoji: "🥥", popular: false, available: true },
    ],
  },
  {
    id: "service", label: "Service Add-ons", emoji: "🍃", desc: "Serving style & extras",
    items: [
      { id: "banana-leaf",    name: "Banana Leaf Service", price: 30, diet: "veg", emoji: "🍃", popular: true,  available: true },
      { id: "plates-service", name: "Disposable Plates",   price: 20, diet: "veg", emoji: "🍽️",popular: false, available: true },
      { id: "paan",           name: "Paan (Post-meal)",    price: 20, diet: "veg", emoji: "🌿", popular: false, available: true },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function safeWrite<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* quota exceeded */ }
}

// ─── Public API ───────────────────────────────────────────────────────────────
export const getPackages      = (): AdminPackage[]        => safeRead(KEYS.packages, DEFAULT_PACKAGES)
export const setPackages      = (v: AdminPackage[])       => safeWrite(KEYS.packages, v)

export const getMenuSections  = (): AdminMenuSection[]    => safeRead(KEYS.menu, DEFAULT_MENU_SECTIONS)
export const setMenuSections  = (v: AdminMenuSection[])   => safeWrite(KEYS.menu, v)

export const getExtraCategories = (): AdminExtraCategory[] => safeRead(KEYS.extras, DEFAULT_EXTRA_CATEGORIES)
export const setExtraCategories = (v: AdminExtraCategory[]) => safeWrite(KEYS.extras, v)

export const getAdminPin = (): string => safeRead<string>(KEYS.adminPin, "AJAY1234")
export const setAdminPin = (pin: string) => safeWrite(KEYS.adminPin, pin)

export const resetAllData = () => {
  if (typeof window === "undefined") return
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
}

// Count helpers
export const totalMenuItems  = (sections: AdminMenuSection[])    => sections.reduce((s, sec) => s + sec.items.length, 0)
export const totalExtraItems = (cats: AdminExtraCategory[])      => cats.reduce((s, c) => s + c.items.length, 0)
export const unavailableCount = (sections: AdminMenuSection[])   =>
  sections.reduce((s, sec) => s + sec.items.filter((i) => !i.available).length, 0)
