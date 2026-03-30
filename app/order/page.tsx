"use client"

import { useState, useMemo, useRef, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getPackages, getExtraCategories, addBooking } from "../lib/siteData"

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
    color: "from-[#8B4513] to-[#b5601e]",
    badgeColor: "bg-red-100 text-red-800",
    includes: ["Biryani (7 variants)", "Sambar", "Gongura Pachadi", "Curd Chutney", "Raita", "Plates & Service"],
  },
  "non-veg-premium": {
    id: "non-veg-premium", name: "Non-Veg Premium", tag: "NON-VEG", price: 180,
    color: "from-[#3d1a07] to-[#6b2d0f]",
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

// ─── Inner Component ──────────────────────────────────────────────────────────
function OrderInner() {
  const router = useRouter()
  const params = useSearchParams()
  const pkgId = params.get("pkg") ?? "non-veg-basic"

  // Load admin-edited packages & extras from localStorage
  const [pkgsMap, setPkgsMap] = useState(PACKAGES)
  const [extraCats, setExtraCats] = useState(EXTRA_CATEGORIES)
  useEffect(() => {
    const adminPkgs = getPackages()
    const map: typeof PACKAGES = {}
    adminPkgs.forEach((p) => {
      map[p.id] = {
        id: p.id,
        name: p.name,
        tag: p.tag,
        price: p.price,
        color: p.color,
        badgeColor: p.badgeColor,
        includes: p.includes,
        choiceGroups: p.choiceGroups,
      }
    })
    setPkgsMap(map)
    // Filter out unavailable extras
    const adminExtras = getExtraCategories()
    const filteredCats = adminExtras.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => item.available !== false),
    })).filter((cat) => cat.items.length > 0)
    setExtraCats(filteredCats as typeof EXTRA_CATEGORIES)
  }, [])

  const pkg = pkgsMap[pkgId] ?? pkgsMap["non-veg-basic"] ?? Object.values(pkgsMap)[0]

  // 3-step flow: "extras" → "details" → "done"
  const [step, setStep] = useState<"extras" | "details" | "done">("extras")
  const [activeCategory, setActiveCategory] = useState("starters")
  const [extras, setExtras] = useState<Record<string, boolean>>({})
  const [showSummaryDrawer, setShowSummaryDrawer] = useState(false)
  const tabsScrollRef = useRef<HTMLDivElement>(null)
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

  const totalPerPerson = (pkg?.price ?? 0) + extraCostPerPerson
  const grandTotal = totalPerPerson * guests

  const currentCat = extraCats.find((c) => c.id === activeCategory) ?? extraCats[0]!

  function toggle(id: string) {
    setExtras((prev) => ({ ...prev, [id]: !prev[id] }))
  }

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
      notes: form.notes.trim(),
      totalPerPerson,
      submittedAt: new Date().toISOString(),
      status: "pending",
    })
    setConfirmationNo(confNo)
    setFormLoading(false)
    setStep("done")
  }

  // ── Shared header component ────────────────────────────────────────────────
  const stepLabels = [
    { n: 1, label: "Package", done: true, path: "/packages" },
    { n: 2, label: "Add Extras", done: false, active: step === "extras" },
    { n: 3, label: "Confirm", done: false, active: step === "details" },
  ]

  const Header = () => (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur shadow-sm border-b border-[#f0e6d3]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#8B4513] flex items-center justify-center text-base flex-shrink-0">🍛</div>
          <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg font-bold text-[#8B4513] font-playfair leading-tight">
                Ajay Foods &amp; Beverages
              </h1>
              <p className="text-xs text-[#D4A853] font-medium tracking-wide">Quality Assured Foods</p>
            </div>
        </button>

        <div className="flex items-center gap-1.5 text-xs">
          <button onClick={() => router.push("/packages")} className="flex items-center gap-1.5 text-[#aaa] hover:text-[#8B4513] px-2 py-1.5 transition-colors">
            <span className="w-4 h-4 rounded-full bg-[#D4A853] text-white flex items-center justify-center font-bold text-[10px]">✓</span>
            <span className="hidden sm:inline">Package</span>
          </button>
          <span className="text-[#ccc]">›</span>
          <span className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full font-semibold ${step === "extras" ? "bg-[#8B4513] text-white" : "text-[#aaa]"}`}>
            {step !== "extras" ? <span className="w-4 h-4 rounded-full bg-[#D4A853] text-white flex items-center justify-center font-bold text-[10px]">✓</span> : <span className="w-4 h-4 rounded-full bg-white text-[#8B4513] flex items-center justify-center font-bold text-[10px]">2</span>}
            <span className="hidden sm:inline">Add Extras</span>
          </span>
          <span className="text-[#ccc]">›</span>
          <span className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full font-semibold ${step === "details" ? "bg-[#8B4513] text-white" : "text-[#aaa]"}`}>
            {step === "details" ? <span className="w-4 h-4 rounded-full bg-white text-[#8B4513] flex items-center justify-center font-bold text-[10px]">3</span> : <span className="w-4 h-4 rounded-full border border-[#ccc] flex items-center justify-center text-[10px]">3</span>}
            <span className="hidden sm:inline">Confirm</span>
          </span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={() => router.push("/")}
            className="text-sm text-[#888] hover:text-[#8B4513] transition-colors flex items-center gap-1">
            🏠 <span className="hidden sm:inline">Home</span>
          </button>
          <span className="text-[#e0d0bc]">|</span>
          <button onClick={() => step === "details" ? setStep("extras") : router.push("/packages")}
            className="text-sm text-[#888] hover:text-[#8B4513] transition-colors flex items-center gap-1">
            ← {step === "details" ? "Back" : "Packages"}
          </button>
        </div>
      </div>
    </header>
  )

  // ── DONE SCREEN ────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-[#f0e6d3]">
          <div className="bg-gradient-to-br from-[#3d1a07] to-[#8B4513] px-8 py-10 text-center text-white">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl mx-auto mb-4">✅</div>
            <h1 className="font-playfair text-3xl font-bold">Booking Request Sent!</h1>
            <p className="text-white/70 mt-2">We&apos;ll call you within 24 hours to confirm</p>
            <div className="mt-4 bg-white/10 border border-white/20 rounded-2xl px-5 py-3 inline-block">
              <p className="text-xs text-white/60 mb-0.5">Confirmation Number</p>
              <p className="font-playfair text-2xl font-bold text-[#D4A853]">{confirmationNo}</p>
            </div>
          </div>
          <div className="p-6 space-y-3 text-sm">
            {[
              { label: "Name",   value: form.name },
              { label: "Phone",  value: `+91 ${form.phone}` },
              { label: "Event",  value: `${form.eventType} · ${form.eventDate}` },
              { label: "Guests", value: `${guests} persons` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b border-[#f0e6d3]">
                <span className="text-[#888]">{label}</span>
                <span className="font-semibold text-right max-w-[60%]">{value}</span>
              </div>
            ))}

            {/* Package with full includes */}
            <div className="py-2 border-b border-[#f0e6d3]">
              <div className="flex justify-between mb-2">
                <span className="text-[#888]">Package</span>
                <span className="font-semibold text-[#8B4513]">{pkg.name} — ₹{pkg.price}/person</span>
              </div>
              <ul className="space-y-0.5 pl-2">
                {pkg.includes.map((inc, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-[#555]">
                    <span className="text-[#D4A853] flex-shrink-0">✓</span>{inc}
                  </li>
                ))}
              </ul>
            </div>

            {/* Meal preferences */}
            {Object.keys(preferences).filter(k => (preferences[k] ?? []).length > 0).length > 0 && (
              <div className="py-2 border-b border-[#f0e6d3]">
                <span className="text-[#888] block mb-1.5">Your Choices</span>
                {(pkg.choiceGroups ?? []).map(g => {
                  const sel = preferences[g.id] ?? []
                  if (sel.length === 0) return null
                  return (
                    <div key={g.id} className="flex justify-between text-xs mb-1">
                      <span className="text-[#888]">{g.label}</span>
                      <span className="font-semibold text-right max-w-[55%]">{sel.join(", ")}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Extras */}
            {selectedExtras.length > 0 && (
              <div className="py-2 border-b border-[#f0e6d3]">
                <span className="text-[#888] block mb-1.5">Extra Dishes ({selectedExtras.length})</span>
                <div className="flex flex-wrap gap-1">
                  {selectedExtras.map(item => (
                    <span key={item.id} className="flex items-center gap-1 text-xs bg-[#FDF6EC] border border-[#e0d0bc] px-2 py-0.5 rounded-full text-[#555]">
                      {item.emoji} {item.name} <span className="text-[#8B4513] font-semibold">+₹{item.price}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between py-3 bg-[#FDF6EC] rounded-2xl px-4 -mx-4 mt-2">
              <span className="font-bold text-[#8B4513] text-base">Estimated Total</span>
              <span className="font-bold text-[#8B4513] text-base">₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
            <p className="text-center text-xs text-[#aaa] pt-1">Save your confirmation number for reference.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => router.push("/packages")}
                className="flex-1 border border-[#8B4513] text-[#8B4513] py-3 rounded-xl font-semibold hover:bg-[#8B4513] hover:text-white transition-colors text-sm">
                New Order
              </button>
              <button onClick={() => router.push("/")}
                className="flex-1 bg-[#8B4513] text-white py-3 rounded-xl font-semibold hover:bg-[#6d3410] transition-colors text-sm">
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
      <div className="min-h-screen bg-[#FDF6EC] pb-32 md:pb-10">
        <Header />

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h2 className="font-playfair text-2xl font-bold text-[#8B4513]">Review &amp; Confirm</h2>
            <p className="text-[#888] text-sm mt-0.5">Check your order and fill in your contact details to submit.</p>
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
              <div className="bg-white rounded-2xl border border-[#f0e6d3] shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-playfair text-lg font-bold text-[#8B4513]">Extra Dishes</h3>
                  <button onClick={() => setStep("extras")}
                    className="text-xs text-[#8B4513] border border-[#8B4513] px-3 py-1 rounded-full hover:bg-[#8B4513] hover:text-white transition-colors font-semibold">
                    Edit Extras
                  </button>
                </div>
                {selectedExtras.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-[#aaa] text-sm">No extras added</p>
                    <button onClick={() => setStep("extras")} className="text-[#8B4513] text-sm font-semibold mt-1 underline">Add some extras →</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedExtras.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 bg-[#FDF6EC] rounded-xl px-3 py-2">
                        <span className="text-lg">{item.emoji}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{item.name}</p>
                          <p className="text-[10px] text-[#8B4513] font-bold">+₹{item.price}/pp</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cost Breakdown */}
              <div className="bg-white rounded-2xl border border-[#f0e6d3] shadow-sm p-5">
                <h3 className="font-playfair text-lg font-bold text-[#8B4513] mb-4">Cost Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[#555]">
                    <span>{pkg.name} (₹{pkg.price} × {guests} guests)</span>
                    <span className="font-medium">₹{(pkg.price * guests).toLocaleString("en-IN")}</span>
                  </div>
                  {selectedExtras.map((item) => (
                    <div key={item.id} className="flex justify-between text-[#555]">
                      <span className="flex items-center gap-1.5"><span>{item.emoji}</span>{item.name} (₹{item.price} × {guests})</span>
                      <span className="font-medium">₹{(item.price * guests).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-[#8B4513] text-base pt-3 border-t-2 border-[#D4A853]/40 mt-2">
                    <span>Estimated Total</span>
                    <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <p className="text-[10px] text-[#aaa] text-center">Final pricing confirmed on call · Min 30 guests</p>
                </div>
              </div>
            </div>

            {/* RIGHT: Contact Form */}
            <div className="w-full lg:w-[400px] flex-shrink-0">
              <div className="bg-white rounded-2xl border border-[#f0e6d3] shadow-md p-6">
                <h3 className="font-playfair text-xl font-bold text-[#8B4513] mb-5">Your Contact Details</h3>
                <div className="space-y-4">
                  <div className={errors.name ? "error-field" : ""}>
                    <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Your Name *</label>
                    <input type="text" placeholder="Ramesh Kumar" value={form.name}
                      onChange={(e) => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: "" }) }}
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/10 bg-[#FDF6EC] ${errors.name ? "border-red-400" : "border-[#e0d0bc]"}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div className={errors.phone ? "error-field" : ""}>
                    <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Phone Number *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#888] font-medium">+91</span>
                      <input type="tel" placeholder="98765 43210" maxLength={10}
                        value={form.phone}
                        onChange={(e) => { const d = e.target.value.replace(/\D/g,"").slice(0,10); setForm({...form,phone:d}); if(errors.phone) setErrors({...errors,phone:""}) }}
                        className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/10 bg-[#FDF6EC] ${errors.phone ? "border-red-400" : "border-[#e0d0bc]"}`}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div className={errors.eventType ? "error-field" : ""}>
                    <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Event Type *</label>
                    <select value={form.eventType}
                      onChange={(e) => { setForm({...form,eventType:e.target.value}); if(errors.eventType) setErrors({...errors,eventType:""}) }}
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/10 bg-[#FDF6EC] ${errors.eventType ? "border-red-400" : "border-[#e0d0bc]"}`}
                    >
                      <option value="">Select type…</option>
                      {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    {errors.eventType && <p className="text-red-500 text-xs mt-1">{errors.eventType}</p>}
                  </div>

                  <div className={errors.guestCount ? "error-field" : ""}>
                    <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">
                      Guest Count * <span className="text-[#888] normal-case font-normal">(min 30)</span>
                    </label>
                    <input type="number" placeholder="100" min={30} max={5000} value={form.guestCount}
                      onChange={(e) => { setForm({...form,guestCount:e.target.value}); if(errors.guestCount) setErrors({...errors,guestCount:""}) }}
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/10 bg-[#FDF6EC] ${errors.guestCount ? "border-red-400" : "border-[#e0d0bc]"}`}
                    />
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {[50, 100, 200, 500].map((n) => (
                        <button key={n} type="button" onClick={() => setForm({ ...form, guestCount: String(n) })}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-[#FDF6EC] border border-[#e0d0bc] text-[#666] hover:border-[#8B4513] hover:text-[#8B4513] transition-colors"
                        >{n}</button>
                      ))}
                    </div>
                    {errors.guestCount && <p className="text-red-500 text-xs mt-1">{errors.guestCount}</p>}
                  </div>

                  <div className={errors.eventDate ? "error-field" : ""}>
                    <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Event Date *</label>
                    <input type="date" min={tomorrowStr} max={oneYearStr} value={form.eventDate}
                      onChange={(e) => { setForm({...form,eventDate:e.target.value}); if(errors.eventDate) setErrors({...errors,eventDate:""}) }}
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/10 bg-[#FDF6EC] ${errors.eventDate ? "border-red-400" : "border-[#e0d0bc]"}`}
                    />
                    {errors.eventDate && <p className="text-red-500 text-xs mt-1">{errors.eventDate}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Special Requests</label>
                    <textarea rows={3} placeholder="Any other dietary requirements or special notes…" value={form.notes}
                      onChange={(e) => setForm({...form,notes:e.target.value})}
                      className="w-full border border-[#e0d0bc] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/10 bg-[#FDF6EC] resize-none"
                    />
                  </div>

                  {/* Total preview */}
                  <div className="bg-[#FDF6EC] border border-[#e0d0bc] rounded-xl px-4 py-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-[#555]">Estimated total ({guests} guests)</span>
                      <span className="font-bold text-[#8B4513] text-base">₹{grandTotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <button onClick={handleSubmit} disabled={formLoading}
                    className="w-full bg-[#8B4513] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#6d3410] transition-colors shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
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
                  <p className="text-center text-xs text-[#aaa]">We&apos;ll call you within 24 hours to confirm.</p>
                  <button onClick={() => setStep("extras")} className="w-full text-center text-sm text-[#888] hover:text-[#8B4513] transition-colors py-1">
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

  // ── EXTRAS SCREEN (Step 2: Add Extras) ────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FDF6EC] pb-32 md:pb-0">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6 items-start">
        {/* ── LEFT ─────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Selected Package Banner */}
          <div className={`bg-gradient-to-r ${pkg.color} rounded-2xl p-5 text-white flex items-center justify-between`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${pkg.badgeColor}`}>{pkg.tag}</span>
                <span className="text-white/70 text-xs">Selected Package</span>
              </div>
              <h2 className="font-playfair text-xl font-bold">{pkg.name}</h2>
              <p className="text-white/80 text-sm mt-0.5">{pkg.includes.slice(0, 3).join(" · ")}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">₹{pkg.price}</p>
              <p className="text-white/70 text-xs">per person</p>
            </div>
          </div>

          {/* Extra Dishes */}
          <div className="bg-white rounded-2xl border border-[#f0e6d3] shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-0">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h2 className="font-playfair text-xl font-bold text-[#8B4513]">
                    Want to add extra dishes? ✨
                  </h2>
                  <p className="text-[#888] text-sm mt-0.5">Completely optional — add items to make it special</p>
                </div>
                {selectedExtras.length > 0 && (
                  <span className="bg-[#8B4513] text-white text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ml-4">
                    +{selectedExtras.length} added
                  </span>
                )}
              </div>

              {/* Category Tabs with scroll arrows */}
              <div className="relative mt-4 pb-4">
                {/* Left arrow */}
                <button
                  type="button"
                  onClick={() => tabsScrollRef.current?.scrollBy({ left: -160, behavior: "smooth" })}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-[#e0d0bc] shadow-md flex items-center justify-center text-[#8B4513] hover:bg-[#8B4513] hover:text-white transition-colors text-xs font-bold"
                  aria-label="Scroll tabs left"
                >
                  ‹
                </button>
                <div ref={tabsScrollRef} className="flex gap-2 overflow-x-auto scrollbar-none px-9">
                  {extraCats.map((cat) => {
                    const count = cat.items.filter((i) => extras[i.id]).length
                    return (
                      <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                          activeCategory === cat.id
                            ? "bg-[#8B4513] text-white shadow-md"
                            : "bg-[#FDF6EC] text-[#555] border border-[#e0d0bc] hover:border-[#8B4513] hover:text-[#8B4513]"
                        }`}
                      >
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                        {count > 0 && (
                          <span className={`text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${
                            activeCategory === cat.id ? "bg-white/20 text-white" : "bg-[#8B4513] text-white"
                          }`}>{count}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
                {/* Right arrow */}
                <button
                  type="button"
                  onClick={() => tabsScrollRef.current?.scrollBy({ left: 160, behavior: "smooth" })}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-[#e0d0bc] shadow-md flex items-center justify-center text-[#8B4513] hover:bg-[#8B4513] hover:text-white transition-colors text-xs font-bold"
                  aria-label="Scroll tabs right"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="px-6 pb-6">
              <p className="text-xs text-[#aaa] mb-4 font-medium">{currentCat.desc}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {currentCat.items.map((item) => {
                  const isAdded = !!extras[item.id]
                  return (
                    <button key={item.id} onClick={() => toggle(item.id)}
                      className={`relative rounded-2xl overflow-hidden text-left transition-all duration-200 ${
                        isAdded ? "ring-2 ring-[#8B4513] shadow-md scale-[1.02]" : "hover:shadow-md hover:scale-[1.01] border border-[#f0e6d3]"
                      }`}
                    >
                      <div className={`h-24 flex items-center justify-center text-5xl ${
                        item.diet === "veg"
                          ? isAdded ? "bg-green-50" : "bg-[#f5faf5]"
                          : isAdded ? "bg-red-50" : "bg-[#fdf5f0]"
                      }`}>
                        {item.emoji}
                        {item.popular && !isAdded && (
                          <span className="absolute top-2 right-2 bg-[#D4A853] text-[#3d1a07] text-[8px] font-bold px-1.5 py-0.5 rounded-full">HOT</span>
                        )}
                        {isAdded && (
                          <span className="absolute top-2 right-2 w-6 h-6 bg-[#8B4513] rounded-full flex items-center justify-center text-white text-xs font-bold">✓</span>
                        )}
                      </div>
                      <div className="bg-white px-3 py-2.5">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${item.diet === "veg" ? "bg-green-500" : "bg-red-500"}`} />
                          <p className="font-semibold text-[#1a1a1a] text-xs leading-snug truncate">{item.name}</p>
                        </div>
                        <p className="text-[#8B4513] font-bold text-sm">₹{item.price}<span className="text-[#aaa] font-normal text-[10px]">/person</span></p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: STICKY SIDEBAR ─────────────────────────────────────── */}
        <div className="hidden md:block w-80 flex-shrink-0">
          <div className="sticky top-20 bg-white rounded-2xl border border-[#f0e6d3] shadow-md overflow-hidden">
            <div className={`bg-gradient-to-br ${pkg.color} px-5 py-4`}>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-0.5">Your Selection</p>
              <h3 className="font-playfair text-lg font-bold text-white">{pkg.name}</h3>
            </div>

            <div className="p-5 space-y-3 max-h-[40vh] overflow-y-auto">
              <div className="flex justify-between text-sm">
                <span className="text-[#555]">{pkg.name} (base)</span>
                <span className="font-medium text-[#1a1a1a]">₹{pkg.price}/pp</span>
              </div>
              {selectedExtras.length > 0 && (
                <>
                  <div className="border-t border-[#f5ece0] pt-3">
                    <p className="text-[10px] font-bold text-[#aaa] uppercase tracking-wider mb-2">Extras (+₹{extraCostPerPerson}/pp)</p>
                    {selectedExtras.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm py-1">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className="text-base">{item.emoji}</span>
                          <span className="text-[#444] truncate text-xs">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-[#8B4513] font-semibold text-xs">+₹{item.price}</span>
                          <button onClick={() => toggle(item.id)} className="text-[#ccc] hover:text-red-400 transition-colors text-lg leading-none ml-1">×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {selectedExtras.length === 0 && (
                <p className="text-xs text-[#aaa] text-center py-2">No extras selected yet — tap items on the left!</p>
              )}
            </div>

            {/* Meal Preference Dropdowns — shown in sidebar on step 2 */}
            {(pkg.choiceGroups ?? []).length > 0 && (
              <div className="border-t border-[#f0e6d3] px-5 py-4 space-y-3">
                <p className="text-[10px] font-bold text-[#aaa] uppercase tracking-wider">🎯 Your Meal Choices</p>
                {(pkg.choiceGroups ?? []).map((group) => {
                  const selected = preferences[group.id] ?? []
                  const selects = Array.from({ length: group.pick }, (_, i) => i)
                  return (
                    <div key={group.id}>
                      <label className="block text-[10px] font-semibold text-[#555] mb-1">
                        {group.label}
                        {selected.filter(Boolean).length === group.pick
                          ? <span className="ml-1.5 text-green-600 font-normal">✓</span>
                          : <span className="ml-1.5 text-amber-500 font-normal">(pick {group.pick})</span>
                        }
                      </label>
                      <div className={`grid gap-1.5 ${group.pick > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                        {selects.map((i) => (
                          <select key={i} value={selected[i] ?? ""}
                            onChange={(e) => {
                              setPreferences(prev => {
                                const cur = [...(prev[group.id] ?? [])]
                                cur[i] = e.target.value
                                return { ...prev, [group.id]: cur }
                              })
                            }}
                            className="w-full border border-[#e0d0bc] rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-[#8B4513] focus:ring-1 focus:ring-[#8B4513]/20 text-[#333]"
                          >
                            <option value="">— {group.pick > 1 ? `Choice ${i + 1}` : "Select"} —</option>
                            {group.options
                              .filter(opt => opt === selected[i] || !selected.includes(opt))
                              .map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))
                            }
                          </select>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="border-t border-[#f0e6d3] bg-[#FDF6EC] px-5 py-3 text-xs text-[#888]">
              <p>Base: ₹{pkg.price}/person {extraCostPerPerson > 0 && `+ extras: ₹${extraCostPerPerson}/person`}</p>
              <p className="text-[#555] font-semibold mt-0.5">Total rate: ₹{totalPerPerson}/person</p>
            </div>

            <div className="px-5 pb-5 pt-3 space-y-2">
              <button onClick={() => setStep("details")}
                className="w-full bg-[#8B4513] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#6d3410] transition-colors shadow-md flex items-center justify-center gap-2"
              >
                Continue to Details →
              </button>
              <p className="text-center text-xs text-[#aaa]">Extras are optional · Skip if not needed</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM BAR ────────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#f0e6d3] shadow-xl px-4 py-3 z-40">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-[#888]">
              {selectedExtras.length > 0 ? `${selectedExtras.length} extras selected` : "No extras yet"}
            </p>
            <p className="font-bold text-[#8B4513] text-base">₹{totalPerPerson}/person</p>
          </div>
          <div className="flex gap-2">
            {selectedExtras.length > 0 && (
              <button onClick={() => setShowSummaryDrawer(true)}
                className="border border-[#8B4513] text-[#8B4513] px-4 py-2.5 rounded-xl text-sm font-semibold"
              >
                Summary
              </button>
            )}
            <button onClick={() => setStep("details")}
              className="bg-[#8B4513] text-white px-5 py-2.5 rounded-xl text-sm font-bold"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE SUMMARY DRAWER ─────────────────────────────────────── */}
      {showSummaryDrawer && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSummaryDrawer(false)} />
          <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0e6d3]">
              <h3 className="font-playfair text-lg font-bold text-[#8B4513]">Your Extras</h3>
              <button onClick={() => setShowSummaryDrawer(false)} className="text-[#888] text-2xl leading-none w-8 h-8 flex items-center justify-center">×</button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-[#555]">{pkg.name} (base ₹{pkg.price}/pp)</span>
                <span className="font-medium">included</span>
              </div>
              {selectedExtras.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <span>{item.emoji}</span>
                    <span className="text-[#444]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#8B4513] font-semibold">+₹{item.price}/pp</span>
                    <button onClick={() => toggle(item.id)} className="text-[#ccc] hover:text-red-400 text-lg">×</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#f0e6d3] px-5 py-4">
              <div className="flex justify-between font-bold text-[#8B4513] mb-3">
                <span>Total rate</span><span>₹{totalPerPerson}/person</span>
              </div>
              <button onClick={() => { setShowSummaryDrawer(false); setStep("details") }}
                className="w-full bg-[#8B4513] text-white py-3 rounded-xl font-bold text-sm"
              >
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
      <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#8B4513] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#8B4513] font-semibold">Loading…</p>
        </div>
      </div>
    }>
      <OrderInner />
    </Suspense>
  )
}
