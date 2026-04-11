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
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary-mid to-primary-mid flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(92,15,15,0.15)] border border-warm-border p-8 w-full max-w-sm mx-auto" style={{ animation: "heroFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" }}>
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center mx-auto mb-5">
              <span className="font-playfair text-gold font-bold text-2xl">A</span>
            </div>
            <h1 className="font-playfair text-2xl font-bold text-text-dark">Admin Login</h1>
            <p className="text-text-muted text-sm text-center mb-6 mt-1">Ajay Foods &amp; Beverages</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-text-dark text-xs font-semibold uppercase tracking-wide mb-1.5 block">Admin PIN</label>
              <input
                type="password"
                placeholder="Enter PIN"
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value); setPinError("") }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-warm-bg border border-warm-border rounded-xl px-4 py-3 text-center text-2xl font-bold text-text-dark tracking-[0.5em] focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition"
                autoFocus
              />
              {pinError && <p className="text-red-500 text-xs text-center mt-2">{pinError}</p>}
            </div>
            <button onClick={handleLogin}
              className="w-full bg-primary text-gold font-bold py-3 rounded-full shadow-[0_4px_16px_rgba(92,15,15,0.25)] hover:bg-primary-mid transition-colors"
            >
              Login →
            </button>
            <button onClick={() => router.push("/")} className="w-full text-center text-sm text-text-muted hover:text-primary transition-colors py-1">
              ← Back to website
            </button>
            <p className="text-center text-[10px] text-text-muted/50">Default PIN: AJAY1234</p>
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
    <div className="min-h-screen bg-warm-bg" onClick={refreshSession} onKeyDown={refreshSession}>

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
        <div className="fixed top-0 left-0 right-0 z-[90] bg-primary text-white text-center text-xs font-semibold py-2 flex items-center justify-center gap-3">
          Your session will expire soon due to inactivity.
          <button onClick={refreshSession} className="bg-white text-primary px-3 py-0.5 rounded-full text-xs font-bold hover:bg-warm-bg transition-colors">
            Stay Logged In
          </button>
        </div>
      )}

      {/* Top Nav */}
      <div className="sticky top-0 z-40">
        <header className="bg-gradient-to-r from-primary via-primary-mid to-primary-mid border-b border-white/10 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            {/* Logo + branding */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gold/[0.18] border border-gold/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="font-playfair text-gold font-bold text-base">A</span>
              </div>
              <div>
                <h1 className="font-playfair text-white font-bold text-base leading-tight">Ajay Foods Admin</h1>
                <p className="text-white/40 text-xs">Owner Dashboard</p>
              </div>
            </div>
            {/* Right: desktop links + hamburger */}
            <div className="flex items-center gap-2">
              <a href="/" target="_blank" rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-xs text-white/70 border border-white/20 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors font-medium"
              >View Site</a>
              <button onClick={doLogout}
                className="hidden sm:flex items-center gap-1.5 text-xs text-white/70 border border-white/20 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors font-medium"
              >Logout</button>
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setMobileNavOpen(v => !v) }}
                  className="w-9 h-9 bg-white/[0.08] border border-white/[0.12] rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-white/15 transition-colors flex-shrink-0"
                  aria-label="Toggle navigation"
                >
                  <span className="w-3 h-0.5 bg-white/60 rounded" />
                  <span className="w-3 h-0.5 bg-white/60 rounded" />
                  <span className="w-3 h-0.5 bg-white/60 rounded" />
                </button>

                {/* Floating dropdown card */}
                {mobileNavOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-14 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-warm-border overflow-hidden"
                  >
                    {/* Dashboard — always at top */}
                    <div className="px-4 pt-3 pb-0.5">
                      <p className="text-[10px] font-bold text-gold uppercase tracking-widest">Overview</p>
                    </div>
                    <button
                      onClick={() => { setActiveTab("dashboard"); setMobileNavOpen(false) }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-warm-bg transition-colors text-left ${activeTab === "dashboard" ? "bg-warm-bg" : ""}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-warm-bg border border-warm-border flex items-center justify-center text-xl flex-shrink-0">📊</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-dark text-sm leading-tight">Dashboard</p>
                        <p className="text-text-muted text-xs mt-0.5">{packages.length} packages · {totalMenuItems(menuSections)} dishes</p>
                      </div>
                    </button>

                    {/* Manage section — all tabs except dashboard */}
                    <div className="mx-4 my-1 border-t border-warm-border" />
                    <div className="px-4 pt-2 pb-0.5">
                      <p className="text-[10px] font-bold text-gold uppercase tracking-widest">Manage</p>
                    </div>
                    <div className="pb-2">
                      {tabs.filter(t => t.id !== "dashboard").map((t) => (
                        <button key={t.id}
                          onClick={() => { setActiveTab(t.id); setMobileNavOpen(false) }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-warm-bg transition-colors text-left ${activeTab === t.id ? "bg-warm-bg" : ""}`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-warm-bg border border-warm-border flex items-center justify-center text-xl flex-shrink-0">
                            {t.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-text-dark text-sm leading-tight">{t.label}</p>
                            <p className="text-text-muted text-xs mt-0.5">{((): string => {
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
                            <span className="bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">{t.badge} new</span>
                          )}
                        </button>
                      ))}
                      <div className="mx-4 my-1 border-t border-warm-border" />
                      <button onClick={doLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-warm-bg transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-warm-bg border border-warm-border flex items-center justify-center text-xl flex-shrink-0">🚪</div>
                        <p className="font-semibold text-primary text-sm">Logout</p>
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
      <div className="max-w-7xl mx-auto px-4 py-5 bg-warm-bg min-h-screen" key={activeTab} style={{ animation: "heroFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both" }}>

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
    { label: "Packages", value: packages.length, tab: "packages" as Tab,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> },
    { label: "Menu Items", value: totalMenuItems(menuSections), tab: "menu" as Tab,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2"/><path d="M18 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/><path d="M21 9H13"/></svg> },
    { label: "Unavailable", value: unavail, tab: "menu" as Tab, warn: unavail > 0,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
    { label: "Bookings", value: bookingCount, tab: "bookings" as Tab,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
    { label: "Pending", value: pendingCount, tab: "bookings" as Tab, warn: pendingCount > 0,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  ]
  const priceRange = useMemo(() => ({
    min: Math.min(...packages.map(p => p.price)),
    max: Math.max(...packages.map(p => p.price))
  }), [packages])

  return (
    <div className="space-y-6" style={{ animation: "heroFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>

      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary-mid to-primary-light rounded-2xl px-6 py-5 flex items-center justify-between shadow-[0_4px_14px_rgba(92,15,15,0.25)] mb-5">
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gold/[0.08] pointer-events-none" />
        <div>
          <h2 className="font-playfair text-2xl font-bold text-white">Good day!</h2>
          <p className="text-white/55 text-sm mt-0.5">Manage your business below</p>
        </div>
        <div className="text-right hidden sm:block relative z-10">
          <p className="text-gold font-bold text-sm">Ajay Foods</p>
          <p className="text-white/35 text-xs mt-0.5">Owner Dashboard</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <button key={s.label} onClick={() => setActiveTab(s.tab)}
            className={`bg-white rounded-2xl border shadow-[0_2px_8px_rgba(92,15,15,0.05)] p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all ${
              s.warn ? "border-amber-200" : "border-warm-border"
            }`}
            style={{ animation: `heroFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms both` }}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.warn ? "bg-amber-50 text-amber-600" : "bg-primary/[0.08] text-primary"}`}>{s.icon}</div>
            <div className={`font-playfair text-2xl font-bold leading-none ${s.warn ? "text-amber-600" : "text-text-dark"}`}>{s.value}</div>
            <div className="text-text-muted text-xs uppercase tracking-[0.08em] mt-1">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Package summary with full includes */}
      <div className="bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.05)] overflow-hidden">
        <div className="px-6 py-4 border-b border-warm-border flex items-center justify-between">
          <h3 className="font-playfair text-xl font-bold text-text-dark">Packages Overview</h3>
          <button onClick={() => setActiveTab("packages")} className="bg-primary text-gold text-xs font-bold px-4 py-2 rounded-full hover:bg-primary-mid transition-colors">Edit Packages →</button>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-warm-border">
          {packages.map((p) => (
            <div key={p.id} className="flex flex-col">
              {/* Gradient header */}
              <div className={`bg-gradient-to-br ${p.color} px-4 py-3 relative`}>
                {p.popular && <span className="absolute top-2 right-2 text-[8px] bg-gold text-primary font-bold px-1.5 py-0.5 rounded-full">★ Popular</span>}
                <p className="text-white/70 text-[9px] font-bold uppercase tracking-wider">{p.tag}</p>
                <p className="font-playfair font-bold text-base text-white mt-0.5">{p.name}</p>
                <p className="text-xl font-bold text-white mt-1">₹{p.price} <span className="text-white/60 text-[10px] font-normal">/person</span></p>
              </div>
              {/* Includes list */}
              <div className="px-4 py-3 flex-1 bg-warm-bg">
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-2">Includes</p>
                <ul className="space-y-1">
                  {(p.includes ?? []).map((inc, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-text-mid">
                      <span className="text-gold flex-shrink-0 font-bold mt-0.5">✓</span>{inc}
                    </li>
                  ))}
                </ul>
                {(p.choiceGroups ?? []).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-warm-border">
                    {(p.choiceGroups ?? []).map(g => (
                      <p key={g.id} className="text-[10px] text-text-muted mb-0.5 leading-snug">
                        <span className="font-semibold text-primary">{g.label}:</span>{" "}
                        {g.options.slice(0, 3).join(", ")}{g.options.length > 3 ? ` +${g.options.length - 3} more` : ""}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-muted px-6 py-3 border-t border-warm-border">Price range: ₹{priceRange.min} – ₹{priceRange.max} per person · Click &quot;Edit Packages&quot; to modify</p>
      </div>

    </div>
  )
})

// ─── Packages Tab ─────────────────────────────────────────────────────────────
const PKG_STYLE_TEMPLATES = [
  { color: "from-[#2d6a4f] to-[#40916c]", lightColor: "bg-[#d8f3dc]", textColor: "text-[#1b4332]", badgeColor: "bg-green-100 text-green-800", tag: "VEG" as const, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80", alt: "Vegetarian thali" },
  { color: "from-[#e9c46a] to-[#f4a261]", lightColor: "bg-[#fff3cd]", textColor: "text-[#5c3d11]", badgeColor: "bg-yellow-100 text-yellow-800", tag: "VEG" as const, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80", alt: "Indian vegetarian spread" },
  { color: "from-primary-light to-primary-mid", lightColor: "bg-[#fce8d8]", textColor: "text-[#4a1a05]", badgeColor: "bg-primary/[0.12] text-primary", tag: "NON-VEG" as const, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80", alt: "Chicken biryani" },
  { color: "from-primary to-primary-mid", lightColor: "bg-[#f5ddd0]", textColor: "text-[#2a0f03]", badgeColor: "bg-primary/[0.12] text-primary", tag: "NON-VEG" as const, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80", alt: "Indian non-veg feast" },
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
          <h2 className="font-playfair text-2xl font-bold text-text-dark">Edit Packages</h2>
          <p className="text-text-muted text-sm mt-0.5">Manage packages, items, and customer choice options.</p>
        </div>
        <div className="flex items-center gap-3">
          {dirty && (
            <button onClick={() => { onSave(local); setDirty(false) }}
              className="bg-primary text-gold px-5 py-2.5 rounded-full font-bold text-sm hover:bg-primary-mid transition-colors shadow-[0_4px_16px_rgba(92,15,15,0.2)] flex items-center gap-2"
            >
              Save All
            </button>
          )}
          <button onClick={addNewPackage}
            className="flex items-center gap-2 bg-primary text-gold px-4 py-2 rounded-full text-sm font-bold hover:bg-primary-mid transition-colors shadow-[0_4px_16px_rgba(92,15,15,0.2)]"
          >
            + New Package
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {local.map((pkg) => (
          <div key={pkg.id} className={`bg-white rounded-2xl border shadow-[0_2px_8px_rgba(92,15,15,0.05)] overflow-hidden transition-all ${editId === pkg.id ? "border-primary shadow-lg" : "border-warm-border"}`}>
            {/* Card header */}
            <div className={`bg-gradient-to-r ${pkg.color} p-4`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${pkg.badgeColor}`}>{pkg.tag}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <h3 className="font-playfair text-xl font-bold text-white">{pkg.name}</h3>
                    {pkg.popular && <span className="text-[9px] bg-gold text-primary font-bold px-2 py-0.5 rounded-full">★ Popular</span>}
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
            <div className="px-4 py-3 bg-warm-bg border-b border-warm-border">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">What&apos;s Included</p>
              <ul className="space-y-1">
                {pkg.includes.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-text-mid">
                    <span className="w-3.5 h-3.5 rounded-full bg-gold/30 flex items-center justify-center text-primary text-[8px] flex-shrink-0 mt-0.5 font-bold">✓</span>
                    {inc}
                  </li>
                ))}
              </ul>
              {(pkg.choiceGroups ?? []).length > 0 && (
                <div className="mt-2 pt-2 border-t border-warm-border">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Choice Options</p>
                  {(pkg.choiceGroups ?? []).map(g => (
                    <p key={g.id} className="text-[10px] text-text-muted mb-0.5">
                      <span className="font-semibold text-primary">{g.label}:</span> {g.options.slice(0, 4).join(", ")}{g.options.length > 4 ? ` +${g.options.length - 4} more` : ""}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Action bar */}
            <div className="flex border-b border-warm-border">
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
                className={`flex-1 text-center text-xs font-semibold py-2.5 transition-colors flex items-center justify-center gap-1.5 ${editId === pkg.id ? "bg-green-50 text-green-700 hover:bg-green-100" : "text-primary hover:bg-warm-bg"}`}
              >
                {editId === pkg.id ? "Save & Close" : "Edit"}
              </button>
              <div className="w-px bg-warm-border" />
              <button
                onClick={() => copyPackage(pkg)}
                className="flex-1 text-center text-xs font-semibold text-text-muted border-0 py-2.5 hover:bg-warm-bg transition-colors flex items-center justify-center gap-1.5"
                title="Duplicate this package"
              >
                Copy
              </button>
              <div className="w-px bg-warm-border" />
              <button
                onClick={() => deletePackage(pkg.id)}
                className="flex-1 text-center text-xs font-semibold text-primary py-2.5 hover:bg-warm-bg transition-colors flex items-center justify-center gap-1.5"
              >
                Delete
              </button>
            </div>

            {/* Editor */}
            {editId === pkg.id && (
              <div className="p-5 space-y-5">
                {/* Price */}
                <div>
                  <label className="text-text-dark text-xs font-semibold uppercase tracking-wide mb-1.5 block">Price per Person (₹)</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={50} max={500} step={5} value={pkg.price}
                      onChange={(e) => update(pkg.id, "price", Number(e.target.value))}
                      className="flex-1 accent-primary"
                    />
                    <div className="flex items-center border border-warm-border rounded-xl overflow-hidden">
                      <span className="px-3 py-2 text-sm font-bold text-primary bg-warm-bg">₹</span>
                      <input type="number" min={50} max={1000} step={5} value={pkg.price}
                        onChange={(e) => update(pkg.id, "price", Number(e.target.value))}
                        className="w-20 px-2 py-2 text-sm font-bold text-text-dark focus:outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-text-muted mt-1">For 100 guests: ₹{(pkg.price * 100).toLocaleString("en-IN")}</p>
                </div>

                {/* Name */}
                <div>
                  <label className="text-text-dark text-xs font-semibold uppercase tracking-wide mb-1.5 block">Package Name</label>
                  <input type="text" value={pkg.name}
                    onChange={(e) => update(pkg.id, "name", e.target.value)}
                    className="w-full bg-surface border border-warm-border rounded-xl px-4 py-2.5 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition"
                  />
                </div>

                {/* Tagline */}
                <div>
                  <label className="text-text-dark text-xs font-semibold uppercase tracking-wide mb-1.5 block">Tagline</label>
                  <input type="text" value={pkg.tagline}
                    onChange={(e) => update(pkg.id, "tagline", e.target.value)}
                    className="w-full bg-surface border border-warm-border rounded-xl px-4 py-2.5 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition"
                  />
                </div>

                {/* Ideal for */}
                <div>
                  <label className="text-text-dark text-xs font-semibold uppercase tracking-wide mb-1.5 block">Ideal For Hint</label>
                  <input type="text" value={pkg.ideal}
                    onChange={(e) => update(pkg.id, "ideal", e.target.value)}
                    className="w-full bg-surface border border-warm-border rounded-xl px-4 py-2.5 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition"
                    placeholder="e.g. Ideal for 50–200 guests"
                  />
                </div>

                {/* Popular toggle */}
                <div className="flex items-center justify-between bg-warm-bg rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-text-dark">Mark as Most Popular</p>
                    <p className="text-xs text-text-muted">Shows a badge on the packages page</p>
                  </div>
                  <button onClick={() => update(pkg.id, "popular", !pkg.popular)}
                    className={`relative w-12 h-6 rounded-full transition-all ${pkg.popular ? "bg-primary border-primary" : "bg-warm-border"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${pkg.popular ? "left-6" : "left-0.5"}`} />
                  </button>
                </div>

                {/* Includes list */}
                <div>
                  <label className="text-text-dark text-xs font-semibold uppercase tracking-wide mb-1.5 block">What&apos;s Included ({pkg.includes.length} items)</label>
                  <div className="space-y-2 mb-3">
                    {pkg.includes.map((inc, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-warm-bg rounded-xl px-3 py-2">
                        <span className="w-4 h-4 rounded-full bg-gold/30 flex items-center justify-center text-primary text-[10px] flex-shrink-0">✓</span>
                        <input type="text" value={inc}
                          onChange={(e) => {
                            const updated = [...pkg.includes]
                            updated[idx] = e.target.value
                            update(pkg.id, "includes", updated)
                          }}
                          className="flex-1 bg-transparent text-sm focus:outline-none text-text-dark"
                        />
                        <button onClick={() => removeInclude(pkg.id, idx)} className="text-text-muted hover:text-primary transition-colors text-lg leading-none flex-shrink-0">×</button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newInclude} placeholder="Add included item…"
                      onChange={(e) => setNewInclude(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addInclude(pkg.id)}
                      className="flex-1 bg-surface border border-warm-border rounded-xl px-3 py-2 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition"
                    />
                    <button onClick={() => addInclude(pkg.id)}
                      className="bg-primary text-gold px-4 py-2 rounded-full text-sm font-bold hover:bg-primary-mid transition-colors"
                    >+ Add</button>
                  </div>
                  {/* Pick from menu items */}
                  <div className="mt-3 pt-3 border-t border-warm-border">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Or pick from menu items</p>
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
                      <label className="text-text-dark text-xs font-semibold uppercase tracking-wide block">Customer Choice Options</label>
                      <p className="text-[10px] text-text-muted mt-0.5">Items marked &quot;your choice&quot; — customers pick from these options</p>
                    </div>
                    <button onClick={() => addChoice(pkg.id)}
                      className="text-xs bg-gold/[0.12] border border-gold/25 text-[#8B6A1A] px-3 py-1.5 rounded-full font-semibold hover:bg-gold/20 transition-colors"
                    >+ Add Group</button>
                  </div>

                  {(pkg.choiceGroups ?? []).length === 0 && (
                    <p className="text-xs text-text-muted italic text-center py-3 bg-warm-bg rounded-xl border border-dashed border-warm-border">No choice groups yet. Add one above.</p>
                  )}

                  <div className="space-y-3">
                    {(pkg.choiceGroups ?? []).map((group) => {
                      const key = pkg.id + "-" + group.id
                      return (
                        <div key={group.id} className="border border-warm-border rounded-xl overflow-hidden">
                          <div className="bg-warm-bg px-3 py-2 flex items-center gap-2">
                            <input type="text" value={group.label}
                              onChange={e => updateChoiceGroup(pkg.id, group.id, "label", e.target.value)}
                              className="flex-1 bg-transparent text-sm font-semibold text-text-dark focus:outline-none"
                              placeholder="Group label e.g. Dal (pick 1)"
                            />
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="text-xs text-text-muted">Pick:</span>
                              <input type="number" min={1} max={5} value={group.pick}
                                onChange={e => updateChoiceGroup(pkg.id, group.id, "pick", Number(e.target.value))}
                                className="w-12 border border-warm-border rounded-lg px-2 py-1 text-xs text-center bg-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition"
                              />
                            </div>
                            <button onClick={() => removeChoiceGroup(pkg.id, group.id)} className="text-text-muted hover:text-primary transition-colors text-base leading-none ml-1">×</button>
                          </div>
                          <div className="p-3">
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {group.options.map((opt, oi) => (
                                <span key={oi} className="flex items-center gap-1 bg-warm-bg border border-warm-border text-text-mid text-xs px-2.5 py-1 rounded-full">
                                  {opt}
                                  <button onClick={() => removeOption(pkg.id, group.id, oi)} className="text-text-muted hover:text-primary transition-colors ml-0.5 leading-none">×</button>
                                </span>
                              ))}
                              {group.options.length === 0 && <span className="text-xs text-text-muted italic">No options yet</span>}
                            </div>
                            <div className="flex gap-2">
                              <input type="text"
                                value={newOptionText[key] ?? ""}
                                onChange={e => setNewOptionText(prev => ({ ...prev, [key]: e.target.value }))}
                                onKeyDown={e => e.key === "Enter" && addOption(pkg.id, group.id)}
                                placeholder="Add option e.g. Kandi Pappu"
                                className="flex-1 bg-surface border border-warm-border rounded-lg px-3 py-1.5 text-xs text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition"
                              />
                              <button onClick={() => addOption(pkg.id, group.id)}
                                className="bg-primary text-gold px-3 py-1.5 rounded-full text-xs font-bold hover:bg-primary-mid transition-colors"
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
          <div className="bg-primary text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl max-w-2xl mx-auto">
            <p className="font-semibold text-sm">You have unsaved changes</p>
            <div className="flex gap-3">
              <button onClick={() => { setLocal(JSON.parse(JSON.stringify(packages))); setDirty(false) }}
                className="border border-white/30 text-white/80 px-4 py-2 rounded-full text-xs font-semibold hover:bg-white/10 transition-colors"
              >Discard</button>
              <button onClick={() => { onSave(local); setDirty(false) }}
                className="bg-gold text-primary px-4 py-2 rounded-full text-xs font-bold hover:bg-gold-light transition-colors"
              >Save Changes</button>
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
          <h2 className="font-playfair text-2xl font-bold text-text-dark">Edit Menu Items</h2>
          <p className="text-text-muted text-sm mt-0.5">Manage items shown on the /menu page and quick booking modal.</p>
        </div>
        {dirty && (
          <button onClick={() => { onSave(local); setDirty(false) }}
            className="bg-primary text-gold px-5 py-2.5 rounded-full font-bold text-sm hover:bg-primary-mid transition-colors shadow-[0_4px_16px_rgba(92,15,15,0.2)] flex items-center gap-2"
          >Save Changes</button>
        )}
      </div>

      {/* Row 1: Search + Diet filter */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-base">🔍</span>
          <input
            type="text"
            placeholder="Search menu items by name or description…"
            value={menuSearch}
            onChange={e => setMenuSearch(e.target.value)}
            className="w-full bg-surface border border-warm-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition"
          />
          {menuSearch && (
            <button onClick={() => setMenuSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dark text-lg leading-none">×</button>
          )}
        </div>
        <div className="inline-flex bg-warm-bg border border-warm-border rounded-xl p-1 gap-0.5 flex-shrink-0">
          {(["all", "veg", "non-veg"] as const).map((d) => (
            <button key={d} onClick={() => setDietFilter(d)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                dietFilter === d ? "bg-primary text-gold shadow-sm" : "text-text-mid hover:text-text-dark"
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
                  activeSection === sec.id ? "bg-primary text-gold shadow-sm" : "bg-white border border-warm-border text-text-mid hover:border-primary hover:text-primary"
                }`}
              >
                <span>{sec.emoji}</span> {sec.label}
                {unavail > 0 && <span className="bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{unavail}</span>}
              </button>
            )
          })}
        </div>
      )}

      {/* Diet filter + section list OR search results */}
      {!searchResults ? (
        <>

      {sectionData && (
        <div className="bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.05)] overflow-hidden">
          {/* Section header */}
          <div className="px-5 py-4 border-b border-warm-border flex items-center justify-between">
            <div>
              <h3 className="font-playfair text-xl font-bold text-text-dark">{sectionData.emoji} {sectionData.label}</h3>
              <p className="text-xs text-text-muted">{sectionData.items.length} items · {sectionData.items.filter(i => !i.available).length} unavailable</p>
            </div>
            <button onClick={() => setShowAddForm(v => !v)}
              className="bg-primary text-gold text-xs font-bold px-4 py-2 rounded-full hover:bg-primary-mid transition-colors"
            >
              + Add Item
            </button>
          </div>

          {/* Add new item form */}
          {showAddForm && (
            <div className="bg-warm-bg border-b border-warm-border px-5 py-4 space-y-3">
              <h4 className="font-semibold text-sm text-text-dark">New Item in {sectionData.label}</h4>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                <input type="text" placeholder="Item name *" value={newItem.name}
                  onChange={e => setNewItem(n => ({ ...n, name: e.target.value }))}
                  className="bg-surface border border-warm-border rounded-xl px-3 py-2 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition col-span-2 md:col-span-2"
                />
                <div className="flex border border-warm-border rounded-xl overflow-hidden bg-white">
                  <span className="px-3 py-2 bg-warm-bg text-sm font-bold text-primary">₹</span>
                  <input type="number" min={0} placeholder="Price" value={newItem.price || ""}
                    onChange={e => setNewItem(n => ({ ...n, price: Number(e.target.value) }))}
                    className="flex-1 px-2 py-2 text-sm text-text-dark focus:outline-none"
                  />
                </div>
                <select value={newItem.diet} onChange={e => setNewItem(n => ({ ...n, diet: e.target.value as "veg" | "non-veg" }))}
                  className="bg-warm-bg border border-warm-border rounded-xl px-3 py-2 text-sm text-text-dark focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition"
                >
                  <option value="veg">🌿 Veg</option>
                  <option value="non-veg">🍗 Non-Veg</option>
                </select>
                <input type="text" placeholder="Short description" value={newItem.desc}
                  onChange={e => setNewItem(n => ({ ...n, desc: e.target.value }))}
                  className="bg-surface border border-warm-border rounded-xl px-3 py-2 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition col-span-2 md:col-span-3"
                />
                <div className="flex gap-2">
                  <button onClick={addItem} className="flex-1 bg-primary text-gold py-2 rounded-full text-sm font-bold hover:bg-primary-mid transition-colors">Add</button>
                  <button onClick={() => setShowAddForm(false)} className="border border-warm-border text-text-muted px-3 py-2 rounded-xl text-sm hover:border-primary hover:text-primary transition-colors">✕</button>
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
                    ? "bg-warm-bg border-warm-border opacity-60"
                    : "bg-white border-warm-border hover:shadow-md hover:border-primary/30"
                }`}
              >
                {/* Visual header */}
                <div className={`flex items-center justify-center py-4 relative ${item.diet === "veg" ? "bg-green-50" : "bg-warm-bg"}`}>
                  <span className="text-3xl">{item.diet === "veg" ? "🌿" : "🍗"}</span>
                  {item.popular && (
                    <span className="absolute top-1.5 left-1.5 bg-gold text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full">★ Popular</span>
                  )}
                  <button onClick={() => updateItem(sectionData.id, item.id, "popular", !item.popular)}
                    title={item.popular ? "Unmark popular" : "Mark popular"}
                    className={`absolute top-1.5 right-1.5 text-base transition-all ${item.popular ? "text-gold" : "text-warm-border hover:text-gold"}`}
                  >★</button>
                </div>

                {/* Content */}
                <div className="px-3 pt-2 pb-1 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-2 h-2 rounded-sm border flex-shrink-0 ${item.diet === "veg" ? "border-green-600 bg-green-100" : "border-primary bg-primary/10"}`} />
                    {editItemId === item.id ? (
                      <input type="text" value={item.name}
                        onChange={e => updateItem(sectionData.id, item.id, "name", e.target.value)}
                        className="flex-1 bg-warm-bg border border-warm-border rounded-lg px-2 py-0.5 text-xs text-text-dark focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition"
                      />
                    ) : (
                      <p className={`font-semibold text-xs leading-tight ${!item.available ? "line-through text-text-muted" : "text-text-dark"}`}>{item.name}</p>
                    )}
                  </div>
                  {editItemId === item.id ? (
                    <input type="text" value={item.desc}
                      onChange={e => updateItem(sectionData.id, item.id, "desc", e.target.value)}
                      className="w-full bg-warm-bg border border-warm-border rounded-lg px-2 py-0.5 text-[10px] text-text-dark focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition mb-1"
                      placeholder="Description…"
                    />
                  ) : (
                    item.desc && <p className="text-[10px] text-text-muted leading-tight mb-1 line-clamp-1">{item.desc}</p>
                  )}
                  {/* Price */}
                  {editItemId === item.id ? (
                    <div className="flex items-center border border-warm-border rounded-lg overflow-hidden h-6 w-full mb-1">
                      <span className="px-1.5 text-[10px] font-bold text-primary bg-warm-bg h-full flex items-center">₹</span>
                      <input type="number" min={0} value={item.price}
                        onChange={e => updateItem(sectionData.id, item.id, "price", Number(e.target.value))}
                        className="flex-1 px-1 text-xs font-bold text-text-dark focus:outline-none h-full"
                      />
                    </div>
                  ) : (
                    <span className="inline-block bg-primary/[0.08] text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.price === 0 ? "Free" : `₹${item.price}`}
                    </span>
                  )}
                </div>

                {/* Controls bar */}
                <div className="flex items-center gap-1 px-2 py-1.5 border-t border-warm-border bg-warm-bg/50">
                  <button onClick={() => updateItem(sectionData.id, item.id, "available", !item.available)}
                    className={`flex-1 text-[10px] py-0.5 rounded-full font-semibold transition-all ${
                      item.available ? "bg-green-100 text-green-700 hover:bg-primary/10 hover:text-primary" : "bg-primary/10 text-primary hover:bg-green-100 hover:text-green-700"
                    }`}
                  >{item.available ? "✓ On" : "✗ Off"}</button>
                  <button onClick={() => setEditItemId(editItemId === item.id ? null : item.id)}
                    className="text-xs text-text-muted hover:text-primary transition-colors px-1.5"
                  >{editItemId === item.id ? "✓" : "✏️"}</button>
                  <button onClick={() => deleteItem(sectionData.id, item.id)}
                    className="text-xs text-text-muted hover:text-primary transition-colors px-1"
                  >🗑️</button>
                </div>
              </div>
            ))}
          </div>

          {sectionData.items.length === 0 && (
            <div className="text-center py-10 text-text-muted">
              <p>No items in this section.</p>
              <button onClick={() => setShowAddForm(true)} className="text-primary font-semibold text-sm mt-2">+ Add first item</button>
            </div>
          )}
        </div>
      )}
        </>
      ) : (
        /* ── Search results view ── */
        <div className="bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.05)] overflow-hidden">
          <div className="px-5 py-4 border-b border-warm-border bg-warm-bg flex items-center justify-between">
            <p className="font-semibold text-sm text-text-dark">
              {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &ldquo;{menuSearch}&rdquo;
            </p>
            <button onClick={() => setMenuSearch("")} className="text-xs text-text-muted hover:text-primary border border-warm-border px-3 py-1 rounded-full">Clear search</button>
          </div>
          {searchResults.length === 0 ? (
            <div className="text-center py-10 text-text-muted">
              <p className="text-2xl mb-2">🍽️</p>
              <p>No items found matching &ldquo;{menuSearch}&rdquo;</p>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {searchResults.map((item) => (
                <div key={item.id}
                  className={`border rounded-2xl p-4 flex flex-col gap-2 transition-all ${
                    !item.available ? "bg-warm-bg border-warm-border opacity-60" : "bg-white border-warm-border hover:shadow-md hover:border-gold/50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`w-2.5 h-2.5 rounded-sm border-2 mt-1 flex-shrink-0 ${item.diet === "veg" ? "border-green-600 bg-green-100" : "border-primary bg-primary/10"}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${!item.available ? "line-through text-text-muted" : "text-text-dark"}`}>{item.name}</p>
                      {item.desc && <p className="text-xs text-text-muted">{item.desc}</p>}
                      <p className="text-[10px] text-gold font-semibold mt-0.5">{item.sectionEmoji} {item.sectionLabel}</p>
                    </div>
                    <button onClick={() => updateItem(item.sectionId, item.id, "popular", !item.popular)}
                      className={`text-base flex-shrink-0 ${item.popular ? "text-gold" : "text-warm-border hover:text-gold"}`}>★</button>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-1">
                    <span className="font-bold text-sm text-gold">{item.price === 0 ? "Free" : `₹${item.price}`}</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateItem(item.sectionId, item.id, "available", !item.available)}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${item.available ? "bg-green-100 text-green-700 hover:bg-primary/10 hover:text-primary" : "bg-primary/10 text-primary hover:bg-green-100 hover:text-green-700"}`}>
                        {item.available ? "✓ On" : "✗ Off"}
                      </button>
                      <button onClick={() => deleteItem(item.sectionId, item.id)} className="text-xs text-text-muted hover:text-primary px-1">🗑️</button>
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
          <div className="bg-primary text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl max-w-2xl mx-auto">
            <p className="font-semibold text-sm">Unsaved changes</p>
            <div className="flex gap-3">
              <button onClick={() => { setLocal(JSON.parse(JSON.stringify(sections))); setDirty(false) }}
                className="border border-white/30 text-white/80 px-4 py-2 rounded-full text-xs font-semibold hover:bg-white/10"
              >Discard</button>
              <button onClick={() => { onSave(local); setDirty(false) }}
                className="bg-gold text-primary px-4 py-2 rounded-full text-xs font-bold hover:bg-gold-light transition-colors"
              >Save</button>
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
          <h2 className="font-playfair text-2xl font-bold text-text-dark">Edit Order Extras</h2>
          <p className="text-text-muted text-sm mt-0.5">These are the add-on dishes customers can pick in Step 2 of booking.</p>
        </div>
        {dirty && (
          <button onClick={() => { onSave(local); setDirty(false) }}
            className="bg-primary text-gold px-5 py-2.5 rounded-full font-bold text-sm hover:bg-primary-mid transition-colors shadow-[0_4px_16px_rgba(92,15,15,0.2)]"
          >Save Changes</button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {local.map(cat => (
          <button key={cat.id} onClick={() => setActiveCat(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
              activeCat === cat.id ? "bg-primary text-gold shadow-sm" : "bg-white border border-warm-border text-text-mid hover:border-primary hover:text-primary"
            }`}
          >
            <span>{cat.emoji}</span>{cat.label}
            <span className="text-[10px] font-bold opacity-70">({cat.items.length})</span>
          </button>
        ))}
      </div>

      {catData && (
        <div className="bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.05)] overflow-hidden">
          <div className="px-5 py-4 border-b border-warm-border flex items-center justify-between">
            <h3 className="font-playfair text-xl font-bold text-text-dark">{catData.emoji} {catData.label}</h3>
            <button onClick={() => setShowAddForm(v => !v)}
              className="bg-primary text-gold text-xs font-bold px-4 py-2 rounded-full hover:bg-primary-mid transition-colors"
            >+ Add Item</button>
          </div>

          {showAddForm && (
            <div className="bg-warm-bg border-b border-warm-border px-5 py-4 grid sm:grid-cols-5 gap-3">
              <input type="text" placeholder="Item name *" value={newItem.name}
                onChange={e => setNewItem(n => ({ ...n, name: e.target.value }))}
                className="bg-surface border border-warm-border rounded-xl px-3 py-2 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition sm:col-span-2"
              />
              <div className="flex items-center border border-warm-border rounded-xl overflow-hidden bg-white">
                <span className="px-2 text-xs font-bold text-primary bg-warm-bg">₹</span>
                <input type="number" min={0} placeholder="Price" value={newItem.price || ""}
                  onChange={e => setNewItem(n => ({ ...n, price: Number(e.target.value) }))}
                  className="w-full px-2 py-2 text-sm text-text-dark focus:outline-none"
                />
              </div>
              <select value={newItem.diet} onChange={e => setNewItem(n => ({ ...n, diet: e.target.value as "veg" | "non-veg" }))}
                className="bg-warm-bg border border-warm-border rounded-xl px-3 py-2 text-sm text-text-dark focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition"
              >
                <option value="veg">🌿 Veg</option>
                <option value="non-veg">🍗 Non-Veg</option>
              </select>
              <div className="flex gap-2">
                <button onClick={addItem} className="flex-1 bg-primary text-gold py-2 rounded-full text-sm font-bold hover:bg-primary-mid transition-colors">Add</button>
                <button onClick={() => setShowAddForm(false)} className="border border-warm-border text-text-muted px-3 py-2 rounded-xl text-sm hover:text-primary transition-colors">✕</button>
              </div>
            </div>
          )}

          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {catData.items.map((item) => (
              <div key={item.id}
                className={`border rounded-2xl p-3 flex flex-col gap-2 transition-all text-center ${
                  !item.available
                    ? "bg-warm-bg border-warm-border opacity-60"
                    : "bg-white border-warm-border hover:shadow-md hover:border-gold/50"
                }`}
              >
                {/* Emoji + star */}
                <div className="flex items-start justify-between">
                  <span className={`w-2 h-2 rounded-sm border flex-shrink-0 mt-1 ${item.diet === "veg" ? "border-green-600 bg-green-100" : "border-primary bg-primary/10"}`} />
                  <span className="text-3xl flex-1 text-center">{item.emoji}</span>
                  <button onClick={() => updateItem(catData.id, item.id, "popular", !item.popular)}
                    className={`text-sm flex-shrink-0 ${item.popular ? "text-gold" : "text-warm-border hover:text-gold"}`}>★</button>
                </div>
                {/* Name */}
                <p className={`font-semibold text-xs leading-tight ${!item.available ? "line-through text-text-muted" : "text-text-dark"}`}>{item.name}</p>
                {/* Price inline edit */}
                <div className="flex items-center border border-warm-border rounded-lg overflow-hidden mx-auto">
                  <span className="px-1.5 text-[10px] font-bold text-primary bg-warm-bg">₹</span>
                  <input type="number" min={0} value={item.price}
                    onChange={e => updateItem(catData.id, item.id, "price", Number(e.target.value))}
                    className="w-14 px-1 py-1 text-xs font-bold text-text-dark focus:outline-none text-center"
                  />
                </div>
                {/* Controls */}
                <div className="flex items-center justify-center gap-1.5">
                  <button onClick={() => updateItem(catData.id, item.id, "available", !item.available)}
                    className={`text-[9px] px-2 py-0.5 rounded-full font-semibold transition-all ${
                      item.available ? "bg-green-100 text-green-700 hover:bg-primary/10 hover:text-primary" : "bg-primary/10 text-primary hover:bg-green-100 hover:text-green-700"
                    }`}
                  >{item.available ? "✓ On" : "✗ Off"}</button>
                  <button onClick={() => deleteItem(catData.id, item.id)} className="text-xs text-text-muted hover:text-primary">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {dirty && (
        <div className="sticky bottom-4">
          <div className="bg-primary text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl max-w-2xl mx-auto">
            <p className="font-semibold text-sm">Unsaved changes</p>
            <div className="flex gap-3">
              <button onClick={() => { setLocal(JSON.parse(JSON.stringify(categories))); setDirty(false) }}
                className="border border-white/30 text-white/80 px-4 py-2 rounded-full text-xs font-semibold"
              >Discard</button>
              <button onClick={() => { onSave(local); setDirty(false) }}
                className="bg-gold text-primary px-4 py-2 rounded-full text-xs font-bold hover:bg-gold-light transition-colors"
              >Save</button>
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
        <h2 className="font-playfair text-2xl font-bold text-text-dark">Settings</h2>
        <p className="text-text-muted text-sm mt-0.5">Manage admin access and data.</p>
      </div>

      {/* PIN change */}
      <div className="bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.05)] p-6 space-y-4">
        <h3 className="font-playfair text-xl font-bold text-text-dark">Change Admin PIN</h3>
        <div>
          <label className="text-text-dark text-xs font-semibold uppercase tracking-wide mb-1.5 block">Current PIN</label>
          <input type="password" value={currentPin} onChange={e => setCurrentPin(e.target.value)}
            className="w-full bg-surface border border-warm-border rounded-xl px-4 py-2.5 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition"
            placeholder="Enter current PIN"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-text-dark text-xs font-semibold uppercase tracking-wide mb-1.5 block">New PIN</label>
            <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)}
              className="w-full bg-surface border border-warm-border rounded-xl px-4 py-2.5 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition"
              placeholder="Min 4 characters"
            />
          </div>
          <div>
            <label className="text-text-dark text-xs font-semibold uppercase tracking-wide mb-1.5 block">Confirm New PIN</label>
            <input type="password" value={confirmPin} onChange={e => setConfirmPin(e.target.value)}
              className="w-full bg-surface border border-warm-border rounded-xl px-4 py-2.5 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition"
              placeholder="Repeat new PIN"
            />
          </div>
        </div>
        {pinMsg && <p className={`text-sm font-semibold ${pinMsg.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>{pinMsg}</p>}
        <button onClick={changePIN} className="bg-primary text-gold px-6 py-3 rounded-full font-bold text-sm shadow-[0_4px_16px_rgba(92,15,15,0.2)] hover:bg-primary-mid transition-colors">
          Update PIN
        </button>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.05)] p-6">
        <h3 className="font-playfair text-xl font-bold text-text-dark mb-4">How edits work</h3>
        <div className="space-y-3 text-sm text-text-mid">
          {[
            ["Packages", "Edit price, tagline, what's included, and popular flag. Changes appear on /packages immediately after refresh."],
            ["Menu Items", "Add, edit or remove dishes per section. Toggle ★ for popular and ✓/✗ for availability. Unavailable items are hidden on /menu."],
            ["Order Extras", "Edit add-on dishes customers can pick during booking at /order. Update prices or toggle availability."],
            ["Saving", "All changes are saved to your browser's storage. They persist across sessions on this device."],
          ].map(([title, desc]) => (
            <div key={title} className="flex gap-3">
              <div className="flex-1">
                <p className="font-semibold text-text-dark">{title}</p>
                <p className="text-text-muted text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reset */}
      <div className="bg-primary/[0.05] border border-primary/20 rounded-2xl p-6">
        <h3 className="font-playfair text-xl font-bold text-primary mb-2">Reset All Data</h3>
        <p className="text-primary/80 text-sm mb-4">This will remove all your edits and restore the original default menu, packages, and extras. This cannot be undone.</p>
        <button onClick={onResetAll} className="bg-primary text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-primary-mid transition-colors">
          Reset Everything to Defaults
        </button>
      </div>
    </div>
  )
}

// ─── Bookings Tab ─────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<BookingEntry["status"], string> = {
  pending:   "bg-gold/[0.15] text-[#8B6A1A] border border-gold/25",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-primary/[0.08] text-primary border border-primary/15",
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
        <h2 className="font-playfair text-xl font-bold text-text-dark">Customer Bookings</h2>
        <p className="text-xs text-text-muted">{bookings.length} total · {counts.pending} pending</p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
              filter === s ? "bg-primary text-gold" : "bg-white border border-warm-border text-text-mid hover:bg-warm-bg hover:border-primary"
            }`}
          >
            {s === "all" ? "All" : s} {counts[s] > 0 && <span className="ml-1 opacity-70">({counts[s]})</span>}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.05)] p-12 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-text-muted font-medium">No bookings yet</p>
          <p className="text-xs text-text-muted/70 mt-1">Bookings submitted from the website will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.05)] overflow-hidden">
              {/* Header row */}
              <div className="flex items-center gap-3 px-5 py-4 cursor-pointer" onClick={() => setExpanded(expanded === b.id ? null : b.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-playfair font-bold text-text-dark text-sm">{b.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                    <span className="text-[10px] text-text-muted font-mono">{b.id}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-text-muted">
                    <span>📅 {b.eventDate}</span>
                    <span>👥 {b.guestCount} guests</span>
                    <span>📦 {b.packageName}</span>
                    <span>📞 {b.phone}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gold text-sm">₹{b.totalPerPerson}<span className="text-[10px] text-text-muted font-normal">/pp</span></p>
                  <p className="text-[10px] text-text-muted">₹{(b.totalPerPerson * b.guestCount).toLocaleString("en-IN")} est.</p>
                </div>
                <span className="text-text-muted text-sm flex-shrink-0">{expanded === b.id ? "▲" : "▼"}</span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 px-5 pb-3 flex-wrap">
                {STATUS_NEXT[b.status].map((a) => (
                  <button key={a.status} onClick={() => onStatusChange(b.id, a.status)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                      a.status === "cancelled" ? "bg-primary/[0.08] border border-primary/15 text-primary hover:bg-primary/15"
                      : a.status === "completed" ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                      : "bg-primary text-gold hover:bg-primary-mid"
                    }`}
                  >{a.label}</button>
                ))}
              </div>

              {/* Expanded details */}
              {expanded === b.id && (
                <div className="border-t border-warm-border px-5 py-4 bg-warm-bg/40 space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    <div><span className="text-text-muted">Event Type</span><p className="font-medium text-text-dark mt-0.5">{b.eventType}</p></div>
                    <div><span className="text-text-muted">Event Date</span><p className="font-medium text-text-dark mt-0.5">{b.eventDate}</p></div>
                    <div><span className="text-text-muted">Guests</span><p className="font-medium text-text-dark mt-0.5">{b.guestCount}</p></div>
                    <div><span className="text-text-muted">Submitted</span><p className="font-medium text-text-dark mt-0.5">{new Date(b.submittedAt).toLocaleString("en-IN")}</p></div>
                  </div>
                  {b.extras.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Extras</p>
                      <div className="flex flex-wrap gap-1.5">
                        {b.extras.map(e => (
                          <span key={e.id} className="bg-white border border-warm-border text-text-mid text-xs px-2.5 py-1 rounded-full">{e.emoji} {e.name} +₹{e.price}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {Object.keys(b.preferences).filter(k => (b.preferences[k] ?? []).some(Boolean)).length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Meal Choices</p>
                      <div className="space-y-1">
                        {Object.entries(b.preferences)
                          .filter(([, v]) => v.some(Boolean))
                          .map(([k, v]) => {
                            const vals = v.filter(Boolean).join(", ")
                            return <p key={k} className="text-xs text-text-mid"><span className="font-medium capitalize">{k}:</span> {vals}</p>
                          })
                        }
                      </div>
                    </div>
                  )}
                  {b.notes && (
                    <div>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Special Requests</p>
                      <p className="text-xs text-text-mid bg-white border border-warm-border rounded-xl px-3 py-2">{b.notes}</p>
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
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">🔍</span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dishes…"
          className="w-full pl-8 pr-8 py-2 bg-surface border border-warm-border rounded-xl text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition" />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dark text-xs">✕</button>}
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
                    ? "bg-primary text-gold shadow-sm"
                    : "bg-white border border-warm-border text-text-mid hover:border-primary hover:text-primary"
                }`}
              >
                <span>{sec.emoji}</span> {sec.label}
                {selCount > 0 && (
                  <span className="bg-gold text-primary text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{selCount}</span>
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
                  : t === "non-veg" ? "bg-primary text-gold border-primary"
                  : "bg-primary text-gold border-primary"
                : "bg-white text-text-mid border-warm-border hover:border-gold"
            }`}
          >
            {t === "all" ? "All" : t === "veg" ? "🌿 Veg" : "🍗 Non-Veg"}
          </button>
        ))}
      </div>

      {/* Items */}
      {isFiltering ? (
        allFilteredItems.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-6">No dishes found</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {allFilteredItems.map(item => {
              const isSel = selected.includes(item.name)
              return (
                <button key={item.id} type="button" onClick={() => onToggle(item.name)}
                  className={`relative text-left rounded-xl border-2 p-3 transition-all ${
                    isSel ? "border-primary bg-primary/5 shadow-sm" : "border-warm-border bg-white hover:border-gold"
                  }`}
                >
                  {isSel && <span className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-white text-[9px] font-bold">✓</span>}
                  <div className="flex items-start gap-2 pr-5">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.diet === "veg" ? "bg-green-500" : "bg-primary"}`} />
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-text-dark leading-tight">{item.name}</p>
                      <p className="text-[10px] text-gold mt-0.5">{item.sectionEmoji} {item.sectionLabel}</p>
                      {item.price > 0 && <p className="text-[10px] font-semibold text-primary mt-0.5">₹{item.price}/person</p>}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )
      ) : (
        activeSectionData && activeSectionData.items.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-6">No items in this section</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {(activeSectionData?.items ?? []).map(item => {
              const isSel = selected.includes(item.name)
              return (
                <button key={item.id} type="button" onClick={() => onToggle(item.name)}
                  className={`relative text-left rounded-xl border-2 p-3 transition-all ${
                    isSel ? "border-primary bg-primary/5 shadow-sm" : "border-warm-border bg-white hover:border-gold"
                  }`}
                >
                  {isSel && <span className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-white text-[9px] font-bold">✓</span>}
                  <div className="flex items-start gap-2 pr-5">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.diet === "veg" ? "bg-green-500" : "bg-primary"}`} />
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-text-dark leading-tight">{item.name}</p>
                      {item.price > 0 && <p className="text-[10px] font-semibold text-primary mt-0.5">₹{item.price}/person</p>}
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
        <h2 className="font-playfair text-xl font-bold text-text-dark">Charity / Community Feeds</h2>
        <button onClick={newEntry} className="bg-primary text-gold text-xs font-bold px-4 py-2 rounded-full hover:bg-primary-mid transition-colors">+ New</button>
      </div>

      {/* Top: ItemPicker left, Form right */}
      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Left: Item Picker */}
        <div className="bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.05)] p-5">
          <h3 className="font-playfair font-bold text-text-dark text-sm mb-3">Select Dishes for Entry</h3>
          {items.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {items.map(it => (
                <span key={it} className="flex items-center gap-1 bg-warm-bg border border-gold/40 text-text-mid text-xs px-2.5 py-1 rounded-full">
                  {it}
                  <button onClick={() => setItems(items.filter(i => i !== it))} className="text-text-muted hover:text-primary ml-0.5 leading-none">×</button>
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
        <div className="bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.05)] p-5 space-y-4">
          <h3 className="font-playfair font-bold text-text-dark text-sm">{editing ? "Edit Entry" : "Add New Entry"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-dark text-xs font-semibold uppercase tracking-wide mb-1.5 block">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                className="w-full bg-surface border border-warm-border rounded-xl px-3 py-2 text-sm text-text-dark focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition" />
            </div>
            <div>
              <label className="text-text-dark text-xs font-semibold uppercase tracking-wide mb-1.5 block">People to feed</label>
              <input type="number" min={1} value={form.members} onChange={e => setForm({...form, members: e.target.value})}
                className="w-full bg-surface border border-warm-border rounded-xl px-3 py-2 text-sm text-text-dark focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition" />
            </div>
          </div>
          <div>
            <label className="text-text-dark text-xs font-semibold uppercase tracking-wide mb-1.5 block">Notes (optional)</label>
            <textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              placeholder="Any special notes…" className="w-full bg-surface border border-warm-border rounded-xl px-3 py-2 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition resize-none" />
          </div>
          <p className="text-xs text-text-muted bg-warm-bg rounded-lg px-3 py-2 border border-warm-border">
            {items.length === 0 ? "← Select dishes from the left panel" : `${items.length} dish${items.length !== 1 ? "es" : ""} selected`}
          </p>
          <button onClick={save} disabled={!form.date || items.length === 0}
            className="w-full bg-primary text-gold font-bold text-sm py-2.5 rounded-full shadow-[0_4px_16px_rgba(92,15,15,0.2)] hover:bg-primary-mid transition-colors disabled:opacity-50">
            {editing ? "Update Entry" : "Save Entry"}
          </button>
        </div>
      </div>

      {/* Bottom: History */}
      <div className="space-y-3">
        <h3 className="font-playfair font-bold text-text-dark text-sm">Past Entries ({entries.length})</h3>
        {entries.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-8">No entries yet</p>
        ) : (
          entries.map(e => (
            <div key={e.id} className="bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.05)] px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-playfair font-bold text-text-dark text-sm">📅 {e.date} <span className="text-text-muted font-normal">· {e.members} people</span></p>
                  <p className="text-xs text-text-muted mt-0.5">{e.items.join(", ")}</p>
                  {e.notes && <p className="text-xs text-text-muted/70 mt-0.5 italic">{e.notes}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => loadEntry(e)} className="bg-gold/[0.12] border border-gold/25 text-[#8B6A1A] text-xs font-semibold px-3 py-1 rounded-full hover:bg-gold/20 transition-colors cursor-pointer">Edit</button>
                  <button onClick={() => { if (confirm(`Delete charity entry for ${e.date}?\n\nThis cannot be undone.`)) onSave(entries.filter(x => x.id !== e.id)) }} className="bg-primary/[0.08] border border-primary/15 text-primary text-xs font-semibold px-3 py-1 rounded-full hover:bg-primary/15 transition-colors cursor-pointer">Del</button>
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
    planned: "bg-gold/[0.15] text-[#8B6A1A] border border-gold/25",
    active: "bg-green-100 text-green-800",
    completed: "bg-primary/[0.08] text-primary border border-primary/15",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-playfair text-xl font-bold text-text-dark">Stall & Event Management</h2>
        <button onClick={newStall} className="bg-primary text-gold text-xs font-bold px-4 py-2 rounded-full hover:bg-primary-mid transition-colors">+ New Stall</button>
      </div>

      {/* Top: ItemPicker left, Form right */}
      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Left: Item Picker */}
        <div className="bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.05)] p-5">
          <h3 className="font-playfair font-bold text-text-dark text-sm mb-3">Select Items for Stall</h3>
          {form.items.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {form.items.map((it, idx) => (
                <span key={idx} className="flex items-center gap-1 bg-warm-bg border border-gold/40 text-text-mid text-xs px-2.5 py-1 rounded-full">
                  {it.name}{it.price > 0 ? ` ₹${it.price}` : ""}
                  <button onClick={() => setForm(f => ({...f, items: f.items.filter((_, i) => i !== idx)}))} className="text-text-muted hover:text-primary ml-0.5 leading-none">×</button>
                </span>
              ))}
              <p className="text-[10px] text-text-muted w-full text-right mt-1">Total: ₹{form.items.reduce((s, i) => s + i.price, 0).toLocaleString("en-IN")}</p>
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
        <div className="bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.05)] p-5 space-y-4">
          <h3 className="font-playfair font-bold text-text-dark text-sm">{editing ? "Edit Stall" : "Add New Stall"}</h3>
          <div>
            <label className="text-text-dark text-xs font-semibold uppercase tracking-wide mb-1.5 block">Stall Name</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Temple Main Gate Stall"
              className="w-full bg-surface border border-warm-border rounded-xl px-4 py-2.5 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-dark text-xs font-semibold uppercase tracking-wide mb-1.5 block">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                className="w-full bg-surface border border-warm-border rounded-xl px-3 py-2 text-sm text-text-dark focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition" />
            </div>
            <div>
              <label className="text-text-dark text-xs font-semibold uppercase tracking-wide mb-1.5 block">Shift</label>
              <select value={form.shift} onChange={e => setForm({...form, shift: e.target.value as StallEntry["shift"]})}
                className="w-full bg-surface border border-warm-border rounded-xl px-3 py-2 text-sm text-text-dark focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition">
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="all-day">All Day</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-text-dark text-xs font-semibold uppercase tracking-wide mb-1.5 block">Location</label>
            <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Durga Temple, Vijayawada"
              className="w-full bg-surface border border-warm-border rounded-xl px-4 py-2.5 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition" />
          </div>
          <div>
            <label className="text-text-dark text-xs font-semibold uppercase tracking-wide mb-1.5 block">Status</label>
            <div className="flex gap-2">
              {(["planned", "active", "completed"] as const).map(s => (
                <button key={s} onClick={() => setForm({...form, status: s})}
                  className={`flex-1 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${form.status === s ? STATUS_STYLE[s] : "bg-warm-bg text-text-muted hover:bg-warm-border border border-warm-border"}`}
                >{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-text-dark text-xs font-semibold uppercase tracking-wide mb-1.5 block">Notes (optional)</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              placeholder="Any notes…" className="w-full bg-surface border border-warm-border rounded-xl px-4 py-2.5 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition resize-none" />
          </div>
          <p className="text-xs text-text-muted bg-warm-bg rounded-lg px-3 py-2 border border-warm-border">
            {form.items.length === 0 ? "← Select items from the left panel" : `${form.items.length} item${form.items.length !== 1 ? "s" : ""} · ₹${form.items.reduce((s, i) => s + i.price, 0).toLocaleString("en-IN")} total`}
          </p>
          <button onClick={save} disabled={!form.name.trim() || !form.date}
            className="w-full bg-primary text-gold font-bold text-sm py-2.5 rounded-full shadow-[0_4px_16px_rgba(92,15,15,0.2)] hover:bg-primary-mid transition-colors disabled:opacity-50">
            {editing ? "Update Stall" : "Save Stall"}
          </button>
        </div>
      </div>

      {/* Bottom: Stall list */}
      <div className="space-y-3">
        <h3 className="font-playfair font-bold text-text-dark text-sm">Stalls ({stalls.length})</h3>
        {stalls.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-8">No stalls configured yet</p>
        ) : (
          stalls.map(s => (
            <div key={s.id} className="bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.05)] px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-playfair font-bold text-text-dark text-sm">{s.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[s.status]}`}>{s.status}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">📅 {s.date} · {s.shift} {s.location && `· 📍 ${s.location}`}</p>
                  <p className="text-xs text-text-muted/70 mt-0.5">{s.items.length} items · ₹{s.items.reduce((x, i) => x + i.price, 0).toLocaleString("en-IN")} total</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => loadStall(s)} className="bg-gold/[0.12] border border-gold/25 text-[#8B6A1A] text-xs font-semibold px-3 py-1 rounded-full hover:bg-gold/20 transition-colors cursor-pointer">Edit</button>
                  <button onClick={() => { if (confirm(`Delete stall "${s.name}"?\n\nThis cannot be undone.`)) onSave(stalls.filter(x => x.id !== s.id)) }} className="bg-primary/[0.08] border border-primary/15 text-primary text-xs font-semibold px-3 py-1 rounded-full hover:bg-primary/15 transition-colors cursor-pointer">Del</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
})
