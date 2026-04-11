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
    color: "from-primary to-primary-light",
    lightColor: "bg-primary/5",
    textColor: "text-text-dark",
    badgeColor: "bg-[#fde8e8] text-[#8B1A1A]",
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
    color: "from-primary via-primary-mid to-primary-light",
    lightColor: "bg-primary/5",
    textColor: "text-text-dark",
    badgeColor: "bg-[#fde8e8] text-[#8B1A1A]",
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

// ─── Animation helpers ─────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function onCardTilt(e: React.MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget
  const { left, top, width, height } = el.getBoundingClientRect()
  const x = ((e.clientX - left) / width  - 0.5) * 10
  const y = ((e.clientY - top)  / height - 0.5) * -10
  el.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) scale(1.02)`
}
function onCardTiltReset(e: React.MouseEvent<HTMLDivElement>) {
  e.currentTarget.style.transform = ""
}

function PackagesInner() {
  const router = useRouter()
  const params = useSearchParams()
  const prefill = params.get("prefill")

  const [guestCount, setGuestCount] = useState(100)
  const [guestInput, setGuestInput] = useState("100")
  const [showComparison, setShowComparison] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const cardsView = useInView()
  const footerView = useInView()

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
    <div className="bg-warm-bg min-h-screen">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur shadow-sm border-b border-warm-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <button onClick={() => router.push("/")} className="flex items-center gap-3 flex-shrink-0">
            <div className="relative w-11 h-11 flex-shrink-0 rounded-full bg-white border-2 border-gold overflow-hidden shadow-sm">
              <Image src="/logo.png" alt="Ajay Foods logo" fill className="object-contain p-0.5" priority />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg font-bold text-primary font-playfair leading-tight">
                Ajay Foods &amp; Beverages
              </h1>
              <p className="text-xs text-gold font-medium tracking-wide">Quality Assured Foods</p>
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
                  l.active ? "bg-primary text-white" : "text-text-mid hover:text-primary hover:bg-primary/5"
                }`}
              >{l.label}</button>
            ))}
            <button onClick={() => router.push("/packages")}
              className="ml-2 bg-gold text-primary px-4 py-1.5 rounded-full font-bold text-xs hover:opacity-90 transition-opacity"
            >Book Now →</button>
          </nav>

          {/* Hamburger (mobile) */}
          <button onClick={() => setNavOpen(!navOpen)}
            className="md:hidden flex flex-col gap-[5px] p-2 flex-shrink-0"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-primary transition-all ${navOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block w-5 h-0.5 bg-primary transition-all ${navOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-primary transition-all ${navOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </button>
        </div>

        {/* Mobile nav dropdown */}
        {navOpen && (
          <div className="md:hidden bg-white border-t border-warm-border shadow-lg">
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
              {[
                { label: "🏠 Home", path: "/" },
                { label: "🍽️ Menu", path: "/menu" },
                { label: "📦 Packages", path: "/packages" },
              ].map((l) => (
                <button key={l.path} onClick={() => { router.push(l.path); setNavOpen(false) }}
                  className="text-left px-3 py-2.5 rounded-xl text-sm font-medium text-text-dark hover:bg-primary/5 hover:text-primary transition-colors"
                >{l.label}</button>
              ))}
              <button onClick={() => { router.push("/packages"); setNavOpen(false) }}
                className="mt-1 w-full bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary-mid transition-colors"
              >Book Now →</button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-mid to-primary-light py-12 px-4 text-center text-white">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gold/[0.06] pointer-events-none" />
        <div className="hero-badge inline-flex items-center gap-2 bg-gold/[0.12] border border-gold/25 rounded-full px-4 py-1.5 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-gold" />
          <span className="text-gold text-xs font-semibold tracking-widest uppercase">Choose Your Package</span>
        </div>
        <h1 className="font-playfair text-3xl md:text-4xl font-bold text-white" style={{ animation: "heroFadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.2s both" }}>Choose Your Package</h1>
        <p className="hero-sub text-white/55 text-sm mt-2 max-w-xl mx-auto">
          Start with a base package that fits your event, then add extra dishes to make it yours.
        </p>
      </div>

      {/* Controls bar */}
      <div className="bg-white border-b border-warm-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Guest count */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
            <span className="text-text-muted text-xs uppercase tracking-widest font-semibold whitespace-nowrap">How many guests?</span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="range" min={30} max={1000} step={10} value={Math.min(guestCount, 1000)}
                onChange={(e) => { const n = Number(e.target.value); setGuestCount(n); setGuestInput(String(n)) }}
                className="w-32 sm:w-40 accent-primary mt-2"
              />
              <input
                type="number" min={30} max={5000} value={guestInput}
                onChange={(e) => handleGuestInput(e.target.value)}
                onBlur={() => { if (!guestInput || parseInt(guestInput) < 30) { setGuestInput("30"); setGuestCount(30) } }}
                className="w-20 border border-warm-border rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:border-primary bg-warm-bg font-semibold"
              />
              <span className="text-text-muted text-xs">guests</span>
            </div>
            {/* Quick presets */}
            <div className="flex gap-1.5 flex-wrap">
              {[50, 100, 200, 500].map((n) => (
                <button key={n} onClick={() => { setGuestCount(n); setGuestInput(String(n)) }}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${guestCount === n ? "bg-primary text-white border-primary" : "border-warm-border text-text-mid hover:border-primary hover:text-primary bg-warm-bg"}`}
                >{n}</button>
              ))}
            </div>
          </div>
          {/* Compare toggle */}
          <button
            onClick={() => setShowComparison((v) => !v)}
            className={`flex-shrink-0 flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border transition-all ${showComparison ? "bg-primary text-white border-primary" : "border-primary text-primary hover:bg-primary hover:text-white"}`}
          >
            {showComparison ? "✕ Hide Comparison" : "⇄ Compare Packages"}
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      {showComparison && (
        <div className="max-w-7xl mx-auto px-4 py-6 overflow-x-auto">
          <div className="bg-white rounded-2xl border border-warm-border shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary-light px-6 py-4">
              <h2 className="font-playfair text-xl font-bold text-white">Package Comparison</h2>
              <p className="text-white/70 text-xs mt-0.5">All prices are per person · Minimum 30 guests</p>
            </div>
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-warm-border">
                  <th className="text-left px-5 py-3 text-text-muted font-semibold text-xs uppercase tracking-wider w-40">Feature</th>
                  {pkgList.map((p) => (
                    <th key={p.id} className={`px-4 py-3 text-center font-bold text-sm ${p.popular ? "text-primary" : "text-text-dark"}`}>
                      {p.name}
                      {p.popular && <span className="ml-1 text-[9px] bg-gold text-primary px-1.5 py-0.5 rounded-full">Popular</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, idx) => (
                  <tr key={row.label} className={idx % 2 === 0 ? "bg-warm-bg" : "bg-white"}>
                    <td className="px-5 py-2.5 text-text-mid font-medium text-xs">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className={`px-4 py-2.5 text-center text-sm font-semibold ${
                        v === "✓" ? "text-green-600" : v === "—" ? "text-warm-border" : "text-primary"
                      }`}>{v}</td>
                    ))}
                  </tr>
                ))}
                {/* Price row */}
                <tr className="bg-gradient-to-r from-warm-bg to-white border-t-2 border-gold/30">
                  <td className="px-5 py-3 font-bold text-text-mid text-xs uppercase tracking-wider">Total for {guestCount} guests</td>
                  {pkgList.map((p) => (
                    <td key={p.id} className="px-4 py-3 text-center font-bold text-primary">
                      ₹{(p.price * guestCount).toLocaleString("en-IN")}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <div className="px-6 py-4 bg-warm-bg flex flex-wrap gap-2 justify-center">
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
      <div ref={cardsView.ref} className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <p className="text-gold text-xs font-semibold uppercase tracking-[0.2em] mb-2">Step 1 of 3</p>
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-text-dark">Select a Base Package</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {pkgList.map((pkg, pkgIdx) => {
            const isPrefill = prefill === pkg.id
            return (
              <div
                key={pkg.id}
                ref={(el) => { cardRefs.current[pkg.id] = el }}
                onMouseMove={onCardTilt}
                onMouseLeave={onCardTiltReset}
                style={{ transitionProperty: "opacity, transform", transitionDuration: "0.6s", transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)", transitionDelay: `${pkgIdx * 120}ms` }}
                className={`card-tilt bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.06)] p-0 overflow-hidden hover:shadow-[0_8px_24px_rgba(92,15,15,0.12)] transition-all duration-500 flex flex-col ${
                  cardsView.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                } ${
                  isPrefill
                    ? "ring-2 ring-gold shadow-xl border-2 border-gold"
                    : ""
                }`}
              >
                {/* Pre-selected banner */}
                {isPrefill && (
                  <div className="bg-gold text-primary text-center text-[10px] font-bold py-1 tracking-wider uppercase">
                    Pre-selected for you
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
                        <span className="badge-glow bg-gold/[0.15] border border-gold/30 text-[#8B6A1A] text-[9px] font-semibold px-2 py-0.5 rounded-full">
                          Popular
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
                  <p className="text-[10px] text-text-muted italic mb-3 mt-1">{pkg.ideal}</p>

                  {/* Includes */}
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">What&apos;s included</p>
                  <ul className="space-y-1.5 flex-1">
                    {pkg.includes.map((item) => (
                      <li key={item} className="text-text-muted text-sm flex items-start gap-2">
                        <svg className="text-gold mt-0.5 shrink-0 w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M13.485 1.929a1 1 0 0 1 0 1.414L6.414 10.414 2.515 6.515a1 1 0 0 1 1.414-1.414l2.485 2.485 6.657-6.657a1 1 0 0 1 1.414 0z"/>
                        </svg>
                        <span className="text-xs">{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => router.push(`/order?pkg=${pkg.id}`)}
                    className="w-full mt-5 bg-primary text-gold font-bold text-sm py-3.5 rounded-full shadow-[0_4px_16px_rgba(92,15,15,0.2)] hover:bg-primary-mid transition-colors"
                  >
                    Choose Package →
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer icon strip */}
        <div ref={footerView.ref} className="mt-10 text-center">
          <div className="inline-flex flex-wrap items-start gap-4 sm:gap-6 bg-white border border-warm-border rounded-2xl px-6 sm:px-8 py-5 shadow-[0_2px_8px_rgba(92,15,15,0.05)] justify-center">
            {[
              { icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-primary">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ), label: "Min 30 guests", sub: "Per event" },
              { icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-primary">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              ), label: "Fully customizable", sub: "Add extras" },
              { icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-primary">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16z" />
                </svg>
              ), label: "24hr confirmation", sub: "Quick response" },
              { icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-primary">
                  <rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              ), label: "On-time delivery", sub: "Guaranteed" },
            ].map((f, i) => (
              <div
                key={f.label}
                className={`bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.05)] p-4 text-center transition-all duration-500 ${
                  footerView.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-10 h-10 bg-primary/[0.08] rounded-xl flex items-center justify-center mx-auto mb-3">
                  {f.icon}
                </div>
                <p className="text-text-dark text-sm font-semibold whitespace-nowrap">{f.label}</p>
                <p className="text-text-muted text-xs mt-0.5">{f.sub}</p>
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
      <div className="bg-warm-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-primary font-semibold">Loading packages…</p>
        </div>
      </div>
    }>
      <PackagesInner />
    </Suspense>
  )
}
