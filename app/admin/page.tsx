"use client";

import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { Icon } from "@iconify/react";

export default function AdminDashboard() {
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [teamForm, setTeamForm] = useState({ name: "", purse: "", logo: "" });
  const [playerForm, setPlayerForm] = useState({
    name: "",
    basePrice: "",
    category: "Batsman",
    fromWhere: "",
    photo: "",
    phoneNumber: "",
  });
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [loading, setLoading] = useState({ team: false, player: false, start: null as number | null });
  const [toast, setToast] = useState({ type: "", text: "", visible: false });

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, []);

  const fetchPlayers = async () => {
    try {
      const res = await api.get("/players");
      setPlayers(res.data);
    } catch (e) {
      console.error("Failed to fetch players", e);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await api.get("/teams");
      setTeams(res.data);
    } catch (e) {
      console.error("Failed to fetch teams", e);
    }
  };

  const showToast = (type: "error" | "success", text: string) => {
    setToast({ type, text, visible: true });
    setTimeout(() => setToast({ type: "", text: "", visible: false }), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setForm: Function, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev: any) => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.logo) {
      showToast("error", "Franchise logo is required");
      return;
    }
    setLoading((p) => ({ ...p, team: true }));
    try {
      if (editingTeamId) {
        await api.put(`/teams/${editingTeamId}`, {
          name: teamForm.name,
          purse: Number(teamForm.purse),
          logo: teamForm.logo,
        });
        showToast("success", `Franchise "${teamForm.name}" updated successfully!`);
      } else {
        await api.post("/teams", {
          name: teamForm.name,
          purse: Number(teamForm.purse),
          logo: teamForm.logo,
        });
        showToast("success", `Franchise "${teamForm.name}" added successfully!`);
      }
      setTeamForm({ name: "", purse: "", logo: "" });
      setEditingTeamId(null);
      // Reset file input
      const fileInput = document.getElementById("team-logo-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      fetchTeams();
    } catch (error: any) {
      showToast(
        "error",
        error?.response?.data?.error || "Failed to save franchise."
      );
    } finally {
      setLoading((p) => ({ ...p, team: false }));
    }
  };

  const handleDeleteTeam = async (id: number) => {
    if (!confirm("Are you sure you want to delete this franchise?")) return;
    try {
      await api.delete(`/teams/${id}`);
      showToast("success", "Franchise deleted!");
      fetchTeams();
    } catch (error) {
      showToast("error", "Failed to delete franchise");
    }
  };

  const handleEditTeam = (team: any) => {
    setEditingTeamId(team.id);
    setTeamForm({
      name: team.name,
      purse: team.purse.toString(),
      logo: team.logo,
    });
    // Jump to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerForm.photo) {
      showToast("error", "Player photo is required");
      return;
    }
    setLoading((p) => ({ ...p, player: true }));
    try {
      const payload = {
        name: playerForm.name,
        basePrice: Number(playerForm.basePrice),
        category: playerForm.category,
        fromWhere: playerForm.fromWhere,
        photo: playerForm.photo,
        phoneNumber: playerForm.phoneNumber,
      };

      if (editingPlayerId) {
        await api.put(`/players/${editingPlayerId}`, payload);
        showToast("success", `Player "${playerForm.name}" updated successfully!`);
      } else {
        await api.post("/players", payload);
        showToast("success", `Player "${playerForm.name}" added successfully!`);
      }
      
      setPlayerForm({ name: "", basePrice: "", category: "Batsman", fromWhere: "", photo: "", phoneNumber: "" });
      setEditingPlayerId(null);
      // Reset file input
      const fileInput = document.getElementById("player-photo-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      fetchPlayers();
    } catch (error: any) {
      showToast(
        "error",
        error?.response?.data?.error || "Failed to save player."
      );
    } finally {
      setLoading((p) => ({ ...p, player: false }));
    }
  };

  const handleDeletePlayer = async (id: number) => {
    if (!confirm("Are you sure you want to delete this player?")) return;
    try {
      await api.delete(`/players/${id}`);
      showToast("success", "Player deleted!");
      fetchPlayers();
    } catch (error) {
      showToast("error", "Failed to delete player");
    }
  };

  const handleEditPlayer = (player: any) => {
    setEditingPlayerId(player.id);
    setPlayerForm({
      name: player.name,
      basePrice: player.basePrice.toString(),
      category: player.category,
      fromWhere: player.fromWhere,
      photo: player.photo,
      phoneNumber: player.phoneNumber,
    });
    // Jump to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartAuction = async (playerId: number) => {
    setLoading(p => ({ ...p, start: playerId }));
    try {
      await api.post(`/admin/auction/start/${playerId}`);
      showToast("success", "Auction started!");
    } catch (error: any) {
      showToast("error", "Failed to start auction");
    } finally {
      setLoading(p => ({ ...p, start: null }));
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
              <label className="text-sm font-medium text-zinc-400 ml-1">Total Points Limit</label>
              <div className="relative">
                <Icon icon="lucide:coins" className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  required
                  type="number"
                  placeholder="e.g. 1000"
                  value={teamForm.purse}
                  onChange={(e) => setTeamForm({ ...teamForm, purse: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-white placeholder-zinc-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Franchise Logo</label>
              <div className="relative">
                <Icon icon="lucide:image" className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="team-logo-input"
                  required
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setTeamForm, "logo")}
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                />
              </div>
              {teamForm.logo && <div className="mt-2 text-[10px] text-zinc-500 truncate">{teamForm.name} Logo Selected</div>}
            </div>

            <button
              disabled={loading.team}
              type="submit"
              className={`w-full py-4 rounded-xl font-semibold tracking-wide transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:pointer-events-none mt-4 ${
                editingTeamId 
                ? "bg-amber-600 hover:bg-amber-500 shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_25px_rgba(217,119,6,0.5)]" 
                : "bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
              }`}
            >
              {loading.team ? (
                <Icon icon="lucide:loader-2" className="animate-spin text-xl" />
              ) : (
                <>
                  <Icon icon={editingTeamId ? "lucide:save" : "lucide:plus"} className="text-xl group-hover/btn:scale-110 transition-transform" />
                  {editingTeamId ? "Update Franchise" : "Create Franchise"}
                </>
              )}
            </button>
            {editingTeamId && (
              <button
                type="button"
                onClick={() => { setEditingTeamId(null); setTeamForm({ name: "", purse: "", logo: "" }); }}
                className="w-full py-2 text-sm text-zinc-500 hover:text-white transition-colors"
              >
                Cancel Edit
              </button>
            )}
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
                <label className="text-sm font-medium text-zinc-400 ml-1">Base Price (Points)</label>
                <div className="relative">
                  <Icon icon="lucide:coins" className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    required
                    type="number"
                    placeholder="20"
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
                <label className="text-sm font-medium text-zinc-400 ml-1">From Where / Nationality</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. India, Australia"
                  value={playerForm.fromWhere}
                  onChange={(e) => setPlayerForm({ ...playerForm, fromWhere: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all text-white placeholder-zinc-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">Player Photo</label>
                <div className="relative">
                  <Icon icon="lucide:image" className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    id="player-photo-input"
                    required
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setPlayerForm, "photo")}
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all text-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-500 cursor-pointer"
                  />
                </div>
                {playerForm.photo && <div className="mt-2 text-[10px] text-zinc-500 truncate">{playerForm.name} Photo Selected</div>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">Phone Number</label>
                <div className="relative">
                  <Icon icon="lucide:phone" className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    required
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={playerForm.phoneNumber}
                    onChange={(e) => setPlayerForm({ ...playerForm, phoneNumber: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all text-white placeholder-zinc-600"
                  />
                </div>
              </div>
            </div>

            <button
              disabled={loading.player}
              type="submit"
              className={`w-full py-4 rounded-xl font-semibold tracking-wide transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:pointer-events-none mt-4 ${
                editingPlayerId 
                ? "bg-amber-600 hover:bg-amber-500 shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_25px_rgba(217,119,6,0.5)]" 
                : "bg-pink-600 hover:bg-pink-500 shadow-[0_0_20px_rgba(219,39,119,0.3)] hover:shadow-[0_0_25px_rgba(219,39,119,0.5)]"
              }`}
            >
              {loading.player ? (
                <Icon icon="lucide:loader-2" className="animate-spin text-xl" />
              ) : (
                <>
                  <Icon icon={editingPlayerId ? "lucide:save" : "lucide:plus"} className="text-xl group-hover/btn:scale-110 transition-transform" />
                  {editingPlayerId ? "Update Player" : "Add Player"}
                </>
              )}
            </button>
            {editingPlayerId && (
              <button
                type="button"
                onClick={() => { setEditingPlayerId(null); setPlayerForm({ name: "", basePrice: "", category: "Batsman", fromWhere: "", photo: "", phoneNumber: "" }); }}
                className="w-full py-2 text-sm text-zinc-500 hover:text-white transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </form>
          </section>
        </div>

        {/* Manage Franchises Section */}
        <section className="relative bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-500 group lg:col-span-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
                <Icon icon="lucide:shield" className="text-2xl" />
              </div>
              <h2 className="text-3xl font-semibold text-white/90">Manage Franchises</h2>
            </div>
            <button 
              onClick={fetchTeams}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <Icon icon="lucide:refresh-cw" className="text-sm" /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.length === 0 ? (
              <div className="col-span-full py-12 text-center text-zinc-600">No franchises found.</div>
            ) : (
              teams.map((team) => (
                <div key={team.id} className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-indigo-500/50 transition-all">
                  <div className="flex items-center gap-4">
                    <img src={team.logo} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt="" />
                    <div>
                      <h3 className="font-semibold text-white">{team.name}</h3>
                      <p className="text-xs text-zinc-500">{team.purse.toLocaleString()} pts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditTeam(team)}
                      className="p-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg transition-all"
                    >
                      <Icon icon="lucide:edit-3" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTeam(team.id)}
                      className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                    >
                      <Icon icon="lucide:trash-2" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Auction Queue Section */}
        <section className="relative bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-500 group lg:col-span-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl">
                <Icon icon="lucide:list-ordered" className="text-2xl" />
              </div>
              <h2 className="text-3xl font-semibold text-white/90">Auction Queue / Manage Players</h2>
            </div>
            <button 
              onClick={fetchPlayers}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <Icon icon="lucide:refresh-cw" className="text-sm" /> Refresh List
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left text-zinc-500 text-sm border-b border-white/5">
                  <th className="pb-4 font-medium px-4">Player</th>
                  <th className="pb-4 font-medium px-4">Category</th>
                  <th className="pb-4 font-medium text-right px-4">Base Price</th>
                  <th className="pb-4 font-medium text-center px-4">Status</th>
                  <th className="pb-4 font-medium text-right px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {players.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-zinc-600">No players found. Add some above!</td></tr>
                ) : (
                  players.map((player) => (
                    <tr key={player.id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img src={player.photo} className="w-8 h-8 rounded-full object-cover border border-white/5" alt="" />
                          <span className="font-medium">{player.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-zinc-400 px-4">{player.category}</td>
                      <td className="py-4 text-right tabular-nums text-zinc-300 px-4">{player.basePrice.toLocaleString()} pts</td>
                      <td className="py-4 text-center px-4">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${player.sold ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                          {player.sold ? (player.teamId ? 'Sold' : 'Unsold') : 'Available'}
                        </span>
                      </td>
                      <td className="py-4 text-right px-4">
                         <div className="flex items-center justify-end gap-2">
                            {!player.sold && (
                                <button 
                                    disabled={loading.start === player.id}
                                    onClick={() => handleStartAuction(player.id)}
                                    className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-lg shadow-cyan-900/20"
                                >
                                    {loading.start === player.id ? "..." : "Auction"}
                                </button>
                            )}
                            <button 
                                onClick={() => handleEditPlayer(player)}
                                className="p-1 px-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg transition-all text-xs flex items-center gap-1"
                            >
                                <Icon icon="lucide:edit-3" /> Edit
                            </button>
                            <button 
                                onClick={() => handleDeletePlayer(player.id)}
                                className="p-1 px-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all text-xs flex items-center gap-1"
                            >
                                <Icon icon="lucide:trash-2" /> Delete
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    );
}
