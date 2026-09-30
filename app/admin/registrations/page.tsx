"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "../../../services/api";
import { Icon } from "@iconify/react";
import { getImageUrl } from "../../../services/image";

const CATEGORIES = ["ALL", "Batsman", "Bowler", "All Rounder", "Wicket Keeper"];
const BATTING_STYLES = ["Right Handed", "Left Handed"];
const BOWLING_STYLES = [
  "Right-arm Fast",
  "Right-arm Medium",
  "Right-arm Spin",
  "Left-arm Fast",
  "Left-arm Spin",
  "None",
];

interface Tournament {
  id: number;
  name: string;
  slug: string;
  season?: string;
  registrationOpen: boolean;
  status: string;
  playersCount?: number;
}

interface Player {
  id: number;
  name: string;
  phoneNumber: string | null;
  category: string;
  fromWhere: string;
  battingStyle?: string | null;
  bowlingStyle?: string | null;
  age?: number | null;
  photo: string | null;
  basePrice: number;
  sold: boolean;
  status: string;
  tournamentId?: number;
  tournamentSlug: string | null;
  tournament?: {
    id: number;
    name: string;
    slug: string;
  };
  createdAt?: string;
}

interface EditModal {
  open: boolean;
  player: Player | null;
}

function AdminRegistrationsContent() {
  const searchParams = useSearchParams();
  const initialTournamentId = searchParams.get("tournamentId") || "";

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(initialTournamentId);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [villageFilter, setVillageFilter] = useState("");
  const [toast, setToast] = useState({ type: "", text: "", visible: false });
  const [editModal, setEditModal] = useState<EditModal>({ open: false, player: null });
  const [editForm, setEditForm] = useState<Partial<Player>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [togglingReg, setTogglingReg] = useState(false);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text, visible: true });
    setTimeout(() => setToast({ type: "", text: "", visible: false }), 4000);
  };

  // Load Tournaments for Dropdown Filter
  useEffect(() => {
    const fetchTourneys = async () => {
      try {
        const res = await api.get("/tournaments");
        if (Array.isArray(res.data)) {
          setTournaments(res.data);
        }
      } catch (err) {
        console.error("Failed to load tournaments list:", err);
      }
    };
    fetchTourneys();
  }, []);

  // Fetch Registrations with multi-tournament isolation filter
  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedTournamentId) params.set("tournamentId", selectedTournamentId);
      if (search.trim()) params.set("search", search.trim());
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (villageFilter.trim()) params.set("village", villageFilter.trim());

      const res = await api.get(`/admin/registrations?${params.toString()}`);
      setPlayers(res.data);
    } catch (e) {
      showToast("error", "Failed to load registrations.");
    } finally {
      setLoading(false);
    }
  }, [selectedTournamentId, search, categoryFilter, villageFilter]);

  useEffect(() => {
    const debounce = setTimeout(fetchRegistrations, 300);
    return () => clearTimeout(debounce);
  }, [fetchRegistrations]);

  const handleTournamentSelect = (id: string) => {
    setSelectedTournamentId(id);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (id) {
        url.searchParams.set("tournamentId", id);
      } else {
        url.searchParams.delete("tournamentId");
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  const handleCopyRegistrationLink = (tournamentId: number | string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/register/${tournamentId}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    showToast("success", `Registration link copied: /register/${tournamentId}`);
  };

  const handleToggleRegistration = async (t: Tournament) => {
    setTogglingReg(true);
    try {
      const res = await api.post(`/tournaments/${t.id}/toggle-registration`);
      const newStatus = res.data.registrationOpen;
      setTournaments((prev) =>
        prev.map((item) => (item.id === t.id ? { ...item, registrationOpen: newStatus } : item))
      );
      showToast(
        "success",
        res.data.message || `Registration is now ${newStatus ? "OPEN" : "CLOSED"} for ${t.name}.`
      );
    } catch (err: any) {
      showToast("error", err?.response?.data?.error || "Failed to toggle registration.");
    } finally {
      setTogglingReg(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/registrations/${id}`);
      showToast("success", `${name} deleted successfully.`);
      setPlayers((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      showToast("error", "Failed to delete player.");
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (player: Player) => {
    setEditForm({ ...player });
    setEditModal({ open: true, player });
  };

  const handleSaveEdit = async () => {
    if (!editModal.player) return;
    setSaving(true);
    try {
      await api.put(`/admin/registrations/${editModal.player.id}`, {
        name: editForm.name,
        phoneNumber: editForm.phoneNumber,
        category: editForm.category,
        fromWhere: editForm.fromWhere,
        battingStyle: editForm.battingStyle,
        bowlingStyle: editForm.bowlingStyle,
        age: editForm.age,
        basePrice: editForm.basePrice,
      });
      showToast("success", "Player updated successfully.");
      setEditModal({ open: false, player: null });
      fetchRegistrations();
    } catch (e: any) {
      showToast("error", e?.response?.data?.error || "Failed to update player.");
    } finally {
      setSaving(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "SOLD":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "UNSOLD":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const activeTournament = tournaments.find((t) => String(t.id) === String(selectedTournamentId));

  const stats = {
    total: players.length,
    available: players.filter((p) => p.status === "AVAILABLE").length,
    sold: players.filter((p) => p.sold).length,
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-white p-4 md:p-8 font-sans selection:bg-purple-500/30">
      {/* Toast Notification */}
      <div
        className={`fixed top-6 right-6 z-50 transition-all duration-300 transform ${
          toast.visible ? "translate-x-0 opacity-100" : "translate-x-[200%] opacity-0"
        }`}
      >
        <div
          className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border ${
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          <Icon icon={toast.type === "success" ? "solar:check-circle-bold" : "solar:danger-triangle-bold"} className="text-xl" />
          <p className="font-medium tracking-wide text-sm">{toast.text}</p>
        </div>
      </div>

      {/* Edit Player Modal */}
      {editModal.open && editModal.player && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-black text-white">Edit Player Registration</h3>
                <p className="text-slate-400 text-xs mt-0.5">Player ID: #{editModal.player.id}</p>
              </div>
              <button
                onClick={() => setEditModal({ open: false, player: null })}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <Icon icon="solar:close-circle-bold" className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  value={editForm.name ?? ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Mobile Number</label>
                <input
                  type="tel"
                  value={editForm.phoneNumber ?? ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Category</label>
                <select
                  value={editForm.category ?? ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  {["Batsman", "Bowler", "All Rounder", "Wicket Keeper"].map((c) => (
                    <option key={c} value={c} className="bg-slate-900">{c}</option>
                  ))}
                </select>
              </div>

              {/* Batting & Bowling Style in 2 cols */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Batting Style</label>
                  <select
                    value={editForm.battingStyle ?? "Right Handed"}
                    onChange={(e) => setEditForm((p) => ({ ...p, battingStyle: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-xs md:text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    {BATTING_STYLES.map((b) => (
                      <option key={b} value={b} className="bg-slate-900">{b}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Bowling Style</label>
                  <select
                    value={editForm.bowlingStyle ?? "Right-arm Medium"}
                    onChange={(e) => setEditForm((p) => ({ ...p, bowlingStyle: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-xs md:text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    {BOWLING_STYLES.map((b) => (
                      <option key={b} value={b} className="bg-slate-900">{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Village & Age in 2 cols */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Village / City</label>
                  <input
                    type="text"
                    value={editForm.fromWhere ?? ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, fromWhere: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Age</label>
                  <input
                    type="number"
                    value={editForm.age ?? ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, age: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              {/* Base Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Base Price (₹)</label>
                <input
                  type="number"
                  value={editForm.basePrice ?? 500}
                  onChange={(e) => setEditForm((p) => ({ ...p, basePrice: Number(e.target.value) }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditModal({ open: false, player: null })}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white font-black py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Icon icon="solar:spinner-bold" className="animate-spin text-base" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon icon="solar:diskette-bold" className="text-base" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Navigation & Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-1">
              <Link href="/admin" className="hover:underline flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors">
                <Icon icon="solar:arrow-left-bold" /> Admin Dashboard
              </Link>
              <span>/</span>
              <Link href="/admin/tournaments" className="hover:underline text-slate-400 hover:text-cyan-400 transition-colors">
                Tournaments
              </Link>
              <span>/</span>
              <span>Player Registrations</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Player Registrations
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage tournament-isolated player registration pools and auction entries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/tournaments"
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg"
            >
              <Icon icon="solar:cup-star-bold" className="text-base text-cyan-400" />
              Tournaments Hub
            </Link>
          </div>
        </div>

        {/* Tournament Selector Dropdown Bar */}
        <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <Icon icon="solar:cup-bold" className="text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <label htmlFor="tournament-select" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Select Active Tournament Scope
              </label>
              <select
                id="tournament-select"
                value={selectedTournamentId}
                onChange={(e) => handleTournamentSelect(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white font-bold text-sm rounded-xl px-3 py-1.5 mt-0.5 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer w-full md:w-72"
              >
                <option value="">All Tournaments (Global View)</option>
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (ID: {t.id}) {t.season ? `• ${t.season}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeTournament ? (
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
              <span
                className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                  activeTournament.registrationOpen
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    activeTournament.registrationOpen ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                  }`}
                />
                {activeTournament.registrationOpen ? "Registration Open" : "Registration Closed"}
              </span>

              <button
                onClick={() => handleToggleRegistration(activeTournament)}
                disabled={togglingReg}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  activeTournament.registrationOpen
                    ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30"
                    : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                }`}
              >
                {togglingReg ? "Updating..." : activeTournament.registrationOpen ? "Close Registration" : "Open Registration"}
              </button>

              <button
                onClick={() => handleCopyRegistrationLink(activeTournament.id)}
                className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                title="Copy public registration URL"
              >
                <Icon icon="solar:copy-bold" className="text-sm" />
                Copy Link (/register/{activeTournament.id})
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-medium">
              Showing registrations across all active tournaments
            </div>
          )}
        </div>

        {/* Selected Tournament Spotlight Banner (if scoped) */}
        {activeTournament && (
          <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-indigo-950/40 border border-cyan-500/30 rounded-3xl p-5 md:p-6 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-3xl shrink-0">
                <Icon icon="solar:cup-star-bold" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-black text-white">{activeTournament.name}</h2>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">
                    ID: #{activeTournament.id}
                  </span>
                </div>
                <p className="text-xs text-cyan-400 font-semibold mt-0.5">
                  {activeTournament.season || "Season 1"} • Direct Registration URL:{" "}
                  <code className="text-white bg-slate-900 px-2 py-0.5 rounded font-mono">
                    /register/{activeTournament.id}
                  </code>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/register/${activeTournament.id}`}
                target="_blank"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Icon icon="solar:link-bold" className="text-sm text-cyan-400" />
                Open Form
              </Link>
              <Link
                href={`/admin?tournament=${activeTournament.slug}`}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-cyan-950/50"
              >
                <Icon icon="solar:gavel-bold" className="text-sm" />
                Auction Room
              </Link>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Registered",
              value: stats.total,
              icon: "solar:users-group-rounded-bold",
              color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
            },
            {
              label: "Available / Unsold",
              value: stats.available,
              icon: "solar:check-circle-bold",
              color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            },
            {
              label: "Sold in Auction",
              value: stats.sold,
              icon: "solar:cup-bold",
              color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
            },
          ].map(({ label, value, icon, color }) => (
            <div
              key={label}
              className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 md:p-5 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="text-2xl md:text-3xl font-black text-white mt-1 font-mono">{value}</p>
              </div>
              <div className={`p-3 rounded-xl border ${color}`}>
                <Icon icon={icon} className="text-xl md:text-2xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Icon icon="solar:magnifer-bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
            <input
              type="text"
              placeholder="Search by player name, phone, or village..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  categoryFilter === cat
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Village Filter */}
          <div className="relative">
            <Icon icon="solar:map-point-bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
            <input
              type="text"
              placeholder="Filter by village..."
              value={villageFilter}
              onChange={(e) => setVillageFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors w-full md:w-44"
            />
          </div>
        </div>

        {/* Players Table */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Icon icon="solar:spinner-bold" className="text-4xl text-cyan-400 animate-spin" />
              <p className="text-slate-400 text-sm">Loading player records...</p>
            </div>
          ) : players.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-600">
              <Icon icon="solar:users-group-rounded-bold" className="text-5xl opacity-30" />
              <p className="text-sm font-semibold text-slate-400">No registered players found</p>
              <p className="text-xs text-slate-500">
                {selectedTournamentId
                  ? "Share the registration link above to start receiving player submissions."
                  : "Try adjusting your search criteria or select a specific tournament."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800/80 bg-slate-900/50">
                      {[
                        "Player",
                        "Mobile",
                        "Category",
                        "Style / Role",
                        "Age",
                        "Village / City",
                        !selectedTournamentId ? "Tournament" : null,
                        "Status",
                        "Actions",
                      ]
                        .filter(Boolean)
                        .map((h) => (
                          <th key={h as string} className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {players.map((player) => (
                      <tr key={player.id} className="hover:bg-slate-900/40 transition-colors group">
                        {/* Player Photo & Name */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                              {player.photo ? (
                                <img
                                  src={getImageUrl(player.photo)}
                                  alt={player.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600">
                                  <Icon icon="solar:user-bold" className="text-lg" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{player.name}</p>
                              <p className="text-xs text-slate-500 font-mono">#{player.id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Mobile Number */}
                        <td className="px-5 py-4">
                          <span className="text-slate-300 text-sm font-mono">
                            {player.phoneNumber ? `+91 ${player.phoneNumber}` : "—"}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4">
                          <span className="text-cyan-400 text-xs font-bold bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                            {player.category}
                          </span>
                        </td>

                        {/* Batting & Bowling Style */}
                        <td className="px-5 py-4">
                          <div className="space-y-0.5 text-xs">
                            <span className="text-slate-300 font-medium block">
                              🏏 {player.battingStyle || "Right Handed"}
                            </span>
                            <span className="text-slate-400 text-[11px] block">
                              ⚡ {player.bowlingStyle || "Right-arm Medium"}
                            </span>
                          </div>
                        </td>

                        {/* Age */}
                        <td className="px-5 py-4">
                          <span className="text-slate-300 text-xs font-semibold">
                            {player.age ? `${player.age} yrs` : "—"}
                          </span>
                        </td>

                        {/* Village / City */}
                        <td className="px-5 py-4">
                          <span className="text-slate-300 text-sm">{player.fromWhere}</span>
                        </td>

                        {/* Tournament Scope (if viewing all) */}
                        {!selectedTournamentId && (
                          <td className="px-5 py-4">
                            <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-xs font-semibold">
                              {player.tournament?.name || player.tournamentSlug || `ID: #${player.tournamentId}`}
                            </span>
                          </td>
                        )}

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${statusColor(player.status)}`}>
                            {player.status}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(player)}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white border border-slate-700 hover:border-indigo-500 transition-all"
                              title="Edit Player"
                            >
                              <Icon icon="solar:pen-bold" className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleDelete(player.id, player.name)}
                              disabled={deleting === player.id}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-red-600/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/50 transition-all disabled:opacity-40"
                              title="Delete Player"
                            >
                              {deleting === player.id ? (
                                <Icon icon="solar:spinner-bold" className="text-sm animate-spin" />
                              ) : (
                                <Icon icon="solar:trash-bin-trash-bold" className="text-sm" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden divide-y divide-slate-800/60">
                {players.map((player) => (
                  <div key={player.id} className="p-4 flex gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                      {player.photo ? (
                        <img src={getImageUrl(player.photo)} alt={player.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Icon icon="solar:user-bold" className="text-xl" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-white text-sm truncate">{player.name}</p>
                          <span className="text-xs text-cyan-400 font-semibold">{player.category}</span>
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${statusColor(player.status)}`}>
                          {player.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 space-y-0.5">
                        <p>{player.fromWhere} {player.age ? `• ${player.age} yrs` : ""}</p>
                        <p className="font-mono text-slate-500 text-[11px]">{player.phoneNumber ? `+91 ${player.phoneNumber}` : ""}</p>
                        <p className="text-[11px] text-slate-400">
                          {player.battingStyle || "Right Handed"} • {player.bowlingStyle || "Right-arm Medium"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleEdit(player)}
                          className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1"
                        >
                          <Icon icon="solar:pen-bold" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(player.id, player.name)}
                          disabled={deleting === player.id}
                          className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-red-600/20 text-slate-400 hover:text-red-400 border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 disabled:opacity-40"
                        >
                          {deleting === player.id ? (
                            <Icon icon="solar:spinner-bold" className="animate-spin" />
                          ) : (
                            <Icon icon="solar:trash-bin-trash-bold" />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs pb-4">
          Showing {players.length} registration{players.length !== 1 ? "s" : ""}
          {activeTournament ? ` for ${activeTournament.name}` : ""}
        </p>
      </div>
    </div>
  );
}

export default function AdminRegistrationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090a0f] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      }
    >
      <AdminRegistrationsContent />
    </Suspense>
  );
}
