"use client"

import { useState, useMemo, useCallback, memo, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getPackages, getExtraCategories, getMenuSections, addBooking, type AdminMenuSection } from "../lib/siteData"

// ─── Package Definitions ──────────────────────────────────────────────────────
type PkgEntry = {
  id: string; name: string; tag: string; price: number
  color: string; badgeColor: string
  includes: string[]
  choiceGroups?: { id: string; label: string; pick: number; options: string[] }[]
}
const PACKAGES: Record<string, PkgEntry> = {
  "veg-basic": {
    id: "veg-basic", name: "Veg Basic", tag: "VEG", price: 100,
    color: "from-[#2d6a4f] to-[#40916c]",
    badgeColor: "bg-green-100 text-green-800",
    includes: ["White Rice", "Sambar + Rasam + Curd", "1 Dal", "1 Iguru Curry", "1 Pachadi", "1 Thalimpu"],
  },
  "veg-premium": {
    id: "veg-premium", name: "Veg Premium", tag: "VEG", price: 140,
    color: "from-[#e9c46a] to-[#f4a261]",
    badgeColor: "bg-yellow-100 text-yellow-800",
    includes: ["White Rice + Pulihora", "Sambar + Rasam + Curd", "2 Dals", "2 Iguru Curries", "2 Pachadis", "2 Thalimpus", "1 Sweet Dish"],
  },
  "non-veg-basic": {
    id: "non-veg-basic", name: "Non-Veg Basic", tag: "NON-VEG", price: 150,
    color: "from-primary to-primary-light",
    badgeColor: "bg-red-100 text-red-800",
    includes: ["Biryani (7 variants)", "Sambar", "Gongura Pachadi", "Curd Chutney", "Raita", "Plates & Service"],
  },
  "non-veg-premium": {
    id: "non-veg-premium", name: "Non-Veg Premium", tag: "NON-VEG", price: 180,
    color: "from-primary to-primary-mid",
    badgeColor: "bg-red-100 text-red-800",
    includes: ["Biryani (7 variants)", "Choice of Curry", "Sambar", "Gongura + Curd Chutney", "Raita", "Plates & Service"],
  },
}

// ─── Extra Dish Categories ────────────────────────────────────────────────────
const EXTRA_CATEGORIES = [
  {
    id: "starters", label: "Starters", emoji: "🍗",
    desc: "Perfect to serve at the start of your event",
    items: [
      { id: "apollo-fish",     name: "Apollo Fish",       price: 75,  diet: "non-veg" as const, emoji: "🐟", popular: true  },
      { id: "chicken-fry",     name: "Chicken Fry",       price: 75,  diet: "non-veg" as const, emoji: "🍗", popular: true  },
      { id: "chicken-65",      name: "Chicken 65",        price: 80,  diet: "non-veg" as const, emoji: "🍗", popular: true  },
      { id: "chicken-tikka",   name: "Chicken Tikka",     price: 85,  diet: "non-veg" as const, emoji: "🍢", popular: false },
      { id: "fish-fry",        name: "Fish Fry",          price: 90,  diet: "non-veg" as const, emoji: "🐟", popular: true  },
      { id: "mutton-fry",      name: "Mutton Fry",        price: 100, diet: "non-veg" as const, emoji: "🥩", popular: false },
      { id: "prawn-fry",       name: "Prawn Fry",         price: 120, diet: "non-veg" as const, emoji: "🦐", popular: false },
      { id: "mirchi-bajji",    name: "Mirchi Bajji",      price: 25,  diet: "veg" as const,     emoji: "🌶️", popular: true  },
      { id: "veg-pakora",      name: "Veg Pakora",        price: 30,  diet: "veg" as const,     emoji: "🥙", popular: false },
      { id: "paneer-tikka",    name: "Paneer Tikka",      price: 70,  diet: "veg" as const,     emoji: "🧀", popular: true  },
      { id: "gobi-manchurian", name: "Gobi Manchurian",   price: 50,  diet: "veg" as const,     emoji: "🥦", popular: false },
    ],
  },
  {
    id: "curries", label: "Extra Curries", emoji: "🍲",
    desc: "Add rich gravies to your meal",
    items: [
      { id: "mutton-curry",   name: "Mutton Curry",        price: 150, diet: "non-veg" as const, emoji: "🥘", popular: true  },
      { id: "gongura-mutton", name: "Gongura Mutton",      price: 160, diet: "non-veg" as const, emoji: "🍲", popular: true  },
      { id: "gongura-chicken",name: "Gongura Chicken",     price: 110, diet: "non-veg" as const, emoji: "🍗", popular: false },
      { id: "fish-curry",     name: "Fish Curry",          price: 120, diet: "non-veg" as const, emoji: "🐟", popular: true  },
      { id: "prawn-curry",    name: "Prawn Curry",         price: 150, diet: "non-veg" as const, emoji: "🦐", popular: false },
      { id: "egg-curry",      name: "Egg Curry",           price: 60,  diet: "non-veg" as const, emoji: "🥚", popular: false },
      { id: "paneer-butter",  name: "Paneer Butter Masala",price: 90,  diet: "veg" as const,     emoji: "🧀", popular: true  },
      { id: "dal-tadka",      name: "Dal Tadka",           price: 30,  diet: "veg" as const,     emoji: "🫕", popular: false },
      { id: "chana-masala",   name: "Chana Masala",        price: 45,  diet: "veg" as const,     emoji: "🫘", popular: false },
    ],
  },
  {
    id: "sweets", label: "Sweets", emoji: "🍮",
    desc: "End the feast on a sweet note",
    items: [
      { id: "semya-payasam", name: "Semya Payasam",  price: 30, diet: "veg" as const, emoji: "🍮", popular: true  },
      { id: "rice-payasam",  name: "Rice Payasam",   price: 30, diet: "veg" as const, emoji: "🍚", popular: false },
      { id: "bobbatlu",      name: "Bobbatlu",       price: 25, diet: "veg" as const, emoji: "🫓", popular: true  },
      { id: "gulab-jamun",   name: "Gulab Jamun",    price: 25, diet: "veg" as const, emoji: "🟤", popular: true  },
      { id: "pootharekulu",  name: "Pootharekulu",   price: 30, diet: "veg" as const, emoji: "📜", popular: true  },
      { id: "halwa",         name: "Suji Halwa",     price: 25, diet: "veg" as const, emoji: "🥣", popular: false },
      { id: "laddu",         name: "Boondi Laddu",   price: 20, diet: "veg" as const, emoji: "🟡", popular: false },
      { id: "vada",          name: "Medu Vada",      price: 20, diet: "veg" as const, emoji: "🍩", popular: true  },
    ],
  },
  {
    id: "rice", label: "Extra Rice", emoji: "🍛",
    desc: "More rice & biryani options",
    items: [
      { id: "mutton-biryani", name: "Mutton Biryani", price: 180, diet: "non-veg" as const, emoji: "🍛", popular: true  },
      { id: "prawn-biryani",  name: "Prawn Biryani",  price: 180, diet: "non-veg" as const, emoji: "🦐", popular: false },
      { id: "veg-biryani",    name: "Veg Biryani",    price: 80,  diet: "veg" as const,     emoji: "🫕", popular: true  },
      { id: "pulihora",       name: "Pulihora",       price: 15,  diet: "veg" as const,     emoji: "🍋", popular: false },
      { id: "ghee-rice",      name: "Ghee Rice",      price: 40,  diet: "veg" as const,     emoji: "✨", popular: false },
    ],
  },
  {
    id: "beverages", label: "Beverages", emoji: "☕",
    desc: "Drinks & refreshments",
    items: [
      { id: "filter-coffee", name: "Filter Coffee",   price: 15, diet: "veg" as const, emoji: "☕", popular: true  },
      { id: "buttermilk",    name: "Buttermilk",      price: 10, diet: "veg" as const, emoji: "🥛", popular: true  },
      { id: "chai",          name: "Masala Chai",     price: 10, diet: "veg" as const, emoji: "🍵", popular: false },
      { id: "lassi",         name: "Sweet Lassi",     price: 20, diet: "veg" as const, emoji: "🥤", popular: false },
      { id: "fresh-lime",    name: "Fresh Lime Juice",price: 15, diet: "veg" as const, emoji: "🍋", popular: false },
      { id: "coconut-water", name: "Tender Coconut",  price: 30, diet: "veg" as const, emoji: "🥥", popular: false },
    ],
  },
  {
    id: "service", label: "Service Add-ons", emoji: "🍃",
    desc: "Serving style & extras",
    items: [
      { id: "banana-leaf",    name: "Banana Leaf Service",price: 30, diet: "veg" as const, emoji: "🍃", popular: true  },
      { id: "plates-service", name: "Disposable Plates",  price: 20, diet: "veg" as const, emoji: "🍽️", popular: false },
      { id: "paan",           name: "Paan (Post-meal)",   price: 20, diet: "veg" as const, emoji: "🌿", popular: false },
    ],
  },
]

const EVENT_TYPES = ["Wedding", "Birthday", "Engagement", "Corporate Lunch", "Religious Function", "Anniversary", "Baby Shower", "Other"]

// ─── Order Item Picker ────────────────────────────────────────────────────────
const OrderItemPicker = memo(function OrderItemPicker({
  sections,
  selected,
  onToggle,
}: {
  sections: AdminMenuSection[]
  selected: string[]
  onToggle: (name: string) => void
}) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "veg" | "non-veg">("all")
  const [activeSection, setActiveSection] = useState(() => sections[0]?.id ?? "")

  const q = search.trim().toLowerCase()
  const isSearching = !!q   // only search triggers flat-list mode; diet filter works within section tabs
  function isDietActive(t: "all" | "veg" | "non-veg") { return typeFilter === t }

  const filteredSections = useMemo(
    () =>
      sections.map((sec) => ({
        ...sec,
        items: sec.items.filter(
          (i) =>
            (i as { available?: boolean }).available !== false &&
            (typeFilter === "all" || i.diet === typeFilter) &&
            (!q || i.name.toLowerCase().includes(q))
        ),
      })),
    [sections, typeFilter, q]
  )

  const activeItems = useMemo(
    () =>
      isSearching
        ? filteredSections.flatMap((sec) => sec.items.map((i) => ({ ...i, sectionLabel: sec.label })))
        : (filteredSections.find((s) => s.id === activeSection)?.items ?? []),
    [isSearching, filteredSections, activeSection]
  )

  return (
    <div className="space-y-3">
      {/* Search bar — full width */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">🔍</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search dishes…"
          className="w-full border border-warm-border rounded-xl pl-10 pr-9 py-2.5 text-sm bg-surface focus:outline-none focus:border-primary/50 placeholder:text-text-muted"
        />
        {search.length > 0 ? (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-mid text-lg leading-none">×</button>
        ) : null}
      </div>

      {/* Diet pills + section tabs always visible together; search hides sections and shows flat results */}
      {!isSearching ? (
        <div className="flex gap-2 overflow-x-auto pb-0.5 hide-scroll" style={{scrollbarWidth:"none", msOverflowStyle:"none"}}>
          <style>{`.hide-scroll::-webkit-scrollbar{display:none}`}</style>
          {/* Diet pills */}
          {(["all", "veg", "non-veg"] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                isDietActive(t)
                  ? t === "veg" ? "bg-green-600 text-white border-green-600"
                    : t === "non-veg" ? "bg-red-600 text-white border-red-600"
                    : "bg-primary text-gold border-primary"
                  : t === "veg" ? "bg-white text-text-muted border-warm-border hover:border-green-500"
                    : t === "non-veg" ? "bg-white text-text-muted border-warm-border hover:border-red-500"
                    : "bg-white text-text-muted border-warm-border hover:border-primary/30"
              }`}>
              {t === "all" ? "All" : t === "veg" ? "🌿 Veg" : "🍗 Non-Veg"}
            </button>
          ))}

          {/* Divider */}
          <div className="w-px bg-warm-border flex-shrink-0 my-1" />

          {/* Section tabs */}
          {sections.map(sec => {
            const selCount = sec.items.filter(i => selected.includes(i.name)).length
            return (
              <button key={sec.id} onClick={() => setActiveSection(sec.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                  activeSection === sec.id
                    ? "bg-primary text-gold border-primary shadow-sm"
                    : "bg-white text-text-muted border-warm-border hover:border-primary/30"
                }`}>
                {sec.emoji} {sec.label}
                {selCount > 0 && (
                  <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${activeSection === sec.id ? "bg-white/25 text-white" : "bg-primary text-gold"}`}>
                    {selCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      ) : (
        /* Searching — diet pills + result count */
        <div className="flex gap-2">
          {(["all", "veg", "non-veg"] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                typeFilter === t
                  ? t === "veg" ? "bg-green-600 text-white border-green-600"
                    : t === "non-veg" ? "bg-red-600 text-white border-red-600"
                    : "bg-primary text-gold border-primary"
                  : "bg-white text-text-muted border-warm-border hover:border-primary/30"
              }`}>
              {t === "all" ? "All" : t === "veg" ? "🌿 Veg" : "🍗 Non-Veg"}
            </button>
          ))}
          <span className="text-xs text-text-muted self-center ml-1">{activeItems.length} results</span>
        </div>
      )}

      {/* Items — compact horizontal list */}
      {sections.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-8">Loading menu…</p>
      ) : activeItems.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-8">No dishes found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {activeItems.map(item => {
            const isAdded = selected.includes(item.name)
            const price = item.price
            return (
              <button
                key={item.name}
                onClick={() => onToggle(item.name)}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150 ${
                  isAdded
                    ? "bg-warm-bg border-2 border-primary shadow-sm"
                    : "bg-white border border-warm-border hover:border-primary/30 hover:shadow-sm"
                }`}
              >
                {/* Diet dot */}
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.diet === "veg" ? "bg-green-500" : "bg-red-500"}`} />

                {/* Name + section label */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-tight truncate ${isAdded ? "text-primary" : "text-text-dark"}`}>{item.name}</p>
                  {"sectionLabel" in item && isSearching && (
                    <p className="text-[10px] text-text-muted mt-0.5">{(item as { sectionLabel?: string }).sectionLabel}</p>
                  )}
                </div>

                {/* Price */}
                <span className={`text-sm font-bold flex-shrink-0 ${isAdded ? "text-gold" : "text-text-muted"}`}>
                  {price === 0 ? "Free" : `₹${price}`}
                </span>

                {/* Add / check */}
                <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all text-xs font-bold ${
                  isAdded ? "bg-primary text-gold" : "bg-warm-border text-primary hover:bg-primary hover:text-gold"
                }`}>
                  {isAdded ? "✓" : "+"}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
})

// ─── Header Component ────────────────────────────────────────────────────────
type HeaderProps = {
  step: "extras" | "details" | "done"
  onSetStep: (s: "extras" | "details" | "done") => void
  onGoBack: () => void
}

function OrderHeader({ step, onSetStep, onGoBack }: HeaderProps) {
  const router = useRouter()
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-primary to-primary-mid border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-base flex-shrink-0">🍛</div>
          <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg font-bold text-gold font-playfair leading-tight">
                Ajay Foods &amp; Beverages
              </h1>
              <p className="text-xs text-gold/70 font-medium tracking-wide">Quality Assured Foods</p>
            </div>
        </button>

        <div className="flex items-center gap-1.5 text-xs">
          <button onClick={() => router.push("/packages")} className="flex items-center gap-1.5 text-white/55 hover:text-white/90 px-2 py-1.5 transition-colors">
            <span className="w-4 h-4 rounded-full bg-gold text-primary flex items-center justify-center font-bold text-[10px]">✓</span>
            <span className="hidden sm:inline">Package</span>
          </button>
          <span className="text-white/30">›</span>
          {step === "details" ? (
            <button onClick={() => onSetStep("extras")} className="flex items-center gap-1.5 px-2 py-1.5 text-white/55 hover:text-white/90 transition-colors">
              <span className="w-4 h-4 rounded-full bg-gold text-primary flex items-center justify-center font-bold text-[10px]">✓</span>
              <span className="hidden sm:inline">Add Extras</span>
            </button>
          ) : (
            <span className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full font-semibold ${step === "extras" ? "bg-gold/20 text-gold" : "text-white/40"}`}>
              <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-[10px]">2</span>
              <span className="hidden sm:inline">Add Extras</span>
            </span>
          )}
          <span className="text-white/30">›</span>
          <span className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full font-semibold ${step === "details" ? "bg-gold/20 text-gold" : "text-white/40"}`}>
            {step === "details" ? <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-[10px]">3</span> : <span className="w-4 h-4 rounded-full border border-white/20 text-white/40 flex items-center justify-center text-[10px]">3</span>}
            <span className="hidden sm:inline">Confirm</span>
          </span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={() => router.push("/")}
            className="text-sm text-white/55 hover:text-white/90 transition-colors flex items-center gap-1">
            🏠 <span className="hidden sm:inline">Home</span>
          </button>
          <span className="text-white/20">|</span>
          <button onClick={onGoBack}
            className="text-sm text-white/55 hover:text-white/90 transition-colors flex items-center gap-1">
            ← {step === "details" ? "Back to Extras" : "Packages"}
          </button>
        </div>
      </div>
    </header>
  )
}

// ─── Inner Component ──────────────────────────────────────────────────────────
function OrderInner() {
  const router = useRouter()
  const params = useSearchParams()
  const pkgId = params.get("pkg") ?? "non-veg-basic"

  // Load admin-edited packages & extras from localStorage (lazy init — no extra render)
  const [pkgsMap] = useState<typeof PACKAGES>(() => {
    const map: typeof PACKAGES = {}
    getPackages().forEach((p) => {
      map[p.id] = { id: p.id, name: p.name, tag: p.tag, price: p.price, color: p.color, badgeColor: p.badgeColor, includes: p.includes, choiceGroups: p.choiceGroups }
    })
    return map
  })
  const [extraCats] = useState<typeof EXTRA_CATEGORIES>(() =>
    getExtraCategories()
      .map((cat) => ({ ...cat, items: cat.items.filter((item) => item.available !== false) }))
      .filter((cat) => cat.items.length > 0) as typeof EXTRA_CATEGORIES
  )
  const [menuSections] = useState<AdminMenuSection[]>(() =>
    getMenuSections().filter((s) => s.items.some((i) => (i as { available?: boolean }).available !== false))
  )

  const pkg = pkgsMap[pkgId] ?? pkgsMap["non-veg-basic"] ?? Object.values(pkgsMap)[0]

  // 3-step flow: "extras" → "details" → "done"
  const [step, setStep] = useState<"extras" | "details" | "done">("extras")
  const [extras, setExtras] = useState<Record<string, boolean>>({})
  const [showSummaryDrawer, setShowSummaryDrawer] = useState(false)
  const [summaryEditMode, setSummaryEditMode] = useState(false)
  const [removedIncludes, setRemovedIncludes] = useState<number[]>([])
  const [essentialItems, setEssentialItems] = useState(["Plate", "Glass", "Water"])
  const [formLoading, setFormLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmationNo, setConfirmationNo] = useState("")

  const [form, setForm] = useState({
    name: "", phone: "", eventType: "", guestCount: "100", eventDate: "", notes: "",
  })

  // Meal preferences: { [groupId]: selectedOption[] }
  const [preferences, setPreferences] = useState<Record<string, string[]>>({})

  const guests = Math.max(30, parseInt(form.guestCount) || 30)

  const selectedExtras = useMemo(
    () => extraCats.flatMap((c) => c.items).filter((i) => extras[i.id]),
    [extras, extraCats]
  )

  const extraCostPerPerson = useMemo(
    () => selectedExtras.reduce((s, i) => s + i.price, 0),
    [selectedExtras]
  )

  const [menuExtras, setMenuExtras] = useState<string[]>([])

  const menuExtraCostPerPerson = useMemo(() => {
    return menuSections.flatMap(s => s.items)
      .filter(i => menuExtras.includes(i.name))
      .reduce((s, i) => s + i.price, 0)
  }, [menuExtras, menuSections])

  const totalPerPerson = (pkg?.price ?? 0) + extraCostPerPerson + menuExtraCostPerPerson
  const grandTotal = totalPerPerson * guests

  function toggle(id: string) {
    setExtras((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleMenuExtra = useCallback((name: string) => {
    setMenuExtras(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }, [])

  // Tomorrow min date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split("T")[0]
  const oneYearStr = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Enter your full name (min 2 characters)"
    const ph = form.phone.replace(/\D/g, "")
    if (!ph) e.phone = "Phone number is required"
    else if (!/^[6-9]\d{9}$/.test(ph)) e.phone = "Enter a valid 10-digit Indian mobile number"
    if (!form.eventType) e.eventType = "Please select an event type"
    const gc = parseInt(form.guestCount)
    if (!form.guestCount) e.guestCount = "Guest count is required"
    else if (isNaN(gc) || gc < 30) e.guestCount = "Minimum 30 guests"
    else if (gc > 5000) e.guestCount = "Maximum 5000 guests"
    if (!form.eventDate) e.eventDate = "Event date is required"
    else if (new Date(form.eventDate) <= new Date()) e.eventDate = "Event date must be in the future"
    return e
  }

  async function handleSubmit() {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) {
      // Scroll to first error
      document.querySelector(".error-field")?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    setFormLoading(true)
    await new Promise((r) => setTimeout(r, 1400))
    const confNo = "AJF" + Math.floor(100000 + Math.random() * 900000)
    const menuExtraItems = menuSections.flatMap(s => s.items).filter(i => menuExtras.includes(i.name))
    addBooking({
      id: confNo,
      name: form.name.trim(),
      phone: form.phone.replace(/\D/g, ""),
      eventType: form.eventType,
      eventDate: form.eventDate,
      guestCount: parseInt(form.guestCount),
      packageId: pkg?.id ?? "",
      packageName: pkg?.name ?? "",
      extras: selectedExtras.map((e) => ({ id: e.id, name: e.name, price: e.price, emoji: e.emoji })),
      preferences,
      notes: [form.notes.trim(), menuExtraItems.length > 0 ? `Menu extras: ${menuExtraItems.map(i => `${i.name} (+₹${i.price}/pp)`).join(", ")}` : ""].filter(Boolean).join("\n"),
      totalPerPerson,
      submittedAt: new Date().toISOString(),
      status: "pending",
    })
    setConfirmationNo(confNo)
    setFormLoading(false)
    setStep("done")
  }

  const handleGoBack = useCallback(() => {
    if (step === "details") setStep("extras")
    else router.push("/packages")
  }, [step, router])

  // ── DONE SCREEN ────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-warm-border">
          <div className="bg-gradient-to-br from-primary to-primary-light px-8 py-10 text-center text-white">
            <div className="w-16 h-16 bg-gold/[0.12] border-2 border-gold/30 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h1 className="font-playfair text-3xl font-bold">Booking Request Sent!</h1>
            <p className="text-white/75 text-sm mt-2">We&apos;ll call you within 24 hours to confirm</p>
            <div className="mt-4 bg-gradient-to-br from-primary to-primary-light rounded-2xl px-5 py-3 inline-block border border-gold/20">
              <p className="text-xs text-white/75 mb-0.5">Confirmation Number</p>
              <p className="font-playfair text-xl font-bold text-gold">{confirmationNo}</p>
            </div>
          </div>
          <div className="p-6 space-y-3 text-sm">
            {[
              { label: "Name",   value: form.name },
              { label: "Phone",  value: `+91 ${form.phone}` },
              { label: "Event",  value: `${form.eventType} · ${form.eventDate}` },
              { label: "Guests", value: `${guests} persons` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b border-warm-border">
                <span className="text-text-muted">{label}</span>
                <span className="font-semibold text-right max-w-[60%] text-text-dark">{value}</span>
              </div>
            ))}

            {/* Package with full includes */}
            <div className="py-2 border-b border-warm-border">
              <div className="flex justify-between mb-2">
                <span className="text-text-muted">Package</span>
                <span className="font-semibold text-primary">{pkg.name} — ₹{pkg.price}/person</span>
              </div>
              <ul className="space-y-0.5 pl-2">
                {pkg.includes.map((inc, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-text-mid">
                    <span className="text-gold flex-shrink-0">✓</span>{inc}
                  </li>
                ))}
              </ul>
            </div>

            {/* Meal preferences */}
            {Object.keys(preferences).filter(k => (preferences[k] ?? []).length > 0).length > 0 && (
              <div className="py-2 border-b border-warm-border">
                <span className="text-text-muted block mb-1.5">Your Choices</span>
                {(pkg.choiceGroups ?? []).map(g => {
                  const sel = preferences[g.id] ?? []
                  if (sel.length === 0) return null
                  return (
                    <div key={g.id} className="flex justify-between text-xs mb-1">
                      <span className="text-text-muted">{g.label}</span>
                      <span className="font-semibold text-right max-w-[55%] text-text-dark">{sel.join(", ")}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Extras */}
            {(selectedExtras.length > 0 || menuExtras.length > 0) && (
              <div className="py-2 border-b border-warm-border">
                <span className="text-text-muted block mb-1.5">Extra Dishes ({selectedExtras.length + menuExtras.length})</span>
                <div className="flex flex-wrap gap-1">
                  {selectedExtras.map(item => (
                    <span key={item.id} className="flex items-center gap-1 text-xs bg-warm-bg border border-warm-border px-2 py-0.5 rounded-full text-text-mid">
                      {item.emoji} {item.name} <span className="text-primary font-semibold">+₹{item.price}</span>
                    </span>
                  ))}
                  {menuSections.flatMap(s => s.items.filter(i => menuExtras.includes(i.name)).map(item => (
                    <span key={item.name} className="flex items-center gap-1 text-xs bg-warm-bg border border-warm-border px-2 py-0.5 rounded-full text-text-mid">
                      {item.name} <span className="text-primary font-semibold">+₹{item.price}</span>
                    </span>
                  )))}
                </div>
              </div>
            )}

            <div className="flex justify-between py-3 bg-warm-bg rounded-2xl px-4 -mx-4 mt-2">
              <span className="font-bold text-primary text-base">Estimated Total</span>
              <span className="font-bold text-gold text-base">₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
            <p className="text-center text-xs text-text-muted pt-1">Save your confirmation number for reference.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => router.push("/packages")}
                className="flex-1 border border-warm-border text-text-mid py-3 rounded-full font-semibold hover:border-primary/30 transition-colors text-sm">
                New Order
              </button>
              <button onClick={() => router.push("/")}
                className="mt-6 bg-gold text-primary font-bold px-8 py-3 rounded-full hover:bg-gold-light transition-colors flex-1 text-sm">
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── DETAILS SCREEN (Step 3: Review + Contact Form) ─────────────────────────
  if (step === "details") {
    return (
      <div className="min-h-screen bg-warm-bg pb-32 md:pb-10">
        <OrderHeader step={step} onSetStep={setStep} onGoBack={handleGoBack} />

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h2 className="font-playfair text-2xl font-bold text-text-dark">Review &amp; Confirm</h2>
            <p className="text-text-muted text-sm mt-0.5">Check your order and fill in your contact details to submit.</p>
          </div>

          <div className="flex gap-6 items-start flex-col lg:flex-row">
            {/* LEFT: Order Summary */}
            <div className="flex-1 space-y-4">
              {/* Package */}
              <div className={`bg-gradient-to-r ${pkg.color} rounded-2xl overflow-hidden text-white`}>
                <div className="flex items-center justify-between p-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${pkg.badgeColor}`}>{pkg.tag}</span>
                      <span className="text-white/70 text-xs">Selected Package</span>
                    </div>
                    <h3 className="font-playfair text-xl font-bold">{pkg.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">₹{pkg.price}</p>
                    <p className="text-white/70 text-xs">per person</p>
                  </div>
                </div>
                {/* Package includes */}
                <div className="bg-black/20 px-5 py-3">
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Includes</p>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {pkg.includes.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-white/90">
                        <span className="text-[#D4A853] flex-shrink-0 mt-0.5">✓</span>{item}
                      </li>
                    ))}
                  </ul>
                  {/* Meal preferences summary */}
                  {Object.keys(preferences).filter(k => (preferences[k] ?? []).length > 0).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1.5">Your Choices</p>
                      {(pkg.choiceGroups ?? []).map(g => {
                        const sel = preferences[g.id] ?? []
                        if (sel.length === 0) return null
                        return (
                          <p key={g.id} className="text-xs text-white/80 mb-0.5">
                            <span className="font-semibold text-[#D4A853]">{g.label}:</span> {sel.join(", ")}
                          </p>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Extras */}
              <div className="bg-white rounded-2xl border border-warm-border shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-playfair text-lg font-bold text-text-dark">Extra Dishes</h3>
                  <button onClick={() => setStep("extras")}
                    className="text-xs text-primary border border-warm-border px-3 py-1 rounded-full hover:border-primary/30 transition-colors font-semibold">
                    Edit Extras
                  </button>
                </div>
                {selectedExtras.length === 0 && menuExtras.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-text-muted text-sm">No extras added</p>
                    <button onClick={() => setStep("extras")} className="text-primary text-sm font-semibold mt-1 underline">Add some extras →</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedExtras.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 bg-warm-bg rounded-xl px-3 py-2">
                        <span className="text-lg">{item.emoji}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate text-text-dark">{item.name}</p>
                          <p className="text-[10px] text-gold font-bold">+₹{item.price}/pp</p>
                        </div>
                      </div>
                    ))}
                    {menuSections.flatMap(s => s.items.filter(i => menuExtras.includes(i.name)).map(item => (
                      <div key={item.name} className="flex items-center gap-2 bg-warm-bg rounded-xl px-3 py-2">
                        <span className="text-lg">{item.diet === "veg" ? "🌿" : "🍗"}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate text-text-dark">{item.name}</p>
                          <p className="text-[10px] text-gold font-bold">+₹{item.price}/pp</p>
                        </div>
                      </div>
                    )))}
                  </div>
                )}
              </div>

              {/* Cost Breakdown */}
              <div className="bg-white rounded-2xl border border-warm-border shadow-sm p-5">
                <h3 className="font-playfair text-lg font-bold text-text-dark mb-4">Cost Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-text-mid">
                    <span>{pkg.name} (₹{pkg.price} × {guests} guests)</span>
                    <span className="font-medium">₹{(pkg.price * guests).toLocaleString("en-IN")}</span>
                  </div>
                  {selectedExtras.map((item) => (
                    <div key={item.id} className="flex justify-between text-text-mid">
                      <span className="flex items-center gap-1.5"><span>{item.emoji}</span>{item.name} (₹{item.price} × {guests})</span>
                      <span className="font-medium">₹{(item.price * guests).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                  {menuSections.flatMap(s => s.items.filter(i => menuExtras.includes(i.name)).map(item => (
                    <div key={item.name} className="flex justify-between text-text-mid">
                      <span>{item.name} (₹{item.price} × {guests})</span>
                      <span className="font-medium">₹{(item.price * guests).toLocaleString("en-IN")}</span>
                    </div>
                  )))}
                  <div className="flex justify-between font-bold text-primary text-base pt-3 border-t-2 border-gold/40 mt-2">
                    <span>Estimated Total</span>
                    <span className="text-gold">₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <p className="text-[10px] text-text-muted text-center">Final pricing confirmed on call · Min 30 guests</p>
                </div>
              </div>
            </div>

            {/* RIGHT: Contact Form */}
            <div className="w-full lg:w-[400px] flex-shrink-0">
              <div className="bg-white rounded-2xl border border-warm-border shadow-md p-6">
                <h3 className="font-playfair text-xl font-bold text-text-dark mb-5">Your Contact Details</h3>
                <div className="space-y-4">
                  <div className={errors.name ? "error-field" : ""}>
                    <label className="text-text-dark text-sm font-semibold mb-1.5 block">Your Name *</label>
                    <input type="text" placeholder="Ramesh Kumar" value={form.name}
                      onChange={(e) => { setForm(prev => ({ ...prev, name: e.target.value })); if (errors.name) setErrors({ ...errors, name: "" }) }}
                      className={`w-full bg-surface border rounded-xl px-4 py-3 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition ${errors.name ? "border-red-400" : "border-warm-border"}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div className={errors.phone ? "error-field" : ""}>
                    <label className="text-text-dark text-sm font-semibold mb-1.5 block">Phone Number *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted font-medium">+91</span>
                      <input type="tel" placeholder="98765 43210" maxLength={10}
                        value={form.phone}
                        onChange={(e) => { const d = e.target.value.replace(/\D/g,"").slice(0,10); setForm(prev => ({...prev,phone:d})); if(errors.phone) setErrors({...errors,phone:""}) }}
                        className={`w-full bg-surface border rounded-xl pl-10 pr-4 py-3 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition ${errors.phone ? "border-red-400" : "border-warm-border"}`}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div className={errors.eventType ? "error-field" : ""}>
                    <label className="text-text-dark text-sm font-semibold mb-1.5 block">Event Type *</label>
                    <select value={form.eventType}
                      onChange={(e) => { setForm(prev => ({...prev,eventType:e.target.value})); if(errors.eventType) setErrors({...errors,eventType:""}) }}
                      className={`w-full bg-surface border rounded-xl px-4 py-3 text-sm text-text-dark focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition ${errors.eventType ? "border-red-400" : "border-warm-border"}`}
                    >
                      <option value="">Select type…</option>
                      {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    {errors.eventType && <p className="text-red-500 text-xs mt-1">{errors.eventType}</p>}
                  </div>

                  <div className={errors.guestCount ? "error-field" : ""}>
                    <label className="text-text-dark text-sm font-semibold mb-1.5 block">
                      Guest Count * <span className="text-text-muted normal-case font-normal">(min 30)</span>
                    </label>
                    <input type="number" placeholder="100" min={30} max={5000} value={form.guestCount}
                      onChange={(e) => { setForm(prev => ({...prev,guestCount:e.target.value})); if(errors.guestCount) setErrors({...errors,guestCount:""}) }}
                      className={`w-full bg-surface border rounded-xl px-4 py-3 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition ${errors.guestCount ? "border-red-400" : "border-warm-border"}`}
                    />
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {[50, 100, 200, 500].map((n) => (
                        <button key={n} type="button" onClick={() => setForm(prev => ({ ...prev, guestCount: String(n) }))}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${form.guestCount === String(n) ? "bg-primary border-primary text-gold" : "bg-surface border-warm-border text-text-muted hover:border-primary/30"}`}
                        >{n}</button>
                      ))}
                    </div>
                    {errors.guestCount && <p className="text-red-500 text-xs mt-1">{errors.guestCount}</p>}
                  </div>

                  <div className={errors.eventDate ? "error-field" : ""}>
                    <label className="text-text-dark text-sm font-semibold mb-1.5 block">Event Date *</label>
                    <input type="date" min={tomorrowStr} max={oneYearStr} value={form.eventDate}
                      onChange={(e) => { setForm(prev => ({...prev,eventDate:e.target.value})); if(errors.eventDate) setErrors({...errors,eventDate:""}) }}
                      className={`w-full bg-surface border rounded-xl px-4 py-3 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition ${errors.eventDate ? "border-red-400" : "border-warm-border"}`}
                    />
                    {errors.eventDate && <p className="text-red-500 text-xs mt-1">{errors.eventDate}</p>}
                  </div>

                  <div>
                    <label className="text-text-dark text-sm font-semibold mb-1.5 block">Special Requests</label>
                    <textarea rows={3} placeholder="Any other dietary requirements or special notes…" value={form.notes}
                      onChange={(e) => setForm(prev => ({...prev,notes:e.target.value}))}
                      className="w-full bg-surface border border-warm-border rounded-xl px-4 py-3 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition resize-none"
                    />
                  </div>

                  {/* Cost breakdown */}
                  <div className="bg-surface border border-warm-border rounded-xl px-4 py-3 text-xs space-y-1.5">
                    <p className="font-semibold text-text-mid text-[11px] uppercase tracking-wider mb-2">Cost Breakdown</p>
                    <div className="flex justify-between text-text-muted">
                      <span>{pkg.name} (base)</span>
                      <span>₹{pkg.price}/pp</span>
                    </div>
                    {selectedExtras.map((item) => (
                      <div key={item.id} className="flex justify-between text-text-muted">
                        <span>{item.emoji} {item.name}</span>
                        <span>+₹{item.price}/pp</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-primary text-sm pt-1.5 border-t border-warm-border mt-1">
                      <span>Total ({guests} guests)</span>
                      <span className="text-gold">₹{grandTotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <button onClick={handleSubmit} disabled={formLoading}
                    className="w-full bg-primary text-gold font-bold py-4 rounded-full shadow-[0_4px_16px_rgba(92,15,15,0.25)] hover:bg-primary-mid transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {formLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Submitting…
                      </>
                    ) : "Submit Booking Request 🎉"}
                  </button>
                  <p className="text-center text-xs text-text-muted">We&apos;ll call you within 24 hours to confirm.</p>
                  <button onClick={() => setStep("extras")} className="w-full border border-warm-border text-text-mid text-sm py-3 rounded-full hover:border-primary/30 transition-colors mt-3">
                    ← Back to Extras
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Summary helpers ───────────────────────────────────────────────────────
  const _hasChoices = (pkg.choiceGroups ?? []).length > 0
  const _allIncludes = pkg.includes.filter(inc => !(_hasChoices && /^\d+\s/.test(inc.trim())))
  const _visibleIncludes = _allIncludes.filter((_, idx) => !removedIncludes.includes(idx))
  function _groupShortName(label: string) {
    return label.replace(/\s*\(pick\s*\d+\)/gi, "").replace(/\s*of\s+your\s+choice/gi, "").replace(/\s*\(.*?\)/g, "").trim()
  }
  const _summaryTotal = _visibleIncludes.length + (pkg.choiceGroups?.reduce((s, g) => s + g.pick, 0) ?? 0) + menuExtras.length + essentialItems.length

  // ── EXTRAS SCREEN (Step 2: Add Extras) ────────────────────────────────────
  return (
    <div className="min-h-screen bg-warm-bg pb-36 md:pb-0">
      <OrderHeader step={step} onSetStep={setStep} onGoBack={handleGoBack} />

      <div className="max-w-6xl mx-auto px-4 py-5 flex gap-6 items-start">
        {/* ── LEFT ─────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Selected Package Banner — compact */}
          <div className={`bg-gradient-to-r ${pkg.color} rounded-2xl px-5 py-3.5 text-white flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 ${pkg.badgeColor}`}>{pkg.tag}</span>
              <div>
                <p className="font-bold text-base leading-tight">{pkg.name}</p>
                <p className="text-white/70 text-xs mt-0.5 hidden sm:block">{pkg.includes.slice(0, 3).join(" · ")}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold">₹{pkg.price}</p>
              <p className="text-white/60 text-[10px]">per person</p>
            </div>
          </div>

          {/* Extra Dishes */}
          <div className="bg-white rounded-2xl border border-warm-border shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-playfair text-xl font-bold text-text-dark border-b border-warm-border pb-3 mb-4">Add Extra Dishes <span className="text-base">✨</span></h2>
                  <p className="text-text-muted text-xs mt-0.5">Optional — add any dishes from our menu</p>
                </div>
                {menuExtras.length > 0 && (
                  <span className="bg-primary text-gold text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ml-3">+{menuExtras.length}</span>
                )}
              </div>
              <OrderItemPicker
                sections={menuSections}
                selected={menuExtras}
                onToggle={toggleMenuExtra}
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT: ORDER SUMMARY SIDEBAR ────────────────────────────── */}
        <div className="hidden md:block w-[380px] flex-shrink-0">
          <div className="sticky top-20 bg-white rounded-2xl shadow-lg overflow-hidden border border-warm-border">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-mid rounded-t-2xl px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🛒</span>
                <h3 className="font-playfair text-white font-bold text-lg">Order Summary</h3>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">{_summaryTotal} items</span>
                <button onClick={() => setSummaryEditMode(v => !v)} title={summaryEditMode ? "Done" : "Edit order"}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${summaryEditMode ? "bg-white text-primary" : "bg-white/15 text-white hover:bg-white/25"}`}>
                  {summaryEditMode
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  }
                </button>
              </div>
            </div>

            <div>
              {/* Package section */}
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`flex-1 text-sm font-extrabold uppercase tracking-wider ${pkg.tag === "VEG" ? "text-green-700" : "text-primary"}`}>{pkg.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm text-text-muted">👥</span>
                    <input type="number" min={30} value={form.guestCount}
                      onChange={e => setForm(prev => ({...prev, guestCount: e.target.value}))}
                      className="w-24 border border-warm-border rounded-lg px-3 py-1.5 text-sm text-center font-semibold text-text-dark focus:outline-none focus:border-primary/50 bg-surface"
                      placeholder="guests" />
                  </div>
                </div>
                <div className={`border-l-2 pl-4 space-y-2.5 ${pkg.tag === "VEG" ? "border-green-300" : "border-primary/30"}`}>
                  {_visibleIncludes.map((inc, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${pkg.tag === "VEG" ? "bg-green-400" : "bg-primary/60"}`} />
                      <span className="flex-1 text-sm text-text-dark leading-snug">{inc}</span>
                      {summaryEditMode && (
                        <button onClick={() => setRemovedIncludes(prev => [...prev, _allIncludes.indexOf(inc)])}
                          className="w-6 h-6 rounded-full bg-warm-bg flex items-center justify-center text-primary/60 hover:bg-warm-border hover:text-primary flex-shrink-0 transition-colors text-base leading-none">–</button>
                      )}
                    </div>
                  ))}
                  {(pkg.choiceGroups ?? []).map((group) => {
                    const sel = preferences[group.id] ?? []
                    const shortName = _groupShortName(group.label)
                    return Array.from({ length: group.pick }, (_, i) => (
                      <div key={`${group.id}-${i}`} className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${pkg.tag === "VEG" ? "bg-green-400" : "bg-primary/60"}`} />
                        <select value={sel[i] ?? ""}
                          onChange={(e) => { setPreferences(prev => { const cur = [...(prev[group.id] ?? [])]; cur[i] = e.target.value; return { ...prev, [group.id]: cur } }) }}
                          className={`w-[180px] flex-shrink-0 border rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none appearance-none cursor-pointer transition-colors ${sel[i] ? "border-green-200 bg-green-50 text-green-900" : "border-warm-border bg-surface text-text-muted"}`}
                          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: "28px" }}>
                          <option value="">{group.pick > 1 ? `${shortName} ${i + 1}` : shortName}</option>
                          {group.options.filter(opt => opt === sel[i] || !sel.includes(opt)).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        {summaryEditMode && (
                          <button
                            onClick={() => setPreferences(prev => {
                              const cur = [...(prev[group.id] ?? [])]
                              cur[i] = ""
                              return { ...prev, [group.id]: cur }
                            })}
                            className="w-6 h-6 rounded-full bg-warm-bg flex items-center justify-center text-primary/60 hover:bg-warm-border hover:text-primary flex-shrink-0 transition-colors text-base leading-none"
                          >–</button>
                        )}
                      </div>
                    ))
                  })}
                </div>
              </div>

              {/* Extra dishes */}
              {menuExtras.length > 0 && (
                <div className="px-5 py-4 border-t border-warm-border">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Extra Dishes</p>
                  <div className="border-l-2 border-primary/30 pl-4 space-y-2.5">
                    {menuSections.flatMap(s => s.items.filter(i => menuExtras.includes(i.name)).map(item => (
                      <div key={item.name} className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.diet === "veg" ? "bg-green-400" : "bg-primary/60"}`} />
                        <span className="w-[170px] flex-shrink-0 text-sm text-text-dark truncate">{item.name}</span>
                        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                          {item.price > 0 && <span className="text-xs text-gold font-semibold">+₹{item.price}</span>}
                          {summaryEditMode && (
                            <button onClick={() => setMenuExtras(prev => prev.filter(n => n !== item.name))}
                              className="w-6 h-6 rounded-full bg-warm-bg flex items-center justify-center text-primary/60 hover:bg-warm-border hover:text-primary flex-shrink-0 transition-colors text-base leading-none">–</button>
                          )}
                        </div>
                      </div>
                    )))}
                  </div>
                </div>
              )}

              {/* Essentials — no heading, no Free tag */}
              {essentialItems.length > 0 && (
                <div className="px-5 py-4 border-t border-warm-border">
                  <div className="border-l-2 border-warm-border pl-4 space-y-2.5">
                    {essentialItems.map(name => (
                      <div key={name} className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-warm-border" />
                        <span className="flex-1 text-sm text-text-muted">{name}</span>
                        {summaryEditMode && (
                          <button onClick={() => setEssentialItems(prev => prev.filter(n => n !== name))}
                            className="w-6 h-6 rounded-full bg-warm-bg flex items-center justify-center text-primary/60 hover:bg-warm-border hover:text-primary flex-shrink-0 transition-colors text-base leading-none">–</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-warm-border px-5 py-4 bg-surface">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-xs text-text-muted mb-0.5">₹{totalPerPerson}/person × {guests} guests</p>
                  <p className="text-xl font-bold text-gold">₹{grandTotal.toLocaleString("en-IN")}</p>
                </div>
                {menuExtraCostPerPerson > 0 && (
                  <div className="text-right">
                    <p className="text-[10px] text-text-muted">Extras added</p>
                    <p className="text-sm font-semibold text-gold">+₹{menuExtraCostPerPerson}/pp</p>
                  </div>
                )}
              </div>
              <button onClick={() => setStep("details")}
                className="w-full bg-primary text-gold font-bold py-4 rounded-full shadow-[0_4px_16px_rgba(92,15,15,0.25)] hover:bg-primary-mid transition-colors mt-4">
                Continue to Details →
              </button>
              <p className="text-center text-xs text-text-muted mt-2">Extras are optional · Skip anytime</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM BAR ────────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-warm-border shadow-xl z-40">
        {/* Row 1 — summary tap */}
        <button
          onClick={() => setShowSummaryDrawer(true)}
          className="w-full flex items-center justify-between px-4 pt-3 pb-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🛒</span>
            <span className="text-xs font-semibold text-primary">{_summaryTotal} items</span>
            <span className="text-xs text-text-muted">· tap to review order</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gold text-sm">₹{grandTotal.toLocaleString("en-IN")}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M18 15l-6-6-6 6"/></svg>
          </div>
        </button>
        {/* Row 2 — Continue */}
        <div className="px-4 pb-4">
          <button
            onClick={() => setStep("details")}
            className="w-full bg-primary text-gold py-3.5 rounded-2xl font-bold text-base shadow-[0_4px_16px_rgba(92,15,15,0.25)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            Continue to Details
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>

      {/* ── MOBILE SUMMARY DRAWER — same full summary ─────────────────── */}
      {showSummaryDrawer && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSummaryDrawer(false)} />
          <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">

            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-mid rounded-t-2xl px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🛒</span>
                <h3 className="font-playfair font-bold text-white text-lg">Order Summary</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">{_summaryTotal} items</span>
                <button onClick={() => setSummaryEditMode(v => !v)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${summaryEditMode ? "bg-white text-primary" : "bg-white/15 text-white hover:bg-white/25"}`}>
                  {summaryEditMode
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  }
                </button>
                <button onClick={() => setShowSummaryDrawer(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-lg leading-none hover:bg-white/20">×</button>
              </div>
            </div>

            {/* Scrollable content — same layout as desktop */}
            <div className="flex-1 overflow-y-auto">
              {/* Package */}
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`flex-1 text-sm font-extrabold uppercase tracking-wider ${pkg.tag === "VEG" ? "text-green-700" : "text-primary"}`}>{pkg.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-muted">👥</span>
                    <input type="number" min={30} value={form.guestCount}
                      onChange={e => setForm(prev => ({...prev, guestCount: e.target.value}))}
                      className="w-24 border border-warm-border rounded-lg px-3 py-1.5 text-sm text-center font-semibold text-text-dark focus:outline-none focus:border-primary/50 bg-surface"
                      placeholder="guests" />
                  </div>
                </div>
                <div className={`border-l-2 pl-4 space-y-3 ${pkg.tag === "VEG" ? "border-green-300" : "border-primary/30"}`}>
                  {_visibleIncludes.map((inc, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${pkg.tag === "VEG" ? "bg-green-400" : "bg-primary/60"}`} />
                      <span className="flex-1 text-sm text-text-dark">{inc}</span>
                      {summaryEditMode && (
                        <button onClick={() => setRemovedIncludes(prev => [...prev, _allIncludes.indexOf(inc)])}
                          className="w-6 h-6 rounded-full bg-warm-bg flex items-center justify-center text-primary/60 hover:bg-warm-border hover:text-primary flex-shrink-0 transition-colors text-base leading-none">–</button>
                      )}
                    </div>
                  ))}
                  {(pkg.choiceGroups ?? []).map((group) => {
                    const sel = preferences[group.id] ?? []
                    const shortName = _groupShortName(group.label)
                    return Array.from({ length: group.pick }, (_, i) => (
                      <div key={`${group.id}-${i}`} className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${pkg.tag === "VEG" ? "bg-green-400" : "bg-primary/60"}`} />
                        <select value={sel[i] ?? ""}
                          onChange={(e) => { setPreferences(prev => { const cur = [...(prev[group.id] ?? [])]; cur[i] = e.target.value; return { ...prev, [group.id]: cur } }) }}
                          className={`flex-1 border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none appearance-none cursor-pointer ${sel[i] ? "border-green-200 bg-green-50 text-green-900" : "border-warm-border bg-surface text-text-muted"}`}
                          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: "28px" }}>
                          <option value="">{group.pick > 1 ? `${shortName} ${i + 1}` : shortName}</option>
                          {group.options.filter(opt => opt === sel[i] || !sel.includes(opt)).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        {summaryEditMode && (
                          <button
                            onClick={() => setPreferences(prev => {
                              const cur = [...(prev[group.id] ?? [])]
                              cur[i] = ""
                              return { ...prev, [group.id]: cur }
                            })}
                            className="w-6 h-6 rounded-full bg-warm-bg flex items-center justify-center text-primary/60 hover:bg-warm-border hover:text-primary flex-shrink-0 transition-colors text-base leading-none"
                          >–</button>
                        )}
                      </div>
                    ))
                  })}
                </div>
              </div>

              {/* Extra dishes */}
              {menuExtras.length > 0 && (
                <div className="px-5 py-4 border-t border-warm-border">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Extra Dishes</p>
                  <div className="border-l-2 border-primary/30 pl-4 space-y-3">
                    {menuSections.flatMap(s => s.items.filter(i => menuExtras.includes(i.name)).map(item => (
                      <div key={item.name} className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.diet === "veg" ? "bg-green-400" : "bg-primary/60"}`} />
                        <span className="w-[170px] flex-shrink-0 text-sm text-text-dark truncate">{item.name}</span>
                        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                          {item.price > 0 && <span className="text-xs text-gold font-semibold">+₹{item.price}</span>}
                          {summaryEditMode && (
                            <button onClick={() => setMenuExtras(prev => prev.filter(n => n !== item.name))}
                              className="w-6 h-6 rounded-full bg-warm-bg flex items-center justify-center text-primary/60 hover:bg-warm-border hover:text-primary flex-shrink-0 transition-colors text-base leading-none">–</button>
                          )}
                        </div>
                      </div>
                    )))}
                  </div>
                </div>
              )}

              {/* Essentials */}
              {essentialItems.length > 0 && (
                <div className="px-5 py-4 border-t border-warm-border">
                  <div className="border-l-2 border-warm-border pl-4 space-y-3">
                    {essentialItems.map(name => (
                      <div key={name} className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-warm-border" />
                        <span className="flex-1 text-sm text-text-muted">{name}</span>
                        {summaryEditMode && (
                          <button onClick={() => setEssentialItems(prev => prev.filter(n => n !== name))}
                            className="w-6 h-6 rounded-full bg-warm-bg flex items-center justify-center text-primary/60 hover:bg-warm-border hover:text-primary flex-shrink-0 transition-colors text-base leading-none">–</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-warm-border px-5 py-4 bg-surface flex-shrink-0">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-xs text-text-muted mb-0.5">₹{totalPerPerson}/person × {guests} guests</p>
                  <p className="text-xl font-bold text-gold">₹{grandTotal.toLocaleString("en-IN")}</p>
                </div>
                {menuExtraCostPerPerson > 0 && (
                  <div className="text-right">
                    <p className="text-[10px] text-text-muted">Extras</p>
                    <p className="text-sm font-semibold text-gold">+₹{menuExtraCostPerPerson}/pp</p>
                  </div>
                )}
              </div>
              <button onClick={() => { setShowSummaryDrawer(false); setStep("details") }}
                className="w-full bg-primary text-gold font-bold py-4 rounded-full shadow-[0_4px_16px_rgba(92,15,15,0.25)] hover:bg-primary-mid transition-colors mt-4">
                Continue to Details →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-warm-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-primary font-semibold">Loading…</p>
        </div>
      </div>
    }>
      <OrderInner />
    </Suspense>
  )
}
