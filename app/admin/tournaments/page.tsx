"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "../../../services/api";
import { Icon } from "@iconify/react";

interface Tournament {
  id: number;
  name: string;
  tournamentName?: string;
  slug: string;
  logo?: string | null;
  tournamentLogo?: string | null;
  season?: string;
  status: "NOT_STARTED" | "ACTIVE" | "LIVE" | "COMPLETED" | "ARCHIVED" | string;
  isLive?: boolean;
  registrationOpen: boolean;
  playersCount: number;
  teamsCount: number;
  bidsCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function TournamentsManagementPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ id: number | null; type: string | null }>({
    id: null,
    type: null,
  });
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string; visible: boolean }>({
    type: "success",
    text: "",
    visible: false,
  });

  // Category view filter
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "COMPLETED" | "ARCHIVED">("ALL");

  // Create Tournament Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTourneyForm, setNewTourneyForm] = useState({
    name: "",
    season: "Season 1",
    registrationOpen: true,
  });

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState<Tournament | null>(null);
  const [typedConfirmName, setTypedConfirmName] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/tournaments");
      if (Array.isArray(res.data)) {
        setTournaments(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load tournaments:", err);
      showToast("error", err?.response?.data?.error || "Failed to load tournaments.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text, visible: true });
    setTimeout(() => setToast({ type, text, visible: false }), 4500);
  };

  // Group tournaments
  const activeTournaments = tournaments.filter(
    (t) => t.status === "ACTIVE" || t.status === "LIVE" || t.status === "NOT_STARTED"
  );
  const completedTournaments = tournaments.filter((t) => t.status === "COMPLETED");
  const archivedTournaments = tournaments.filter((t) => t.status === "ARCHIVED");

  // Action: Create Tournament
  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTourneyForm.name.trim()) {
      showToast("error", "Tournament name is required.");
      return;
    }

    setActionLoading({ id: 0, type: "create" });
    try {
      const res = await api.post("/tournaments", {
        name: newTourneyForm.name.trim(),
        season: newTourneyForm.season.trim(),
        registrationOpen: newTourneyForm.registrationOpen,
        status: "NOT_STARTED",
      });
      showToast("success", res.data.message || "Tournament created successfully!");
      setShowCreateModal(false);
      setNewTourneyForm({ name: "", season: "Season 1", registrationOpen: true });
      await fetchTournaments();
    } catch (err: any) {
      console.error("Create error:", err);
      showToast("error", err?.response?.data?.error || "Failed to create tournament.");
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  // Action: Archive Tournament
  const handleArchive = async (tournament: Tournament) => {
    if (tournament.isLive || tournament.status === "LIVE") {
      showToast("error", "Live tournaments cannot be archived. Complete or stop the auction first.");
      return;
    }

    setActionLoading({ id: tournament.id, type: "archive" });
    try {
      const res = await api.post(`/tournaments/${tournament.id}/archive`);
      showToast("success", res.data.message || `Tournament '${tournament.name}' archived.`);
      await fetchTournaments();
    } catch (err: any) {
      console.error("Archive error:", err);
      showToast("error", err?.response?.data?.error || "Failed to archive tournament.");
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  // Action: Restore Tournament (ARCHIVED -> COMPLETED)
  const handleRestore = async (tournament: Tournament) => {
    setActionLoading({ id: tournament.id, type: "restore" });
    try {
      const res = await api.post(`/tournaments/${tournament.id}/restore`);
      showToast("success", res.data.message || `Tournament '${tournament.name}' restored to Completed list.`);
      await fetchTournaments();
    } catch (err: any) {
      console.error("Restore error:", err);
      showToast("error", err?.response?.data?.error || "Failed to restore tournament.");
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  // Action: Mark as Completed
  const handleComplete = async (tournament: Tournament) => {
    setActionLoading({ id: tournament.id, type: "complete" });
    try {
      const res = await api.post(`/tournaments/${tournament.id}/complete`);
      showToast("success", res.data.message || `Tournament '${tournament.name}' marked as Completed.`);
      await fetchTournaments();
    } catch (err: any) {
      console.error("Complete error:", err);
      showToast("error", err?.response?.data?.error || "Failed to complete tournament.");
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  // Action: Toggle Registration Open / Closed
  const handleToggleRegistration = async (tournament: Tournament) => {
    setActionLoading({ id: tournament.id, type: "toggle-registration" });
    try {
      const res = await api.post(`/tournaments/${tournament.id}/toggle-registration`);
      const newStatus = res.data.registrationOpen;
      setTournaments((prev) =>
        prev.map((t) => (t.id === tournament.id ? { ...t, registrationOpen: newStatus } : t))
      );
      showToast(
        "success",
        res.data.message || `Registration for '${tournament.name}' is now ${newStatus ? "OPEN" : "CLOSED"}.`
      );
    } catch (err: any) {
      console.error("Toggle registration error:", err);
      showToast("error", err?.response?.data?.error || "Failed to toggle registration.");
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  // Action: Copy Registration URL to Clipboard
  const handleCopyRegistrationLink = (tournament: Tournament) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/register/${tournament.id}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    showToast("success", `Registration link copied: /register/${tournament.id}`);
  };

  // Action: Export Player Registration List (.xlsx)
  const handleDownloadPlayers = async (tournament: Tournament) => {
    setActionLoading({ id: tournament.id, type: "download-players" });
    try {
      const response = await api.get(`/admin/export/players/${tournament.id}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeName = tournament.name.replace(/[^a-zA-Z0-9_-]/g, "_");
      link.setAttribute("download", `${safeName}_Player_Registration_List.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast("success", `Downloaded Player Registrations for '${tournament.name}'.`);
    } catch (err: any) {
      console.error("Download players error:", err);
      showToast("error", "Failed to download Player Registration List.");
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  // Action: Export Auction Results (.xlsx)
  const handleDownloadResults = async (tournament: Tournament) => {
    setActionLoading({ id: tournament.id, type: "download-results" });
    try {
      const response = await api.get(`/admin/export/auction-results/${tournament.id}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeName = tournament.name.replace(/[^a-zA-Z0-9_-]/g, "_");
      link.setAttribute("download", `${safeName}_Auction_Results.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast("success", `Downloaded Auction Results for '${tournament.name}'.`);
    } catch (err: any) {
      console.error("Download results error:", err);
      showToast("error", "Failed to download Auction Results.");
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  // Open Delete Modal
  const openDeleteModal = (tournament: Tournament) => {
    if (tournament.isLive || tournament.status === "LIVE") {
      showToast("error", "Live tournaments cannot be permanently deleted. Complete or stop the auction first.");
      return;
    }
    setTournamentToDelete(tournament);
    setTypedConfirmName("");
    setDeleteError("");
    setDeleteModalOpen(true);
  };

  // Execute Permanent Delete
  const handleExecuteDelete = async () => {
    if (!tournamentToDelete) return;
    if (typedConfirmName.trim() !== tournamentToDelete.name.trim()) {
      setDeleteError("Typed name does not match the tournament name.");
      return;
    }

    setActionLoading({ id: tournamentToDelete.id, type: "delete" });
    setDeleteError("");

    try {
      const res = await api.delete(`/admin/tournaments/${tournamentToDelete.id}`);
      showToast(
        "success",
        res.data.message || `Tournament '${tournamentToDelete.name}' and its records were permanently deleted.`
      );
      setDeleteModalOpen(false);
      setTournamentToDelete(null);
      await fetchTournaments();
    } catch (err: any) {
      console.error("Delete error:", err);
      const errMsg = err?.response?.data?.error || "Failed to permanently delete tournament.";
      setDeleteError(errMsg);
      showToast("error", errMsg);
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  return (
    <div className="min-h-screen bg-[#07080d] text-white p-4 md:p-10 font-sans selection:bg-cyan-500/30">
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
          <Icon
            icon={toast.type === "success" ? "lucide:check-circle" : "lucide:alert-circle"}
            className="text-xl"
          />
          <p className="font-medium tracking-wide">{toast.text}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-1">
              <Link
                href="/admin"
                className="hover:underline flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <Icon icon="solar:arrow-left-bold" /> Admin Dashboard
              </Link>
              <span>/</span>
              <span>Tournaments Hub</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent text-left">
              Tournaments Management Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage multi-tournament lifecycle, archive completed events, download official records, or permanently clean up storage.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold px-5 py-3 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-cyan-950/40 transition-all border border-cyan-400/30"
            >
              <Icon icon="solar:add-circle-bold" className="text-lg" />
              New Tournament
            </button>
            <Link
              href="/admin"
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg"
            >
              <Icon icon="solar:gavel-bold" className="text-base" />
              Auction Console
            </Link>
          </div>
        </header>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-950/80 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Tournaments
              </span>
              <span className="text-2xl font-extrabold text-white mt-1 block">
                {tournaments.length}
              </span>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Icon icon="solar:cup-star-bold" className="text-2xl" />
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                Active / Live
              </span>
              <span className="text-2xl font-extrabold text-cyan-400 mt-1 block">
                {activeTournaments.length}
              </span>
            </div>
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <Icon icon="solar:play-bold" className="text-2xl" />
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                Completed
              </span>
              <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">
                {completedTournaments.length}
              </span>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Icon icon="solar:check-circle-bold" className="text-2xl" />
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                Archived
              </span>
              <span className="text-2xl font-extrabold text-amber-400 mt-1 block">
                {archivedTournaments.length}
              </span>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Icon icon="solar:archive-bold" className="text-2xl" />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          {(
            [
              { key: "ALL", label: "All Tournaments", count: tournaments.length },
              { key: "ACTIVE", label: "Active & Live", count: activeTournaments.length },
              { key: "COMPLETED", label: "Completed", count: completedTournaments.length },
              { key: "ARCHIVED", label: "Archived Tournaments", count: archivedTournaments.length },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === tab.key
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Icon icon="lucide:loader-2" className="text-4xl text-cyan-400 animate-spin" />
            <p className="text-slate-400 text-sm font-medium">Loading tournament records...</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* SECTION 1: ACTIVE & LIVE TOURNAMENTS */}
            {(activeTab === "ALL" || activeTab === "ACTIVE") && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                    Active & Live Tournaments ({activeTournaments.length})
                  </h2>
                </div>

                {activeTournaments.length === 0 ? (
                  <div className="bg-slate-950/60 border border-slate-800/60 p-8 rounded-2xl text-center text-slate-500 text-sm">
                    No active tournaments found. Create one or restore an archived tournament.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeTournaments.map((t) => (
                      <div
                        key={t.id}
                        className="bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/50 rounded-3xl p-6 backdrop-blur-xl shadow-xl transition-all flex flex-col justify-between space-y-5"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-white">{t.name}</h3>
                              <span className="text-xs text-slate-400 font-medium">
                                {t.season || "Season 1"} • ID: {t.id}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                                t.isLive || t.status === "LIVE"
                                  ? "bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse"
                                  : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                              }`}
                            >
                              {t.isLive || t.status === "LIVE" ? (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                                  LIVE AUCTION
                                </>
                              ) : (
                                t.status
                              )}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-900 text-center">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                                Players
                              </span>
                              <span className="text-base font-bold text-white font-mono">
                                {t.playersCount}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                                Teams
                              </span>
                              <span className="text-base font-bold text-white font-mono">
                                {t.teamsCount}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                                Bids
                              </span>
                              <span className="text-base font-bold text-white font-mono">
                                {t.bidsCount}
                              </span>
                            </div>
                          </div>
                        </div>

                          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    t.registrationOpen ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                                  }`}
                                />
                                <span
                                  className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                                    t.registrationOpen
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                      : "bg-slate-800 text-slate-400 border-slate-700"
                                  }`}
                                >
                                  {t.registrationOpen ? "REGISTRATION OPEN" : "REGISTRATION CLOSED"}
                                </span>
                              </div>

                              <button
                                onClick={() => handleToggleRegistration(t)}
                                disabled={actionLoading.id === t.id && actionLoading.type === "toggle-registration"}
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                                  t.registrationOpen
                                    ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30"
                                    : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                }`}
                              >
                                {actionLoading.id === t.id && actionLoading.type === "toggle-registration"
                                  ? "Updating..."
                                  : t.registrationOpen
                                  ? "Close Reg."
                                  : "Open Reg."}
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                              <button
                                onClick={() => handleCopyRegistrationLink(t)}
                                className="bg-slate-800/90 hover:bg-slate-750 text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 py-1.5 px-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                                title="Copy registration link for this tournament"
                              >
                                <Icon icon="solar:copy-bold" className="text-xs" />
                                Copy Link
                              </button>

                              <Link
                                href={`/admin/registrations?tournamentId=${t.id}`}
                                className="bg-slate-800/90 hover:bg-slate-750 text-indigo-300 hover:text-indigo-200 border border-indigo-500/20 py-1.5 px-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all text-center"
                              >
                                <Icon icon="solar:users-group-rounded-bold" className="text-xs" />
                                View Players
                              </Link>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2">
                            <Link
                              href={`/admin?tournament=${t.slug}`}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/40"
                          >
                            <Icon icon="solar:gavel-bold" className="text-base" />
                            Open Auction Console
                          </Link>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleComplete(t)}
                              disabled={actionLoading.id === t.id}
                              className="bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 py-2 px-3 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Icon icon="solar:check-circle-bold" className="text-emerald-400" />
                              Mark Completed
                            </button>
                            <Link
                              href={`/admin/settings?tournamentId=${t.id}`}
                              className="bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 py-2 px-3 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Icon icon="solar:settings-bold" className="text-indigo-400" />
                              Settings
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* SECTION 2: COMPLETED TOURNAMENTS */}
            {(activeTab === "ALL" || activeTab === "COMPLETED") && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:check-circle-bold" className="text-emerald-400 text-xl" />
                  <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                    Completed Tournaments ({completedTournaments.length})
                  </h2>
                </div>

                {completedTournaments.length === 0 ? (
                  <div className="bg-slate-950/60 border border-slate-800/60 p-8 rounded-2xl text-center text-slate-500 text-sm">
                    No completed tournaments yet. When an auction concludes, mark it completed here.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedTournaments.map((t) => (
                      <div
                        key={t.id}
                        className="bg-slate-950/80 border border-emerald-500/20 hover:border-emerald-500/40 rounded-3xl p-6 backdrop-blur-xl shadow-xl transition-all flex flex-col justify-between space-y-5"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-white">{t.name}</h3>
                              <span className="text-xs text-slate-400 font-medium">
                                {t.season || "Season 1"} • ID: {t.id}
                              </span>
                            </div>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              COMPLETED
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-900 text-center">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                                Players
                              </span>
                              <span className="text-base font-bold text-white font-mono">
                                {t.playersCount}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                                Teams
                              </span>
                              <span className="text-base font-bold text-white font-mono">
                                {t.teamsCount}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                                Total Bids
                              </span>
                              <span className="text-base font-bold text-emerald-400 font-mono">
                                {t.bidsCount}
                              </span>
                            </div>
                          </div>
                        </div>

                          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-2.5 mb-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    t.registrationOpen ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                                  }`}
                                />
                                <span
                                  className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                                    t.registrationOpen
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                      : "bg-slate-800 text-slate-400 border-slate-700"
                                  }`}
                                >
                                  {t.registrationOpen ? "REGISTRATION OPEN" : "REGISTRATION CLOSED"}
                                </span>
                              </div>

                              <button
                                onClick={() => handleToggleRegistration(t)}
                                disabled={actionLoading.id === t.id && actionLoading.type === "toggle-registration"}
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                                  t.registrationOpen
                                    ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30"
                                    : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                }`}
                              >
                                {actionLoading.id === t.id && actionLoading.type === "toggle-registration"
                                  ? "Updating..."
                                  : t.registrationOpen
                                  ? "Close Reg."
                                  : "Open Reg."}
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                              <button
                                onClick={() => handleCopyRegistrationLink(t)}
                                className="bg-slate-800/90 hover:bg-slate-750 text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 py-1.5 px-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                                title="Copy registration link for this tournament"
                              >
                                <Icon icon="solar:copy-bold" className="text-xs" />
                                Copy Link
                              </button>

                              <Link
                                href={`/admin/registrations?tournamentId=${t.id}`}
                                className="bg-slate-800/90 hover:bg-slate-750 text-indigo-300 hover:text-indigo-200 border border-indigo-500/20 py-1.5 px-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all text-center"
                              >
                                <Icon icon="solar:users-group-rounded-bold" className="text-xs" />
                                View Players
                              </Link>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-2 pt-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Link
                              href={`/admin?tournament=${t.slug}`}
                              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-750 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center"
                            >
                              <Icon icon="solar:eye-bold" className="text-cyan-400" />
                              View
                            </Link>
                            <button
                              onClick={() => handleDownloadResults(t)}
                              disabled={actionLoading.id === t.id}
                              className="bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center"
                            >
                              <Icon icon="solar:file-download-bold" className="text-emerald-400" />
                              Results Excel
                            </button>
                          </div>

                          <button
                            onClick={() => handleDownloadPlayers(t)}
                            disabled={actionLoading.id === t.id}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Icon icon="solar:users-group-rounded-bold" className="text-indigo-400" />
                            Download Player Registration List
                          </button>

                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900">
                            <button
                              onClick={() => handleArchive(t)}
                              disabled={actionLoading.id === t.id}
                              className="bg-amber-950/30 hover:bg-amber-900/50 text-amber-300 border border-amber-800/40 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Icon icon="solar:archive-bold" className="text-amber-400" />
                              Archive
                            </button>

                            <button
                              onClick={() => openDeleteModal(t)}
                              className="bg-red-950/30 hover:bg-red-900/50 text-red-300 border border-red-800/40 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Icon icon="solar:trash-bin-trash-bold" className="text-red-400" />
                              Delete Permanently
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* SECTION 3: ARCHIVED TOURNAMENTS */}
            {(activeTab === "ALL" || activeTab === "ARCHIVED") && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:archive-bold" className="text-amber-400 text-xl" />
                  <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                    Archived Tournaments ({archivedTournaments.length})
                  </h2>
                </div>

                {archivedTournaments.length === 0 ? (
                  <div className="bg-slate-950/60 border border-slate-800/60 p-8 rounded-2xl text-center text-slate-500 text-sm">
                    No archived tournaments. Archived tournaments remain in storage but are kept separate from active lists.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {archivedTournaments.map((t) => (
                      <div
                        key={t.id}
                        className="bg-slate-950/90 border border-amber-500/20 hover:border-amber-500/40 rounded-3xl p-6 backdrop-blur-xl shadow-xl transition-all flex flex-col justify-between space-y-5"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-slate-200">{t.name}</h3>
                              <span className="text-xs text-slate-500 font-medium">
                                {t.season || "Season 1"} • ID: {t.id}
                              </span>
                            </div>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              ARCHIVED
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-900 text-center">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                                Players
                              </span>
                              <span className="text-base font-bold text-slate-300 font-mono">
                                {t.playersCount}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                                Teams
                              </span>
                              <span className="text-base font-bold text-slate-300 font-mono">
                                {t.teamsCount}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                                Bids
                              </span>
                              <span className="text-base font-bold text-slate-300 font-mono">
                                {t.bidsCount}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions for Archived */}
                        <div className="space-y-2 pt-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Link
                              href={`/admin?tournament=${t.slug}`}
                              className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center"
                            >
                              <Icon icon="solar:eye-bold" className="text-slate-400" />
                              View
                            </Link>
                            <button
                              onClick={() => handleDownloadResults(t)}
                              disabled={actionLoading.id === t.id}
                              className="bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-800 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center"
                            >
                              <Icon icon="solar:file-download-bold" className="text-emerald-400" />
                              Results
                            </button>
                          </div>

                          <button
                            onClick={() => handleDownloadPlayers(t)}
                            disabled={actionLoading.id === t.id}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Icon icon="solar:users-group-rounded-bold" className="text-indigo-400" />
                            Download Registrations
                          </button>

                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900">
                            <button
                              onClick={() => handleRestore(t)}
                              disabled={actionLoading.id === t.id}
                              className="bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Icon icon="solar:restart-bold" className="text-indigo-400" />
                              Restore
                            </button>

                            <button
                              onClick={() => openDeleteModal(t)}
                              className="bg-red-950/30 hover:bg-red-900/50 text-red-300 border border-red-800/40 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Icon icon="solar:trash-bin-trash-bold" className="text-red-400" />
                              Delete Permanently
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>

      {/* CREATE TOURNAMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                  <Icon icon="solar:cup-star-bold" className="text-xl" />
                </div>
                <h3 className="text-lg font-bold text-white">Create New Tournament</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Icon icon="lucide:x" className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleCreateTournament} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Tournament Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Satara Cricket League"
                  value={newTourneyForm.name}
                  onChange={(e) => setNewTourneyForm({ ...newTourneyForm, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Season
                </label>
                <input
                  type="text"
                  placeholder="e.g. Season 1 (2026)"
                  value={newTourneyForm.season}
                  onChange={(e) => setNewTourneyForm({ ...newTourneyForm, season: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-850 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-white block">Open Player Registration</span>
                  <span className="text-[11px] text-slate-400">Allow players to submit registrations via form</span>
                </div>
                <input
                  type="checkbox"
                  checked={newTourneyForm.registrationOpen}
                  onChange={(e) =>
                    setNewTourneyForm({ ...newTourneyForm, registrationOpen: e.target.checked })
                  }
                  className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading.type === "create"}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-950/40 disabled:opacity-50"
                >
                  {actionLoading.type === "create" ? (
                    <Icon icon="lucide:loader-2" className="animate-spin text-base" />
                  ) : (
                    <Icon icon="solar:check-circle-bold" className="text-base" />
                  )}
                  Create Tournament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PERMANENT DELETE CONFIRMATION MODAL WITH TYPED NAME VERIFICATION */}
      {deleteModalOpen && tournamentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-950 border border-red-600/40 rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl shadow-red-950/30">
            {/* Modal Header */}
            <div className="flex items-start gap-4 border-b border-red-500/20 pb-4">
              <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded-2xl flex-shrink-0 animate-bounce">
                <Icon icon="solar:shield-warning-bold" className="text-3xl" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span>DELETE TOURNAMENT PERMANENTLY</span>
                </h3>
                <p className="text-red-400 text-xs mt-1 font-semibold">
                  This action is irreversible and will permanently delete database records and files.
                </p>
              </div>
            </div>

            {/* Warning Message & Details */}
            <div className="space-y-4 text-xs text-slate-300">
              <p>
                Are you sure you want to permanently delete:{" "}
                <span className="font-extrabold text-white text-sm bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                  {tournamentToDelete.name}
                </span>{" "}
                (ID: {tournamentToDelete.id})?
              </p>

              <div className="bg-red-950/30 border border-red-900/40 rounded-2xl p-4 space-y-2">
                <span className="font-bold text-red-300 uppercase tracking-wider block text-[11px]">
                  The following data will be permanently destroyed:
                </span>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
                  <li>Tournament information & configuration</li>
                  <li>All {tournamentToDelete.playersCount} registered players</li>
                  <li>All player photos & files from server disk storage</li>
                  <li>All {tournamentToDelete.teamsCount} teams & franchise purses</li>
                  <li>All {tournamentToDelete.bidsCount} bids & real-time auction logs</li>
                  <li>All official auction results & history</li>
                  <li>Registration records & phone verification data</li>
                </ul>
              </div>

              <p className="text-slate-400 text-[11px] leading-relaxed">
                ⚠️ Other tournaments in your system will remain safe and completely unaffected.
              </p>

              {deleteError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs flex items-center gap-2">
                  <Icon icon="lucide:alert-circle" className="text-base flex-shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              {/* Requirement 6: Typed Confirmation Verification */}
              <div className="pt-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Type{" "}
                  <span className="text-cyan-400 font-mono select-all font-extrabold">
                    {tournamentToDelete.name}
                  </span>{" "}
                  to confirm deletion:
                </label>
                <input
                  type="text"
                  placeholder="Type the exact tournament name..."
                  value={typedConfirmName}
                  onChange={(e) => {
                    setTypedConfirmName(e.target.value);
                    setDeleteError("");
                  }}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={actionLoading.type === "delete"}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={
                  typedConfirmName.trim() !== tournamentToDelete.name.trim() ||
                  actionLoading.type === "delete"
                }
                className="bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-800 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-red-950/40 transition-all border border-red-500/40"
              >
                {actionLoading.type === "delete" ? (
                  <>
                    <Icon icon="lucide:loader-2" className="animate-spin text-base" />
                    <span>Deleting Tournament...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="solar:trash-bin-trash-bold" className="text-base" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
