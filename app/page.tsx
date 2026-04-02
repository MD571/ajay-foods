"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

// ─── Full Menu data (for modal) ───────────────────────────────────────────────
const FULL_MENU_SECTIONS = [
  {
    id: "rice-biryani", label: "Rice & Biryani", emoji: "🍛",
    items: [
      { name: "Ambur Dum Biryani",        price: 150, diet: "non-veg", popular: true  },
      { name: "Hyderabadi Dum Biryani",   price: 160, diet: "non-veg", popular: true  },
      { name: "Chicken Biryani",          price: 150, diet: "non-veg", popular: true  },
      { name: "Mutton Biryani",           price: 180, diet: "non-veg", popular: true  },
      { name: "Prawn Biryani",            price: 180, diet: "non-veg", popular: false },
      { name: "Fish Biryani",             price: 160, diet: "non-veg", popular: false },
      { name: "Egg Biryani",              price: 100, diet: "non-veg", popular: false },
      { name: "Veg Biryani",              price: 80,  diet: "veg",     popular: true  },
      { name: "Paneer Biryani",           price: 100, diet: "veg",     popular: false },
      { name: "Pulihora (Tamarind Rice)", price: 15,  diet: "veg",     popular: true  },
      { name: "Ghee Rice",                price: 40,  diet: "veg",     popular: false },
    ],
  },
  {
    id: "curries", label: "Curries", emoji: "🍲",
    items: [
      { name: "Mutton Curry",        price: 150, diet: "non-veg", popular: true  },
      { name: "Gongura Mutton",      price: 160, diet: "non-veg", popular: true  },
      { name: "Chicken Curry",       price: 100, diet: "non-veg", popular: true  },
      { name: "Gongura Chicken",     price: 110, diet: "non-veg", popular: false },
      { name: "Fish Curry",          price: 120, diet: "non-veg", popular: true  },
      { name: "Prawn Curry",         price: 150, diet: "non-veg", popular: false },
      { name: "Egg Curry",           price: 60,  diet: "non-veg", popular: false },
      { name: "Paneer Butter Masala",price: 90,  diet: "veg",     popular: true  },
      { name: "Dal Tadka",           price: 30,  diet: "veg",     popular: true  },
      { name: "Dosakaya Papu",       price: 15,  diet: "veg",     popular: true  },
      { name: "Tomato Pappu",        price: 15,  diet: "veg",     popular: false },
      { name: "Chana Masala",        price: 45,  diet: "veg",     popular: false },
    ],
  },
  {
    id: "starters", label: "Starters", emoji: "🍗",
    items: [
      { name: "Apollo Fish",    price: 75,  diet: "non-veg", popular: true  },
      { name: "Chicken Fry",    price: 75,  diet: "non-veg", popular: true  },
      { name: "Chicken 65",     price: 80,  diet: "non-veg", popular: true  },
      { name: "Chicken Tikka",  price: 85,  diet: "non-veg", popular: true  },
      { name: "Fish Fry",       price: 90,  diet: "non-veg", popular: true  },
      { name: "Mutton Fry",     price: 100, diet: "non-veg", popular: false },
      { name: "Prawn Fry",      price: 120, diet: "non-veg", popular: false },
      { name: "Mirchi Bajji",   price: 25,  diet: "veg",     popular: true  },
      { name: "Veg Pakora",     price: 30,  diet: "veg",     popular: false },
      { name: "Paneer Tikka",   price: 70,  diet: "veg",     popular: true  },
      { name: "Gobi Manchurian",price: 50,  diet: "veg",     popular: false },
    ],
  },
  {
    id: "thalimpu", label: "Veg Thalimpu", emoji: "🥬",
    items: [
      { name: "Aloo Thalimpu (Potato)",     price: 15, diet: "veg", popular: true  },
      { name: "Vankaya Thalimpu (Brinjal)", price: 15, diet: "veg", popular: true  },
      { name: "Bendakaya Fry (Okra)",       price: 20, diet: "veg", popular: true  },
      { name: "Cabbage Fry",                price: 15, diet: "veg", popular: false },
      { name: "Dondakaya (Ivy Gourd)",      price: 15, diet: "veg", popular: false },
      { name: "Mushroom Fry",               price: 35, diet: "veg", popular: true  },
      { name: "Beerakaya (Ridge Gourd)",    price: 15, diet: "veg", popular: false },
      { name: "Beans Thalimpu",             price: 15, diet: "veg", popular: false },
    ],
  },
  {
    id: "pickles", label: "Pickles & Pachadi", emoji: "🫙",
    items: [
      { name: "Gongura Pachadi",   price: 0,  diet: "veg", popular: true  },
      { name: "Tomato Chutney",    price: 0,  diet: "veg", popular: true  },
      { name: "Coconut Chutney",   price: 0,  diet: "veg", popular: false },
      { name: "Allam Pachadi",     price: 0,  diet: "veg", popular: false },
      { name: "Dosakaya Pachadi",  price: 10, diet: "veg", popular: true  },
      { name: "Avakaya Pickle",    price: 5,  diet: "veg", popular: true  },
      { name: "Gongura Pickle",    price: 5,  diet: "veg", popular: true  },
    ],
  },
  {
    id: "sweets", label: "Sweets & Snacks", emoji: "🍮",
    items: [
      { name: "Semya Payasam",  price: 30, diet: "veg", popular: true  },
      { name: "Rice Payasam",   price: 30, diet: "veg", popular: true  },
      { name: "Bobbatlu",       price: 25, diet: "veg", popular: true  },
      { name: "Gulab Jamun",    price: 25, diet: "veg", popular: true  },
      { name: "Pootharekulu",   price: 30, diet: "veg", popular: true  },
      { name: "Suji Halwa",     price: 25, diet: "veg", popular: false },
      { name: "Boondi Laddu",   price: 20, diet: "veg", popular: false },
      { name: "Medu Vada",      price: 20, diet: "veg", popular: true  },
    ],
  },
  {
    id: "beverages", label: "Beverages", emoji: "☕",
    items: [
      { name: "Filter Coffee",     price: 15, diet: "veg", popular: true  },
      { name: "Buttermilk",        price: 10, diet: "veg", popular: true  },
      { name: "Masala Chai",       price: 10, diet: "veg", popular: false },
      { name: "Sweet Lassi",       price: 20, diet: "veg", popular: false },
      { name: "Tender Coconut",    price: 30, diet: "veg", popular: false },
      { name: "Fresh Lime Juice",  price: 15, diet: "veg", popular: false },
    ],
  },
]

// ─── Packages ─────────────────────────────────────────────────────────────────
const PACKAGES = [
  {
    id: "veg-basic", title: "Veg Basic", price: 100, unit: "/person",
    tag: "VEG", tagColor: "bg-green-100 text-green-800",
    color: "from-[#4a7c59] to-[#2d5a3d]", popular: false,
    ideal: "Ideal for 50–200 guests",
    includes: ["White Rice (Unlimited)", "Sambar + Rasam + Curd", "Choice of Dal (Papu)", "Choice of Curry (Iguru)", "Choice of Pachadi", "Choice of Thalimpu"],
  },
  {
    id: "veg-premium", title: "Veg Premium", price: 140, unit: "/person",
    tag: "VEG", tagColor: "bg-green-100 text-green-800",
    color: "from-[#D4A853] to-[#b88d3a]", popular: true,
    ideal: "Ideal for weddings & functions",
    includes: ["White Rice + Pulihora / Ghee Rice", "Sambar + Rasam + Curd", "2 Dals + 2 Curries", "2 Pachadis + 2 Thalimpus", "1 Sweet Dish", "Papad"],
  },
  {
    id: "non-veg-basic", title: "Non-Veg Basic", price: 150, unit: "/person",
    tag: "NON-VEG", tagColor: "bg-red-100 text-red-800",
    color: "from-[#8B4513] to-[#6d3410]", popular: false,
    ideal: "Ideal for 30–150 guests",
    includes: ["Biryani (7 variants)", "Sambar", "Gongura Pachadi", "Perugu Chutney", "Curd Rice", "Plates & Service"],
  },
  {
    id: "non-veg-premium", title: "Non-Veg Premium", price: 180, unit: "/person",
    tag: "NON-VEG", tagColor: "bg-red-100 text-red-800",
    color: "from-[#3d1a07] to-[#6b2d0f]", popular: false,
    ideal: "Ideal for grand celebrations",
    includes: ["Biryani (7 variants)", "Choice of Curry", "Sambar + Gongura", "Perugu Chutney", "Curd Rice", "Plates & Service"],
  },
]

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: "Ramesh Reddy", event: "Wedding Reception", rating: 5,
    avatar: "RR", color: "bg-[#8B4513]",
    text: "The biryani was absolutely phenomenal! Every guest kept asking for the recipe. Ajay Foods made our wedding day truly unforgettable. The team arrived on time, set up everything perfectly, and the food stayed fresh throughout the evening. Highly recommended!",
  },
  {
    name: "Sunitha Rao", event: "Corporate Lunch", rating: 5,
    avatar: "SR", color: "bg-[#D4A853]",
    text: "We order from Ajay Foods every week for our team lunches. The consistency, punctuality, and freshness is unmatched. The dal tadka and gongura chicken are office favourites. Everyone looks forward to lunch days!",
  },
  {
    name: "Venkat Sharma", event: "Birthday Celebration", rating: 5,
    avatar: "VS", color: "bg-[#4a7c59]",
    text: "Managed a 200-person birthday party with ease! The team was professional, food was incredible, and cleanup was spotless. The non-veg premium package was perfect value. Will definitely use them again for our next family function!",
  },
  {
    name: "Priya Nair", event: "Engagement Ceremony", rating: 5,
    avatar: "PN", color: "bg-[#6b2d0f]",
    text: "Ordered the veg premium package for our engagement. The bobbatlu and semya payasam were outstanding — just like my grandmother used to make. Guests from across Telangana complimented the authentic taste!",
  },
]

// ─── Event types ──────────────────────────────────────────────────────────────
const EVENT_TYPES = [
  { value: "Wedding", label: "🎊 Wedding" },
  { value: "Birthday", label: "🎂 Birthday" },
  { value: "Engagement", label: "💍 Engagement" },
  { value: "Corporate", label: "🏢 Corporate Lunch" },
  { value: "Religious", label: "🙏 Religious Function" },
  { value: "Anniversary", label: "🥂 Anniversary" },
  { value: "Other", label: "📅 Other" },
]

// ─── Stats Section with count-up animation ────────────────────────────────────
const STATS = [
  { value: 15,      suffix: "+",  label: "Years of Excellence", icon: "🏆" },
  { value: 10000,   suffix: "+",  label: "Events Catered",      icon: "🎊", compact: true },
  { value: 50000,   suffix: "+",  label: "Happy Guests",        icon: "😊", compact: true },
  { value: 100,     suffix: "%",  label: "Fresh Ingredients",   icon: "🌿" },
]

function StatsSection() {
  const [visible, setVisible] = useState(false)
  const [counts, setCounts] = useState(() => STATS.map(() => 0))
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visible) {
          setVisible(true)
          observer.disconnect()
          STATS.forEach((stat, i) => {
            const duration = 1600
            const steps = 50
            const increment = stat.value / steps
            let current = 0
            const timer = setInterval(() => {
              current = Math.min(current + increment, stat.value)
              setCounts((prev) => {
                const next = [...prev]
                next[i] = Math.round(current)
                return next
              })
              if (current >= stat.value) clearInterval(timer)
            }, duration / steps)
          })
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [visible])

  function fmt(idx: number) {
    const stat = STATS[idx]
    const n = counts[idx]
    if (stat.compact && n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K"
    return n.toLocaleString("en-IN")
  }

  return (
    <section ref={ref} className="py-12 bg-[#FDF6EC]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <div key={s.label}
              className={`bg-white rounded-2xl p-6 text-center shadow-sm border border-[#f0e6d3] hover:shadow-md hover:-translate-y-0.5 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="font-playfair font-bold text-3xl text-[#8B4513]">
                {visible ? fmt(i) + s.suffix : "0" + s.suffix}
              </div>
              <div className="text-xs text-[#666] mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AjayFoodsWebsite() {
  const router = useRouter()

  // Nav
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("home")

  // Modals
  const [menuModalOpen, setMenuModalOpen] = useState(false)
  const [menuModalCat, setMenuModalCat] = useState("all")
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [confirmationNo, setConfirmationNo] = useState("")

  // Quick Booking form
  const [form, setForm] = useState({ name: "", phone: "", eventType: "", guestCount: "", eventDate: "", notes: "", flexDates: false })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formLoading, setFormLoading] = useState(false)

  // UX state
  const [testimonialIdx, setTestimonialIdx] = useState(0)
  const [pricePer100, setPricePer100] = useState(false)
  const [menuFilter, setMenuFilter] = useState("all")
  const testimonialTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Testimonials auto-play
  useEffect(() => {
    testimonialTimer.current = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length)
    }, 5000)
    return () => { if (testimonialTimer.current) clearInterval(testimonialTimer.current) }
  }, [])

  const resetTestimonialTimer = useCallback(() => {
    if (testimonialTimer.current) clearInterval(testimonialTimer.current)
    testimonialTimer.current = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length)
    }, 5000)
  }, [])

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = menuModalOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuModalOpen])

  const navLinks = [
    { id: "home",     label: "Home",     href: null         },
    { id: "services", label: "Services", href: null         },
    { id: "menu",     label: "Menu",     href: "/menu"      },
    { id: "about",    label: "About Us", href: null         },
    { id: "packages", label: "Packages", href: "/packages"  },
  ]

  const scrollTo = (id: string) => {
    setMenuOpen(false)
    const link = navLinks.find((l) => l.id === id)
    if (link?.href) { router.push(link.href); return }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    setActiveSection(id)
  }

  // ── Form validation ────────────────────────────────────────────────────────
  function validateForm() {
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
    if (!form.flexDates) {
      if (!form.eventDate) e.eventDate = "Please select your event date"
      else if (new Date(form.eventDate) <= new Date()) e.eventDate = "Event date must be in the future"
    }
    return e
  }

  async function handleBookingSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errors = validateForm()
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return
    setFormLoading(true)
    await new Promise((r) => setTimeout(r, 1400))
    const confNo = "AJF" + Math.floor(100000 + Math.random() * 900000)
    setConfirmationNo(confNo)
    setBookingSuccess(true)
    setFormLoading(false)
    setForm({ name: "", phone: "", eventType: "", guestCount: "", eventDate: "", notes: "", flexDates: false })
  }

  function handlePhone(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 10)
    setForm((f) => ({ ...f, phone: digits }))
  }

  // ── Filtered menu items ────────────────────────────────────────────────────
  const homeMenuItems = [
    { emoji: "🍛", name: "Ambur Dum Biryani",  desc: "Slow-cooked dum biryani with whole spices and tender chicken", section: "rice-biryani", popular: true,  price: "₹150/person" },
    { emoji: "🍲", name: "Mutton Curry",        desc: "Slow-cooked mutton in rich, spiced Andhra-style gravy",        section: "curries",     popular: true,  price: "₹150/person" },
    { emoji: "🐟", name: "Apollo Fish",         desc: "Crispy fried fish tossed in aromatic spices",                  section: "starters",    popular: true,  price: "₹75/person"  },
    { emoji: "🍮", name: "Semya Payasam",       desc: "Creamy vermicelli pudding with cardamom and cashews",          section: "sweets",      popular: true,  price: "₹30/person"  },
    { emoji: "🫙", name: "Gongura Pachadi",     desc: "Tangy sorrel leaf chutney — the pride of Andhra cuisine",     section: "pickles",     popular: false, price: "Free"         },
    { emoji: "🍗", name: "Chicken Fry",         desc: "Marinated chicken fried to golden perfection with curry leaves", section: "starters",  popular: true,  price: "₹75/person"  },
    { emoji: "🥬", name: "Aloo Thalimpu",       desc: "Tempered potatoes with mustard seeds and curry leaves",        section: "thalimpu",    popular: false, price: "₹15/person"  },
    { emoji: "🥘", name: "Dosakaya Papu",       desc: "Comforting yellow cucumber dal — a Telugu home essential",     section: "curries",     popular: false, price: "₹15/person"  },
  ]
  const menuFilterOptions = [
    { id: "all",         label: "All" },
    { id: "rice-biryani",label: "Biryani" },
    { id: "curries",     label: "Curries" },
    { id: "starters",    label: "Starters" },
    { id: "thalimpu",    label: "Veg" },
    { id: "pickles",     label: "Pachadi" },
    { id: "sweets",      label: "Sweets" },
  ]
  const filteredHomeMenu = menuFilter === "all" ? homeMenuItems : homeMenuItems.filter((i) => i.section === menuFilter)

  // ── Modal menu items ────────────────────────────────────────────────────────
  const modalItems = menuModalCat === "all"
    ? FULL_MENU_SECTIONS.flatMap((s) => s.items.map((i) => ({ ...i, sectionLabel: s.label })))
    : (FULL_MENU_SECTIONS.find((s) => s.id === menuModalCat)?.items ?? []).map((i) => {
        const sec = FULL_MENU_SECTIONS.find((s) => s.id === menuModalCat)!
        return { ...i, sectionLabel: sec.label }
      })

  // ── Tomorrow's date ────────────────────────────────────────────────────────
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split("T")[0]
  const oneYearStr = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0]

  return (
    <div className="min-h-screen bg-[#FDF6EC] text-[#1a1a1a] font-sans overflow-x-hidden">

      {/* ══ FULL MENU MODAL ══════════════════════════════════════════════════ */}
      {menuModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuModalOpen(false)} />
          <div className="relative bg-white w-full sm:max-w-4xl max-h-[92vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#3d1a07] to-[#8B4513] px-6 py-5 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="font-playfair text-2xl font-bold text-white">Full Menu</h2>
                <p className="text-white/70 text-sm">All items — prices per person</p>
              </div>
              <button onClick={() => setMenuModalOpen(false)} className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xl transition-colors">×</button>
            </div>
            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto px-4 py-3 border-b border-[#f0e6d3] flex-shrink-0 scrollbar-none">
              {[{ id: "all", label: "All Items", emoji: "🍽️" }, ...FULL_MENU_SECTIONS].map((cat) => (
                <button key={cat.id} onClick={() => setMenuModalCat(cat.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    menuModalCat === cat.id ? "bg-[#8B4513] text-white" : "bg-[#FDF6EC] text-[#555] border border-[#e0d0bc] hover:border-[#8B4513]"
                  }`}
                >
                  <span>{"emoji" in cat ? cat.emoji : ""}</span> {cat.label}
                </button>
              ))}
            </div>
            {/* Items grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {modalItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 bg-[#FDF6EC] border border-[#f0e6d3] rounded-xl px-4 py-3 hover:border-[#D4A853] transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.diet === "veg" ? "bg-green-500" : "bg-red-500"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1a1a1a] truncate">{item.name}</p>
                        {"sectionLabel" in item && menuModalCat === "all" && (
                          <p className="text-[10px] text-[#aaa]">{(item as { sectionLabel: string }).sectionLabel}</p>
                        )}
                      </div>
                      {item.popular && <span className="text-[9px] bg-[#D4A853]/20 text-[#8B4513] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">HOT</span>}
                    </div>
                    <span className={`text-sm font-bold flex-shrink-0 ${item.price === 0 ? "text-green-600" : "text-[#8B4513]"}`}>
                      {item.price === 0 ? "Free" : `₹${item.price}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Footer CTA */}
            <div className="border-t border-[#f0e6d3] px-6 py-4 bg-[#FDF6EC] flex-shrink-0 flex items-center justify-between gap-4">
              <p className="text-xs text-[#888]">All prices are per person · Minimum 30 guests · Customisable</p>
              <button onClick={() => { setMenuModalOpen(false); router.push("/packages") }}
                className="bg-[#8B4513] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#6d3410] transition-colors whitespace-nowrap flex-shrink-0"
              >
                Book Now →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ BOOKING SUCCESS MODAL ════════════════════════════════════════════ */}
      {bookingSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setBookingSuccess(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mx-auto mb-4">✅</div>
            <h2 className="font-playfair text-2xl font-bold text-[#8B4513] mb-2">Booking Request Sent!</h2>
            <p className="text-[#555] text-sm mb-4">
              Thank you! We'll call you back <strong>within 24 hours</strong> to confirm your booking.
            </p>
            <div className="bg-[#FDF6EC] rounded-2xl px-5 py-3 mb-6 inline-block">
              <p className="text-xs text-[#888] mb-0.5">Confirmation Number</p>
              <p className="font-playfair text-2xl font-bold text-[#8B4513]">{confirmationNo}</p>
            </div>
            <p className="text-xs text-[#aaa] mb-6">Please save this number for reference.</p>
            <button onClick={() => setBookingSuccess(false)}
              className="bg-[#8B4513] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#6d3410] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ══ NAVBAR ═══════════════════════════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur shadow-md py-2" : "bg-[#2a1005]/85 backdrop-blur-md py-4"
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">

          {/* Logo */}
          <button onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setActiveSection("home"); setMenuOpen(false) }} className="flex items-center gap-3 flex-shrink-0">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white border-2 border-[#D4A853]/40 shadow-md flex-shrink-0">
              <Image src="/logo.png" alt="Ajay Foods logo" fill className="object-cover" priority />
            </div>
            <div className="hidden sm:block">
              <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg font-bold text-[#8B4513] font-playfair leading-tight">
                Ajay Foods &amp; Beverages
              </h1>
              <p className="text-xs text-[#D4A853] font-medium tracking-wide">Quality Assured Foods</p>
            </div>
            </div>
          </button>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((l) => (
              <button key={l.id} onClick={() => scrollTo(l.id)}
                className={`text-sm font-medium transition-all relative group ${
                  activeSection === l.id
                    ? "text-[#D4A853]"
                    : scrolled ? "text-[#1a1a1a] hover:text-[#8B4513]" : "text-white/90 hover:text-[#D4A853]"
                }`}
              >
                {l.label}
                <span className={`absolute -bottom-0.5 left-0 h-0.5 bg-[#D4A853] transition-all duration-300 ${activeSection === l.id ? "w-full" : "w-0 group-hover:w-full"}`} />
              </button>
            ))}
          </div>

          {/* Phone + Book Now */}
          <div className="hidden md:flex items-center gap-3">
            <a href="tel:+919876543210"
              className={`hidden xl:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                scrolled ? "border-[#8B4513]/30 text-[#8B4513] hover:bg-[#8B4513]/5" : "border-white/20 text-white/80 hover:text-white"
              }`}
            >
              📞 +91 98765 43210
            </a>
            <button onClick={() => router.push("/packages")}
              className="bg-[#D4A853] text-[#3d1a07] px-5 py-2 rounded-full text-sm font-bold hover:bg-[#e8bc6a] transition-colors shadow-md"
            >
              Book Now
            </button>
          </div>

          {/* Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden flex flex-col gap-[5px] p-2 flex-shrink-0" aria-label="Open menu">
            <span className={`block w-6 h-0.5 transition-all ${scrolled ? "bg-[#8B4513]" : "bg-white"} ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block w-6 h-0.5 transition-all ${scrolled ? "bg-[#8B4513]" : "bg-white"} ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 transition-all ${scrolled ? "bg-[#8B4513]" : "bg-white"} ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-[#f0e6d3] shadow-xl">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((l) => (
                <button key={l.id} onClick={() => scrollTo(l.id)}
                  className={`text-left text-base font-medium py-3 px-3 rounded-xl transition-colors ${
                    activeSection === l.id ? "bg-[#8B4513]/10 text-[#8B4513] font-semibold" : "text-[#1a1a1a] hover:bg-[#FDF6EC]"
                  }`}
                >
                  {l.label}
                </button>
              ))}
              <div className="mt-2 pt-3 border-t border-[#f0e6d3] flex flex-col gap-2">
                <a href="tel:+919876543210" className="flex items-center gap-2 text-sm text-[#8B4513] font-semibold px-3 py-2">
                  📞 +91 98765 43210
                </a>
                <button onClick={() => { setMenuOpen(false); router.push("/packages") }}
                  className="bg-[#D4A853] text-[#3d1a07] px-5 py-3 rounded-xl text-sm font-bold w-full"
                >
                  Book Now →
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #3d1a07 0%, #6b2d0f 35%, #8B4513 65%, #b5601e 100%)" }}
      >
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[#D4A853]/10 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-[#D4A853]/10 blur-3xl" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {["🍛", "🍲", "🍮", "🥗", "🫙", "🍟", "☕", "🥬"].map((emoji, i) => (
            <span key={i} className="absolute text-2xl opacity-10"
              style={{ left: `${10 + i * 11}%`, top: `${15 + (i % 3) * 25}%`, animation: `float ${3 + i * 0.4}s ease-in-out infinite alternate` }}
            >{emoji}</span>
          ))}
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#D4A853]/20 border border-[#D4A853]/40 rounded-full px-4 py-1.5 mb-6">
            <span className="text-[#D4A853] text-sm">✦</span>
            <span className="text-[#D4A853] text-xs font-semibold tracking-widest uppercase">Traditional Telugu Cuisine</span>
            <span className="text-[#D4A853] text-sm">✦</span>
          </div>
          <h1 className="font-playfair text-5xl md:text-7xl font-bold leading-tight mb-6">
            Authentic Flavors,<br />
            <span className="text-[#D4A853]">Unforgettable</span> Feasts
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            From intimate family gatherings to grand celebrations — Ajay Foods brings
            the warmth of home-cooked Telugu cuisine to every occasion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => router.push("/packages")}
              className="bg-[#D4A853] text-[#3d1a07] px-8 py-4 rounded-full font-bold text-base hover:bg-[#e8bc6a] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 w-full sm:w-auto"
            >
              Book Your Event 🎉
            </button>
            <button onClick={() => router.push("/menu")}
              className="bg-white/10 backdrop-blur border border-white/30 text-white px-8 py-4 rounded-full font-semibold text-base hover:bg-white/20 transition-all w-full sm:w-auto"
            >
              View Our Menu 🍽️
            </button>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <span className="text-xl animate-bounce">↓</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none"><path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H0Z" fill="#FDF6EC" /></svg>
        </div>
      </section>

      {/* ══ STATS ════════════════════════════════════════════════════════════ */}
      <StatsSection />

      {/* ══ SERVICES ═════════════════════════════════════════════════════════ */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-[#D4A853] text-sm font-semibold tracking-widest uppercase">What We Offer</span>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-[#8B4513] mt-2 mb-4">Our Services</h2>
            <p className="text-[#555] max-w-xl mx-auto">We specialize in exceptional culinary experiences for every occasion, big or small.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "🎊", title: "Event Catering", desc: "Weddings, birthdays, corporate events, and family functions — we handle every detail with care.", features: ["Custom menus", "On-site cooking", "Professional staff", "Full setup & cleanup"], color: "from-[#8B4513] to-[#b5601e]", link: "/packages" },
              // { icon: "🙏", title: "Charity & Community", desc: "Dedicated morning feeds — nutritious, lovingly prepared meals served before 9 AM daily.", features: ["Fresh morning prep", "Large-scale cooking", "Flexible quantities", "Donation-based pricing"], color: "from-[#D4A853] to-[#c49840]", link: "#about" },
              { icon: "🏪", title: "Daily Stalls", desc: "Morning and evening food stalls with fixed-price offerings — consistent quality, every day.", features: ["Twice daily service", "Fixed pricing", "Quick service", "Morning & evening"], color: "from-[#6d3410] to-[#8B4513]", link: "/menu" },
            ].map((s) => (
              <div key={s.title} className="group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-2 border border-[#f0e6d3] flex flex-col">
                <div className={`bg-gradient-to-br ${s.color} p-8 text-white`}>
                  <div className="text-5xl mb-4">{s.icon}</div>
                  <h3 className="font-playfair text-2xl font-bold mb-2">{s.title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{s.desc}</p>
                </div>
                <div className="bg-white p-6 flex-1 flex flex-col">
                  <ul className="space-y-2 flex-1">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-[#444]">
                        <span className="w-4 h-4 rounded-full bg-[#D4A853]/20 flex items-center justify-center text-[#8B4513] text-xs flex-shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => router.push(s.link)} className="mt-5 flex items-center gap-1.5 text-[#8B4513] text-sm font-semibold hover:gap-3 transition-all group/btn">
                    Learn more <span className="group-hover/btn:translate-x-1 transition-transform inline-block">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MENU HIGHLIGHTS ══════════════════════════════════════════════════ */}
      <section id="menu" className="py-20 bg-[#FDF6EC]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-[#D4A853] text-sm font-semibold tracking-widest uppercase">Taste the Tradition</span>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-[#8B4513] mt-2 mb-4">Our Signature Menu</h2>
            <p className="text-[#555] max-w-xl mx-auto">Every dish crafted with authentic spices, fresh ingredients, and generations of culinary wisdom.</p>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {menuFilterOptions.map((opt) => (
              <button key={opt.id} onClick={() => setMenuFilter(opt.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  menuFilter === opt.id ? "bg-[#8B4513] text-white shadow-md" : "bg-white border border-[#e0d0bc] text-[#555] hover:border-[#8B4513] hover:text-[#8B4513]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredHomeMenu.map((item) => (
              <div key={item.name} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-[#f0e6d3] group">
                <div className="bg-gradient-to-br from-[#fdf0e0] to-[#f5e6cc] h-36 flex items-center justify-center relative">
                  <span className="text-6xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                  {item.popular && (
                    <span className="absolute top-3 right-3 bg-[#D4A853] text-[#3d1a07] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Popular</span>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-[10px] text-[#D4A853] font-bold uppercase tracking-widest">{item.section.replace("-", " ")}</span>
                  <h4 className="font-playfair font-bold text-[#8B4513] text-base mt-0.5">{item.name}</h4>
                  <p className="text-xs text-[#666] mt-1 leading-relaxed">{item.desc}</p>
                  <p className="text-xs font-semibold text-[#8B4513] mt-2">{item.price}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredHomeMenu.length === 0 && (
            <p className="text-center text-[#888] py-12">No items in this category. <button onClick={() => setMenuFilter("all")} className="text-[#8B4513] font-semibold underline">Show all</button></p>
          )}

          <div className="text-center mt-10">
            <button onClick={() => setMenuModalOpen(true)}
              className="bg-[#8B4513] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-[#6d3410] transition-colors shadow-md inline-flex items-center gap-2"
            >
              View Full Menu 📋
            </button>
          </div>
        </div>
      </section>

      {/* ══ PRICING PACKAGES ════════════════════════════════════════════════ */}
      {/* <section id="pricing" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-[#D4A853] text-sm font-semibold tracking-widest uppercase">Simple & Transparent</span>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-[#8B4513] mt-2 mb-4">Menu Packages</h2>
            <p className="text-[#555] max-w-xl mx-auto">Choose a package and customise with extras. No hidden charges.</p>
            <div className="inline-flex items-center mt-5 bg-[#FDF6EC] border border-[#e0d0bc] rounded-full p-1 gap-1">
              <button onClick={() => setPricePer100(false)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${!pricePer100 ? "bg-[#8B4513] text-white shadow-sm" : "text-[#888] hover:text-[#555]"}`}
              >
                Per Person
              </button>
              <button onClick={() => setPricePer100(true)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${pricePer100 ? "bg-[#8B4513] text-white shadow-sm" : "text-[#888] hover:text-[#555]"}`}
              >
                Per 100 Guests
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PACKAGES.map((pkg) => (
              <div key={pkg.id} className={`rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border-2 ${pkg.popular ? "border-[#D4A853]" : "border-[#f0e6d3]"} relative`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-[#D4A853] text-[#3d1a07] text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-md">⭐ Most Popular</span>
                  </div>
                )}
                <div className={`bg-gradient-to-br ${pkg.color} p-6 text-white`}>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${pkg.tagColor}`}>{pkg.tag}</span>
                  <h3 className="font-playfair text-xl font-bold mt-3">{pkg.title}</h3>
                  <div className="mt-1">
                    <span className="text-3xl font-bold">
                      {pricePer100 ? `₹${(pkg.price * 100).toLocaleString("en-IN")}` : `₹${pkg.price}`}
                    </span>
                    <span className="text-white/70 text-sm ml-1">
                      {pricePer100 ? "for 100 guests" : "/person"}
                    </span>
                  </div>
                  {pricePer100 && <p className="text-white/50 text-xs mt-0.5">₹{pkg.price}/person</p>}
                </div>
                <div className="bg-white p-5">
                  <p className="text-[10px] text-[#aaa] font-semibold uppercase tracking-wider mb-2">{pkg.ideal}</p>
                  <ul className="space-y-2 mb-4">
                    {pkg.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-[#444]">
                        <span className="w-4 h-4 rounded-full bg-[#D4A853]/20 flex items-center justify-center text-[#8B4513] text-xs flex-shrink-0 mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => router.push(`/packages?prefill=${pkg.id}`)}
                    className="w-full bg-[#8B4513] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6d3410] transition-colors"
                  >
                    Book This Package →
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-[#888] mt-8">Minimum 30 persons · Fully customisable · Contact us for bulk discounts</p>
        </div>
      </section> */}

      {/* ══ WHY CHOOSE US ════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#FDF6EC]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#D4A853] text-sm font-semibold tracking-widest uppercase">Why Ajay Foods</span>
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-[#8B4513] mt-2 mb-6">
                The Difference is in<br />Every Bite
              </h2>
              <p className="text-[#555] leading-relaxed mb-8">
                We don&apos;t just cater food — we create memories. Authentic flavors, punctual service, and personal attention to every order.
              </p>
              <div className="space-y-5">
                {[
                  { icon: "🌿", title: "Farm-Fresh Ingredients",  desc: "Sourced daily from trusted local vendors for maximum freshness." },
                  { icon: "👨‍🍳", title: "Experienced Chefs",       desc: "Decades of Telugu culinary expertise in every dish." },
                  { icon: "⏰", title: "Always On Time",           desc: "Lunch shift ready by 12 PM, Dinner shift ready by 6 PM — we respect your schedule." },
                  { icon: "🎯", title: "Customisable Menus",      desc: "Mix and match items to craft the perfect meal for your guests." },
                ].map((w) => (
                  <div key={w.title} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl flex-shrink-0 shadow-sm border border-[#f0e6d3]">{w.icon}</div>
                    <div>
                      <h4 className="font-semibold text-[#1a1a1a] text-sm">{w.title}</h4>
                      <p className="text-[#666] text-xs mt-0.5 leading-relaxed">{w.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[420px]">
              <div className="absolute top-0 right-0 w-72 h-48 rounded-2xl bg-gradient-to-br from-[#8B4513] to-[#6d3410] shadow-xl p-6 text-white">
                <div className="text-4xl mb-3">🍛</div>
                <p className="font-playfair text-xl font-bold">Biryani Special</p>
                <p className="text-white/70 text-sm mt-1">Aromatic, rich, unforgettable</p>
              </div>
              <div className="absolute top-28 left-0 w-72 h-48 rounded-2xl bg-gradient-to-br from-[#D4A853] to-[#c49840] shadow-xl p-6">
                <div className="text-4xl mb-3">🎊</div>
                <p className="font-playfair text-xl font-bold text-[#3d1a07]">Grand Events</p>
                <p className="text-[#3d1a07]/70 text-sm mt-1">Serving 50 to 5000 guests</p>
              </div>
              <div className="absolute bottom-0 right-8 w-72 h-48 rounded-2xl bg-white border border-[#f0e6d3] shadow-xl p-6">
                <div className="text-4xl mb-3">🙏</div>
                <p className="font-playfair text-xl font-bold text-[#8B4513]">Community First</p>
                <p className="text-[#666] text-sm mt-1">Daily charity feeds before 9 AM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════════════════════ */}
      {/* <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-[#D4A853] text-sm font-semibold tracking-widest uppercase">Simple Process</span>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-[#8B4513] mt-2 mb-4">How It Works</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-[#D4A853]/30 via-[#D4A853] to-[#D4A853]/30" />
            {[
              { step: "01", icon: "📞", title: "Get in Touch",    desc: "Call us or fill the booking form with your event details." },
              { step: "02", icon: "📋", title: "Choose Package",  desc: "Pick a base package and add extra dishes to suit your taste." },
              { step: "03", icon: "👨‍🍳", title: "We Prepare",      desc: "Our chefs get to work with fresh ingredients and love." },
              { step: "04", icon: "🎉", title: "You Celebrate",   desc: "Enjoy your event while we handle the food, end to end." },
            ].map((s) => (
              <div key={s.step} className="text-center relative z-10">
                <div className="w-20 h-20 rounded-full bg-[#FDF6EC] border-2 border-[#D4A853] shadow-md flex items-center justify-center text-3xl mx-auto mb-4">{s.icon}</div>
                <div className="text-[#D4A853] text-xs font-bold mb-1">STEP {s.step}</div>
                <h4 className="font-playfair font-bold text-[#8B4513] text-lg mb-2">{s.title}</h4>
                <p className="text-[#666] text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ══ TESTIMONIALS (CAROUSEL) ══════════════════════════════════════════ */}
      <section className="py-20 bg-[#FDF6EC]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[#D4A853] text-sm font-semibold tracking-widest uppercase">What People Say</span>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-[#8B4513] mt-2 mb-4">Loved by Thousands</h2>
          </div>

          {/* Unified carousel — all screen sizes */}
          <div className="relative">
            {/* Card grid: desktop shows 2 side by side, mobile shows 1 */}
            <div className="grid md:grid-cols-2 gap-6">
              {[0, 1].map((offset) => {
                const idx = (testimonialIdx + offset) % TESTIMONIALS.length
                const t = TESTIMONIALS[idx]
                return (
                  <div key={`${testimonialIdx}-${offset}`}
                    className={`bg-white rounded-2xl p-6 border border-[#f0e6d3] shadow-sm transition-all duration-300 ${offset === 1 ? "hidden md:block" : ""}`}
                  >
                    <div className="flex gap-0.5 mb-3">{Array.from({ length: t.rating }).map((_, i) => <span key={i} className="text-[#D4A853]">★</span>)}</div>
                    <p className="text-[#444] text-sm leading-relaxed mb-5 italic min-h-[72px]">&quot;{t.text}&quot;</p>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>{t.avatar}</div>
                      <div>
                        <p className="font-semibold text-[#1a1a1a] text-sm">{t.name}</p>
                        <p className="text-[#D4A853] text-xs">{t.event}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button onClick={() => { setTestimonialIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length); resetTestimonialTimer() }}
                className="w-10 h-10 rounded-full bg-white border border-[#e0d0bc] flex items-center justify-center text-[#8B4513] hover:bg-[#8B4513] hover:text-white transition-colors shadow-sm font-bold"
              >←</button>
              <div className="flex gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button key={i} onClick={() => { setTestimonialIdx(i); resetTestimonialTimer() }}
                    className={`h-2 rounded-full transition-all duration-300 ${i === testimonialIdx ? "bg-[#8B4513] w-6" : "bg-[#e0d0bc] w-2"}`}
                  />
                ))}
              </div>
              <button onClick={() => { setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length); resetTestimonialTimer() }}
                className="w-10 h-10 rounded-full bg-white border border-[#e0d0bc] flex items-center justify-center text-[#8B4513] hover:bg-[#8B4513] hover:text-white transition-colors shadow-sm font-bold"
              >→</button>
            </div>
            <p className="text-center text-xs text-[#aaa] mt-2">{testimonialIdx + 1} of {TESTIMONIALS.length} · Auto-plays every 5s</p>
          </div>
        </div>
      </section>

      {/* ══ ABOUT ════════════════════════════════════════════════════════════ */}
      <section id="about" className="py-20 bg-gradient-to-br from-[#3d1a07] to-[#8B4513]">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <span className="text-[#D4A853] text-sm font-semibold tracking-widest uppercase">Our Story</span>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold mt-2 mb-6">Rooted in Tradition,<br />Grown with Love</h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto mb-6">
            Ajay Foods was born from a simple belief — that food is the purest form of love.
            What started as home cooking for family gatherings has grown into one of the region&apos;s
            most trusted catering services, serving thousands of meals daily.
          </p>
          <p className="text-white/70 text-base leading-relaxed max-w-2xl mx-auto">
            Our recipes are passed down through generations, our spices are sourced with care,
            and every plate is made with the same dedication as if it were for our own family.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            {["Telugu Cuisine", "Fresh Daily", "Morning & Evening", "Community Focused", "15+ Years"].map((tag) => (
              <span key={tag} className="bg-white/10 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FIND US ══════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <span className="text-[#D4A853] text-sm font-semibold tracking-widest uppercase">Our Location</span>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#8B4513] mt-2">Find Us</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FDF6EC] border border-[#f0e6d3] flex items-center justify-center text-xl shadow-sm flex-shrink-0">📍</div>
                <div>
                  <p className="text-[#D4A853] text-xs font-semibold uppercase tracking-wider">Location</p>
                  <p className="font-medium text-[#1a1a1a] text-sm">Hyderabad, Telangana</p>
                  <p className="text-[#888] text-xs mt-0.5">Serving all surrounding areas</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FDF6EC] border border-[#f0e6d3] flex items-center justify-center text-xl shadow-sm flex-shrink-0">⏰</div>
                <div>
                  <p className="text-[#D4A853] text-xs font-semibold uppercase tracking-wider">Service Hours</p>
                  <p className="font-medium text-[#1a1a1a] text-sm">Morning ☀️ delivery by 12:00 PM</p>
                  <p className="text-[#888] text-xs mt-0.5">Evening 🌙 delivery by 6:00 PM</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FDF6EC] border border-[#f0e6d3] flex items-center justify-center text-xl shadow-sm flex-shrink-0">📧</div>
                <div>
                  <p className="text-[#D4A853] text-xs font-semibold uppercase tracking-wider">Email Us</p>
                  <a href="mailto:ajayfoods.co.in@gmail.com" className="font-medium text-[#8B4513] text-sm hover:underline">ajayfoods.co.in@gmail.com</a>
                  <p className="text-[#888] text-xs mt-0.5">We reply within 24 hours</p>
                </div>
              </div>
              <a href="https://maps.app.goo.gl/pXH84d2EoCmZ11S7A" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#8B4513] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#6d3410] transition-colors shadow-md"
              >
                📍 Get Directions on Google Maps
              </a>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg border border-[#f0e6d3] aspect-video">
              <iframe
                src="https://maps.google.com/maps?q=Hyderabad,Telangana,India&output=embed&z=12"
                className="w-full h-full"
                style={{ border: 0, minHeight: "250px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ajay Foods Location"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══ CONTACT ══════════════════════════════════════════════════════════ */}
      {/* <section id="contact" className="py-20 bg-[#FDF6EC]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-[#D4A853] text-sm font-semibold tracking-widest uppercase">Get In Touch</span>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-[#8B4513] mt-2 mb-4">Let&apos;s Plan Your Event</h2>
            <p className="text-[#555] max-w-xl mx-auto">Tell us about your event and we&apos;ll get back to you within 24 hours with a customised menu and pricing.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div>
                <h3 className="font-playfair text-2xl font-bold text-[#8B4513] mb-5">Contact Details</h3>
                <div className="space-y-4">
                  {[
                    { icon: "📧", label: "Email",        value: "ajayfoods.co.in@gmail.com", sub: "We reply within 24 hours",  href: "mailto:ajayfoods.co.in@gmail.com" },
                    { icon: "📍", label: "Location",     value: "Hyderabad, Telangana",      sub: "Serving all surrounding areas", href: null },
                    { icon: "⏰", label: "Service Hours",value: "Morning ☀️ by 12:00 PM",    sub: "Evening 🌙 by 6:00 PM",     href: null },
                  ].map((c) => (
                    <div key={c.label} className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-[#f0e6d3] flex items-center justify-center text-xl shadow-sm flex-shrink-0">{c.icon}</div>
                      <div>
                        <p className="text-[#D4A853] text-xs font-semibold uppercase tracking-wider">{c.label}</p>
                        {c.href ? (
                          <a href={c.href} className="font-medium text-[#1a1a1a] text-sm hover:text-[#8B4513] transition-colors">{c.value}</a>
                        ) : (
                          <p className="font-medium text-[#1a1a1a] text-sm">{c.value}</p>
                        )}
                        <p className="text-[#888] text-xs">{c.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <a href="https://wa.me/?text=Hi! I'd like to book catering for my event."
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#25D366] text-white px-5 py-4 rounded-2xl font-semibold hover:bg-[#1da851] transition-colors shadow-md"
              >
                <span className="text-2xl">💬</span>
                <div>
                  <p className="font-bold text-sm">Prefer WhatsApp?</p>
                  <p className="text-xs text-white/80">Chat with us instantly →</p>
                </div>
              </a>

              <div className="bg-gradient-to-br from-[#FDF6EC] to-[#fef9f2] rounded-2xl p-6 border border-[#f0e6d3]">
                <p className="text-3xl mb-3">⏰</p>
                <h4 className="font-playfair text-xl font-bold text-[#8B4513] mb-2">Service Hours</h4>
                <div className="space-y-2 text-sm text-[#555]">
                  <div className="flex items-center gap-2"><span className="text-base">☀️</span><span><strong>Lunch shift:</strong> Ready by 12 PM</span></div>
                  <div className="flex items-center gap-2"><span className="text-base">🌙</span><span><strong>Evening shift:</strong> Ready by 6 PM</span></div>
                  <div className="flex items-center gap-2"><span className="text-base">📅</span><span><strong>Available:</strong> 7 days a week</span></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-[#f0e6d3] p-8">
              <h3 className="font-playfair text-2xl font-bold text-[#8B4513] mb-1">Quick Booking</h3>
              <p className="text-xs text-[#888] mb-5">Fill in your details and we&apos;ll call you within 24 hours.</p>
              <form className="space-y-4" onSubmit={handleBookingSubmit} noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Your Name *</label>
                    <input type="text" placeholder="e.g. Ramesh Kumar" value={form.name}
                      onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); if (formErrors.name) setFormErrors((fe) => ({ ...fe, name: "" })) }}
                      className={`w-full border rounded-xl px-4 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/10 bg-white placeholder:text-[#b0a090] placeholder:italic ${formErrors.name ? "border-red-400 bg-red-50" : "border-[#e0d0bc]"}`}
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span>{formErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Phone *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#555] font-semibold select-none">+91</span>
                      <input type="tel" placeholder="10-digit mobile" value={form.phone} onChange={(e) => { handlePhone(e.target.value); if (formErrors.phone) setFormErrors((fe) => ({ ...fe, phone: "" })) }} maxLength={10}
                        className={`w-full border rounded-xl pl-11 pr-4 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/10 bg-white placeholder:text-[#b0a090] placeholder:italic ${formErrors.phone ? "border-red-400 bg-red-50" : "border-[#e0d0bc]"}`}
                      />
                    </div>
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span>{formErrors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Event Type *</label>
                    <select value={form.eventType} onChange={(e) => { setForm((f) => ({ ...f, eventType: e.target.value })); if (formErrors.eventType) setFormErrors((fe) => ({ ...fe, eventType: "" })) }}
                      className={`w-full border rounded-xl px-4 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/10 bg-white ${formErrors.eventType ? "border-red-400 bg-red-50" : "border-[#e0d0bc]"}`}
                    >
                      <option value="">— Select event type —</option>
                      {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    {formErrors.eventType && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span>{formErrors.eventType}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Guest Count *</label>
                    <input type="number" placeholder="e.g. 150" min={30} max={5000} value={form.guestCount}
                      onChange={(e) => { setForm((f) => ({ ...f, guestCount: e.target.value })); if (formErrors.guestCount) setFormErrors((fe) => ({ ...fe, guestCount: "" })) }}
                      className={`w-full border rounded-xl px-4 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/10 bg-white placeholder:text-[#b0a090] ${formErrors.guestCount ? "border-red-400 bg-red-50" : "border-[#e0d0bc]"}`}
                    />
                    {formErrors.guestCount && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span>{formErrors.guestCount}</p>}
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {[50, 100, 200, 500].map((n) => (
                        <button key={n} type="button" onClick={() => { setForm((f) => ({ ...f, guestCount: String(n) })); if (formErrors.guestCount) setFormErrors((fe) => ({ ...fe, guestCount: "" })) }}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${form.guestCount === String(n) ? "bg-[#8B4513] border-[#8B4513] text-white" : "bg-[#FDF6EC] border-[#e0d0bc] text-[#666] hover:border-[#8B4513] hover:text-[#8B4513]"}`}
                        >{n}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Event Date {!form.flexDates && "*"}</label>
                  <input type="date" min={tomorrowStr} max={oneYearStr} value={form.eventDate} disabled={form.flexDates}
                    onChange={(e) => { setForm((f) => ({ ...f, eventDate: e.target.value })); if (formErrors.eventDate) setFormErrors((fe) => ({ ...fe, eventDate: "" })) }}
                    onInput={(e) => { const v = (e.target as HTMLInputElement).value; if (v) { setForm((f) => ({ ...f, eventDate: v })); if (formErrors.eventDate) setFormErrors((fe) => ({ ...fe, eventDate: "" })) } }}
                    className={`w-full border rounded-xl px-4 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/10 bg-white disabled:opacity-40 disabled:cursor-not-allowed ${formErrors.eventDate ? "border-red-400 bg-red-50" : "border-[#e0d0bc]"}`}
                  />
                  <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                    <input type="checkbox" checked={form.flexDates} onChange={(e) => setForm((f) => ({ ...f, flexDates: e.target.checked, eventDate: "" }))}
                      className="w-4 h-4 accent-[#8B4513]"
                    />
                    <span className="text-xs text-[#666]">I&apos;m flexible with dates — discuss over call</span>
                  </label>
                  {formErrors.eventDate && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span>{formErrors.eventDate}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Special Requests</label>
                  <textarea rows={3} placeholder="Any dietary requirements, special dishes, or preferences..." value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    className="w-full border border-[#e0d0bc] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/10 bg-[#FDF6EC] resize-none"
                  />
                </div>

                {parseInt(form.guestCount) > 0 ? (
                  <div className="bg-[#FDF6EC] border border-[#e0d0bc] rounded-xl px-4 py-3 text-sm">
                    <p className="text-[#888] text-xs font-semibold uppercase tracking-wider mb-1">Quick Estimate</p>
                    <div className="flex flex-wrap gap-3">
                      {[{ name: "Veg Basic", price: 100 }, { name: "Non-Veg Basic", price: 150 }, { name: "Non-Veg Premium", price: 180 }].map((p) => (
                        <span key={p.name} className="text-xs text-[#555]">
                          <span className="font-semibold text-[#8B4513]">{p.name}:</span> ₹{(p.price * parseInt(form.guestCount)).toLocaleString("en-IN")}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <button type="submit" disabled={formLoading}
                  className="w-full bg-[#8B4513] text-white py-4 rounded-xl font-semibold text-sm hover:bg-[#6d3410] transition-colors shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Sending…
                    </>
                  ) : "Send Booking Request 🎉"}
                </button>
                <p className="text-center text-xs text-[#888]">We&apos;ll call you back within 24 hours to confirm details.</p>
              </form>
            </div>
          </div>
        </div>
      </section> */}

      {/* ══ FOOTER ═══════════════════════════════════════════════════════════ */}
      <footer className="bg-[#1a0a03] text-white py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white border border-[#D4A853]/30">
                  <Image src="/logo.png" alt="Ajay Foods logo" fill className="object-cover" />
                </div>
                <div>
                  <p className="font-playfair font-bold text-xl text-white">Ajay Foods</p>
                  <p className="text-[10px] text-[#D4A853] tracking-widest uppercase">& Beverages</p>
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                Bringing the authentic taste of Telugu cuisine to your table — with love, tradition, and the freshest ingredients since over 15 years.
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                <a href="https://www.facebook.com/AjayFoods/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#1877F2] cursor-pointer transition-colors text-white">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://www.instagram.com/ajayfoods.official/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#E1306C] cursor-pointer transition-colors text-white">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://www.youtube.com/@ajayfoods.official" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FF0000] cursor-pointer transition-colors text-white">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
                </a>
                <a href="https://x.com/AjayFoods" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/30 cursor-pointer transition-colors text-white">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.776-8.906L2.25 2.25h6.844l4.235 5.596zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://www.threads.net/@ajayfoods.official" target="_blank" rel="noopener noreferrer" aria-label="Threads" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/30 cursor-pointer transition-colors text-white">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.455-1.282 3.283-.795.994-1.908 1.628-3.393 1.936-1.185.246-2.747.192-3.998-.278a5.128 5.128 0 0 1-2.732-2.427c-.562-1.098-.753-2.43-.546-3.766.418-2.713 2.476-4.515 5.38-4.73a11.8 11.8 0 0 1 1.56.014c-.082-.796-.262-1.45-.556-1.95-.51-.879-1.325-1.306-2.495-1.306h-.03c-.98.01-1.754.396-2.303 1.146-.31.42-.532.94-.662 1.55l-1.995-.388c.156-.9.47-1.692.934-2.357.842-1.195 2.071-1.82 3.656-1.855h.057c1.99 0 3.532.79 4.425 2.285.518.864.802 1.963.847 3.268a7.726 7.726 0 0 1 .844.378c1.143.605 2.008 1.47 2.505 2.576.74 1.697.888 4.37-1.345 6.534-1.755 1.72-3.878 2.471-6.7 2.497z"/></svg>
                </a>
                <a href="mailto:ajayfoods.co.in@gmail.com" aria-label="Email" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#EA4335] cursor-pointer transition-colors text-white">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2">
                {navLinks.map((l) => (
                  <li key={l.id}>
                    <button onClick={() => scrollTo(l.id)} className="text-white/60 text-sm hover:text-[#D4A853] transition-colors">{l.label}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">Services</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li>Event Catering</li>
                <li>Wedding Catering</li>
                <li>Corporate Lunches</li>
                <li>Charity Feeds</li>
                <li>Daily Stalls</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-white/40 text-xs">© {new Date().getFullYear()} Ajay Foods & Beverages. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-white/40 text-xs">Made with</span>
                <span className="text-red-400">❤️</span>
                <span className="text-white/40 text-xs">in Hyderabad</span>
              </div>
              <button
                onClick={() => router.push("/admin")}
                className="text-white/20 hover:text-white/50 text-xs transition-colors flex items-center gap-1 group"
                title="Owner Login"
              >
                <span className="group-hover:text-[#D4A853] transition-colors">⚙</span>
                <span>Owner Login</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Mobile sticky CTA bar ───────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#f0e6d3] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 flex gap-3">
        <a
          href="https://wa.me/919876543210?text=Hi! I'd like to book catering for my event."
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.524 5.847L.057 23.882l6.198-1.438A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.806 9.806 0 01-5.031-1.386l-.36-.214-3.732.866.938-3.63-.235-.373A9.818 9.818 0 012.18 12C2.18 6.57 6.57 2.18 12 2.18c5.43 0 9.82 4.39 9.82 9.82 0 5.43-4.39 9.818-9.82 9.818z"/></svg>
          WhatsApp
        </a>
        <button
          onClick={() => router.push("/packages")}
          className="flex-1 bg-[#8B4513] text-white py-3 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-transform"
        >
          Book Now
        </button>
      </div>

      {/* Spacer so footer content isn't hidden behind sticky bar on mobile */}
      <div className="h-[72px] md:hidden" />

    </div>
  )
}
