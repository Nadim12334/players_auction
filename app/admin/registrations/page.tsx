"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "../../../services/api";
import { Icon } from "@iconify/react";
import { getImageUrl } from "../../../services/image";

const CATEGORIES = ["ALL", "Batsman", "Bowler", "All Rounder", "Wicket Keeper"];

interface Player {
  id: number;
  name: string;
  phoneNumber: string | null;
  category: string;
  fromWhere: string;
  photo: string | null;
  basePrice: number;
  sold: boolean;
  status: string;
  tournamentSlug: string | null;
  createdAt?: string;
}

interface EditModal {
  open: boolean;
  player: Player | null;
}

export default function AdminRegistrationsPage() {
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

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text, visible: true });
    setTimeout(() => setToast({ type: "", text: "", visible: false }), 4000);
  };

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
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
  }, [search, categoryFilter, villageFilter]);

  useEffect(() => {
    const debounce = setTimeout(fetchRegistrations, 300);
    return () => clearTimeout(debounce);
  }, [fetchRegistrations]);

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
      case "AVAILABLE": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "SOLD": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "UNSOLD": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const stats = {
    total: players.length,
    available: players.filter((p) => p.status === "AVAILABLE").length,
    sold: players.filter((p) => p.sold).length,
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-white p-4 md:p-8 font-sans selection:bg-purple-500/30">
      {/* Toast */}
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
          <Icon icon={toast.type === "success" ? "lucide:check-circle" : "lucide:alert-circle"} className="text-xl" />
          <p className="font-medium tracking-wide">{toast.text}</p>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.open && editModal.player && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white">Edit Player</h3>
                <p className="text-slate-400 text-xs mt-0.5">ID: #{editModal.player.id}</p>
              </div>
              <button
                onClick={() => setEditModal({ open: false, player: null })}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <Icon icon="lucide:x" />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: "Full Name", key: "name", type: "text" },
                { label: "Mobile Number", key: "phoneNumber", type: "tel" },
                { label: "Village / City", key: "fromWhere", type: "text" },
                { label: "Base Price (₹)", key: "basePrice", type: "number" },
              ].map(({ label, key, type }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{label}</label>
                  <input
                    type={type}
                    value={(editForm as any)[key] ?? ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              ))}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Category</label>
                <select
                  value={editForm.category ?? ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  {["Batsman", "Bowler", "All Rounder", "Wicket Keeper"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
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
                    <Icon icon="solar:spinner-bold" className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon icon="solar:diskette-bold" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-1">
              <Link href="/admin" className="hover:underline flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors">
                <Icon icon="solar:arrow-left-bold" /> Admin Dashboard
              </Link>
              <span>/</span>
              <span>Player Registrations</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Player Registrations
            </h1>
            <p className="text-slate-400 text-sm mt-1">View, search, edit and manage all registered players.</p>
          </div>
          <Link
            href="/admin"
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg"
          >
            <Icon icon="solar:alt-arrow-left-bold" className="text-base" />
            Back to Dashboard
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Registered", value: stats.total, icon: "solar:users-group-rounded-bold", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
            { label: "Available for Auction", value: stats.available, icon: "solar:gavel-bold", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
            { label: "Already Sold", value: stats.sold, icon: "solar:check-circle-bold", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
          ].map((s) => (
            <div key={s.label} className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
              <div className={`p-3 rounded-xl border ${s.color}`}>
                <Icon icon={s.icon} className="text-xl" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs text-slate-400 font-semibold">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Icon icon="solar:magnifer-bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
            <input
              id="reg-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, mobile or village..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors min-w-[160px]"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c === "ALL" ? "All Categories" : c}</option>
            ))}
          </select>

          {/* Village Filter */}
          <div className="relative">
            <Icon icon="solar:map-point-bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
            <input
              type="text"
              value={villageFilter}
              onChange={(e) => setVillageFilter(e.target.value)}
              placeholder="Filter by village..."
              className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors w-full md:w-40"
            />
          </div>
        </div>

        {/* Player Table */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Icon icon="solar:spinner-bold" className="text-4xl text-cyan-400 animate-spin" />
              <p className="text-slate-400 text-sm">Loading registrations...</p>
            </div>
          ) : players.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-600">
              <Icon icon="solar:users-group-rounded-bold" className="text-5xl opacity-30" />
              <p className="text-sm font-semibold">No registrations found</p>
              <p className="text-xs text-slate-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800/80 bg-slate-900/50">
                      {["Player", "Mobile", "Category", "Village / City", "Status", "Actions"].map((h) => (
                        <th key={h} className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {players.map((player) => (
                      <tr key={player.id} className="hover:bg-slate-900/40 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
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
                        <td className="px-5 py-4">
                          <span className="text-slate-300 text-sm font-mono">{player.phoneNumber || "—"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-cyan-400 text-xs font-bold">{player.category}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-slate-300 text-sm">{player.fromWhere}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${statusColor(player.status)}`}>
                            {player.status}
                          </span>
                        </td>
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

              {/* Mobile Cards */}
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-white text-sm truncate">{player.name}</p>
                          <p className="text-xs text-cyan-400 font-semibold">{player.category}</p>
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${statusColor(player.status)}`}>
                          {player.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-slate-400">{player.fromWhere}</p>
                        <p className="text-xs text-slate-500 font-mono">{player.phoneNumber}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
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
        </p>
      </div>
    </div>
  );
}
