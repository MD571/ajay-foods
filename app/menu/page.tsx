"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getMenuSections } from "../lib/siteData"

// ─── Menu Data ────────────────────────────────────────────────────────────────
const MENU_SECTIONS = [
  {
    id: "rice-biryani", label: "Rice & Biryani", emoji: "🍛",
    desc: "Aromatic slow-cooked specialties — the heart of Telugu feasts",
    items: [
      { name: "Ambur Dum Biryani",   diet: "non-veg" as const, price: 150, desc: "Slow-cooked dum biryani with whole spices and tender chicken",     popular: true  },
      { name: "Mutton Biryani",      diet: "non-veg" as const, price: 180, desc: "Rich, flavourful mutton biryani with fragrant basmati rice",        popular: true  },
      { name: "Prawn Biryani",       diet: "non-veg" as const, price: 180, desc: "Coastal-style biryani with juicy prawns and aromatic spices",       popular: false },
      { name: "Veg Biryani",         diet: "veg"     as const, price: 80,  desc: "Mixed vegetable dum biryani with saffron and fried onions",         popular: true  },
      { name: "Pulihora",            diet: "veg"     as const, price: 15,  desc: "Tangy tamarind rice tempered with curry leaves and peanuts",        popular: false },
      { name: "Ghee Rice",           diet: "veg"     as const, price: 40,  desc: "Fragrant basmati rice cooked in pure ghee with whole spices",       popular: false },
      { name: "White Rice",          diet: "veg"     as const, price: 0,   desc: "Steamed plain rice — unlimited serving with any package",           popular: false },
    ],
  },
  {
    id: "curries", label: "Curries & Gravies", emoji: "🍲",
    desc: "Rich, slow-cooked gravies with authentic Andhra masalas",
    items: [
      { name: "Mutton Curry",         diet: "non-veg" as const, price: 150, desc: "Tender mutton pieces in a bold, spiced Andhra-style gravy",        popular: true  },
      { name: "Gongura Mutton",       diet: "non-veg" as const, price: 160, desc: "Iconic mutton curry made with tangy sorrel leaves",                popular: true  },
      { name: "Gongura Chicken",      diet: "non-veg" as const, price: 110, desc: "Tangy chicken curry with the signature gongura punch",             popular: false },
      { name: "Fish Curry",           diet: "non-veg" as const, price: 120, desc: "Coastal-style fish curry with fresh tamarind and spices",          popular: true  },
      { name: "Prawn Curry",          diet: "non-veg" as const, price: 150, desc: "Coconut-based prawn curry with curry leaves",                      popular: false },
      { name: "Egg Curry",            diet: "non-veg" as const, price: 60,  desc: "Soft-boiled eggs in a rich, spiced onion-tomato gravy",            popular: false },
      { name: "Paneer Butter Masala", diet: "veg"     as const, price: 90,  desc: "Creamy tomato-based gravy with soft paneer cubes",                 popular: true  },
      { name: "Dal Tadka",            diet: "veg"     as const, price: 30,  desc: "Yellow lentils tempered with cumin, garlic, and dried chilli",     popular: false },
      { name: "Chana Masala",         diet: "veg"     as const, price: 45,  desc: "Spiced chickpea curry with tangy tomatoes and coriander",          popular: false },
      { name: "Dosakaya Papu",        diet: "veg"     as const, price: 15,  desc: "Comforting yellow cucumber dal — a Telugu home essential",         popular: false },
    ],
  },
  {
    id: "starters", label: "Starters & Snacks", emoji: "🍗",
    desc: "Crispy, flavourful bites to kick-start your event",
    items: [
      { name: "Apollo Fish",      diet: "non-veg" as const, price: 75,  desc: "Crispy fried fish tossed in aromatic spices and curry leaves",  popular: true  },
      { name: "Chicken Fry",      diet: "non-veg" as const, price: 75,  desc: "Marinated chicken fried to golden perfection",                  popular: true  },
      { name: "Chicken 65",       diet: "non-veg" as const, price: 80,  desc: "Restaurant-style spicy deep-fried chicken",                     popular: true  },
      { name: "Chicken Tikka",    diet: "non-veg" as const, price: 85,  desc: "Grilled chicken marinated in tandoori spices",                  popular: false },
      { name: "Fish Fry",         diet: "non-veg" as const, price: 90,  desc: "Whole fish marinated in red masala and pan-fried crispy",       popular: true  },
      { name: "Mutton Fry",       diet: "non-veg" as const, price: 100, desc: "Dry-cooked mutton with whole spices",                           popular: false },
      { name: "Prawn Fry",        diet: "non-veg" as const, price: 120, desc: "Crispy fried prawns with lemon and pepper",                     popular: false },
      { name: "Mirchi Bajji",     diet: "veg"     as const, price: 25,  desc: "Stuffed green chilli fritters — an Andhra classic",            popular: true  },
      { name: "Veg Pakora",       diet: "veg"     as const, price: 30,  desc: "Crunchy mixed vegetable fritters in spiced gram flour batter", popular: false },
      { name: "Paneer Tikka",     diet: "veg"     as const, price: 70,  desc: "Marinated paneer cubes grilled to a perfect char",             popular: true  },
      { name: "Gobi Manchurian",  diet: "veg"     as const, price: 50,  desc: "Crispy cauliflower tossed in Indo-Chinese sauce",              popular: false },
    ],
  },
  {
    id: "sweets", label: "Sweets & Desserts", emoji: "🍮",
    desc: "Traditional Telugu sweets to complete the feast",
    items: [
      { name: "Semya Payasam",  diet: "veg" as const, price: 30, desc: "Creamy vermicelli pudding with cardamom and cashews",          popular: true  },
      { name: "Rice Payasam",   diet: "veg" as const, price: 30, desc: "Classic rice kheer with milk, sugar, and cardamom",           popular: false },
      { name: "Bobbatlu",       diet: "veg" as const, price: 25, desc: "Sweet flatbread stuffed with chana dal and jaggery",          popular: true  },
      { name: "Gulab Jamun",    diet: "veg" as const, price: 25, desc: "Soft milk-solid dumplings soaked in rose-flavoured syrup",    popular: true  },
      { name: "Pootharekulu",   diet: "veg" as const, price: 30, desc: "Paper-thin rice wafer filled with jaggery and nuts",          popular: true  },
      { name: "Suji Halwa",     diet: "veg" as const, price: 25, desc: "Semolina pudding with ghee, dry fruits, and saffron",         popular: false },
      { name: "Boondi Laddu",   diet: "veg" as const, price: 20, desc: "Besan pearls fried and bound with sugar syrup",               popular: false },
      { name: "Medu Vada",      diet: "veg" as const, price: 20, desc: "Crispy savoury doughnuts — served with chutney and sambar",   popular: true  },
    ],
  },
  {
    id: "thalimpu", label: "Thalimpu & Dal", emoji: "🥬",
    desc: "Traditional stir-fries and comforting lentil dishes",
    items: [
      { name: "Aloo Thalimpu",     diet: "veg" as const, price: 15, desc: "Tempered potatoes with mustard seeds and curry leaves",     popular: false },
      { name: "Beans Thalimpu",    diet: "veg" as const, price: 15, desc: "Stir-fried beans with turmeric and coconut",                popular: false },
      { name: "Cabbage Vepudu",    diet: "veg" as const, price: 15, desc: "Cabbage stir-fry with green chillies and curry leaves",     popular: false },
      { name: "Kandi Pappu",       diet: "veg" as const, price: 15, desc: "Classic toor dal with tamarind and traditional tempering",  popular: true  },
      { name: "Tomato Pappu",      diet: "veg" as const, price: 15, desc: "Tangy tomato dal with fresh coriander",                     popular: false },
    ],
  },
  {
    id: "pachadi", label: "Pachadi & Chutneys", emoji: "🫙",
    desc: "The soul of Telugu cuisine — bold chutneys and pickles",
    items: [
      { name: "Gongura Pachadi",    diet: "veg" as const, price: 0,  desc: "Tangy sorrel leaf chutney — the pride of Andhra cuisine",  popular: true  },
      { name: "Tomato Pachadi",     diet: "veg" as const, price: 0,  desc: "Roasted tomato chutney with garlic and chilli",            popular: false },
      { name: "Coconut Chutney",    diet: "veg" as const, price: 0,  desc: "Fresh coconut chutney with green chilli and ginger",       popular: false },
      { name: "Perugu Pachadi",     diet: "veg" as const, price: 0,  desc: "Creamy yoghurt chutney with cucumber and coriander",       popular: false },
      { name: "Peanut Chutney",     diet: "veg" as const, price: 0,  desc: "Roasted peanut chutney with red chillies",                 popular: false },
    ],
  },
  {
    id: "beverages", label: "Beverages", emoji: "☕",
    desc: "Refreshing drinks to accompany the meal",
    items: [
      { name: "Filter Coffee",    diet: "veg" as const, price: 15, desc: "Traditional South Indian drip coffee with decoction",     popular: true  },
      { name: "Buttermilk",       diet: "veg" as const, price: 10, desc: "Chilled spiced buttermilk — the perfect digestive",       popular: true  },
      { name: "Masala Chai",      diet: "veg" as const, price: 10, desc: "Ginger and cardamom spiced tea with full-cream milk",     popular: false },
      { name: "Sweet Lassi",      diet: "veg" as const, price: 20, desc: "Thick yoghurt-based drink with sugar and rose water",     popular: false },
      { name: "Fresh Lime Juice", diet: "veg" as const, price: 15, desc: "Freshly squeezed lime with sugar, salt, or soda",        popular: false },
      { name: "Tender Coconut",   diet: "veg" as const, price: 30, desc: "Fresh coconut water served in the shell",                popular: false },
    ],
  },
]

const ALL_FILTERS = [
  { id: "all",        label: "All Items",        emoji: "🍽️" },
  { id: "rice-biryani", label: "Rice & Biryani", emoji: "🍛" },
  { id: "curries",    label: "Curries",           emoji: "🍲" },
  { id: "starters",   label: "Starters",          emoji: "🍗" },
  { id: "sweets",     label: "Sweets",            emoji: "🍮" },
  { id: "thalimpu",   label: "Veg & Dal",         emoji: "🥬" },
  { id: "pachadi",    label: "Pachadi",            emoji: "🫙" },
  { id: "beverages",  label: "Beverages",         emoji: "☕" },
]

export default function MenuPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState("all")
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "non-veg">("all")
  const [search, setSearch] = useState("")
  const [navOpen, setNavOpen] = useState(false)

  // Load admin-edited menu from localStorage
  const [menuSections, setMenuSectionState] = useState(MENU_SECTIONS)
  useEffect(() => {
    setMenuSectionState(getMenuSections())
  }, [])

  const allItems = menuSections.flatMap((s) =>
    s.items
      .filter((i) => (i as { available?: boolean }).available !== false)
      .map((i) => ({ ...i, sectionId: s.id, sectionLabel: s.label, sectionEmoji: s.emoji }))
  )

  const filtered = allItems.filter((item) => {
    const matchSection = activeFilter === "all" || item.sectionId === activeFilter
    const matchDiet = dietFilter === "all" || item.diet === dietFilter
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.desc.toLowerCase().includes(search.toLowerCase())
    return matchSection && matchDiet && matchSearch
  })

  const vegCount = allItems.filter((i) => i.diet === "veg").length
  const nonVegCount = allItems.filter((i) => i.diet === "non-veg").length

  return (
    <div className="min-h-screen bg-[#FDF6EC]">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur shadow-sm border-b border-[#f0e6d3]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button onClick={() => router.push("/")} className="flex items-center gap-3 flex-shrink-0">
            <div className="relative w-11 h-11 flex-shrink-0 rounded-full bg-white border-2 border-[#D4A853] overflow-hidden shadow-sm">
              <Image src="/logo.png" alt="Ajay Foods logo" fill className="object-contain p-0.5" priority sizes="44px" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg font-bold text-[#8B4513] font-playfair leading-tight">Ajay Foods &amp; Beverages</h1>
              <p className="text-xs text-[#D4A853] font-medium tracking-wide">Full Menu</p>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {[
              { label: "Home", path: "/" },
              { label: "Menu", path: "/menu", active: true },
              { label: "Packages", path: "/packages" },
            ].map((l) => (
              <button key={l.path} onClick={() => router.push(l.path)}
                className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                  l.active ? "bg-[#8B4513] text-white" : "text-[#555] hover:text-[#8B4513] hover:bg-[#f5ece0]"
                }`}
              >{l.label}</button>
            ))}
            <button onClick={() => router.push("/packages")}
              className="ml-2 bg-[#D4A853] text-[#3d1a07] px-4 py-1.5 rounded-full font-bold text-xs hover:opacity-90 transition-opacity"
            >Book Now →</button>
          </nav>

          {/* Hamburger (mobile) */}
          <button onClick={() => setNavOpen(!navOpen)}
            className="md:hidden flex flex-col gap-[5px] p-2 flex-shrink-0"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-[#8B4513] transition-all ${navOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block w-5 h-0.5 bg-[#8B4513] transition-all ${navOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-[#8B4513] transition-all ${navOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </button>
        </div>

        {/* Mobile nav dropdown */}
        {navOpen && (
          <div className="md:hidden bg-white border-t border-[#f0e6d3] shadow-lg">
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
              {[
                { label: "🏠 Home", path: "/" },
                { label: "🍽️ Menu", path: "/menu" },
                { label: "📦 Packages", path: "/packages" },
              ].map((l) => (
                <button key={l.path} onClick={() => { router.push(l.path); setNavOpen(false) }}
                  className="text-left px-3 py-2.5 rounded-xl text-sm font-medium text-[#333] hover:bg-[#f5ece0] hover:text-[#8B4513] transition-colors"
                >{l.label}</button>
              ))}
              <button onClick={() => { router.push("/packages"); setNavOpen(false) }}
                className="mt-1 w-full bg-[#8B4513] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#6d3410] transition-colors"
              >Book Now →</button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#3d1a07] to-[#8B4513] py-14 px-4 text-center text-white">
        <span className="text-[#D4A853] text-xs font-bold tracking-widest uppercase">Taste the Tradition</span>
        <h1 className="font-playfair text-4xl md:text-5xl font-bold mt-2 mb-3">Our Full Menu</h1>
        <p className="text-white/70 max-w-xl mx-auto text-sm">
          Every dish crafted with authentic spices, fresh ingredients, and generations of culinary wisdom.
          All prices are <strong className="text-white">per person</strong> · Minimum 30 guests.
        </p>
        <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
            <span className="text-white/80">{vegCount} Veg items</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
            <span className="text-white/80">{nonVegCount} Non-Veg items</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#D4A853]">🍽️</span>
            <span className="text-white/80">{allItems.length} total items</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-[#f0e6d3] shadow-sm sticky top-[57px] z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0 w-full sm:max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888] text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search dishes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-[#e0d0bc] rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#8B4513] bg-[#FDF6EC] placeholder:text-[#b0a090]"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#555] text-base leading-none">×</button>
            )}
          </div>

          {/* Diet toggle */}
          <div className="inline-flex bg-[#FDF6EC] border border-[#e0d0bc] rounded-full p-1 gap-0.5 flex-shrink-0">
            {(["all", "veg", "non-veg"] as const).map((d) => (
              <button key={d} onClick={() => setDietFilter(d)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${
                  dietFilter === d ? "bg-[#8B4513] text-white shadow-sm" : "text-[#666] hover:text-[#555]"
                }`}
              >
                {d === "all" ? "All" : d === "veg" ? "🌿 Veg" : "🍗 Non-Veg"}
              </button>
            ))}
          </div>

          {/* Category chips */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none flex-1 pb-0.5">
            {ALL_FILTERS.map((f) => (
              <button key={f.id} onClick={() => setActiveFilter(f.id)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  activeFilter === f.id ? "bg-[#8B4513] text-white shadow-sm" : "bg-[#FDF6EC] border border-[#e0d0bc] text-[#555] hover:border-[#8B4513] hover:text-[#8B4513]"
                }`}
              >
                <span>{f.emoji}</span> {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="max-w-6xl mx-auto px-4 pt-5 pb-2 flex items-center justify-between">
        <p className="text-xs text-[#888]">
          {filtered.length === 0 ? "No items found" : `Showing ${filtered.length} item${filtered.length !== 1 ? "s" : ""}`}
          {search && <span> matching &quot;<strong>{search}</strong>&quot;</span>}
        </p>
        {(activeFilter !== "all" || dietFilter !== "all" || search) && (
          <button onClick={() => { setActiveFilter("all"); setDietFilter("all"); setSearch("") }}
            className="text-xs text-[#8B4513] font-semibold hover:underline">Clear filters</button>
        )}
      </div>

      {/* Items Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="text-[#888] font-medium">No items match your filters.</p>
            <button onClick={() => { setActiveFilter("all"); setDietFilter("all"); setSearch("") }}
              className="mt-4 text-[#8B4513] font-semibold underline text-sm">Show all items</button>
          </div>
        ) : (
          <>
            {/* Section headers when not searching */}
            {activeFilter !== "all" || search ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-2">
                {filtered.map((item) => (
                  <MenuCard key={`${item.sectionId}-${item.name}`} item={item} showSection={activeFilter === "all"} />
                ))}
              </div>
            ) : (
              <div className="space-y-10 mt-4">
                {menuSections.map((section) => {
                  const sItems = section.items.filter((i) =>
                    (i as { available?: boolean }).available !== false &&
                    (dietFilter === "all" || i.diet === dietFilter)
                  )
                  if (sItems.length === 0) return null
                  return (
                    <div key={section.id}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{section.emoji}</span>
                        <div>
                          <h2 className="font-playfair text-xl font-bold text-[#8B4513]">{section.label}</h2>
                          <p className="text-xs text-[#888]">{section.desc}</p>
                        </div>
                        <span className="ml-auto text-xs text-[#aaa] bg-[#f0e6d3] px-2 py-0.5 rounded-full">{sItems.length} items</span>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {sItems.map((item) => (
                          <MenuCard key={item.name} item={{ ...item, sectionId: section.id, sectionLabel: section.label, sectionEmoji: section.emoji }} showSection={false} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Book CTA */}
        <div className="mt-14 bg-gradient-to-br from-[#3d1a07] to-[#8B4513] rounded-3xl p-10 text-center text-white">
          <h2 className="font-playfair text-3xl font-bold mb-3">Ready to Book?</h2>
          <p className="text-white/70 mb-6 max-w-md mx-auto">Choose a package and customise with any of these dishes for your event.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => router.push("/packages")}
              className="bg-[#D4A853] text-[#3d1a07] px-8 py-3.5 rounded-full font-bold hover:bg-[#e8bc6a] transition-colors shadow-lg"
            >
              Browse Packages →
            </button>
            <a href="https://wa.me/919876543210?text=Hi! I'd like to book catering."
              target="_blank" rel="noopener noreferrer"
              className="bg-[#25D366] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#1da851] transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              💬 WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Menu Item Card ────────────────────────────────────────────────────────────
type MenuItemFull = { name: string; diet: "veg" | "non-veg"; price: number; desc: string; popular: boolean; sectionId: string; sectionLabel: string; sectionEmoji: string }

function MenuCard({ item, showSection }: {
  item: MenuItemFull
  showSection: boolean
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#f0e6d3] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className={`w-2.5 h-2.5 rounded-sm border-2 flex-shrink-0 mt-0.5 ${
            item.diet === "veg" ? "border-green-600 bg-green-100" : "border-red-600 bg-red-100"
          }`} />
          <h3 className="font-semibold text-[#1a1a1a] text-sm leading-snug">{item.name}</h3>
        </div>
        <div className="flex flex-col items-end flex-shrink-0 gap-1">
          {item.popular && (
            <span className="text-[8px] font-bold bg-[#D4A853]/20 text-[#8B4513] px-1.5 py-0.5 rounded-full uppercase tracking-wide">Popular</span>
          )}
          <span className={`text-sm font-bold ${item.price === 0 ? "text-green-600" : "text-[#8B4513]"}`}>
            {item.price === 0 ? "Included" : `₹${item.price}`}
          </span>
        </div>
      </div>
      <p className="text-xs text-[#777] leading-relaxed">{item.desc}</p>
      {showSection && (
        <p className="text-[10px] text-[#D4A853] font-semibold uppercase tracking-wider mt-auto">
          {item.sectionEmoji} {item.sectionLabel}
        </p>
      )}
    </div>
  )
}
