import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { Icon } from "@iconify/react";

export default function AdminDashboard() {
  const [players, setPlayers] = useState<any[]>([]);
  const [teamForm, setTeamForm] = useState({ name: "", purse: "" });
  const [playerForm, setPlayerForm] = useState({
    name: "",
    basePrice: "",
    category: "Batsman",
    fromWhere: "",
  });
  const [loading, setLoading] = useState({ team: false, player: false, start: null as number | null });
  const [toast, setToast] = useState({ type: "", text: "", visible: false });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const res = await api.get("/players");
      setPlayers(res.data);
    } catch (e) {
      console.error("Failed to fetch players", e);
    }
  };

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
      fetchPlayers();
    } catch (error: any) {
      showToast(
        "error",
        error?.response?.data?.error || "Failed to add player. Ensure backend is running."
      );
    } finally {
      setLoading((p) => ({ ...p, player: false }));
    }
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

        {/* Auction Queue Section */}
        <section className="relative bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-500 group">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl">
                <Icon icon="lucide:list-ordered" className="text-2xl" />
              </div>
              <h2 className="text-3xl font-semibold text-white/90">Auction Queue</h2>
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
                  <th className="pb-4 font-medium px-4">Name</th>
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
                      <td className="py-4 font-medium px-4">{player.name}</td>
                      <td className="py-4 text-zinc-400 px-4">{player.category}</td>
                      <td className="py-4 text-right tabular-nums text-zinc-300 px-4">{player.basePrice.toLocaleString()} pts</td>
                      <td className="py-4 text-center px-4">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${player.sold ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                          {player.sold ? (player.teamId ? 'Sold' : 'Unsold') : 'Available'}
                        </span>
                      </td>
                      <td className="py-4 text-right px-4">
                        {!player.sold && (
                          <button 
                            disabled={loading.start === player.id}
                            onClick={() => handleStartAuction(player.id)}
                            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow-lg shadow-cyan-900/20"
                          >
                            {loading.start === player.id ? "..." : "Bring to Auction"}
                          </button>
                        )}
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
