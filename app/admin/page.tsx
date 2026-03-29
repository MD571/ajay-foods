"use client"

import { useState, useEffect, useCallback } from "react"
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
} from "../lib/siteData"

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "dashboard" | "packages" | "menu" | "extras" | "settings"

// ─── Admin Page ───────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)
  const [pinInput, setPinInput] = useState("")
  const [pinError, setPinError] = useState("")
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")

  // Data state
  const [packages, setPackagesState] = useState<AdminPackage[]>(DEFAULT_PACKAGES)
  const [menuSections, setMenuSectionsState] = useState<AdminMenuSection[]>(DEFAULT_MENU_SECTIONS)
  const [extraCats, setExtraCatsState] = useState<AdminExtraCategory[]>(DEFAULT_EXTRA_CATEGORIES)
  const [savedFlash, setSavedFlash] = useState("")

  // Load from localStorage on login
  const loadData = useCallback(() => {
    setPackagesState(getPackages())
    setMenuSectionsState(getMenuSections())
    setExtraCatsState(getExtraCategories())
  }, [])

  function handleLogin() {
    const pin = getAdminPin()
    if (pinInput.trim() === pin) {
      setLoggedIn(true)
      setPinError("")
      loadData()
    } else {
      setPinError("Incorrect PIN. Try again.")
      setPinInput("")
    }
  }

  function flash(msg: string) {
    setSavedFlash(msg)
    setTimeout(() => setSavedFlash(""), 2500)
  }

  function savePackages(pkgs: AdminPackage[]) {
    setPackages(pkgs)
    setPackagesState(pkgs)
    flash("✅ Packages saved!")
  }

  function saveMenuSections(secs: AdminMenuSection[]) {
    setMenuSections(secs)
    setMenuSectionsState(secs)
    flash("✅ Menu saved!")
  }

  function saveExtraCats(cats: AdminExtraCategory[]) {
    setExtraCategories(cats)
    setExtraCatsState(cats)
    flash("✅ Extras saved!")
  }

  // ── Login Screen ─────────────────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a0a03] to-[#3d1a07] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8B4513] to-[#D4A853] flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">🔐</div>
            <h1 className="font-playfair text-2xl font-bold text-[#8B4513]">Admin Login</h1>
            <p className="text-[#888] text-sm mt-1">Ajay Foods &amp; Beverages</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Admin PIN</label>
              <input
                type="password"
                placeholder="Enter PIN"
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value); setPinError("") }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full border border-[#e0d0bc] rounded-xl px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/10"
                autoFocus
              />
              {pinError && <p className="text-red-500 text-xs mt-1.5 text-center">{pinError}</p>}
            </div>
            <button onClick={handleLogin}
              className="w-full bg-[#8B4513] text-white py-3.5 rounded-xl font-bold hover:bg-[#6d3410] transition-colors shadow-md"
            >
              Login →
            </button>
            <button onClick={() => router.push("/")} className="w-full text-center text-sm text-[#888] hover:text-[#8B4513] transition-colors py-1">
              ← Back to website
            </button>
            <p className="text-center text-[10px] text-[#bbb]">Default PIN: AJAY1234</p>
          </div>
        </div>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "dashboard", label: "Dashboard",   emoji: "📊" },
    { id: "packages",  label: "Packages",    emoji: "📦" },
    { id: "menu",      label: "Menu Items",  emoji: "🍽️" },
    { id: "extras",    label: "Order Extras",emoji: "➕" },
    { id: "settings",  label: "Settings",    emoji: "⚙️" },
  ]

  return (
    <div className="min-h-screen bg-[#f5f0ea]">
      {/* Top Nav */}
      <header className="bg-gradient-to-r from-[#1a0a03] to-[#3d1a07] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#D4A853] flex items-center justify-center text-lg font-bold text-[#3d1a07]">A</div>
          <div>
            <p className="font-playfair font-bold text-base leading-none">Ajay Foods Admin</p>
            <p className="text-white/50 text-[10px] uppercase tracking-wider">Owner Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {savedFlash && (
            <span className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-full font-semibold animate-pulse">{savedFlash}</span>
          )}
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="text-xs border border-white/30 text-white/80 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors hidden sm:block"
          >
            View Site 🔗
          </a>
          <button onClick={() => setLoggedIn(false)} className="text-xs border border-white/30 text-white/80 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors">
            Logout
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <div className="bg-white border-b border-[#e8ddd0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex gap-0.5 overflow-x-auto scrollbar-none">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === t.id
                  ? "border-[#8B4513] text-[#8B4513]"
                  : "border-transparent text-[#777] hover:text-[#555]"
              }`}
            >
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── DASHBOARD ─────────────────────────────────────────────────── */}
        {activeTab === "dashboard" && (
          <DashboardTab
            packages={packages} menuSections={menuSections} extraCats={extraCats}
            setActiveTab={setActiveTab}
          />
        )}

        {/* ── PACKAGES ──────────────────────────────────────────────────── */}
        {activeTab === "packages" && (
          <PackagesTab packages={packages} onSave={savePackages} />
        )}

        {/* ── MENU ITEMS ────────────────────────────────────────────────── */}
        {activeTab === "menu" && (
          <MenuTab sections={menuSections} onSave={saveMenuSections} />
        )}

        {/* ── ORDER EXTRAS ──────────────────────────────────────────────── */}
        {activeTab === "extras" && (
          <ExtrasTab categories={extraCats} onSave={saveExtraCats} />
        )}

        {/* ── SETTINGS ──────────────────────────────────────────────────── */}
        {activeTab === "settings" && (
          <SettingsTab
            onResetAll={() => {
              if (!confirm("Reset ALL data to defaults? This cannot be undone.")) return
              resetAllData()
              loadData()
              flash("♻️ All data reset to defaults!")
            }}
          />
        )}
      </div>
    </div>
  )
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab({ packages, menuSections, extraCats, setActiveTab }: {
  packages: AdminPackage[]; menuSections: AdminMenuSection[]; extraCats: AdminExtraCategory[]
  setActiveTab: (t: Tab) => void
}) {
  const unavail = unavailableCount(menuSections)
  const stats = [
    { label: "Packages",       value: packages.length,                  icon: "📦", tab: "packages" as Tab },
    { label: "Menu Items",     value: totalMenuItems(menuSections),      icon: "🍽️", tab: "menu" as Tab },
    { label: "Order Extras",   value: totalExtraItems(extraCats),        icon: "➕", tab: "extras" as Tab },
    { label: "Unavailable",    value: unavail,                           icon: "⚠️", tab: "menu" as Tab, warn: unavail > 0 },
  ]
  const priceRange = { min: Math.min(...packages.map(p => p.price)), max: Math.max(...packages.map(p => p.price)) }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-2xl font-bold text-[#8B4513] mb-1">Good day! 👋</h2>
        <p className="text-[#888] text-sm">Here&apos;s an overview of your menu data. Click any card to edit.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <button key={s.label} onClick={() => setActiveTab(s.tab)}
            className={`bg-white rounded-2xl p-5 text-left border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ${
              s.warn ? "border-amber-300 bg-amber-50" : "border-[#f0e6d3]"
            }`}
          >
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`font-playfair text-3xl font-bold ${s.warn ? "text-amber-600" : "text-[#8B4513]"}`}>{s.value}</div>
            <div className="text-xs text-[#666] mt-1 font-medium">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Package price summary */}
      <div className="bg-white rounded-2xl border border-[#f0e6d3] shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-playfair text-lg font-bold text-[#8B4513]">Package Prices</h3>
          <button onClick={() => setActiveTab("packages")} className="text-xs text-[#8B4513] border border-[#8B4513] px-3 py-1 rounded-full hover:bg-[#8B4513] hover:text-white transition-colors font-semibold">Edit Prices</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {packages.map((p) => (
            <div key={p.id} className={`rounded-xl p-4 bg-gradient-to-br ${p.color} text-white relative`}>
              {p.popular && <span className="absolute top-2 right-2 text-[8px] bg-[#D4A853] text-[#3d1a07] font-bold px-1.5 py-0.5 rounded-full">★ Popular</span>}
              <p className="text-white/70 text-[10px] font-semibold uppercase tracking-wider">{p.tag}</p>
              <p className="font-playfair font-bold text-sm mt-0.5">{p.name}</p>
              <p className="text-2xl font-bold mt-1">₹{p.price}</p>
              <p className="text-white/60 text-[10px]">per person</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#888] mt-3">Price range: ₹{priceRange.min} – ₹{priceRange.max} per person</p>
      </div>

    </div>
  )
}

// ─── Packages Tab ─────────────────────────────────────────────────────────────
const PKG_STYLE_TEMPLATES = [
  { color: "from-[#2d6a4f] to-[#40916c]", lightColor: "bg-[#d8f3dc]", textColor: "text-[#1b4332]", badgeColor: "bg-green-100 text-green-800", tag: "VEG" as const, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80", alt: "Vegetarian thali" },
  { color: "from-[#e9c46a] to-[#f4a261]", lightColor: "bg-[#fff3cd]", textColor: "text-[#5c3d11]", badgeColor: "bg-yellow-100 text-yellow-800", tag: "VEG" as const, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80", alt: "Indian vegetarian spread" },
  { color: "from-[#8B4513] to-[#b5601e]", lightColor: "bg-[#fce8d8]", textColor: "text-[#4a1a05]", badgeColor: "bg-red-100 text-red-800", tag: "NON-VEG" as const, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80", alt: "Chicken biryani" },
  { color: "from-[#3d1a07] to-[#6b2d0f]", lightColor: "bg-[#f5ddd0]", textColor: "text-[#2a0f03]", badgeColor: "bg-red-100 text-red-800", tag: "NON-VEG" as const, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80", alt: "Indian non-veg feast" },
]

function PackagesTab({ packages, onSave }: { packages: AdminPackage[]; onSave: (p: AdminPackage[]) => void }) {
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
          <h2 className="font-playfair text-2xl font-bold text-[#8B4513]">Edit Packages</h2>
          <p className="text-[#888] text-sm mt-0.5">Manage packages, items, and customer choice options.</p>
        </div>
        <div className="flex items-center gap-3">
          {dirty && (
            <button onClick={() => { onSave(local); setDirty(false) }}
              className="bg-[#8B4513] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#6d3410] transition-colors shadow-md flex items-center gap-2"
            >
              💾 Save All
            </button>
          )}
          <button onClick={addNewPackage}
            className="flex items-center gap-2 bg-[#D4A853] text-[#3d1a07] px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#e8bc6a] transition-colors shadow-sm"
          >
            + New Package
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {local.map((pkg) => (
          <div key={pkg.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${editId === pkg.id ? "border-[#8B4513] shadow-lg" : "border-[#f0e6d3]"}`}>
            {/* Card header */}
            <div className={`bg-gradient-to-r ${pkg.color} p-4`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${pkg.badgeColor}`}>{pkg.tag}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <h3 className="font-playfair text-xl font-bold text-white">{pkg.name}</h3>
                    {pkg.popular && <span className="text-[9px] bg-[#D4A853] text-[#3d1a07] font-bold px-2 py-0.5 rounded-full">★ Popular</span>}
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
            {editId !== pkg.id && (
              <div className="px-4 py-3 bg-[#fdf9f5] border-b border-[#f0e6d3]">
                <p className="text-[10px] font-bold text-[#aaa] uppercase tracking-wider mb-2">What&apos;s Included</p>
                <ul className="space-y-1">
                  {pkg.includes.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#444]">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#D4A853]/30 flex items-center justify-center text-[#8B4513] text-[8px] flex-shrink-0 mt-0.5 font-bold">✓</span>
                      {inc}
                    </li>
                  ))}
                </ul>
                {(pkg.choiceGroups ?? []).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#f0e6d3]">
                    <p className="text-[10px] font-bold text-[#aaa] uppercase tracking-wider mb-1.5">Choice Options</p>
                    {(pkg.choiceGroups ?? []).map(g => (
                      <p key={g.id} className="text-[10px] text-[#666] mb-0.5">
                        <span className="font-semibold text-[#8B4513]">🎯 {g.label}:</span> {g.options.slice(0, 4).join(", ")}{g.options.length > 4 ? ` +${g.options.length - 4} more` : ""}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action bar */}
            <div className="flex border-b border-[#f0e6d3]">
              <button
                onClick={() => setEditId(editId === pkg.id ? null : pkg.id)}
                className="flex-1 text-center text-xs font-semibold text-[#8B4513] py-2.5 hover:bg-[#FDF6EC] transition-colors flex items-center justify-center gap-1.5"
              >
                {editId === pkg.id ? "▲ Close" : "✏️ Edit"}
              </button>
              <div className="w-px bg-[#f0e6d3]" />
              <button
                onClick={() => copyPackage(pkg)}
                className="flex-1 text-center text-xs font-semibold text-[#666] py-2.5 hover:bg-[#FDF6EC] transition-colors flex items-center justify-center gap-1.5"
                title="Duplicate this package"
              >
                📋 Copy
              </button>
              <div className="w-px bg-[#f0e6d3]" />
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
                  <label className="block text-xs font-bold text-[#555] mb-2 uppercase tracking-wider">💰 Price per Person (₹)</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={50} max={500} step={5} value={pkg.price}
                      onChange={(e) => update(pkg.id, "price", Number(e.target.value))}
                      className="flex-1 accent-[#8B4513]"
                    />
                    <div className="flex items-center border border-[#e0d0bc] rounded-xl overflow-hidden">
                      <span className="px-3 py-2 text-sm font-bold text-[#8B4513] bg-[#FDF6EC]">₹</span>
                      <input type="number" min={50} max={1000} step={5} value={pkg.price}
                        onChange={(e) => update(pkg.id, "price", Number(e.target.value))}
                        className="w-20 px-2 py-2 text-sm font-bold text-[#1a1a1a] focus:outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-[#aaa] mt-1">For 100 guests: ₹{(pkg.price * 100).toLocaleString("en-IN")}</p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-[#555] mb-1.5 uppercase tracking-wider">Package Name</label>
                  <input type="text" value={pkg.name}
                    onChange={(e) => update(pkg.id, "name", e.target.value)}
                    className="w-full border border-[#e0d0bc] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8B4513]"
                  />
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-xs font-bold text-[#555] mb-1.5 uppercase tracking-wider">Tagline</label>
                  <input type="text" value={pkg.tagline}
                    onChange={(e) => update(pkg.id, "tagline", e.target.value)}
                    className="w-full border border-[#e0d0bc] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8B4513]"
                  />
                </div>

                {/* Ideal for */}
                <div>
                  <label className="block text-xs font-bold text-[#555] mb-1.5 uppercase tracking-wider">Ideal For Hint</label>
                  <input type="text" value={pkg.ideal}
                    onChange={(e) => update(pkg.id, "ideal", e.target.value)}
                    className="w-full border border-[#e0d0bc] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8B4513]"
                    placeholder="e.g. Ideal for 50–200 guests"
                  />
                </div>

                {/* Popular toggle */}
                <div className="flex items-center justify-between bg-[#FDF6EC] rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#333]">⭐ Mark as Most Popular</p>
                    <p className="text-xs text-[#888]">Shows a badge on the packages page</p>
                  </div>
                  <button onClick={() => update(pkg.id, "popular", !pkg.popular)}
                    className={`relative w-12 h-6 rounded-full transition-all ${pkg.popular ? "bg-[#8B4513]" : "bg-[#ddd]"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${pkg.popular ? "left-6" : "left-0.5"}`} />
                  </button>
                </div>

                {/* Includes list */}
                <div>
                  <label className="block text-xs font-bold text-[#555] mb-2 uppercase tracking-wider">📋 What&apos;s Included ({pkg.includes.length} items)</label>
                  <div className="space-y-2 mb-3">
                    {pkg.includes.map((inc, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-[#FDF6EC] rounded-xl px-3 py-2">
                        <span className="w-4 h-4 rounded-full bg-[#D4A853]/30 flex items-center justify-center text-[#8B4513] text-[10px] flex-shrink-0">✓</span>
                        <input type="text" value={inc}
                          onChange={(e) => {
                            const updated = [...pkg.includes]
                            updated[idx] = e.target.value
                            update(pkg.id, "includes", updated)
                          }}
                          className="flex-1 bg-transparent text-sm focus:outline-none text-[#333]"
                        />
                        <button onClick={() => removeInclude(pkg.id, idx)} className="text-[#ccc] hover:text-red-500 transition-colors text-lg leading-none flex-shrink-0">×</button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newInclude} placeholder="Add included item…"
                      onChange={(e) => setNewInclude(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addInclude(pkg.id)}
                      className="flex-1 border border-[#e0d0bc] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8B4513]"
                    />
                    <button onClick={() => addInclude(pkg.id)}
                      className="bg-[#8B4513] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#6d3410] transition-colors"
                    >+ Add</button>
                  </div>
                </div>

                {/* Choice Groups */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <label className="block text-xs font-bold text-[#555] uppercase tracking-wider">🎯 Customer Choice Options</label>
                      <p className="text-[10px] text-[#aaa] mt-0.5">Items marked &quot;your choice&quot; — customers pick from these options</p>
                    </div>
                    <button onClick={() => addChoice(pkg.id)}
                      className="text-xs bg-[#FDF6EC] border border-[#D4A853] text-[#8B4513] px-3 py-1.5 rounded-lg font-semibold hover:bg-[#D4A853]/20 transition-colors"
                    >+ Add Group</button>
                  </div>

                  {(pkg.choiceGroups ?? []).length === 0 && (
                    <p className="text-xs text-[#bbb] italic text-center py-3 bg-[#fafafa] rounded-xl border border-dashed border-[#e0d0bc]">No choice groups yet. Add one above.</p>
                  )}

                  <div className="space-y-3">
                    {(pkg.choiceGroups ?? []).map((group) => {
                      const key = pkg.id + "-" + group.id
                      return (
                        <div key={group.id} className="border border-[#e0d0bc] rounded-xl overflow-hidden">
                          <div className="bg-[#FDF6EC] px-3 py-2 flex items-center gap-2">
                            <input type="text" value={group.label}
                              onChange={e => updateChoiceGroup(pkg.id, group.id, "label", e.target.value)}
                              className="flex-1 bg-transparent text-sm font-semibold text-[#333] focus:outline-none"
                              placeholder="Group label e.g. Dal (pick 1)"
                            />
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="text-xs text-[#888]">Pick:</span>
                              <input type="number" min={1} max={5} value={group.pick}
                                onChange={e => updateChoiceGroup(pkg.id, group.id, "pick", Number(e.target.value))}
                                className="w-12 border border-[#e0d0bc] rounded-lg px-2 py-1 text-xs text-center bg-white focus:outline-none focus:border-[#8B4513]"
                              />
                            </div>
                            <button onClick={() => removeChoiceGroup(pkg.id, group.id)} className="text-[#ccc] hover:text-red-500 transition-colors text-base leading-none ml-1">×</button>
                          </div>
                          <div className="p-3">
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {group.options.map((opt, oi) => (
                                <span key={oi} className="flex items-center gap-1 bg-[#f0e6d3] text-[#555] text-xs px-2.5 py-1 rounded-full">
                                  {opt}
                                  <button onClick={() => removeOption(pkg.id, group.id, oi)} className="text-[#aaa] hover:text-red-500 transition-colors ml-0.5 leading-none">×</button>
                                </span>
                              ))}
                              {group.options.length === 0 && <span className="text-xs text-[#bbb] italic">No options yet</span>}
                            </div>
                            <div className="flex gap-2">
                              <input type="text"
                                value={newOptionText[key] ?? ""}
                                onChange={e => setNewOptionText(prev => ({ ...prev, [key]: e.target.value }))}
                                onKeyDown={e => e.key === "Enter" && addOption(pkg.id, group.id)}
                                placeholder="Add option e.g. Kandi Pappu"
                                className="flex-1 border border-[#e0d0bc] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#8B4513]"
                              />
                              <button onClick={() => addOption(pkg.id, group.id)}
                                className="bg-[#8B4513] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#6d3410] transition-colors"
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
          <div className="bg-[#8B4513] text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl max-w-2xl mx-auto">
            <p className="font-semibold text-sm">You have unsaved changes</p>
            <div className="flex gap-3">
              <button onClick={() => { setLocal(JSON.parse(JSON.stringify(packages))); setDirty(false) }}
                className="border border-white/30 text-white/80 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors"
              >Discard</button>
              <button onClick={() => { onSave(local); setDirty(false) }}
                className="bg-white text-[#8B4513] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#FDF6EC] transition-colors"
              >💾 Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Menu Tab ─────────────────────────────────────────────────────────────────
function MenuTab({ sections, onSave }: { sections: AdminMenuSection[]; onSave: (s: AdminMenuSection[]) => void }) {
  const [local, setLocal] = useState<AdminMenuSection[]>(() => JSON.parse(JSON.stringify(sections)))
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "")
  const [editItemId, setEditItemId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [dietFilter, setDietFilter] = useState<"all"|"veg"|"non-veg">("all")
  const [newItem, setNewItem] = useState<Omit<AdminMenuItem, "id">>({
    name: "", diet: "veg", price: 0, desc: "", popular: false, available: true,
  })

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
    if (!confirm("Delete this item?")) return
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
          <h2 className="font-playfair text-2xl font-bold text-[#8B4513]">Edit Menu Items</h2>
          <p className="text-[#888] text-sm mt-0.5">Manage items shown on the /menu page and quick booking modal.</p>
        </div>
        {dirty && (
          <button onClick={() => { onSave(local); setDirty(false) }}
            className="bg-[#8B4513] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#6d3410] transition-colors shadow-md flex items-center gap-2"
          >💾 Save Changes</button>
        )}
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {local.map((sec) => {
          const unavail = sec.items.filter(i => !i.available).length
          return (
            <button key={sec.id} onClick={() => setActiveSection(sec.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                activeSection === sec.id ? "bg-[#8B4513] text-white shadow-md" : "bg-white border border-[#e0d0bc] text-[#555] hover:border-[#8B4513]"
              }`}
            >
              <span>{sec.emoji}</span> {sec.label}
              {unavail > 0 && <span className="bg-amber-400 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{unavail}</span>}
            </button>
          )
        })}
      </div>

      {/* Diet filter */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-[#555] uppercase tracking-wider">Filter:</span>
        <div className="inline-flex bg-[#FDF6EC] border border-[#e0d0bc] rounded-full p-1 gap-0.5">
          {(["all", "veg", "non-veg"] as const).map((d) => (
            <button key={d} onClick={() => setDietFilter(d)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                dietFilter === d ? "bg-[#8B4513] text-white shadow-sm" : "text-[#666] hover:text-[#555]"
              }`}
            >
              {d === "all" ? "All" : d === "veg" ? "🌿 Veg" : "🍗 Non-Veg"}
            </button>
          ))}
        </div>
      </div>

      {sectionData && (
        <div className="bg-white rounded-2xl border border-[#f0e6d3] shadow-sm overflow-hidden">
          {/* Section header */}
          <div className="px-5 py-4 border-b border-[#f0e6d3] flex items-center justify-between">
            <div>
              <h3 className="font-playfair text-lg font-bold text-[#8B4513]">{sectionData.emoji} {sectionData.label}</h3>
              <p className="text-xs text-[#888]">{sectionData.items.length} items · {sectionData.items.filter(i => !i.available).length} unavailable</p>
            </div>
            <button onClick={() => setShowAddForm(v => !v)}
              className="flex items-center gap-1.5 bg-[#8B4513] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#6d3410] transition-colors"
            >
              + Add Item
            </button>
          </div>

          {/* Add new item form */}
          {showAddForm && (
            <div className="bg-[#FDF6EC] border-b border-[#f0e6d3] px-5 py-4 space-y-3">
              <h4 className="font-semibold text-sm text-[#8B4513]">New Item in {sectionData.label}</h4>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                <input type="text" placeholder="Item name *" value={newItem.name}
                  onChange={e => setNewItem(n => ({ ...n, name: e.target.value }))}
                  className="border border-[#e0d0bc] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8B4513] bg-white col-span-2 md:col-span-2"
                />
                <div className="flex border border-[#e0d0bc] rounded-xl overflow-hidden bg-white">
                  <span className="px-3 py-2 bg-[#FDF6EC] text-sm font-bold text-[#8B4513]">₹</span>
                  <input type="number" min={0} placeholder="Price" value={newItem.price || ""}
                    onChange={e => setNewItem(n => ({ ...n, price: Number(e.target.value) }))}
                    className="flex-1 px-2 py-2 text-sm focus:outline-none"
                  />
                </div>
                <select value={newItem.diet} onChange={e => setNewItem(n => ({ ...n, diet: e.target.value as "veg" | "non-veg" }))}
                  className="border border-[#e0d0bc] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#8B4513]"
                >
                  <option value="veg">🌿 Veg</option>
                  <option value="non-veg">🍗 Non-Veg</option>
                </select>
                <input type="text" placeholder="Short description" value={newItem.desc}
                  onChange={e => setNewItem(n => ({ ...n, desc: e.target.value }))}
                  className="border border-[#e0d0bc] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8B4513] bg-white col-span-2 md:col-span-3"
                />
                <div className="flex gap-2">
                  <button onClick={addItem} className="flex-1 bg-[#8B4513] text-white py-2 rounded-xl text-sm font-bold hover:bg-[#6d3410] transition-colors">Add</button>
                  <button onClick={() => setShowAddForm(false)} className="border border-[#e0d0bc] text-[#888] px-3 py-2 rounded-xl text-sm hover:border-red-300 hover:text-red-500 transition-colors">✕</button>
                </div>
              </div>
            </div>
          )}

          {/* Items list */}
          <div className="divide-y divide-[#f5ece0]">
            {sectionData.items.filter(item => dietFilter === "all" || item.diet === dietFilter).map((item) => (
              <div key={item.id}
                className={`px-5 py-3.5 flex items-center gap-4 transition-colors ${!item.available ? "bg-[#fafafa] opacity-60" : "hover:bg-[#fdf9f5]"}`}
              >
                {/* Veg/non-veg dot */}
                <span className={`w-3 h-3 rounded-sm border-2 flex-shrink-0 ${item.diet === "veg" ? "border-green-600 bg-green-100" : "border-red-600 bg-red-100"}`} />

                {/* Name + desc */}
                <div className="flex-1 min-w-0">
                  {editItemId === item.id ? (
                    <div className="space-y-2">
                      <input type="text" value={item.name}
                        onChange={e => updateItem(sectionData.id, item.id, "name", e.target.value)}
                        className="w-full border border-[#e0d0bc] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#8B4513]"
                      />
                      <input type="text" value={item.desc}
                        onChange={e => updateItem(sectionData.id, item.id, "desc", e.target.value)}
                        className="w-full border border-[#e0d0bc] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#8B4513]"
                        placeholder="Description…"
                      />
                    </div>
                  ) : (
                    <>
                      <p className={`font-semibold text-sm ${!item.available ? "line-through text-[#aaa]" : "text-[#1a1a1a]"}`}>{item.name}</p>
                      <p className="text-xs text-[#888] truncate">{item.desc}</p>
                    </>
                  )}
                </div>

                {/* Price */}
                {editItemId === item.id ? (
                  <div className="flex items-center border border-[#e0d0bc] rounded-lg overflow-hidden w-24 flex-shrink-0">
                    <span className="px-2 text-xs font-bold text-[#8B4513] bg-[#FDF6EC]">₹</span>
                    <input type="number" min={0} value={item.price}
                      onChange={e => updateItem(sectionData.id, item.id, "price", Number(e.target.value))}
                      className="w-14 px-1 py-1.5 text-sm font-bold text-[#1a1a1a] focus:outline-none"
                    />
                  </div>
                ) : (
                  <span className="font-bold text-sm text-[#8B4513] flex-shrink-0 w-16 text-right">
                    {item.price === 0 ? "Free" : `₹${item.price}`}
                  </span>
                )}

                {/* Controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Popular toggle */}
                  <button onClick={() => updateItem(sectionData.id, item.id, "popular", !item.popular)}
                    title={item.popular ? "Unmark popular" : "Mark as popular"}
                    className={`text-base transition-all ${item.popular ? "text-[#D4A853]" : "text-[#ddd] hover:text-[#D4A853]"}`}
                  >★</button>

                  {/* Available toggle */}
                  <button onClick={() => updateItem(sectionData.id, item.id, "available", !item.available)}
                    title={item.available ? "Mark unavailable" : "Mark available"}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
                      item.available ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600" : "bg-red-100 text-red-600 hover:bg-green-100 hover:text-green-700"
                    }`}
                  >
                    {item.available ? "✓ Available" : "✗ Unavailable"}
                  </button>

                  {/* Edit toggle */}
                  <button onClick={() => setEditItemId(editItemId === item.id ? null : item.id)}
                    className="text-xs text-[#888] hover:text-[#8B4513] transition-colors px-2 py-1"
                  >
                    {editItemId === item.id ? "Done" : "✏️"}
                  </button>

                  {/* Delete */}
                  <button onClick={() => deleteItem(sectionData.id, item.id)}
                    className="text-xs text-[#ccc] hover:text-red-500 transition-colors px-1"
                  >🗑️</button>
                </div>
              </div>
            ))}
          </div>

          {sectionData.items.length === 0 && (
            <div className="text-center py-10 text-[#aaa]">
              <p>No items in this section.</p>
              <button onClick={() => setShowAddForm(true)} className="text-[#8B4513] font-semibold text-sm mt-2">+ Add first item</button>
            </div>
          )}
        </div>
      )}

      {dirty && (
        <div className="sticky bottom-4">
          <div className="bg-[#8B4513] text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl max-w-2xl mx-auto">
            <p className="font-semibold text-sm">Unsaved changes</p>
            <div className="flex gap-3">
              <button onClick={() => { setLocal(JSON.parse(JSON.stringify(sections))); setDirty(false) }}
                className="border border-white/30 text-white/80 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/10"
              >Discard</button>
              <button onClick={() => { onSave(local); setDirty(false) }}
                className="bg-white text-[#8B4513] px-4 py-2 rounded-xl text-xs font-bold"
              >💾 Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Extras Tab ───────────────────────────────────────────────────────────────
function ExtrasTab({ categories, onSave }: { categories: AdminExtraCategory[]; onSave: (c: AdminExtraCategory[]) => void }) {
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
    if (!confirm("Remove this extra?")) return
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
          <h2 className="font-playfair text-2xl font-bold text-[#8B4513]">Edit Order Extras</h2>
          <p className="text-[#888] text-sm mt-0.5">These are the add-on dishes customers can pick in Step 2 of booking.</p>
        </div>
        {dirty && (
          <button onClick={() => { onSave(local); setDirty(false) }}
            className="bg-[#8B4513] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#6d3410] transition-colors shadow-md"
          >💾 Save Changes</button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {local.map(cat => (
          <button key={cat.id} onClick={() => setActiveCat(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
              activeCat === cat.id ? "bg-[#8B4513] text-white shadow-md" : "bg-white border border-[#e0d0bc] text-[#555] hover:border-[#8B4513]"
            }`}
          >
            <span>{cat.emoji}</span>{cat.label}
            <span className="text-[10px] font-bold opacity-70">({cat.items.length})</span>
          </button>
        ))}
      </div>

      {catData && (
        <div className="bg-white rounded-2xl border border-[#f0e6d3] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f0e6d3] flex items-center justify-between">
            <h3 className="font-playfair text-lg font-bold text-[#8B4513]">{catData.emoji} {catData.label}</h3>
            <button onClick={() => setShowAddForm(v => !v)}
              className="flex items-center gap-1.5 bg-[#8B4513] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#6d3410] transition-colors"
            >+ Add Item</button>
          </div>

          {showAddForm && (
            <div className="bg-[#FDF6EC] border-b border-[#f0e6d3] px-5 py-4 grid sm:grid-cols-5 gap-3">
              <input type="text" placeholder="Item name *" value={newItem.name}
                onChange={e => setNewItem(n => ({ ...n, name: e.target.value }))}
                className="border border-[#e0d0bc] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#8B4513] sm:col-span-2"
              />
              <div className="flex items-center border border-[#e0d0bc] rounded-xl overflow-hidden bg-white">
                <span className="px-2 text-xs font-bold text-[#8B4513] bg-[#FDF6EC]">₹</span>
                <input type="number" min={0} placeholder="Price" value={newItem.price || ""}
                  onChange={e => setNewItem(n => ({ ...n, price: Number(e.target.value) }))}
                  className="w-full px-2 py-2 text-sm focus:outline-none"
                />
              </div>
              <select value={newItem.diet} onChange={e => setNewItem(n => ({ ...n, diet: e.target.value as "veg" | "non-veg" }))}
                className="border border-[#e0d0bc] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
              >
                <option value="veg">🌿 Veg</option>
                <option value="non-veg">🍗 Non-Veg</option>
              </select>
              <div className="flex gap-2">
                <button onClick={addItem} className="flex-1 bg-[#8B4513] text-white py-2 rounded-xl text-sm font-bold hover:bg-[#6d3410]">Add</button>
                <button onClick={() => setShowAddForm(false)} className="border border-[#e0d0bc] text-[#888] px-3 py-2 rounded-xl text-sm hover:text-red-500">✕</button>
              </div>
            </div>
          )}

          <div className="divide-y divide-[#f5ece0]">
            {catData.items.map((item) => (
              <div key={item.id} className={`px-5 py-3.5 flex items-center gap-4 hover:bg-[#fdf9f5] transition-colors ${!item.available ? "opacity-50" : ""}`}>
                <span className="text-xl flex-shrink-0">{item.emoji}</span>
                <span className={`w-2.5 h-2.5 rounded-sm border-2 flex-shrink-0 ${item.diet === "veg" ? "border-green-600 bg-green-100" : "border-red-600 bg-red-100"}`} />
                <p className={`flex-1 font-semibold text-sm ${!item.available ? "line-through text-[#aaa]" : "text-[#1a1a1a]"}`}>{item.name}</p>

                {/* Price edit */}
                <div className="flex items-center border border-[#e0d0bc] rounded-lg overflow-hidden w-24 flex-shrink-0">
                  <span className="px-2 text-xs font-bold text-[#8B4513] bg-[#FDF6EC]">₹</span>
                  <input type="number" min={0} value={item.price}
                    onChange={e => updateItem(catData.id, item.id, "price", Number(e.target.value))}
                    className="w-14 px-1 py-1.5 text-sm font-bold focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => updateItem(catData.id, item.id, "popular", !item.popular)}
                    className={`text-base ${item.popular ? "text-[#D4A853]" : "text-[#ddd] hover:text-[#D4A853]"}`}
                    title={item.popular ? "Unmark popular" : "Mark popular"}
                  >★</button>
                  <button onClick={() => updateItem(catData.id, item.id, "available", !item.available)}
                    className={`text-xs px-2 py-1 rounded-lg font-semibold transition-all ${
                      item.available ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600" : "bg-red-100 text-red-600 hover:bg-green-100 hover:text-green-700"
                    }`}
                  >{item.available ? "✓ Available" : "✗ Unavailable"}</button>
                  <button onClick={() => deleteItem(catData.id, item.id)} className="text-[#ccc] hover:text-red-500 transition-colors">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {dirty && (
        <div className="sticky bottom-4">
          <div className="bg-[#8B4513] text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl max-w-2xl mx-auto">
            <p className="font-semibold text-sm">Unsaved changes</p>
            <div className="flex gap-3">
              <button onClick={() => { setLocal(JSON.parse(JSON.stringify(categories))); setDirty(false) }}
                className="border border-white/30 text-white/80 px-4 py-2 rounded-xl text-xs font-semibold"
              >Discard</button>
              <button onClick={() => { onSave(local); setDirty(false) }}
                className="bg-white text-[#8B4513] px-4 py-2 rounded-xl text-xs font-bold"
              >💾 Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

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
        <h2 className="font-playfair text-2xl font-bold text-[#8B4513]">Settings</h2>
        <p className="text-[#888] text-sm mt-0.5">Manage admin access and data.</p>
      </div>

      {/* PIN change */}
      <div className="bg-white rounded-2xl border border-[#f0e6d3] shadow-sm p-6 space-y-4">
        <h3 className="font-playfair text-lg font-bold text-[#8B4513]">🔐 Change Admin PIN</h3>
        <div>
          <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Current PIN</label>
          <input type="password" value={currentPin} onChange={e => setCurrentPin(e.target.value)}
            className="w-full border border-[#e0d0bc] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8B4513]"
            placeholder="Enter current PIN"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">New PIN</label>
            <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)}
              className="w-full border border-[#e0d0bc] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8B4513]"
              placeholder="Min 4 characters"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Confirm New PIN</label>
            <input type="password" value={confirmPin} onChange={e => setConfirmPin(e.target.value)}
              className="w-full border border-[#e0d0bc] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8B4513]"
              placeholder="Repeat new PIN"
            />
          </div>
        </div>
        {pinMsg && <p className={`text-sm font-semibold ${pinMsg.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>{pinMsg}</p>}
        <button onClick={changePIN} className="bg-[#8B4513] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#6d3410] transition-colors">
          Update PIN
        </button>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-[#f0e6d3] shadow-sm p-6">
        <h3 className="font-playfair text-lg font-bold text-[#8B4513] mb-4">ℹ️ How edits work</h3>
        <div className="space-y-3 text-sm text-[#555]">
          {[
            ["📦 Packages", "Edit price, tagline, what's included, and popular flag. Changes appear on /packages immediately after refresh."],
            ["🍽️ Menu Items", "Add, edit or remove dishes per section. Toggle ★ for popular and ✓/✗ for availability. Unavailable items are hidden on /menu."],
            ["➕ Order Extras", "Edit add-on dishes customers can pick during booking at /order. Update prices or toggle availability."],
            ["💾 Saving", "All changes are saved to your browser's storage. They persist across sessions on this device."],
          ].map(([title, desc]) => (
            <div key={title} className="flex gap-3">
              <div className="flex-1">
                <p className="font-semibold text-[#333]">{title}</p>
                <p className="text-[#777] text-xs mt-0.5">{desc}</p>
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
