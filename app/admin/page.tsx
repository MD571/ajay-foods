"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { useRouter } from "next/navigation"
import {
  getPackages, setPackages,
  getMenuSections, setMenuSections,
  getExtraCategories, setExtraCategories,
  getAdminPin, setAdminPin,
  resetAllData,
  totalMenuItems, totalExtraItems, unavailableCount,
  DEFAULT_PACKAGES, DEFAULT_MENU_SECTIONS, DEFAULT_EXTRA_CATEGORIES,
  type AdminPackage, type AdminMenuItem, type AdminMenuSection,
  type AdminExtraItem, type AdminExtraCategory, type ChoiceGroup,
  getBookings, updateBookingStatus,
  getCharityEntries, setCharityEntries,
  getStalls, setStalls,
  type BookingEntry, type CharityEntry, type StallEntry,
} from "../lib/siteData"

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "dashboard" | "packages" | "menu" | "bookings" | "charity" | "stalls" | "settings"

// ─── Admin Page ───────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)
  const [pinInput, setPinInput] = useState("")
  const [pinError, setPinError] = useState("")
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Data state
  const [packages, setPackagesState] = useState<AdminPackage[]>(DEFAULT_PACKAGES)
  const [menuSections, setMenuSectionsState] = useState<AdminMenuSection[]>(DEFAULT_MENU_SECTIONS)
  const [extraCats, setExtraCatsState] = useState<AdminExtraCategory[]>(DEFAULT_EXTRA_CATEGORIES)
  const [bookings, setBookingsState] = useState<BookingEntry[]>([])
  const [charityEntries, setCharityState] = useState<CharityEntry[]>([])
  const [stalls, setStallsState] = useState<StallEntry[]>([])

  // Toast notification
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null)

  // Session timeout (30 min inactivity)
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null)
  const [sessionWarning, setSessionWarning] = useState(false)

  function refreshSession() {
    const expiry = Date.now() + 30 * 60 * 1000
    setSessionExpiry(expiry)
    setSessionWarning(false)
  }

  useEffect(() => {
    if (!loggedIn || !sessionExpiry) return
    const interval = setInterval(() => {
      const remaining = sessionExpiry - Date.now()
      if (remaining <= 0) {
        doLogout()
      } else if (remaining <= 5 * 60 * 1000) {
        setSessionWarning(true)
      } else {
        setSessionWarning(false)
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [loggedIn, sessionExpiry])

  // Load from localStorage on login
  const loadData = useCallback(() => {
    setPackagesState(getPackages())
    setMenuSectionsState(getMenuSections())
    setExtraCatsState(getExtraCategories())
    setBookingsState(getBookings())
    setCharityState(getCharityEntries())
    setStallsState(getStalls())
  }, [])

  function doLogout() {
    setLoggedIn(false)
    setPinInput("")
    setSessionExpiry(null)
    setSessionWarning(false)
  }

  function handleLogin() {
    const pin = getAdminPin()
    if (pinInput.trim() === pin) {
      setLoggedIn(true)
      setPinError("")
      loadData()
      refreshSession()
    } else {
      setPinError("Incorrect PIN. Try again.")
      setPinInput("")
    }
  }

  function showToast(msg: string, type: "success" | "error" | "info" = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function savePackages(pkgs: AdminPackage[]) {
    setPackages(pkgs)
    setPackagesState(pkgs)
    showToast("✅ Packages saved successfully!")
  }

  function saveMenuSections(secs: AdminMenuSection[]) {
    setMenuSections(secs)
    setMenuSectionsState(secs)
    showToast("✅ Menu items saved!")
  }

  function saveExtraCats(cats: AdminExtraCategory[]) {
    setExtraCategories(cats)
    setExtraCatsState(cats)
    showToast("✅ Order extras saved!")
  }

  function saveCharityEntries(entries: CharityEntry[]) {
    setCharityEntries(entries)
    setCharityState(entries)
    showToast("✅ Charity entry saved!")
  }

  function saveStalls(s: StallEntry[]) {
    setStalls(s)
    setStallsState(s)
    showToast("✅ Stall saved!")
  }

  function handleBookingStatus(id: string, status: BookingEntry["status"]) {
    updateBookingStatus(id, status)
    setBookingsState(getBookings())
    showToast("✅ Booking status updated!")
  }

  // ── Login Screen ─────────────────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a0a03] to-[#5C1209] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4380D] to-[#D4A853] flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">🔐</div>
            <h1 className="font-playfair text-2xl font-bold text-[#D4380D]">Admin Login</h1>
            <p className="text-gray-500 text-sm mt-1">Ajay Foods &amp; Beverages</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Admin PIN</label>
              <input
                type="password"
                placeholder="Enter PIN"
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value); setPinError("") }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full border border-red-200 rounded-xl px-4 py-3 text-center text-2xl tracking-widest bg-red-50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]"
                autoFocus
              />
              {pinError && <p className="text-red-500 text-xs mt-1.5 text-center">{pinError}</p>}
            </div>
            <button onClick={handleLogin}
              className="w-full bg-[#D4380D] text-white py-3.5 rounded-xl font-bold hover:bg-[#6d3410] transition-colors shadow-md"
            >
              Login →
            </button>
            <button onClick={() => router.push("/")} className="w-full text-center text-sm text-gray-500 hover:text-[#D4380D] transition-colors py-1">
              ← Back to website
            </button>
            <p className="text-center text-[10px] text-gray-300">Default PIN: AJAY1234</p>
          </div>
        </div>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; emoji: string; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard",   emoji: "📊" },
    { id: "packages",  label: "Packages",    emoji: "📦" },
    { id: "menu",      label: "Menu Items",  emoji: "🍽️" },
    { id: "bookings",  label: "Bookings",    emoji: "📋", badge: bookings.filter(b => b.status === "pending").length },
    { id: "charity",   label: "Charity",     emoji: "🙏" },
    { id: "stalls",    label: "Stalls",      emoji: "🏪" },
    { id: "settings",  label: "Settings",    emoji: "⚙️" },
  ]

  return (
    <div className="min-h-screen bg-[#FFF8F5]" onClick={refreshSession} onKeyDown={refreshSession}>

      {/* ── Toast notification ─────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] px-5 py-3.5 rounded-2xl shadow-2xl font-semibold text-sm text-white flex items-center gap-2.5 transition-all animate-bounce-in ${
          toast.type === "success" ? "bg-green-600" : toast.type === "error" ? "bg-red-600" : "bg-blue-600"
        }`}>
          {toast.msg}
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 ml-1 text-base leading-none">×</button>
        </div>
      )}

      {/* ── Session warning ────────────────────────────────────────────────── */}
      {sessionWarning && (
        <div className="fixed top-0 left-0 right-0 z-[90] bg-red-500 text-white text-center text-xs font-semibold py-2 flex items-center justify-center gap-3">
          ⏰ Your session will expire soon due to inactivity.
          <button onClick={refreshSession} className="bg-white text-red-700 px-3 py-0.5 rounded-full text-xs font-bold hover:bg-red-50 transition-colors">
            Stay Logged In
          </button>
        </div>
      )}

      {/* Top Nav */}
      <div className="sticky top-0 z-40">
        <header className="bg-white border-b border-red-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            {/* Logo + branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4380D] to-[#D4A853] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">A</div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-[#D4380D] font-playfair leading-tight">Ajay Foods Admin</h1>
                <p className="text-xs text-[#D4A853] font-medium tracking-wide">Owner Dashboard</p>
              </div>
            </div>
            {/* Right: desktop links + small brown hamburger */}
            <div className="flex items-center gap-2">
              <a href="/" target="_blank" rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors font-medium"
              >View Site 🔗</a>
              <button onClick={doLogout}
                className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors font-medium"
              >Logout</button>
              {/* Hamburger — small rounded brown square, like ajay-catering */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setMobileNavOpen(v => !v) }}
                  className="w-11 h-11 bg-[#D4380D] rounded-2xl flex items-center justify-center shadow-md hover:bg-[#6d3410] transition-colors flex-shrink-0"
                  aria-label="Toggle navigation"
                >
                  <div className="flex flex-col gap-[5px]">
                    <span className="block w-5 h-0.5 bg-white rounded-full" />
                    <span className="block w-5 h-0.5 bg-white rounded-full" />
                    <span className="block w-5 h-0.5 bg-white rounded-full" />
                  </div>
                </button>

                {/* Floating dropdown card */}
                {mobileNavOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-14 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden"
                  >
                    {/* Dashboard — always at top */}
                    <div className="px-4 pt-3 pb-0.5">
                      <p className="text-[10px] font-bold text-[#D4A853] uppercase tracking-widest">Overview</p>
                    </div>
                    <button
                      onClick={() => { setActiveTab("dashboard"); setMobileNavOpen(false) }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left ${activeTab === "dashboard" ? "bg-red-100" : ""}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-xl flex-shrink-0">📊</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm leading-tight">Dashboard</p>
                        <p className="text-gray-400 text-xs mt-0.5">{packages.length} packages · {totalMenuItems(menuSections)} dishes</p>
                      </div>
                    </button>

                    {/* Manage section — all tabs except dashboard */}
                    <div className="mx-4 my-1 border-t border-red-100" />
                    <div className="px-4 pt-2 pb-0.5">
                      <p className="text-[10px] font-bold text-[#D4A853] uppercase tracking-widest">Manage</p>
                    </div>
                    <div className="pb-2">
                      {tabs.filter(t => t.id !== "dashboard").map((t) => (
                        <button key={t.id}
                          onClick={() => { setActiveTab(t.id); setMobileNavOpen(false) }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left ${activeTab === t.id ? "bg-red-100" : ""}`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-xl flex-shrink-0">
                            {t.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm leading-tight">{t.label}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{((): string => {
                              switch(t.id) {
                                case "packages":  return `${packages.length} packages`
                                case "menu":      return `${totalMenuItems(menuSections)} items`
                                case "bookings":  return `${bookings.length} bookings`
                                case "charity":   return "Daily feeds"
                                case "stalls":    return `${stalls.length} stalls`
                                case "settings":  return "Admin settings"
                                default:          return ""
                              }
                            })()}</p>
                          </div>
                          {t.badge != null && t.badge > 0 && (
                            <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">{t.badge} new</span>
                          )}
                        </button>
                      ))}
                      <div className="mx-4 my-1 border-t border-red-100" />
                      <button onClick={doLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-xl flex-shrink-0">🚪</div>
                        <p className="font-semibold text-red-600 text-sm">Logout</p>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Backdrop to close nav on outside click */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setMobileNavOpen(false)} />
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── DASHBOARD ─────────────────────────────────────────────────── */}
        {activeTab === "dashboard" && (
          <DashboardTab
            packages={packages} menuSections={menuSections} extraCats={extraCats}
            bookingCount={bookings.length}
            pendingCount={bookings.filter(b => b.status === "pending").length}
            setActiveTab={setActiveTab}
          />
        )}

        {/* ── PACKAGES ──────────────────────────────────────────────────── */}
        {activeTab === "packages" && (
          <PackagesTab packages={packages} onSave={savePackages} menuSections={menuSections} />
        )}

        {/* ── MENU ITEMS ────────────────────────────────────────────────── */}
        {activeTab === "menu" && (
          <MenuTab sections={menuSections} onSave={saveMenuSections} />
        )}

        {/* ── BOOKINGS ──────────────────────────────────────────────────── */}
        {activeTab === "bookings" && (
          <BookingsTab bookings={bookings} onStatusChange={handleBookingStatus} />
        )}

        {/* ── CHARITY ───────────────────────────────────────────────────── */}
        {activeTab === "charity" && (
          <CharityTab entries={charityEntries} onSave={saveCharityEntries} menuSections={menuSections} />
        )}

        {/* ── STALLS ────────────────────────────────────────────────────── */}
        {activeTab === "stalls" && (
          <StallsTab stalls={stalls} onSave={saveStalls} menuSections={menuSections} />
        )}

        {/* ── SETTINGS ──────────────────────────────────────────────────── */}
        {activeTab === "settings" && (
          <SettingsTab
            onResetAll={() => {
              if (!confirm("Reset ALL data to defaults? This cannot be undone.")) return
              resetAllData()
              loadData()
              showToast("♻️ All data reset to defaults!", "info")
            }}
          />
        )}
      </div>
    </div>
  )
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
const DashboardTab = memo(function DashboardTab({ packages, menuSections, extraCats, bookingCount, pendingCount, setActiveTab }: {
  packages: AdminPackage[]; menuSections: AdminMenuSection[]; extraCats: AdminExtraCategory[]
  bookingCount: number; pendingCount: number
  setActiveTab: (t: Tab) => void
}) {
  const unavail = unavailableCount(menuSections)
  const stats = [
    { label: "Packages",       value: packages.length,       icon: "📦", tab: "packages" as Tab },
    { label: "Menu Items",     value: totalMenuItems(menuSections), icon: "🍽️", tab: "menu" as Tab },
    { label: "Unavailable",    value: unavail,               icon: "⚠️", tab: "menu" as Tab, warn: unavail > 0 },
    { label: "Bookings",       value: bookingCount,          icon: "📋", tab: "bookings" as Tab },
    { label: "Pending",        value: pendingCount,          icon: "🔔", tab: "bookings" as Tab, warn: pendingCount > 0 },
  ]
  const priceRange = useMemo(() => ({
    min: Math.min(...packages.map(p => p.price)),
    max: Math.max(...packages.map(p => p.price))
  }), [packages])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-2xl font-bold text-[#D4380D] mb-1">Good day! 👋</h2>
        <p className="text-gray-500 text-sm">Here&apos;s an overview of your menu data. Click any card to edit.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <button key={s.label} onClick={() => setActiveTab(s.tab)}
            className={`bg-white rounded-2xl p-5 text-left border shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all ${
              s.warn ? "border-red-300 bg-red-50" : "border-red-100"
            }`}
          >
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`font-playfair text-3xl font-bold ${s.warn ? "text-red-600" : "text-[#D4380D]"}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Package summary with full includes */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 flex items-center justify-between">
          <h3 className="font-playfair text-lg font-bold text-[#D4380D]">Packages Overview</h3>
          <button onClick={() => setActiveTab("packages")} className="text-xs text-[#D4380D] border border-[#D4380D] px-3 py-1 rounded-full hover:bg-[#D4380D] hover:text-white transition-colors font-semibold">Edit Packages →</button>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#FFE0D4]">
          {packages.map((p) => (
            <div key={p.id} className="flex flex-col">
              {/* Gradient header */}
              <div className={`bg-gradient-to-br ${p.color} px-4 py-3 relative`}>
                {p.popular && <span className="absolute top-2 right-2 text-[8px] bg-[#D4A853] text-[#5C1209] font-bold px-1.5 py-0.5 rounded-full">★ Popular</span>}
                <p className="text-white/70 text-[9px] font-bold uppercase tracking-wider">{p.tag}</p>
                <p className="font-playfair font-bold text-base text-white mt-0.5">{p.name}</p>
                <p className="text-xl font-bold text-white mt-1">₹{p.price} <span className="text-white/60 text-[10px] font-normal">/person</span></p>
              </div>
              {/* Includes list */}
              <div className="px-4 py-3 flex-1 bg-red-50/40">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Includes</p>
                <ul className="space-y-1">
                  {(p.includes ?? []).map((inc, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-700">
                      <span className="text-[#D4A853] flex-shrink-0 font-bold mt-0.5">✓</span>{inc}
                    </li>
                  ))}
                </ul>
                {(p.choiceGroups ?? []).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-red-100">
                    {(p.choiceGroups ?? []).map(g => (
                      <p key={g.id} className="text-[10px] text-gray-500 mb-0.5 leading-snug">
                        <span className="font-semibold text-[#D4380D]">🎯 {g.label}:</span>{" "}
                        {g.options.slice(0, 3).join(", ")}{g.options.length > 3 ? ` +${g.options.length - 3} more` : ""}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 px-6 py-3 border-t border-red-100">Price range: ₹{priceRange.min} – ₹{priceRange.max} per person · Click "Edit Packages" to modify</p>
      </div>

    </div>
  )
})

// ─── Packages Tab ─────────────────────────────────────────────────────────────
const PKG_STYLE_TEMPLATES = [
  { color: "from-[#2d6a4f] to-[#40916c]", lightColor: "bg-[#d8f3dc]", textColor: "text-[#1b4332]", badgeColor: "bg-green-100 text-green-800", tag: "VEG" as const, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80", alt: "Vegetarian thali" },
  { color: "from-[#e9c46a] to-[#f4a261]", lightColor: "bg-[#fff3cd]", textColor: "text-[#5c3d11]", badgeColor: "bg-yellow-100 text-yellow-800", tag: "VEG" as const, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80", alt: "Indian vegetarian spread" },
  { color: "from-[#D4380D] to-[#E5622B]", lightColor: "bg-[#fce8d8]", textColor: "text-[#4a1a05]", badgeColor: "bg-red-100 text-red-800", tag: "NON-VEG" as const, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80", alt: "Chicken biryani" },
  { color: "from-[#5C1209] to-[#9E2D1A]", lightColor: "bg-[#f5ddd0]", textColor: "text-[#2a0f03]", badgeColor: "bg-red-100 text-red-800", tag: "NON-VEG" as const, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80", alt: "Indian non-veg feast" },
]

const PackagesTab = memo(function PackagesTab({ packages, onSave, menuSections }: {
  packages: AdminPackage[];
  onSave: (p: AdminPackage[]) => void;
  menuSections: AdminMenuSection[]
}) {
  const [local, setLocal] = useState<AdminPackage[]>(() => JSON.parse(JSON.stringify(packages)))
  const [editId, setEditId] = useState<string | null>(null)
  const [newInclude, setNewInclude] = useState("")
  const [newOptionText, setNewOptionText] = useState<Record<string, string>>({})
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setLocal(JSON.parse(JSON.stringify(packages)))
    setDirty(false)
  }, [packages])

  function update(id: string, field: keyof AdminPackage, value: unknown) {
    setLocal((prev) => prev.map((p) => p.id === id ? { ...p, [field]: value } : p))
    setDirty(true)
  }

  function addInclude(pkgId: string) {
    if (!newInclude.trim()) return
    const pkg = local.find(p => p.id === pkgId)!
    update(pkgId, "includes", [...pkg.includes, newInclude.trim()])
    setNewInclude("")
  }

  function removeInclude(pkgId: string, idx: number) {
    const pkg = local.find(p => p.id === pkgId)!
    update(pkgId, "includes", pkg.includes.filter((_, i) => i !== idx))
  }

  function addChoice(pkgId: string) {
    const pkg = local.find(p => p.id === pkgId)!
    const groups = pkg.choiceGroups ?? []
    const newGroup: ChoiceGroup = { id: "group-" + Date.now(), label: "New Choice Group (pick 1)", pick: 1, options: [] }
    update(pkgId, "choiceGroups", [...groups, newGroup])
  }

  function removeChoiceGroup(pkgId: string, groupId: string) {
    const pkg = local.find(p => p.id === pkgId)!
    update(pkgId, "choiceGroups", (pkg.choiceGroups ?? []).filter(g => g.id !== groupId))
  }

  function updateChoiceGroup(pkgId: string, groupId: string, field: keyof ChoiceGroup, value: unknown) {
    const pkg = local.find(p => p.id === pkgId)!
    update(pkgId, "choiceGroups", (pkg.choiceGroups ?? []).map(g => g.id === groupId ? { ...g, [field]: value } : g))
  }

  function addOption(pkgId: string, groupId: string) {
    const key = pkgId + "-" + groupId
    const text = (newOptionText[key] ?? "").trim()
    if (!text) return
    const pkg = local.find(p => p.id === pkgId)!
    update(pkgId, "choiceGroups", (pkg.choiceGroups ?? []).map(g =>
      g.id === groupId ? { ...g, options: [...g.options, text] } : g
    ))
    setNewOptionText(prev => ({ ...prev, [key]: "" }))
  }

  function removeOption(pkgId: string, groupId: string, optIdx: number) {
    const pkg = local.find(p => p.id === pkgId)!
    update(pkgId, "choiceGroups", (pkg.choiceGroups ?? []).map(g =>
      g.id === groupId ? { ...g, options: g.options.filter((_, i) => i !== optIdx) } : g
    ))
  }

  function copyPackage(pkg: AdminPackage) {
    const style = PKG_STYLE_TEMPLATES[local.length % PKG_STYLE_TEMPLATES.length]
    const copied: AdminPackage = {
      ...JSON.parse(JSON.stringify(pkg)),
      ...style,
      id: pkg.id + "-copy-" + Date.now(),
      name: pkg.name + " (Copy)",
      popular: false,
    }
    setLocal(prev => [...prev, copied])
    setDirty(true)
  }

  function deletePackage(pkgId: string) {
    if (local.length <= 1) { alert("Cannot delete the last package."); return }
    if (!confirm("Delete this package? This cannot be undone.")) return
    setLocal(prev => prev.filter(p => p.id !== pkgId))
    if (editId === pkgId) setEditId(null)
    setDirty(true)
  }

  function addNewPackage() {
    const style = PKG_STYLE_TEMPLATES[local.length % PKG_STYLE_TEMPLATES.length]
    const newPkg: AdminPackage = {
      ...style,
      id: "pkg-" + Date.now(),
      name: "New Package",
      tagline: "Custom Package",
      price: 120,
      popular: false,
      ideal: "Ideal for all events",
      includes: ["White Rice (Unlimited)", "Sambar + Rasam + Curd", "1 Dal of your choice", "Papad"],
      choiceGroups: [],
    }
    setLocal(prev => [...prev, newPkg])
    setEditId(newPkg.id)
    setDirty(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-[#D4380D]">Edit Packages</h2>
          <p className="text-gray-500 text-sm mt-0.5">Manage packages, items, and customer choice options.</p>
        </div>
        <div className="flex items-center gap-3">
          {dirty && (
            <button onClick={() => { onSave(local); setDirty(false) }}
              className="bg-[#D4380D] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#6d3410] transition-colors shadow-md flex items-center gap-2"
            >
              💾 Save All
            </button>
          )}
          <button onClick={addNewPackage}
            className="flex items-center gap-2 bg-[#D4380D] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#6d3410] transition-colors shadow-sm"
          >
            + New Package
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {local.map((pkg) => (
          <div key={pkg.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${editId === pkg.id ? "border-[#D4380D] shadow-lg" : "border-red-100"}`}>
            {/* Card header */}
            <div className={`bg-gradient-to-r ${pkg.color} p-4`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${pkg.badgeColor}`}>{pkg.tag}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <h3 className="font-playfair text-xl font-bold text-white">{pkg.name}</h3>
                    {pkg.popular && <span className="text-[9px] bg-[#D4A853] text-[#5C1209] font-bold px-2 py-0.5 rounded-full">★ Popular</span>}
                  </div>
                  <p className="text-white/70 text-xs">{pkg.tagline}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-3xl font-bold text-white">₹{pkg.price}</p>
                  <p className="text-white/60 text-xs">/person</p>
                </div>
              </div>
            </div>

            {/* Includes list — always visible below header */}
            <div className="px-4 py-3 bg-red-50/40 border-b border-red-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">What&apos;s Included</p>
              <ul className="space-y-1">
                {pkg.includes.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#D4A853]/30 flex items-center justify-center text-[#D4380D] text-[8px] flex-shrink-0 mt-0.5 font-bold">✓</span>
                    {inc}
                  </li>
                ))}
              </ul>
              {(pkg.choiceGroups ?? []).length > 0 && (
                <div className="mt-2 pt-2 border-t border-red-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Choice Options</p>
                  {(pkg.choiceGroups ?? []).map(g => (
                    <p key={g.id} className="text-[10px] text-gray-500 mb-0.5">
                      <span className="font-semibold text-[#D4380D]">🎯 {g.label}:</span> {g.options.slice(0, 4).join(", ")}{g.options.length > 4 ? ` +${g.options.length - 4} more` : ""}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Action bar */}
            <div className="flex border-b border-red-100">
              <button
                onClick={() => {
                  if (editId === pkg.id) {
                    onSave(local)
                    setDirty(false)
                    setEditId(null)
                  } else {
                    setEditId(pkg.id)
                  }
                }}
                className={`flex-1 text-center text-xs font-semibold py-2.5 transition-colors flex items-center justify-center gap-1.5 ${editId === pkg.id ? "bg-green-50 text-green-700 hover:bg-green-100" : "text-[#D4380D] hover:bg-red-50"}`}
              >
                {editId === pkg.id ? "✅ Save & Close" : "✏️ Edit"}
              </button>
              <div className="w-px bg-red-100" />
              <button
                onClick={() => copyPackage(pkg)}
                className="flex-1 text-center text-xs font-semibold text-gray-500 border-0 py-2.5 hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
                title="Duplicate this package"
              >
                📋 Copy
              </button>
              <div className="w-px bg-red-100" />
              <button
                onClick={() => deletePackage(pkg.id)}
                className="flex-1 text-center text-xs font-semibold text-red-400 py-2.5 hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
              >
                🗑️ Delete
              </button>
            </div>

            {/* Editor */}
            {editId === pkg.id && (
              <div className="p-5 space-y-5">
                {/* Price */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">💰 Price per Person (₹)</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={50} max={500} step={5} value={pkg.price}
                      onChange={(e) => update(pkg.id, "price", Number(e.target.value))}
                      className="flex-1 accent-[#D4380D]"
                    />
                    <div className="flex items-center border border-red-200 rounded-xl overflow-hidden">
                      <span className="px-3 py-2 text-sm font-bold text-[#D4380D] bg-red-50">₹</span>
                      <input type="number" min={50} max={1000} step={5} value={pkg.price}
                        onChange={(e) => update(pkg.id, "price", Number(e.target.value))}
                        className="w-20 px-2 py-2 text-sm font-bold text-gray-900 focus:outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">For 100 guests: ₹{(pkg.price * 100).toLocaleString("en-IN")}</p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Package Name</label>
                  <input type="text" value={pkg.name}
                    onChange={(e) => update(pkg.id, "name", e.target.value)}
                    className="w-full border border-red-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A853]"
                  />
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Tagline</label>
                  <input type="text" value={pkg.tagline}
                    onChange={(e) => update(pkg.id, "tagline", e.target.value)}
                    className="w-full border border-red-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A853]"
                  />
                </div>

                {/* Ideal for */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Ideal For Hint</label>
                  <input type="text" value={pkg.ideal}
                    onChange={(e) => update(pkg.id, "ideal", e.target.value)}
                    className="w-full border border-red-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A853]"
                    placeholder="e.g. Ideal for 50–200 guests"
                  />
                </div>

                {/* Popular toggle */}
                <div className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">⭐ Mark as Most Popular</p>
                    <p className="text-xs text-gray-500">Shows a badge on the packages page</p>
                  </div>
                  <button onClick={() => update(pkg.id, "popular", !pkg.popular)}
                    className={`relative w-12 h-6 rounded-full transition-all ${pkg.popular ? "bg-[#D4380D]" : "bg-[#ddd]"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${pkg.popular ? "left-6" : "left-0.5"}`} />
                  </button>
                </div>

                {/* Includes list */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">📋 What&apos;s Included ({pkg.includes.length} items)</label>
                  <div className="space-y-2 mb-3">
                    {pkg.includes.map((inc, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-red-50 rounded-xl px-3 py-2">
                        <span className="w-4 h-4 rounded-full bg-[#D4A853]/30 flex items-center justify-center text-[#D4380D] text-[10px] flex-shrink-0">✓</span>
                        <input type="text" value={inc}
                          onChange={(e) => {
                            const updated = [...pkg.includes]
                            updated[idx] = e.target.value
                            update(pkg.id, "includes", updated)
                          }}
                          className="flex-1 bg-transparent text-sm focus:outline-none text-gray-800"
                        />
                        <button onClick={() => removeInclude(pkg.id, idx)} className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none flex-shrink-0">×</button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newInclude} placeholder="Add included item…"
                      onChange={(e) => setNewInclude(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addInclude(pkg.id)}
                      className="flex-1 border border-red-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A853]"
                    />
                    <button onClick={() => addInclude(pkg.id)}
                      className="bg-[#D4380D] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#6d3410] transition-colors"
                    >+ Add</button>
                  </div>
                  {/* Pick from menu items */}
                  <div className="mt-3 pt-3 border-t border-red-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Or pick from menu items</p>
                    <ItemPickerPanel
                      sections={menuSections}
                      selected={pkg.includes}
                      onToggle={(name) => {
                        const current = pkg.includes
                        const updated = current.includes(name)
                          ? current.filter(i => i !== name)
                          : [...current, name]
                        update(pkg.id, "includes", updated)
                      }}
                    />
                  </div>
                </div>

                {/* Choice Groups */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">🎯 Customer Choice Options</label>
                      <p className="text-[10px] text-gray-400 mt-0.5">Items marked &quot;your choice&quot; — customers pick from these options</p>
                    </div>
                    <button onClick={() => addChoice(pkg.id)}
                      className="text-xs bg-red-50 border border-[#D4A853] text-[#D4380D] px-3 py-1.5 rounded-lg font-semibold hover:bg-[#D4A853]/20 transition-colors"
                    >+ Add Group</button>
                  </div>

                  {(pkg.choiceGroups ?? []).length === 0 && (
                    <p className="text-xs text-gray-300 italic text-center py-3 bg-gray-50 rounded-xl border border-dashed border-red-200">No choice groups yet. Add one above.</p>
                  )}

                  <div className="space-y-3">
                    {(pkg.choiceGroups ?? []).map((group) => {
                      const key = pkg.id + "-" + group.id
                      return (
                        <div key={group.id} className="border border-red-200 rounded-xl overflow-hidden">
                          <div className="bg-red-50 px-3 py-2 flex items-center gap-2">
                            <input type="text" value={group.label}
                              onChange={e => updateChoiceGroup(pkg.id, group.id, "label", e.target.value)}
                              className="flex-1 bg-transparent text-sm font-semibold text-gray-800 focus:outline-none"
                              placeholder="Group label e.g. Dal (pick 1)"
                            />
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="text-xs text-gray-500">Pick:</span>
                              <input type="number" min={1} max={5} value={group.pick}
                                onChange={e => updateChoiceGroup(pkg.id, group.id, "pick", Number(e.target.value))}
                                className="w-12 border border-red-200 rounded-lg px-2 py-1 text-xs text-center bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A853]"
                              />
                            </div>
                            <button onClick={() => removeChoiceGroup(pkg.id, group.id)} className="text-gray-300 hover:text-red-500 transition-colors text-base leading-none ml-1">×</button>
                          </div>
                          <div className="p-3">
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {group.options.map((opt, oi) => (
                                <span key={oi} className="flex items-center gap-1 bg-red-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                                  {opt}
                                  <button onClick={() => removeOption(pkg.id, group.id, oi)} className="text-gray-400 hover:text-red-500 transition-colors ml-0.5 leading-none">×</button>
                                </span>
                              ))}
                              {group.options.length === 0 && <span className="text-xs text-gray-300 italic">No options yet</span>}
                            </div>
                            <div className="flex gap-2">
                              <input type="text"
                                value={newOptionText[key] ?? ""}
                                onChange={e => setNewOptionText(prev => ({ ...prev, [key]: e.target.value }))}
                                onKeyDown={e => e.key === "Enter" && addOption(pkg.id, group.id)}
                                placeholder="Add option e.g. Kandi Pappu"
                                className="flex-1 border border-red-200 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A853]"
                              />
                              <button onClick={() => addOption(pkg.id, group.id)}
                                className="bg-[#D4380D] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#6d3410] transition-colors"
                              >Add</button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {dirty && (
        <div className="sticky bottom-4">
          <div className="bg-[#D4380D] text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl max-w-2xl mx-auto">
            <p className="font-semibold text-sm">You have unsaved changes</p>
            <div className="flex gap-3">
              <button onClick={() => { setLocal(JSON.parse(JSON.stringify(packages))); setDirty(false) }}
                className="border border-white/30 text-white/80 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors"
              >Discard</button>
              <button onClick={() => { onSave(local); setDirty(false) }}
                className="bg-white text-[#D4380D] px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors"
              >💾 Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

// ─── Menu Tab ─────────────────────────────────────────────────────────────────
const MenuTab = memo(function MenuTab({ sections, onSave }: { sections: AdminMenuSection[]; onSave: (s: AdminMenuSection[]) => void }) {
  const [local, setLocal] = useState<AdminMenuSection[]>(() => JSON.parse(JSON.stringify(sections)))
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "")
  const [editItemId, setEditItemId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [dietFilter, setDietFilter] = useState<"all"|"veg"|"non-veg">("all")
  const [menuSearch, setMenuSearch] = useState("")
  const [newItem, setNewItem] = useState<Omit<AdminMenuItem, "id">>({
    name: "", diet: "veg", price: 0, desc: "", popular: false, available: true,
  })

  // Cross-section search results
  const searchResults = menuSearch.trim()
    ? local.flatMap(sec => sec.items
        .filter(i => i.name.toLowerCase().includes(menuSearch.toLowerCase()) || i.desc.toLowerCase().includes(menuSearch.toLowerCase()))
        .map(i => ({ ...i, sectionId: sec.id, sectionLabel: sec.label, sectionEmoji: sec.emoji }))
      )
    : null

  useEffect(() => { setLocal(JSON.parse(JSON.stringify(sections))); setDirty(false) }, [sections])

  const sectionData = local.find(s => s.id === activeSection)

  function updateItem(sectionId: string, itemId: string, field: keyof AdminMenuItem, value: unknown) {
    setLocal(prev => prev.map(sec =>
      sec.id === sectionId
        ? { ...sec, items: sec.items.map(i => i.id === itemId ? { ...i, [field]: value } : i) }
        : sec
    ))
    setDirty(true)
  }

  function deleteItem(sectionId: string, itemId: string) {
    const itemName = local.find(s => s.id === sectionId)?.items.find(i => i.id === itemId)?.name ?? "this item"
    if (!confirm(`Delete "${itemName}"?\n\nThis action cannot be undone.`)) return
    setLocal(prev => prev.map(sec =>
      sec.id === sectionId ? { ...sec, items: sec.items.filter(i => i.id !== itemId) } : sec
    ))
    setDirty(true)
  }

  function addItem() {
    if (!newItem.name.trim()) return
    const id = newItem.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now()
    setLocal(prev => prev.map(sec =>
      sec.id === activeSection
        ? { ...sec, items: [...sec.items, { ...newItem, id }] }
        : sec
    ))
    setNewItem({ name: "", diet: "veg", price: 0, desc: "", popular: false, available: true })
    setShowAddForm(false)
    setDirty(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-[#D4380D]">Edit Menu Items</h2>
          <p className="text-gray-500 text-sm mt-0.5">Manage items shown on the /menu page and quick booking modal.</p>
        </div>
        {dirty && (
          <button onClick={() => { onSave(local); setDirty(false) }}
            className="bg-[#D4380D] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#6d3410] transition-colors shadow-md flex items-center gap-2"
          >💾 Save Changes</button>
        )}
      </div>

      {/* Row 1: Search + Diet filter */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">🔍</span>
          <input
            type="text"
            placeholder="Search menu items by name or description…"
            value={menuSearch}
            onChange={e => setMenuSearch(e.target.value)}
            className="w-full border border-red-200 rounded-xl pl-10 pr-10 py-2.5 text-sm bg-red-50 focus:outline-none focus:ring-2 focus:ring-[#D4A853] placeholder:text-gray-400"
          />
          {menuSearch && (
            <button onClick={() => setMenuSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
          )}
        </div>
        <div className="inline-flex bg-red-50 border border-red-200 rounded-xl p-1 gap-0.5 flex-shrink-0">
          {(["all", "veg", "non-veg"] as const).map((d) => (
            <button key={d} onClick={() => setDietFilter(d)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                dietFilter === d ? "bg-[#D4380D] text-white shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {d === "all" ? "All" : d === "veg" ? "🌿 Veg" : "🍗 Non-Veg"}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Section tabs — hidden when searching */}
      {!searchResults && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {local.map((sec) => {
            const unavail = sec.items.filter(i => !i.available).length
            return (
              <button key={sec.id} onClick={() => setActiveSection(sec.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  activeSection === sec.id ? "bg-[#D4380D] text-white shadow-sm" : "bg-white border border-red-200 text-gray-600 hover:border-[#D4380D] hover:text-[#D4380D]"
                }`}
              >
                <span>{sec.emoji}</span> {sec.label}
                {unavail > 0 && <span className="bg-red-400 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{unavail}</span>}
              </button>
            )
          })}
        </div>
      )}

      {/* Diet filter + section list OR search results */}
      {!searchResults ? (
        <>

      {sectionData && (
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
          {/* Section header */}
          <div className="px-5 py-4 border-b border-red-100 flex items-center justify-between">
            <div>
              <h3 className="font-playfair text-lg font-bold text-[#D4380D]">{sectionData.emoji} {sectionData.label}</h3>
              <p className="text-xs text-gray-500">{sectionData.items.length} items · {sectionData.items.filter(i => !i.available).length} unavailable</p>
            </div>
            <button onClick={() => setShowAddForm(v => !v)}
              className="flex items-center gap-1.5 bg-[#D4380D] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#6d3410] transition-colors"
            >
              + Add Item
            </button>
          </div>

          {/* Add new item form */}
          {showAddForm && (
            <div className="bg-red-50/80 border-b border-red-100 px-5 py-4 space-y-3">
              <h4 className="font-semibold text-sm text-[#D4380D]">New Item in {sectionData.label}</h4>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                <input type="text" placeholder="Item name *" value={newItem.name}
                  onChange={e => setNewItem(n => ({ ...n, name: e.target.value }))}
                  className="border border-red-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A853] col-span-2 md:col-span-2"
                />
                <div className="flex border border-red-200 rounded-xl overflow-hidden bg-white">
                  <span className="px-3 py-2 bg-red-50 text-sm font-bold text-[#D4380D]">₹</span>
                  <input type="number" min={0} placeholder="Price" value={newItem.price || ""}
                    onChange={e => setNewItem(n => ({ ...n, price: Number(e.target.value) }))}
                    className="flex-1 px-2 py-2 text-sm focus:outline-none"
                  />
                </div>
                <select value={newItem.diet} onChange={e => setNewItem(n => ({ ...n, diet: e.target.value as "veg" | "non-veg" }))}
                  className="border border-red-200 rounded-xl px-3 py-2 text-sm bg-red-50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]"
                >
                  <option value="veg">🌿 Veg</option>
                  <option value="non-veg">🍗 Non-Veg</option>
                </select>
                <input type="text" placeholder="Short description" value={newItem.desc}
                  onChange={e => setNewItem(n => ({ ...n, desc: e.target.value }))}
                  className="border border-red-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A853] col-span-2 md:col-span-3"
                />
                <div className="flex gap-2">
                  <button onClick={addItem} className="flex-1 bg-[#D4380D] text-white py-2 rounded-xl text-sm font-bold hover:bg-[#6d3410] transition-colors">Add</button>
                  <button onClick={() => setShowAddForm(false)} className="border border-red-200 text-gray-500 px-3 py-2 rounded-xl text-sm hover:border-red-300 hover:text-red-500 transition-colors">✕</button>
                </div>
              </div>
            </div>
          )}

          {/* Items as booking-style cards */}
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {sectionData.items.filter(item => dietFilter === "all" || item.diet === dietFilter).map((item) => (
              <div key={item.id}
                className={`border rounded-2xl overflow-hidden flex flex-col transition-all ${
                  !item.available
                    ? "bg-gray-50 border-gray-200 opacity-60"
                    : "bg-white border-red-100 hover:shadow-md hover:border-red-300"
                }`}
              >
                {/* Visual header */}
                <div className={`flex items-center justify-center py-4 relative ${item.diet === "veg" ? "bg-green-50" : "bg-red-50"}`}>
                  <span className="text-3xl">{item.diet === "veg" ? "🌿" : "🍗"}</span>
                  {item.popular && (
                    <span className="absolute top-1.5 left-1.5 bg-[#D4A853] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">★ Popular</span>
                  )}
                  <button onClick={() => updateItem(sectionData.id, item.id, "popular", !item.popular)}
                    title={item.popular ? "Unmark popular" : "Mark popular"}
                    className={`absolute top-1.5 right-1.5 text-base transition-all ${item.popular ? "text-[#D4A853]" : "text-gray-200 hover:text-[#D4A853]"}`}
                  >★</button>
                </div>

                {/* Content */}
                <div className="px-3 pt-2 pb-1 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-2 h-2 rounded-sm border flex-shrink-0 ${item.diet === "veg" ? "border-green-600 bg-green-100" : "border-red-600 bg-red-100"}`} />
                    {editItemId === item.id ? (
                      <input type="text" value={item.name}
                        onChange={e => updateItem(sectionData.id, item.id, "name", e.target.value)}
                        className="flex-1 border border-red-200 rounded-lg px-2 py-0.5 text-xs bg-red-50 focus:outline-none focus:ring-1 focus:ring-[#D4A853]"
                      />
                    ) : (
                      <p className={`font-semibold text-xs leading-tight ${!item.available ? "line-through text-gray-400" : "text-gray-800"}`}>{item.name}</p>
                    )}
                  </div>
                  {editItemId === item.id ? (
                    <input type="text" value={item.desc}
                      onChange={e => updateItem(sectionData.id, item.id, "desc", e.target.value)}
                      className="w-full border border-red-200 rounded-lg px-2 py-0.5 text-[10px] bg-red-50 focus:outline-none focus:ring-1 focus:ring-[#D4A853] mb-1"
                      placeholder="Description…"
                    />
                  ) : (
                    item.desc && <p className="text-[10px] text-gray-400 leading-tight mb-1 line-clamp-1">{item.desc}</p>
                  )}
                  {/* Price */}
                  {editItemId === item.id ? (
                    <div className="flex items-center border border-red-200 rounded-lg overflow-hidden h-6 w-full mb-1">
                      <span className="px-1.5 text-[10px] font-bold text-[#D4380D] bg-red-50 h-full flex items-center">₹</span>
                      <input type="number" min={0} value={item.price}
                        onChange={e => updateItem(sectionData.id, item.id, "price", Number(e.target.value))}
                        className="flex-1 px-1 text-xs font-bold focus:outline-none h-full"
                      />
                    </div>
                  ) : (
                    <span className="inline-block bg-[#D4380D]/10 text-[#D4380D] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.price === 0 ? "Free" : `₹${item.price}`}
                    </span>
                  )}
                </div>

                {/* Controls bar */}
                <div className="flex items-center gap-1 px-2 py-1.5 border-t border-amber-50 bg-red-50/50">
                  <button onClick={() => updateItem(sectionData.id, item.id, "available", !item.available)}
                    className={`flex-1 text-[10px] py-0.5 rounded-full font-semibold transition-all ${
                      item.available ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600" : "bg-red-100 text-red-600 hover:bg-green-100 hover:text-green-700"
                    }`}
                  >{item.available ? "✓ On" : "✗ Off"}</button>
                  <button onClick={() => setEditItemId(editItemId === item.id ? null : item.id)}
                    className="text-xs text-gray-400 hover:text-[#D4380D] transition-colors px-1.5"
                  >{editItemId === item.id ? "✓" : "✏️"}</button>
                  <button onClick={() => deleteItem(sectionData.id, item.id)}
                    className="text-xs text-gray-300 hover:text-red-500 transition-colors px-1"
                  >🗑️</button>
                </div>
              </div>
            ))}
          </div>

          {sectionData.items.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <p>No items in this section.</p>
              <button onClick={() => setShowAddForm(true)} className="text-[#D4380D] font-semibold text-sm mt-2">+ Add first item</button>
            </div>
          )}
        </div>
      )}
        </>
      ) : (
        /* ── Search results view ── */
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-red-100 bg-red-50 flex items-center justify-between">
            <p className="font-semibold text-sm text-[#D4380D]">
              🔍 {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &ldquo;{menuSearch}&rdquo;
            </p>
            <button onClick={() => setMenuSearch("")} className="text-xs text-gray-500 hover:text-[#D4380D] border border-red-200 px-3 py-1 rounded-full">Clear search</button>
          </div>
          {searchResults.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-2xl mb-2">🍽️</p>
              <p>No items found matching &ldquo;{menuSearch}&rdquo;</p>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {searchResults.map((item) => (
                <div key={item.id}
                  className={`border rounded-2xl p-4 flex flex-col gap-2 transition-all ${
                    !item.available ? "bg-gray-50 border-red-200 opacity-60" : "bg-white border-red-200 hover:shadow-md hover:border-[#D4A853]/50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`w-2.5 h-2.5 rounded-sm border-2 mt-1 flex-shrink-0 ${item.diet === "veg" ? "border-green-600 bg-green-100" : "border-red-600 bg-red-100"}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${!item.available ? "line-through text-gray-400" : "text-gray-900"}`}>{item.name}</p>
                      {item.desc && <p className="text-xs text-gray-500">{item.desc}</p>}
                      <p className="text-[10px] text-[#D4A853] font-semibold mt-0.5">{item.sectionEmoji} {item.sectionLabel}</p>
                    </div>
                    <button onClick={() => updateItem(item.sectionId, item.id, "popular", !item.popular)}
                      className={`text-base flex-shrink-0 ${item.popular ? "text-[#D4A853]" : "text-[#ddd] hover:text-[#D4A853]"}`}>★</button>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-1">
                    <span className="font-bold text-sm text-[#D4380D]">{item.price === 0 ? "Free" : `₹${item.price}`}</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateItem(item.sectionId, item.id, "available", !item.available)}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${item.available ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600" : "bg-red-100 text-red-600 hover:bg-green-100 hover:text-green-700"}`}>
                        {item.available ? "✓ On" : "✗ Off"}
                      </button>
                      <button onClick={() => deleteItem(item.sectionId, item.id)} className="text-xs text-gray-300 hover:text-red-500 px-1">🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {dirty && (
        <div className="sticky bottom-4">
          <div className="bg-[#D4380D] text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl max-w-2xl mx-auto">
            <p className="font-semibold text-sm">Unsaved changes</p>
            <div className="flex gap-3">
              <button onClick={() => { setLocal(JSON.parse(JSON.stringify(sections))); setDirty(false) }}
                className="border border-white/30 text-white/80 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/10"
              >Discard</button>
              <button onClick={() => { onSave(local); setDirty(false) }}
                className="bg-white text-[#D4380D] px-4 py-2 rounded-xl text-xs font-bold"
              >💾 Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

// ─── Extras Tab ───────────────────────────────────────────────────────────────
const ExtrasTab = memo(function ExtrasTab({ categories, onSave }: { categories: AdminExtraCategory[]; onSave: (c: AdminExtraCategory[]) => void }) {
  const [local, setLocal] = useState<AdminExtraCategory[]>(() => JSON.parse(JSON.stringify(categories)))
  const [activeCat, setActiveCat] = useState(categories[0]?.id ?? "")
  const [showAddForm, setShowAddForm] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [newItem, setNewItem] = useState({ name: "", diet: "veg" as "veg" | "non-veg", price: 0, emoji: "🍽️" })

  useEffect(() => { setLocal(JSON.parse(JSON.stringify(categories))); setDirty(false) }, [categories])

  const catData = local.find(c => c.id === activeCat)

  function updateItem(catId: string, itemId: string, field: keyof AdminExtraItem, value: unknown) {
    setLocal(prev => prev.map(cat =>
      cat.id === catId ? { ...cat, items: cat.items.map(i => i.id === itemId ? { ...i, [field]: value } : i) } : cat
    ))
    setDirty(true)
  }

  function deleteItem(catId: string, itemId: string) {
    const itemName = local.find(c => c.id === catId)?.items.find(i => i.id === itemId)?.name ?? "this item"
    if (!confirm(`Remove "${itemName}" from extras?\n\nThis cannot be undone.`)) return
    setLocal(prev => prev.map(cat =>
      cat.id === catId ? { ...cat, items: cat.items.filter(i => i.id !== itemId) } : cat
    ))
    setDirty(true)
  }

  function addItem() {
    if (!newItem.name.trim()) return
    const id = newItem.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now()
    setLocal(prev => prev.map(cat =>
      cat.id === activeCat
        ? { ...cat, items: [...cat.items, { ...newItem, id, popular: false, available: true }] }
        : cat
    ))
    setNewItem({ name: "", diet: "veg", price: 0, emoji: "🍽️" })
    setShowAddForm(false)
    setDirty(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-[#D4380D]">Edit Order Extras</h2>
          <p className="text-gray-500 text-sm mt-0.5">These are the add-on dishes customers can pick in Step 2 of booking.</p>
        </div>
        {dirty && (
          <button onClick={() => { onSave(local); setDirty(false) }}
            className="bg-[#D4380D] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#6d3410] transition-colors shadow-md"
          >💾 Save Changes</button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {local.map(cat => (
          <button key={cat.id} onClick={() => setActiveCat(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
              activeCat === cat.id ? "bg-[#D4380D] text-white shadow-sm" : "bg-white border border-red-200 text-gray-600 hover:border-[#D4380D] hover:text-[#D4380D]"
            }`}
          >
            <span>{cat.emoji}</span>{cat.label}
            <span className="text-[10px] font-bold opacity-70">({cat.items.length})</span>
          </button>
        ))}
      </div>

      {catData && (
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-red-100 flex items-center justify-between">
            <h3 className="font-playfair text-lg font-bold text-[#D4380D]">{catData.emoji} {catData.label}</h3>
            <button onClick={() => setShowAddForm(v => !v)}
              className="flex items-center gap-1.5 bg-[#D4380D] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#6d3410] transition-colors"
            >+ Add Item</button>
          </div>

          {showAddForm && (
            <div className="bg-red-50/80 border-b border-red-100 px-5 py-4 grid sm:grid-cols-5 gap-3">
              <input type="text" placeholder="Item name *" value={newItem.name}
                onChange={e => setNewItem(n => ({ ...n, name: e.target.value }))}
                className="border border-red-200 rounded-xl px-3 py-2 text-sm bg-red-50 focus:outline-none focus:ring-2 focus:ring-[#D4A853] sm:col-span-2"
              />
              <div className="flex items-center border border-red-200 rounded-xl overflow-hidden bg-white">
                <span className="px-2 text-xs font-bold text-[#D4380D] bg-red-50">₹</span>
                <input type="number" min={0} placeholder="Price" value={newItem.price || ""}
                  onChange={e => setNewItem(n => ({ ...n, price: Number(e.target.value) }))}
                  className="w-full px-2 py-2 text-sm focus:outline-none"
                />
              </div>
              <select value={newItem.diet} onChange={e => setNewItem(n => ({ ...n, diet: e.target.value as "veg" | "non-veg" }))}
                className="border border-red-200 rounded-xl px-3 py-2 text-sm bg-red-50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]"
              >
                <option value="veg">🌿 Veg</option>
                <option value="non-veg">🍗 Non-Veg</option>
              </select>
              <div className="flex gap-2">
                <button onClick={addItem} className="flex-1 bg-[#D4380D] text-white py-2 rounded-xl text-sm font-bold hover:bg-[#6d3410]">Add</button>
                <button onClick={() => setShowAddForm(false)} className="border border-red-200 text-gray-500 px-3 py-2 rounded-xl text-sm hover:text-red-500">✕</button>
              </div>
            </div>
          )}

          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {catData.items.map((item) => (
              <div key={item.id}
                className={`border rounded-2xl p-3 flex flex-col gap-2 transition-all text-center ${
                  !item.available
                    ? "bg-gray-50 border-red-200 opacity-60"
                    : "bg-white border-red-200 hover:shadow-md hover:border-[#D4A853]/50"
                }`}
              >
                {/* Emoji + star */}
                <div className="flex items-start justify-between">
                  <span className={`w-2 h-2 rounded-sm border flex-shrink-0 mt-1 ${item.diet === "veg" ? "border-green-600 bg-green-100" : "border-red-600 bg-red-100"}`} />
                  <span className="text-3xl flex-1 text-center">{item.emoji}</span>
                  <button onClick={() => updateItem(catData.id, item.id, "popular", !item.popular)}
                    className={`text-sm flex-shrink-0 ${item.popular ? "text-[#D4A853]" : "text-[#FFD0C0] hover:text-[#D4A853]"}`}>★</button>
                </div>
                {/* Name */}
                <p className={`font-semibold text-xs leading-tight ${!item.available ? "line-through text-gray-400" : "text-gray-900"}`}>{item.name}</p>
                {/* Price inline edit */}
                <div className="flex items-center border border-red-200 rounded-lg overflow-hidden mx-auto">
                  <span className="px-1.5 text-[10px] font-bold text-[#D4380D] bg-red-50">₹</span>
                  <input type="number" min={0} value={item.price}
                    onChange={e => updateItem(catData.id, item.id, "price", Number(e.target.value))}
                    className="w-14 px-1 py-1 text-xs font-bold focus:outline-none text-center"
                  />
                </div>
                {/* Controls */}
                <div className="flex items-center justify-center gap-1.5">
                  <button onClick={() => updateItem(catData.id, item.id, "available", !item.available)}
                    className={`text-[9px] px-2 py-0.5 rounded-full font-semibold transition-all ${
                      item.available ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600" : "bg-red-100 text-red-600 hover:bg-green-100 hover:text-green-700"
                    }`}
                  >{item.available ? "✓ On" : "✗ Off"}</button>
                  <button onClick={() => deleteItem(catData.id, item.id)} className="text-xs text-gray-300 hover:text-red-500">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {dirty && (
        <div className="sticky bottom-4">
          <div className="bg-[#D4380D] text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl max-w-2xl mx-auto">
            <p className="font-semibold text-sm">Unsaved changes</p>
            <div className="flex gap-3">
              <button onClick={() => { setLocal(JSON.parse(JSON.stringify(categories))); setDirty(false) }}
                className="border border-white/30 text-white/80 px-4 py-2 rounded-xl text-xs font-semibold"
              >Discard</button>
              <button onClick={() => { onSave(local); setDirty(false) }}
                className="bg-white text-[#D4380D] px-4 py-2 rounded-xl text-xs font-bold"
              >💾 Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({ onResetAll }: { onResetAll: () => void }) {
  const [currentPin, setCurrentPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [pinMsg, setPinMsg] = useState("")

  function changePIN() {
    const stored = getAdminPin()
    if (currentPin !== stored) { setPinMsg("❌ Current PIN is incorrect"); return }
    if (newPin.length < 4)     { setPinMsg("❌ New PIN must be at least 4 characters"); return }
    if (newPin !== confirmPin)  { setPinMsg("❌ PINs don't match"); return }
    setAdminPin(newPin)
    setPinMsg("✅ PIN changed successfully!")
    setCurrentPin(""); setNewPin(""); setConfirmPin("")
    setTimeout(() => setPinMsg(""), 3000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-playfair text-2xl font-bold text-[#D4380D]">Settings</h2>
        <p className="text-gray-500 text-sm mt-0.5">Manage admin access and data.</p>
      </div>

      {/* PIN change */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-md p-6 space-y-4">
        <h3 className="font-playfair text-lg font-bold text-[#D4380D]">🔐 Change Admin PIN</h3>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Current PIN</label>
          <input type="password" value={currentPin} onChange={e => setCurrentPin(e.target.value)}
            className="w-full border border-red-200 rounded-xl px-4 py-2.5 text-sm bg-red-50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]"
            placeholder="Enter current PIN"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">New PIN</label>
            <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)}
              className="w-full border border-red-200 rounded-xl px-4 py-2.5 text-sm bg-red-50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]"
              placeholder="Min 4 characters"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Confirm New PIN</label>
            <input type="password" value={confirmPin} onChange={e => setConfirmPin(e.target.value)}
              className="w-full border border-red-200 rounded-xl px-4 py-2.5 text-sm bg-red-50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]"
              placeholder="Repeat new PIN"
            />
          </div>
        </div>
        {pinMsg && <p className={`text-sm font-semibold ${pinMsg.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>{pinMsg}</p>}
        <button onClick={changePIN} className="bg-[#D4380D] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#6d3410] transition-colors">
          Update PIN
        </button>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-md p-6">
        <h3 className="font-playfair text-lg font-bold text-[#D4380D] mb-4">ℹ️ How edits work</h3>
        <div className="space-y-3 text-sm text-gray-600">
          {[
            ["📦 Packages", "Edit price, tagline, what's included, and popular flag. Changes appear on /packages immediately after refresh."],
            ["🍽️ Menu Items", "Add, edit or remove dishes per section. Toggle ★ for popular and ✓/✗ for availability. Unavailable items are hidden on /menu."],
            ["➕ Order Extras", "Edit add-on dishes customers can pick during booking at /order. Update prices or toggle availability."],
            ["💾 Saving", "All changes are saved to your browser's storage. They persist across sessions on this device."],
          ].map(([title, desc]) => (
            <div key={title} className="flex gap-3">
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reset */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <h3 className="font-playfair text-lg font-bold text-red-700 mb-2">⚠️ Reset All Data</h3>
        <p className="text-red-600 text-sm mb-4">This will remove all your edits and restore the original default menu, packages, and extras. This cannot be undone.</p>
        <button onClick={onResetAll} className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors">
          Reset Everything to Defaults
        </button>
      </div>
    </div>
  )
}

// ─── Bookings Tab ─────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<BookingEntry["status"], string> = {
  pending:   "bg-red-100 text-red-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-500",
}
const STATUS_NEXT: Record<BookingEntry["status"], { label: string; status: BookingEntry["status"] }[]> = {
  pending:   [{ label: "Confirm", status: "confirmed" }, { label: "Cancel", status: "cancelled" }],
  confirmed: [{ label: "Mark Done", status: "completed" }, { label: "Cancel", status: "cancelled" }],
  completed: [],
  cancelled: [{ label: "Restore", status: "pending" }],
}

const BookingsTab = memo(function BookingsTab({ bookings, onStatusChange }: {
  bookings: BookingEntry[]
  onStatusChange: (id: string, s: BookingEntry["status"]) => void
}) {
  const [filter, setFilter] = useState<BookingEntry["status"] | "all">("all")
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter)
  const sorted = [...filtered].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    completed: bookings.filter(b => b.status === "completed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-playfair text-xl font-bold text-[#D4380D]">📋 Customer Bookings</h2>
        <p className="text-xs text-gray-500">{bookings.length} total · {counts.pending} pending</p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
              filter === s ? "bg-[#D4380D] text-white" : "bg-white border border-red-200 text-gray-600 hover:bg-red-50 hover:border-[#D4380D]"
            }`}
          >
            {s === "all" ? "All" : s} {counts[s] > 0 && <span className="ml-1 opacity-70">({counts[s]})</span>}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-red-100 p-12 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500 font-medium">No bookings yet</p>
          <p className="text-xs text-gray-400 mt-1">Bookings submitted from the website will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
              {/* Header row */}
              <div className="flex items-center gap-3 px-5 py-4 cursor-pointer" onClick={() => setExpanded(expanded === b.id ? null : b.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm">{b.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{b.id}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-gray-500">
                    <span>📅 {b.eventDate}</span>
                    <span>👥 {b.guestCount} guests</span>
                    <span>📦 {b.packageName}</span>
                    <span>📞 {b.phone}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-[#D4380D] text-sm">₹{b.totalPerPerson}<span className="text-[10px] text-gray-400 font-normal">/pp</span></p>
                  <p className="text-[10px] text-gray-400">₹{(b.totalPerPerson * b.guestCount).toLocaleString("en-IN")} est.</p>
                </div>
                <span className="text-gray-400 text-sm flex-shrink-0">{expanded === b.id ? "▲" : "▼"}</span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 px-5 pb-3 flex-wrap">
                {STATUS_NEXT[b.status].map((a) => (
                  <button key={a.status} onClick={() => onStatusChange(b.id, a.status)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                      a.status === "cancelled" ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                      : a.status === "completed" ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                      : "bg-[#D4380D] text-white hover:bg-[#6d3410]"
                    }`}
                  >{a.label}</button>
                ))}
              </div>

              {/* Expanded details */}
              {expanded === b.id && (
                <div className="border-t border-red-100 px-5 py-4 bg-red-50/40 space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    <div><span className="text-gray-400">Event Type</span><p className="font-medium text-gray-800 mt-0.5">{b.eventType}</p></div>
                    <div><span className="text-gray-400">Event Date</span><p className="font-medium text-gray-800 mt-0.5">{b.eventDate}</p></div>
                    <div><span className="text-gray-400">Guests</span><p className="font-medium text-gray-800 mt-0.5">{b.guestCount}</p></div>
                    <div><span className="text-gray-400">Submitted</span><p className="font-medium text-gray-800 mt-0.5">{new Date(b.submittedAt).toLocaleString("en-IN")}</p></div>
                  </div>
                  {b.extras.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Extras</p>
                      <div className="flex flex-wrap gap-1.5">
                        {b.extras.map(e => (
                          <span key={e.id} className="bg-white border border-red-200 text-gray-600 text-xs px-2.5 py-1 rounded-full">{e.emoji} {e.name} +₹{e.price}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {Object.keys(b.preferences).filter(k => (b.preferences[k] ?? []).some(Boolean)).length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Meal Choices</p>
                      <div className="space-y-1">
                        {Object.entries(b.preferences)
                          .filter(([, v]) => v.some(Boolean))
                          .map(([k, v]) => {
                            const vals = v.filter(Boolean).join(", ")
                            return <p key={k} className="text-xs text-gray-600"><span className="font-medium capitalize">{k}:</span> {vals}</p>
                          })
                        }
                      </div>
                    </div>
                  )}
                  {b.notes && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Special Requests</p>
                      <p className="text-xs text-gray-600 bg-white border border-red-200 rounded-xl px-3 py-2">{b.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

// ─── Item Picker Panel (ajay-catering accordion style) ───────────────────────
const SECTION_PICK_META: Record<string, { label: string; icon: string; color: string; border: string; bg: string }> = {
  "rice-biryani":  { label: "Rice & Biryani",    icon: "🍚", color: "text-orange-700", border: "border-orange-200", bg: "bg-orange-50"  },
  "curries":       { label: "Curries & Gravies",  icon: "🍛", color: "text-red-700",    border: "border-red-200",    bg: "bg-red-50"     },
  "starters":      { label: "Starters & Snacks",  icon: "🍢", color: "text-yellow-700", border: "border-yellow-200", bg: "bg-yellow-50"  },
  "sweets":        { label: "Sweets & Desserts",  icon: "🍮", color: "text-pink-700",   border: "border-pink-200",   bg: "bg-pink-50"    },
  "dal":           { label: "Thalimpu & Dal",     icon: "🥬", color: "text-green-700",  border: "border-green-200",  bg: "bg-green-50"   },
  "chutneys":      { label: "Pachadi & Chutneys", icon: "🫙", color: "text-lime-700",   border: "border-lime-200",   bg: "bg-lime-50"    },
  "beverages":     { label: "Beverages",          icon: "☕", color: "text-purple-700", border: "border-purple-200", bg: "bg-purple-50"  },
}

function ItemPickerPanel({
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
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "")

  const q = search.trim().toLowerCase()
  const isFiltering = !!q || typeFilter !== "all"

  const filteredSections = sections.map(sec => ({
    ...sec,
    items: sec.items.filter(i =>
      (typeFilter === "all" || i.diet === typeFilter) &&
      (!q || i.name.toLowerCase().includes(q))
    ),
  }))

  const activeSectionData = isFiltering
    ? null
    : filteredSections.find(s => s.id === activeSection)

  const allFilteredItems = isFiltering
    ? filteredSections.flatMap(sec => sec.items.map(i => ({ ...i, sectionId: sec.id, sectionLabel: sec.label, sectionEmoji: sec.emoji })))
    : []

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dishes…"
          className="w-full pl-8 pr-8 py-2 border border-red-200 rounded-xl text-sm bg-red-50 focus:outline-none focus:ring-2 focus:ring-[#D4A853] placeholder:text-gray-400" />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">✕</button>}
      </div>

      {/* Section tabs — hidden when filtering */}
      {!isFiltering && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {sections.map(sec => {
            const selCount = sec.items.filter(i => selected.includes(i.name)).length
            return (
              <button key={sec.id} type="button" onClick={() => setActiveSection(sec.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  activeSection === sec.id
                    ? "bg-[#D4380D] text-white shadow-sm"
                    : "bg-white border border-red-200 text-gray-600 hover:border-[#D4380D] hover:text-[#D4380D]"
                }`}
              >
                <span>{sec.emoji}</span> {sec.label}
                {selCount > 0 && (
                  <span className="bg-[#D4A853] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{selCount}</span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Veg / Non-veg filter */}
      <div className="flex gap-2">
        {(["all", "veg", "non-veg"] as const).map(t => (
          <button key={t} type="button" onClick={() => setTypeFilter(t)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              typeFilter === t
                ? t === "veg" ? "bg-green-600 text-white border-green-600"
                  : t === "non-veg" ? "bg-red-600 text-white border-red-600"
                  : "bg-[#D4380D] text-white border-[#D4380D]"
                : "bg-white text-gray-600 border-red-200 hover:border-amber-400"
            }`}
          >
            {t === "all" ? "All" : t === "veg" ? "🌿 Veg" : "🍗 Non-Veg"}
          </button>
        ))}
      </div>

      {/* Items */}
      {isFiltering ? (
        allFilteredItems.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No dishes found</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {allFilteredItems.map(item => {
              const isSel = selected.includes(item.name)
              return (
                <button key={item.id} type="button" onClick={() => onToggle(item.name)}
                  className={`relative text-left rounded-xl border-2 p-3 transition-all ${
                    isSel ? "border-[#D4380D] bg-[#D4380D]/5 shadow-sm" : "border-gray-200 bg-white hover:border-[#D4A853]"
                  }`}
                >
                  {isSel && <span className="absolute top-2 right-2 w-4 h-4 bg-[#D4380D] rounded-full flex items-center justify-center text-white text-[9px] font-bold">✓</span>}
                  <div className="flex items-start gap-2 pr-5">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.diet === "veg" ? "bg-green-500" : "bg-red-500"}`} />
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-gray-800 leading-tight">{item.name}</p>
                      <p className="text-[10px] text-[#D4A853] mt-0.5">{item.sectionEmoji} {item.sectionLabel}</p>
                      {item.price > 0 && <p className="text-[10px] font-semibold text-[#D4380D] mt-0.5">₹{item.price}/person</p>}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )
      ) : (
        activeSectionData && activeSectionData.items.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No items in this section</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {(activeSectionData?.items ?? []).map(item => {
              const isSel = selected.includes(item.name)
              return (
                <button key={item.id} type="button" onClick={() => onToggle(item.name)}
                  className={`relative text-left rounded-xl border-2 p-3 transition-all ${
                    isSel ? "border-[#D4380D] bg-[#D4380D]/5 shadow-sm" : "border-gray-200 bg-white hover:border-[#D4A853]"
                  }`}
                >
                  {isSel && <span className="absolute top-2 right-2 w-4 h-4 bg-[#D4380D] rounded-full flex items-center justify-center text-white text-[9px] font-bold">✓</span>}
                  <div className="flex items-start gap-2 pr-5">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.diet === "veg" ? "bg-green-500" : "bg-red-500"}`} />
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-gray-800 leading-tight">{item.name}</p>
                      {item.price > 0 && <p className="text-[10px] font-semibold text-[#D4380D] mt-0.5">₹{item.price}/person</p>}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}

// ─── Charity Tab ──────────────────────────────────────────────────────────────
const CharityTab = memo(function CharityTab({ entries, onSave, menuSections }: { entries: CharityEntry[]; onSave: (v: CharityEntry[]) => void; menuSections: AdminMenuSection[] }) {
  const [form, setForm] = useState(() => ({ date: new Date().toISOString().split("T")[0], members: "100", notes: "" }))
  const [items, setItems] = useState<string[]>([])
  const [itemInput, setItemInput] = useState("")
  const [editing, setEditing] = useState<string | null>(null)

  function loadEntry(e: CharityEntry) {
    setForm({ date: e.date, members: String(e.members), notes: e.notes })
    setItems([...e.items])
    setEditing(e.id)
  }

  function newEntry() {
    setForm({ date: new Date().toISOString().split("T")[0]!, members: "100", notes: "" })
    setItems([])
    setItemInput("")
    setEditing(null)
  }

  function addItem() {
    const v = itemInput.trim()
    if (v && !items.includes(v)) { setItems([...items, v]); setItemInput("") }
  }

  function save() {
    if (!form.date || !items.length) return
    const id = editing ?? `charity-${Date.now()}`
    const entry: CharityEntry = { id, date: form.date, members: parseInt(form.members) || 100, items, notes: form.notes, createdAt: editing ? (entries.find(e => e.id === editing)?.createdAt ?? new Date().toISOString()) : new Date().toISOString() }
    const updated = editing ? entries.map(e => e.id === editing ? entry : e) : [...entries, entry]
    onSave(updated.sort((a, b) => b.date.localeCompare(a.date)))
    newEntry()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-playfair text-xl font-bold text-[#D4380D]">🙏 Charity / Community Feeds</h2>
        <button onClick={newEntry} className="text-xs text-[#D4380D] border border-[#D4380D] px-3 py-1.5 rounded-full hover:bg-[#D4380D] hover:text-white transition-colors">+ New</button>
      </div>

      {/* Top: ItemPicker left, Form right */}
      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Left: Item Picker */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-md p-5">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">Select Dishes</h3>
          {items.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {items.map(it => (
                <span key={it} className="flex items-center gap-1 bg-red-50 border border-[#D4A853]/40 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                  {it}
                  <button onClick={() => setItems(items.filter(i => i !== it))} className="text-gray-400 hover:text-red-500 ml-0.5 leading-none">×</button>
                </span>
              ))}
            </div>
          )}
          <ItemPickerPanel
            sections={menuSections}
            selected={items}
            onToggle={(name) => setItems(prev => prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name])}
          />
        </div>

        {/* Right: Entry Form */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-md p-5 space-y-4">
          <h3 className="font-semibold text-gray-800 text-sm">{editing ? "Edit Entry" : "Add New Entry"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm bg-red-50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">People to feed</label>
              <input type="number" min={1} value={form.members} onChange={e => setForm({...form, members: e.target.value})}
                className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm bg-red-50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Notes (optional)</label>
            <textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              placeholder="Any special notes…" className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm bg-red-50 focus:outline-none focus:ring-2 focus:ring-[#D4A853] resize-none" />
          </div>
          <p className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">
            {items.length === 0 ? "← Select dishes from the left panel" : `${items.length} dish${items.length !== 1 ? "es" : ""} selected`}
          </p>
          <button onClick={save} disabled={!form.date || items.length === 0}
            className="w-full bg-[#D4380D] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#6d3410] transition-colors disabled:opacity-50">
            {editing ? "Update Entry" : "Save Entry"}
          </button>
        </div>
      </div>

      {/* Bottom: History */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-600 text-sm">Past Entries ({entries.length})</h3>
        {entries.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">No entries yet</p>
        ) : (
          entries.map(e => (
            <div key={e.id} className="bg-white rounded-xl border border-red-100 shadow-sm px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm text-gray-800">📅 {e.date} <span className="text-gray-500 font-normal">· {e.members} people</span></p>
                  <p className="text-xs text-gray-500 mt-0.5">{e.items.join(", ")}</p>
                  {e.notes && <p className="text-xs text-gray-400 mt-0.5 italic">{e.notes}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => loadEntry(e)} className="text-xs text-[#D4380D] border border-[#D4380D] px-2 py-1 rounded-lg hover:bg-[#D4380D] hover:text-white transition-colors">Edit</button>
                  <button onClick={() => { if (confirm(`Delete charity entry for ${e.date}?\n\nThis cannot be undone.`)) onSave(entries.filter(x => x.id !== e.id)) }} className="text-xs text-red-500 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">Del</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
})

// ─── Stalls Tab ───────────────────────────────────────────────────────────────
const StallsTab = memo(function StallsTab({ stalls, onSave, menuSections }: { stalls: StallEntry[]; onSave: (v: StallEntry[]) => void; menuSections: AdminMenuSection[] }) {
  const [form, setForm] = useState<Omit<StallEntry, "id" | "createdAt">>(() => {
    const today = new Date().toISOString().split("T")[0]!
    return { name: "", date: today, shift: "morning", location: "", items: [], notes: "", status: "planned" }
  })
  const [editing, setEditing] = useState<string | null>(null)
  const [itemRow, setItemRow] = useState({ name: "", qty: "", price: "" })

  function loadStall(s: StallEntry) {
    setForm({ name: s.name, date: s.date, shift: s.shift, location: s.location, items: [...s.items], notes: s.notes, status: s.status })
    setEditing(s.id)
  }

  function newStall() {
    const today = new Date().toISOString().split("T")[0]!
    setForm({ name: "", date: today, shift: "morning", location: "", items: [], notes: "", status: "planned" })
    setEditing(null)
    setItemRow({ name: "", qty: "", price: "" })
  }

  function addItem() {
    const n = itemRow.name.trim(); const p = parseFloat(itemRow.price)
    if (!n) return
    setForm(f => ({ ...f, items: [...f.items, { name: n, qty: itemRow.qty.trim(), price: isNaN(p) ? 0 : p }] }))
    setItemRow({ name: "", qty: "", price: "" })
  }

  function save() {
    if (!form.name.trim() || !form.date) return
    const id = editing ?? `stall-${Date.now()}`
    const entry: StallEntry = { id, ...form, createdAt: editing ? (stalls.find(s => s.id === editing)?.createdAt ?? new Date().toISOString()) : new Date().toISOString() }
    const updated = editing ? stalls.map(s => s.id === editing ? entry : s) : [...stalls, entry]
    onSave(updated.sort((a, b) => b.date.localeCompare(a.date)))
    newStall()
  }

  const STATUS_STYLE: Record<StallEntry["status"], string> = {
    planned: "bg-red-100 text-red-800",
    active: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-500",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-playfair text-xl font-bold text-[#D4380D]">🏪 Stall & Event Management</h2>
        <button onClick={newStall} className="text-xs text-[#D4380D] border border-[#D4380D] px-3 py-1.5 rounded-full hover:bg-[#D4380D] hover:text-white transition-colors">+ New Stall</button>
      </div>

      {/* Top: ItemPicker left, Form right */}
      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Left: Item Picker */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-md p-5">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">Select Items for Stall</h3>
          {form.items.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {form.items.map((it, idx) => (
                <span key={idx} className="flex items-center gap-1 bg-red-50 border border-[#D4A853]/40 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                  {it.name}{it.price > 0 ? ` ₹${it.price}` : ""}
                  <button onClick={() => setForm(f => ({...f, items: f.items.filter((_, i) => i !== idx)}))} className="text-gray-400 hover:text-red-500 ml-0.5 leading-none">×</button>
                </span>
              ))}
              <p className="text-[10px] text-gray-400 w-full text-right mt-1">Total: ₹{form.items.reduce((s, i) => s + i.price, 0).toLocaleString("en-IN")}</p>
            </div>
          )}
          <ItemPickerPanel
            sections={menuSections}
            selected={form.items.map(i => i.name)}
            onToggle={(name) => {
              const menuItem = menuSections.flatMap(s => s.items).find(i => i.name === name)
              const existing = form.items.find(i => i.name === name)
              if (existing) {
                setForm(f => ({ ...f, items: f.items.filter(i => i.name !== name) }))
              } else {
                setForm(f => ({ ...f, items: [...f.items, { name, qty: "", price: menuItem?.price ?? 0 }] }))
              }
            }}
          />
        </div>

        {/* Right: Entry Form */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-md p-5 space-y-4">
          <h3 className="font-semibold text-gray-800 text-sm">{editing ? "Edit Stall" : "Add New Stall"}</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Stall Name</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Temple Main Gate Stall"
              className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm bg-red-50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm bg-red-50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Shift</label>
              <select value={form.shift} onChange={e => setForm({...form, shift: e.target.value as StallEntry["shift"]})}
                className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm bg-red-50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]">
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="all-day">All Day</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
            <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Durga Temple, Vijayawada"
              className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm bg-red-50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
            <div className="flex gap-2">
              {(["planned", "active", "completed"] as const).map(s => (
                <button key={s} onClick={() => setForm({...form, status: s})}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${form.status === s ? STATUS_STYLE[s] + " ring-2 ring-current/30" : "bg-red-50 text-gray-500 hover:bg-red-100 border border-red-200"}`}
                >{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Notes (optional)</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              placeholder="Any notes…" className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm bg-red-50 focus:outline-none focus:ring-2 focus:ring-[#D4A853] resize-none" />
          </div>
          <p className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">
            {form.items.length === 0 ? "← Select items from the left panel" : `${form.items.length} item${form.items.length !== 1 ? "s" : ""} · ₹${form.items.reduce((s, i) => s + i.price, 0).toLocaleString("en-IN")} total`}
          </p>
          <button onClick={save} disabled={!form.name.trim() || !form.date}
            className="w-full bg-[#D4380D] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#6d3410] transition-colors disabled:opacity-50">
            {editing ? "Update Stall" : "Save Stall"}
          </button>
        </div>
      </div>

      {/* Bottom: Stall list */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-600 text-sm">Stalls ({stalls.length})</h3>
        {stalls.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">No stalls configured yet</p>
        ) : (
          stalls.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-red-100 shadow-sm px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-800">{s.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[s.status]}`}>{s.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">📅 {s.date} · {s.shift} {s.location && `· 📍 ${s.location}`}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.items.length} items · ₹{s.items.reduce((x, i) => x + i.price, 0).toLocaleString("en-IN")} total</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => loadStall(s)} className="text-xs text-[#D4380D] border border-[#D4380D] px-2 py-1 rounded-lg hover:bg-[#D4380D] hover:text-white transition-colors">Edit</button>
                  <button onClick={() => { if (confirm(`Delete stall "${s.name}"?\n\nThis cannot be undone.`)) onSave(stalls.filter(x => x.id !== s.id)) }} className="text-xs text-red-500 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">Del</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
})
