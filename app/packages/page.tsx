"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { getPackages } from "../lib/siteData"

const PACKAGES = [
  {
    id: "veg-basic",
    tag: "VEG",
    name: "Veg Basic",
    tagline: "Simple & Wholesome",
    price: 100,
    color: "from-[#2d6a4f] to-[#40916c]",
    lightColor: "bg-[#d8f3dc]",
    textColor: "text-[#1b4332]",
    badgeColor: "bg-green-100 text-green-800",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
    alt: "Vegetarian thali",
    popular: false,
    ideal: "Ideal for 50–200 guests",
    includes: [
      "White Rice (Unlimited)",
      "Sambar + Rasam + Curd",
      "1 Dal (Papu) of your choice",
      "1 Iguru (Vegetable Curry)",
      "1 Pachadi / Chutney",
      "1 Thalimpu (Stir-fry)",
      "Papad",
    ],
  },
  {
    id: "veg-premium",
    tag: "VEG",
    name: "Veg Premium",
    tagline: "Rich & Flavourful",
    price: 140,
    color: "from-[#e9c46a] to-[#f4a261]",
    lightColor: "bg-[#fff3cd]",
    textColor: "text-[#5c3d11]",
    badgeColor: "bg-yellow-100 text-yellow-800",
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80",
    alt: "Indian vegetarian spread",
    popular: true,
    ideal: "Ideal for weddings & functions",
    includes: [
      "White Rice + Pulihora / Ghee Rice",
      "Sambar + Rasam + Curd",
      "2 Dals of your choice",
      "2 Iguru (Vegetable Curries)",
      "2 Pachadis / Chutneys",
      "2 Thalimpu (Stir-fries)",
      "1 Sweet Dish",
      "Papad",
    ],
  },
  {
    id: "non-veg-basic",
    tag: "NON-VEG",
    name: "Non-Veg Basic",
    tagline: "Classic Biryani Feast",
    price: 150,
    color: "from-[#8B4513] to-[#b5601e]",
    lightColor: "bg-[#fce8d8]",
    textColor: "text-[#4a1a05]",
    badgeColor: "bg-red-100 text-red-800",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80",
    alt: "Chicken biryani",
    popular: false,
    ideal: "Ideal for 30–150 guests",
    includes: [
      "Biryani (7 variants to choose)",
      "Sambar",
      "Gongura Pachadi",
      "Perugu (Curd) Chutney",
      "Raita",
      "Plates & Service Included",
    ],
  },
  {
    id: "non-veg-premium",
    tag: "NON-VEG",
    name: "Non-Veg Premium",
    tagline: "Grand Celebration Feast",
    price: 180,
    color: "from-[#3d1a07] to-[#6b2d0f]",
    lightColor: "bg-[#f5ddd0]",
    textColor: "text-[#2a0f03]",
    badgeColor: "bg-red-100 text-red-800",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80",
    alt: "Indian non-veg feast",
    popular: false,
    ideal: "Ideal for grand celebrations",
    includes: [
      "Biryani (7 variants to choose)",
      "Curry of choice (Chicken / Mutton / Fish / Prawn)",
      "Sambar",
      "Gongura Pachadi + Curd Chutney",
      "Raita",
      "Plates & Service Included",
    ],
  },
]

const COMPARE_ROWS = [
  { label: "Biryani (7 variants)",         values: ["—",   "—",   "✓",     "✓"]     },
  { label: "White Rice (Unlimited)",        values: ["✓",   "✓",   "—",     "—"]     },
  { label: "Pulihora / Ghee Rice",          values: ["—",   "✓",   "—",     "—"]     },
  { label: "Sambar + Rasam + Curd",         values: ["✓",   "✓",   "Sambar","Sambar"]},
  { label: "Number of Dals",                values: ["1",   "2",   "—",     "—"]     },
  { label: "Number of Curries",             values: ["1",   "2",   "—",     "Choice"]},
  { label: "Pachadi / Chutney",             values: ["1",   "2",   "2",     "2"]     },
  { label: "Stir-fry (Thalimpu)",           values: ["1",   "2",   "—",     "—"]     },
  { label: "Sweet Dish",                    values: ["—",   "✓",   "—",     "—"]     },
  { label: "Raita",                         values: ["—",   "—",   "✓",     "✓"]     },
  { label: "Plates & Service",              values: ["✓",   "✓",   "✓",     "✓"]     },
  { label: "Price per person",              values: ["₹100","₹140","₹150",  "₹180"]  },
]

function PackagesInner() {
  const router = useRouter()
  const params = useSearchParams()
  const prefill = params.get("prefill")

  const [guestCount, setGuestCount] = useState(100)
  const [guestInput, setGuestInput] = useState("100")
  const [showComparison, setShowComparison] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Load admin-edited packages from localStorage
  const [pkgList, setPkgList] = useState(PACKAGES)
  useEffect(() => {
    setPkgList(getPackages())
  }, [])

  useEffect(() => {
    if (prefill && cardRefs.current[prefill]) {
      setTimeout(() => {
        cardRefs.current[prefill]?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 400)
    }
  }, [prefill])

  function handleGuestInput(v: string) {
    setGuestInput(v)
    const n = parseInt(v)
    if (!isNaN(n) && n >= 1) setGuestCount(Math.min(5000, Math.max(1, n)))
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC]">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur shadow-sm border-b border-[#f0e6d3]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <button onClick={() => router.push("/")} className="flex items-center gap-3 flex-shrink-0">
            <div className="relative w-11 h-11 flex-shrink-0 rounded-full bg-white border-2 border-[#D4A853] overflow-hidden shadow-sm">
              <Image src="/logo.png" alt="Ajay Foods logo" fill className="object-contain p-0.5" priority />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg font-bold text-[#8B4513] font-playfair leading-tight">
                Ajay Foods &amp; Beverages
              </h1>
              <p className="text-xs text-[#D4A853] font-medium tracking-wide">Quality Assured Foods</p>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {[
              { label: "Home", path: "/" },
              { label: "Menu", path: "/menu" },
              { label: "Packages", path: "/packages", active: true },
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
      <div className="bg-gradient-to-br from-[#3d1a07] to-[#8B4513] py-12 px-4 text-center text-white">
        <p className="text-[#D4A853] text-sm font-semibold tracking-widest uppercase mb-2">Step 1 of 3</p>
        <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-3">Choose Your Package</h1>
        <p className="text-white/70 text-base max-w-xl mx-auto">
          Start with a base package that fits your event, then add extra dishes to make it yours.
        </p>
      </div>

      {/* Controls bar */}
      <div className="bg-white border-b border-[#f0e6d3] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Guest count */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
            <span className="text-sm font-semibold text-[#555] whitespace-nowrap">How many guests?</span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="range" min={30} max={1000} step={10} value={Math.min(guestCount, 1000)}
                onChange={(e) => { const n = Number(e.target.value); setGuestCount(n); setGuestInput(String(n)) }}
                className="w-32 sm:w-40 accent-[#8B4513]"
              />
              <input
                type="number" min={30} max={5000} value={guestInput}
                onChange={(e) => handleGuestInput(e.target.value)}
                onBlur={() => { if (!guestInput || parseInt(guestInput) < 30) { setGuestInput("30"); setGuestCount(30) } }}
                className="w-20 border border-[#e0d0bc] rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:border-[#8B4513] bg-[#FDF6EC] font-semibold"
              />
              <span className="text-xs text-[#888]">guests</span>
            </div>
            {/* Quick presets */}
            <div className="flex gap-1.5 flex-wrap">
              {[50, 100, 200, 500].map((n) => (
                <button key={n} onClick={() => { setGuestCount(n); setGuestInput(String(n)) }}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${guestCount === n ? "bg-[#8B4513] text-white border-[#8B4513]" : "border-[#e0d0bc] text-[#666] hover:border-[#8B4513] hover:text-[#8B4513] bg-[#FDF6EC]"}`}
                >{n}</button>
              ))}
            </div>
          </div>
          {/* Compare toggle */}
          <button
            onClick={() => setShowComparison((v) => !v)}
            className={`flex-shrink-0 flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border transition-all ${showComparison ? "bg-[#8B4513] text-white border-[#8B4513]" : "border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"}`}
          >
            {showComparison ? "✕ Hide Comparison" : "⇄ Compare Packages"}
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      {showComparison && (
        <div className="max-w-7xl mx-auto px-4 py-6 overflow-x-auto">
          <div className="bg-white rounded-2xl border border-[#f0e6d3] shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#3d1a07] to-[#8B4513] px-6 py-4">
              <h2 className="font-playfair text-xl font-bold text-white">Package Comparison</h2>
              <p className="text-white/70 text-xs mt-0.5">All prices are per person · Minimum 30 guests</p>
            </div>
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-[#f0e6d3]">
                  <th className="text-left px-5 py-3 text-[#888] font-semibold text-xs uppercase tracking-wider w-40">Feature</th>
                  {pkgList.map((p) => (
                    <th key={p.id} className={`px-4 py-3 text-center font-bold text-sm ${p.popular ? "text-[#8B4513]" : "text-[#333]"}`}>
                      {p.name}
                      {p.popular && <span className="ml-1 text-[9px] bg-[#D4A853] text-[#3d1a07] px-1.5 py-0.5 rounded-full">Popular</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, idx) => (
                  <tr key={row.label} className={idx % 2 === 0 ? "bg-[#FDF6EC]" : "bg-white"}>
                    <td className="px-5 py-2.5 text-[#555] font-medium text-xs">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className={`px-4 py-2.5 text-center text-sm font-semibold ${
                        v === "✓" ? "text-green-600" : v === "—" ? "text-[#ccc]" : "text-[#8B4513]"
                      }`}>{v}</td>
                    ))}
                  </tr>
                ))}
                {/* Price row */}
                <tr className="bg-gradient-to-r from-[#FDF6EC] to-white border-t-2 border-[#D4A853]/30">
                  <td className="px-5 py-3 font-bold text-[#555] text-xs uppercase tracking-wider">Total for {guestCount} guests</td>
                  {pkgList.map((p) => (
                    <td key={p.id} className="px-4 py-3 text-center font-bold text-[#8B4513]">
                      ₹{(p.price * guestCount).toLocaleString("en-IN")}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <div className="px-6 py-4 bg-[#FDF6EC] flex flex-wrap gap-2 justify-center">
              {pkgList.map((p) => (
                <button key={p.id} onClick={() => router.push(`/order?pkg=${p.id}`)}
                  className={`bg-gradient-to-r ${p.color} text-white px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-all shadow-sm`}
                >
                  Choose {p.name} →
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Package Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {pkgList.map((pkg) => {
            const isPrefill = prefill === pkg.id
            return (
              <div
                key={pkg.id}
                ref={(el) => { cardRefs.current[pkg.id] = el }}
                className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col ${
                  isPrefill
                    ? "ring-2 ring-[#D4A853] shadow-xl border-2 border-[#D4A853]"
                    : "border border-[#f0e6d3]"
                }`}
              >
                {/* Pre-selected banner */}
                {isPrefill && (
                  <div className="bg-[#D4A853] text-[#3d1a07] text-center text-[10px] font-bold py-1 tracking-wider uppercase">
                    ⭐ Pre-selected for you
                  </div>
                )}

                {/* Image */}
                <div className="relative h-36 overflow-hidden">
                  <Image
                    src={pkg.image} alt={pkg.alt} fill className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${pkg.color} opacity-60`} />
                  <div className="absolute inset-0 p-3 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${pkg.badgeColor}`}>
                        {pkg.tag}
                      </span>
                      {pkg.popular && (
                        <span className="bg-[#D4A853] text-[#3d1a07] text-[9px] font-bold px-2 py-0.5 rounded-full">
                          ★ Popular
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="font-playfair text-lg font-bold text-white drop-shadow-md leading-tight">{pkg.name}</h2>
                      <p className="text-white/80 text-xs">{pkg.tagline}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Price */}
                  <div className={`${pkg.lightColor} px-3 py-2 rounded-xl mb-1`}>
                    <div className="flex items-baseline gap-0.5">
                      <span className={`font-playfair text-2xl font-bold ${pkg.textColor}`}>₹{pkg.price}</span>
                      <span className={`text-xs font-medium ${pkg.textColor} opacity-70`}>/person</span>
                    </div>
                    <p className={`text-[10px] font-semibold mt-0.5 ${pkg.textColor} opacity-60`}>
                      ≈ ₹{(pkg.price * guestCount).toLocaleString("en-IN")} for {guestCount} guests
                    </p>
                  </div>

                  {/* Ideal for */}
                  <p className="text-[10px] text-[#888] italic mb-3 mt-1">{pkg.ideal}</p>

                  {/* Includes */}
                  <p className="text-[10px] font-bold text-[#888] uppercase tracking-wider mb-2">What&apos;s included</p>
                  <ul className="space-y-1.5 flex-1">
                    {pkg.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-[#444]">
                        <span className="w-4 h-4 rounded-full bg-[#D4A853]/20 flex items-center justify-center text-[#8B4513] text-[10px] flex-shrink-0 mt-0.5 font-bold">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => router.push(`/order?pkg=${pkg.id}`)}
                    className={`mt-4 w-full bg-gradient-to-r ${pkg.color} text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-1.5`}
                  >
                    Choose Package →
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer note */}
        <div className="mt-10 text-center">
          <div className="inline-flex flex-wrap items-center gap-6 sm:gap-8 bg-white border border-[#f0e6d3] rounded-2xl px-6 sm:px-8 py-5 shadow-sm justify-center">
            {[
              { icon: "👥", label: "Min 30 guests" },
              { icon: "🔧", label: "Fully customizable" },
              { icon: "📞", label: "24hr confirmation" },
              { icon: "🚚", label: "On-time delivery" },
            ].map((f) => (
              <div key={f.label} className="text-center">
                <div className="text-2xl mb-1">{f.icon}</div>
                <p className="text-xs text-[#666] font-medium whitespace-nowrap">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PackagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#8B4513] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#8B4513] font-semibold">Loading packages…</p>
        </div>
      </div>
    }>
      <PackagesInner />
    </Suspense>
  )
}
