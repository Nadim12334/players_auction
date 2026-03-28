"use client";

import { useState } from "react";
import { api } from "../../services/api";
import { Icon } from "@iconify/react";

export default function AdminDashboard() {
  const [teamForm, setTeamForm] = useState({ name: "", purse: "" });
  const [playerForm, setPlayerForm] = useState({
    name: "",
    basePrice: "",
    category: "Batsman",
    fromWhere: "",
  });
  const [loading, setLoading] = useState({ team: false, player: false });
  const [toast, setToast] = useState({ type: "", text: "", visible: false });

  const showToast = (type: "error" | "success", text: string) => {
    setToast({ type, text, visible: true });
    setTimeout(() => setToast({ type: "", text: "", visible: false }), 4000);
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((p) => ({ ...p, team: true }));
    try {
      await api.post("/teams", {
        name: teamForm.name,
        purse: Number(teamForm.purse),
      });
      showToast("success", `Franchise "${teamForm.name}" added successfully!`);
      setTeamForm({ name: "", purse: "" });
    } catch (error: any) {
      showToast(
        "error",
        error?.response?.data?.error || "Failed to add franchise. Ensure backend is running."
      );
    } finally {
      setLoading((p) => ({ ...p, team: false }));
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((p) => ({ ...p, player: true }));
    try {
      await api.post("/players", {
        name: playerForm.name,
        basePrice: Number(playerForm.basePrice),
        category: playerForm.category,
        fromWhere: playerForm.fromWhere || undefined,
      });
      showToast("success", `Player "${playerForm.name}" added successfully!`);
      setPlayerForm({ name: "", basePrice: "", category: "Batsman", fromWhere: "" });
    } catch (error: any) {
      showToast(
        "error",
        error?.response?.data?.error || "Failed to add player. Ensure backend is running."
      );
    } finally {
      setLoading((p) => ({ ...p, player: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1015] text-white p-8 font-sans selection:bg-purple-500/30">
      
      {/* Dynamic Toast Notification */}
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

      <header className="mb-12 text-center mt-8">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Auction Setup
        </h1>
        <p className="text-zinc-400 mt-3 text-lg font-medium tracking-wide">
          Manage your players and franchises for the upcoming auction
        </p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

        {/* Add Franchise Card */}
        <section className="relative bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden hover:border-purple-500/30 transition-colors duration-500 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 -mr-16 -mt-16 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
          
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Icon icon="lucide:shield" className="text-2xl" />
            </div>
            <h2 className="text-3xl font-semibold text-white/90">Add Franchise</h2>
          </div>

          <form onSubmit={handleAddTeam} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Franchise Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Chennai Super Kings"
                value={teamForm.name}
                onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-white placeholder-zinc-600"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Total Purse Limit</label>
              <div className="relative">
                <Icon icon="lucide:indian-rupee" className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  required
                  type="number"
                  placeholder="e.g. 10000000"
                  value={teamForm.purse}
                  onChange={(e) => setTeamForm({ ...teamForm, purse: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-white placeholder-zinc-600"
                />
              </div>
            </div>

            <button
              disabled={loading.team}
              type="submit"
              className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold tracking-wide shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:pointer-events-none mt-4"
            >
              {loading.team ? (
                <Icon icon="lucide:loader-2" className="animate-spin text-xl" />
              ) : (
                <>
                  <Icon icon="lucide:plus" className="text-xl group-hover/btn:scale-110 transition-transform" />
                  Create Franchise
                </>
              )}
            </button>
          </form>
        </section>

        {/* Add Player Card */}
        <section className="relative bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden hover:border-pink-500/30 transition-colors duration-500 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 -mr-16 -mt-16 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-all" />

          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-pink-500/20 text-pink-400 rounded-xl">
              <Icon icon="lucide:user" className="text-2xl" />
            </div>
            <h2 className="text-3xl font-semibold text-white/90">Add Player</h2>
          </div>

          <form onSubmit={handleAddPlayer} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">Player Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Virat Kohli"
                  value={playerForm.name}
                  onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all text-white placeholder-zinc-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">Base Price</label>
                <div className="relative">
                  <Icon icon="lucide:indian-rupee" className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    required
                    type="number"
                    placeholder="2000000"
                    value={playerForm.basePrice}
                    onChange={(e) => setPlayerForm({ ...playerForm, basePrice: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all text-white placeholder-zinc-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">Category</label>
                <div className="relative">
                  <select
                    value={playerForm.category}
                    onChange={(e) => setPlayerForm({ ...playerForm, category: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all text-white appearance-none cursor-pointer"
                  >
                    <option value="Batsman" className="text-black">Batsman</option>
                    <option value="Bowler" className="text-black">Bowler</option>
                    <option value="All-Rounder" className="text-black">All-Rounder</option>
                    <option value="Wicket Keeper" className="text-black">Wicket Keeper</option>
                  </select>
                  <Icon icon="lucide:chevron-down" className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">From Where / Nationality (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. India, Australia"
                  value={playerForm.fromWhere}
                  onChange={(e) => setPlayerForm({ ...playerForm, fromWhere: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all text-white placeholder-zinc-600"
                />
              </div>
            </div>

            <button
              disabled={loading.player}
              type="submit"
              className="w-full py-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-semibold tracking-wide shadow-[0_0_20px_rgba(219,39,119,0.3)] hover:shadow-[0_0_25px_rgba(219,39,119,0.5)] transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:pointer-events-none mt-4"
            >
              {loading.player ? (
                <Icon icon="lucide:loader-2" className="animate-spin text-xl" />
              ) : (
                <>
                  <Icon icon="lucide:plus" className="text-xl group-hover/btn:scale-110 transition-transform" />
                  Add Player
                </>
              )}
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}
