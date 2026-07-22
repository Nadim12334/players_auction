"use client";

import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { socket } from "../../services/socket";
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
  const [loading, setLoading] = useState({ team: false, player: false, start: null as number | null, action: false });
  const [toast, setToast] = useState({ type: "", text: "", visible: false });

  // Live Controller States
  const [activeState, setActiveState] = useState<any>({ currentPlayerId: null, status: "IDLE" });
  const [activePlayer, setActivePlayer] = useState<any>(null);
  const [selectedBidTeamId, setSelectedBidTeamId] = useState<number | "">("");
  const [customBidAmount, setCustomBidAmount] = useState<string>("");

  // Bulk Player Import States
  const [importFile, setImportFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importSummary, setImportSummary] = useState<any>(null);

  // Inline Base Price Edit States
  const [editingPlayerBasePriceId, setEditingPlayerBasePriceId] = useState<number | null>(null);
  const [editingBasePrice, setEditingBasePrice] = useState<string>("");

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
    fetchActiveState();

    // Socket listeners for real-time dashboard sync
    socket.on("auctionStateUpdate", (state) => {
      console.log("Admin received state update:", state);
      setActiveState(state);
      fetchActiveStateData(state.currentPlayerId);
      fetchPlayers();
      fetchTeams();
    });

    socket.on("newBid", () => {
      fetchActiveState();
      fetchPlayers();
      fetchTeams();
    });

    return () => {
      socket.off("auctionStateUpdate");
      socket.off("newBid");
    };
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

  const fetchActiveState = async () => {
    try {
      const res = await api.get("/auction/state");
      setActiveState(res.data);
      fetchActiveStateData(res.data.currentPlayerId);
    } catch (e) {
      console.error("Failed to fetch auction state", e);
    }
  };

  const fetchActiveStateData = async (currentPlayerId: number | null) => {
    if (!currentPlayerId) {
      setActivePlayer(null);
      return;
    }
    try {
      const playersRes = await api.get("/players");
      const current = playersRes.data.find((p: any) => p.id === currentPlayerId);
      setActivePlayer(current || null);
    } catch (e) {
      console.error("Failed to fetch active player details", e);
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
      const fileInput = document.getElementById("team-logo-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      fetchTeams();
    } catch (error: any) {
      showToast("error", error?.response?.data?.error || "Failed to save franchise.");
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
    window.scrollTo({ top: 300, behavior: 'smooth' });
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
      const fileInput = document.getElementById("player-photo-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      fetchPlayers();
    } catch (error: any) {
      showToast("error", error?.response?.data?.error || "Failed to save player.");
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
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleImportSubmit = async () => {
    if (!importFile) return;
    setUploading(true);
    setUploadProgress(10);
    const formData = new FormData();
    formData.append("file", importFile);

    // Simulate progress bar movement
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 10;
      });
    }, 100);

    try {
      const res = await api.post("/admin/players/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        setUploading(false);
        setImportSummary(res.data);
        setImportFile(null);
        showToast("success", "Players imported successfully!");
        fetchPlayers();
      }, 500);
    } catch (err: any) {
      clearInterval(interval);
      setUploading(false);
      showToast("error", err?.response?.data?.error || "Import failed.");
    }
  };

  const handleSaveInlineBasePrice = async (player: any) => {
    try {
      const parsedPrice = Number(editingBasePrice);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        showToast("error", "Please enter a valid base price.");
        return;
      }
      await api.put(`/players/${player.id}`, {
        name: player.name,
        basePrice: parsedPrice,
        category: player.category,
        fromWhere: player.fromWhere,
        photo: player.photo || "",
        phoneNumber: player.phoneNumber || "",
      });
      showToast("success", `Base price updated for ${player.name}`);
      setEditingPlayerBasePriceId(null);
      fetchPlayers();
    } catch (error: any) {
      showToast("error", error?.response?.data?.error || "Failed to update base price.");
    }
  };

  // Live Controller Functions
  const handleStartAuction = async (playerId: number) => {
    setLoading(p => ({ ...p, start: playerId }));
    try {
      await api.post(`/admin/auction/start/${playerId}`);
      showToast("success", "Auction started successfully!");
      fetchActiveState();
    } catch (error: any) {
      showToast("error", "Failed to start auction");
    } finally {
      setLoading(p => ({ ...p, start: null }));
    }
  };

  const handleAdminPlaceBid = async (increment?: number) => {
    if (!activePlayer) return;
    if (!selectedBidTeamId) {
      showToast("error", "Please select a franchise to place bid!");
      return;
    }

    setLoading(p => ({ ...p, action: true }));
    let amount = 0;
    if (increment) {
      const currentPrice = activePlayer.currentBid || activePlayer.basePrice;
      amount = currentPrice + increment;
    } else {
      amount = Number(customBidAmount);
      if (!amount || isNaN(amount)) {
        showToast("error", "Please enter a valid bid amount");
        setLoading(p => ({ ...p, action: false }));
        return;
      }
    }

    const selectedTeam = teams.find(t => t.id === Number(selectedBidTeamId));
    if (selectedTeam) {
      const MIN_PLAYERS_REQUIRED = 8;
      const MIN_BASE_PRICE = 500;
      const purchasedCount = selectedTeam.players?.filter((p: any) => p.sold).length || 0;
      const requiredPlayersCount = Math.max(0, MIN_PLAYERS_REQUIRED - purchasedCount);
      const isLeading = activePlayer && activePlayer.teamId === selectedTeam.id;
      const effectivePurse = isLeading && activePlayer.currentBid !== null
          ? selectedTeam.purse + activePlayer.currentBid
          : selectedTeam.purse;
      const maxAvailableBid = effectivePurse - (requiredPlayersCount * MIN_BASE_PRICE);

      if (amount > maxAvailableBid) {
        showToast("error", `This team cannot bid more than ₹${maxAvailableBid.toLocaleString()}.`);
        setLoading(p => ({ ...p, action: false }));
        return;
      }
    }

    try {
      await api.post("/auction/bid", {
        playerId: activePlayer.id,
        teamId: Number(selectedBidTeamId),
        amount: amount
      });
      showToast("success", "Bid placed successfully!");
      setCustomBidAmount("");
      // Refresh local state immediately
      fetchActiveState();
      fetchPlayers();
      fetchTeams();
    } catch (error: any) {
      showToast("error", error?.response?.data?.message || error.message);
    } finally {
      setLoading(p => ({ ...p, action: false }));
    }
  };

  const handleSellPlayer = async () => {
    if (!activePlayer) return;
    if (!activePlayer.teamId) {
      showToast("error", "Cannot sell without any bids!");
      return;
    }

    setLoading(p => ({ ...p, action: true }));
    try {
      await api.post(`/admin/auction/sell/${activePlayer.id}`);
      const winner = teams.find(t => t.id === activePlayer.teamId)?.name;
      showToast("success", `Player SOLD to ${winner}!`);
      // Refresh local state immediately
      fetchActiveState();
      fetchPlayers();
      fetchTeams();
    } catch (error: any) {
      showToast("error", error?.response?.data?.message || error.message);
    } finally {
      setLoading(p => ({ ...p, action: false }));
    }
  };

  const handleMarkUnsold = async () => {
    if (!activePlayer) return;
    setLoading(p => ({ ...p, action: true }));
    try {
      await api.post(`/admin/auction/unsold/${activePlayer.id}`);
      showToast("success", "Player marked as UNSOLD!");
      // Refresh local state immediately
      fetchActiveState();
      fetchPlayers();
      fetchTeams();
    } catch (error: any) {
      showToast("error", error?.response?.data?.message || error.message);
    } finally {
      setLoading(p => ({ ...p, action: false }));
    }
  };

  const handleNextPlayer = async () => {
    setLoading(p => ({ ...p, action: true }));
    try {
      const res = await api.post("/admin/auction/next");
      if (res.data.player) {
        showToast("success", `Next player loaded: ${res.data.player.name}`);
        setSelectedBidTeamId("");
      } else {
        showToast("success", "No more unsold players left!");
      }
      // Refresh local state immediately
      fetchActiveState();
      fetchPlayers();
      fetchTeams();
    } catch (error: any) {
      showToast("error", error?.response?.data?.message || error.message);
    } finally {
      setLoading(p => ({ ...p, action: false }));
    }
  };

  const activeLeadingTeam = teams.find(t => t.id === activePlayer?.teamId);
  const BID_INCREMENTS = [500, 1000, 2000, 3000, 4000, 5000];

  const selectedBidTeam = teams.find(t => t.id === Number(selectedBidTeamId));
  let selectedBidTeamMaxBid = 0;
  if (selectedBidTeam) {
    const MIN_PLAYERS_REQUIRED = 8;
    const MIN_BASE_PRICE = 500;
    const purchasedCount = selectedBidTeam.players?.filter((p: any) => p.sold).length || 0;
    const requiredPlayersCount = Math.max(0, MIN_PLAYERS_REQUIRED - purchasedCount);
    const isLeading = activePlayer && activePlayer.teamId === selectedBidTeam.id;
    const effectivePurse = isLeading && activePlayer.currentBid !== null
        ? selectedBidTeam.purse + activePlayer.currentBid
        : selectedBidTeam.purse;
    selectedBidTeamMaxBid = Math.max(0, effectivePurse - (requiredPlayersCount * MIN_BASE_PRICE));
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-white p-6 md:p-12 font-sans selection:bg-purple-500/30">

      {/* Dynamic Toast Notification */}
      <div
        className={`fixed top-6 right-6 z-50 transition-all duration-300 transform ${toast.visible ? "translate-x-0 opacity-100" : "translate-x-[200%] opacity-0"
          }`}
      >
        <div
          className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border ${toast.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
        >
          <Icon icon={toast.type === "success" ? "lucide:check-circle" : "lucide:alert-circle"} className="text-xl" />
          <p className="font-medium tracking-wide">{toast.text}</p>
        </div>
      </div>

      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Titan Megapool Control Center
        </h1>
        <p className="text-zinc-400 mt-2 text-md font-medium tracking-wider">
          Manage local tournament configuration and operate real-time manual auction dashboard.
        </p>
      </header>

      <div className="max-w-7xl mx-auto space-y-8 relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

        {/* ========================================================= */}
        {/* LIVE AUCTION MONITOR & CONTROLLER PANEL                   */}
        {/* ========================================================= */}
        <section className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800/80 p-8 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800/60">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl animate-pulse">
              <Icon icon="solar:gavel-bold" className="text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white uppercase">Live Auction Operator Dashboard</h2>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mt-0.5">Control the tournament projector live feed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Box: Active Player Stats */}
            <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800/50 p-6 rounded-2xl flex flex-col justify-between gap-6 min-h-[300px]">
              {activePlayer ? (
                <div className="flex gap-4 items-start">
                  <div className="w-24 h-24 rounded-xl border border-slate-800 overflow-hidden bg-slate-900 flex-shrink-0">
                    <img src={activePlayer.photo || "https://images.unsplash.com/photo-1624194686522-83788533d11b?q=80&w=800&auto=format&fit=crop"} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${activeState.status === "BIDDING" ? 'bg-cyan-500/10 text-cyan-400' :
                        activeState.status === "SOLD" ? 'bg-emerald-500/10 text-emerald-400' :
                          activeState.status === "UNSOLD" ? 'bg-red-500/10 text-red-400' :
                            'bg-amber-500/10 text-amber-400'
                        }`}>
                        {activeState.status}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">ID: #{activePlayer.id}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white truncate uppercase">{activePlayer.name}</h3>
                    <p className="text-xs font-semibold text-indigo-400">{activePlayer.category} • {activePlayer.fromWhere || "Local"}</p>
                    <p className="text-xs text-slate-500">Base Price: {activePlayer.basePrice} pts</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-600 gap-2">
                  <Icon icon="solar:user-bold-duotone" className="text-4xl opacity-30" />
                  <p className="text-xs font-semibold uppercase tracking-widest">No Active Player Loaded</p>
                  <p className="text-[10px] text-slate-500 max-w-[200px]">Click "Next Player" at right to fetch the first player from queue</p>
                </div>
              )}

              {activePlayer && (
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-slate-500 block font-bold">Leading Bidder</span>
                    <span className="text-sm font-extrabold text-white truncate max-w-[150px] inline-block">
                      {activeLeadingTeam ? activeLeadingTeam.name : "--- No Bids ---"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-widest text-slate-500 block font-bold">Current Bid Price</span>
                    <span className="text-xl font-black text-cyan-400 font-mono">
                      {(activePlayer.currentBid || activePlayer.basePrice).toLocaleString()} pts
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Middle Box: Place Manual Bid */}
            <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800/50 p-6 rounded-2xl flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block">Conduct Bidding</span>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Bidding Franchise</label>
                  <select
                    value={selectedBidTeamId}
                    disabled={!activePlayer || activeState.status !== "BIDDING"}
                    onChange={(e) => setSelectedBidTeamId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full bg-slate-900 border border-slate-850 text-white rounded-xl p-3 focus:outline-none focus:border-cyan-500 text-sm appearance-none cursor-pointer"
                  >
                    <option value="">-- Choose Leading Team --</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} (Purse: {t.purse} pts)</option>
                    ))}
                  </select>
                </div>

                {selectedBidTeam && (
                  <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-3 text-xs space-y-1.5 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Remaining Purse</span>
                      <span className="font-mono font-bold text-white">₹{selectedBidTeam.purse.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Maximum Available Bid</span>
                      <span className="font-mono font-bold text-amber-400">₹{selectedBidTeamMaxBid.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Custom Increment Amount</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="e.g. 750"
                      disabled={!activePlayer || activeState.status !== "BIDDING"}
                      value={customBidAmount}
                      onChange={(e) => setCustomBidAmount(e.target.value)}
                      className="bg-slate-900 border border-slate-850 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500 flex-1 font-mono text-white placeholder-slate-600"
                    />
                    <button
                      onClick={() => handleAdminPlaceBid()}
                      disabled={loading.action || !activePlayer || activeState.status !== "BIDDING"}
                      className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider disabled:opacity-30"
                    >
                      Place Bid
                    </button>
                  </div>
                </div>
              </div>

              {activePlayer && activeState.status === "BIDDING" && (
                <div className="grid grid-cols-3 gap-2 mt-auto">
                  {BID_INCREMENTS.map((inc) => (
                    <button
                      key={inc}
                      onClick={() => handleAdminPlaceBid(inc)}
                      disabled={loading.action}
                      className="bg-slate-900 hover:bg-indigo-600 text-white hover:text-slate-950 border border-slate-800 hover:border-indigo-500 p-3 rounded-xl text-xs font-bold transition-all disabled:opacity-30"
                    >
                      +₹{inc.toLocaleString()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Box: Live Flow Action Controls */}
            <div className="lg:col-span-3 bg-slate-950/80 border border-slate-800/50 p-6 rounded-2xl flex flex-col justify-center gap-3">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest block mb-1">State Actions</span>

              {/* Start Bidding Button */}
              <button
                onClick={() => handleStartAuction(activePlayer.id)}
                disabled={loading.action || !activePlayer || activeState.status !== "IDLE"}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:pointer-events-none text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Icon icon="solar:gavel-bold" className="text-base" />
                Start Bidding
              </button>

              <div className="grid grid-cols-2 gap-2">
                {/* Sell Player Button */}
                <button
                  onClick={handleSellPlayer}
                  disabled={loading.action || !activePlayer || !activePlayer.teamId || activeState.status !== "BIDDING"}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:pointer-events-none text-slate-950 font-bold py-3 px-2 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-lg shadow-emerald-950/20"
                >
                  <Icon icon="solar:check-circle-bold" className="text-sm" />
                  Sell Player
                </button>

                {/* Mark Unsold Button */}
                <button
                  onClick={handleMarkUnsold}
                  disabled={loading.action || !activePlayer || activeState.status !== "BIDDING"}
                  className="bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:pointer-events-none text-white font-bold py-3 px-2 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-lg shadow-red-950/20"
                >
                  <Icon icon="solar:close-circle-bold" className="text-sm" />
                  Unsold
                </button>
              </div>

              {/* Next Player Button */}
              <button
                onClick={handleNextPlayer}
                disabled={loading.action || (activePlayer && activeState.status === "BIDDING")}
                className="w-full bg-slate-900 hover:bg-slate-850 disabled:opacity-30 border border-slate-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Icon icon="solar:round-alt-arrow-right-bold" className="text-base" />
                Next Player
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SETUP FORMS (Add Franchise and Add Player)                */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Franchise Card */}
          <section className="relative bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden hover:border-purple-500/30 transition-colors duration-500 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 -mr-16 -mt-16 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />

            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
                <Icon icon="lucide:shield" className="text-2xl" />
              </div>
              <h2 className="text-3xl font-semibold text-white/90">{editingTeamId ? "Edit Franchise" : "Add Franchise"}</h2>
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
                <label className="text-sm font-medium text-zinc-400 ml-1">Purse Balance Limit (Points)</label>
                <div className="relative">
                  <Icon icon="lucide:coins" className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    required
                    type="number"
                    placeholder="e.g. 10000"
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
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setTeamForm, "logo")}
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                  />
                </div>
                {teamForm.logo && <div className="mt-2 text-[10px] text-zinc-500 truncate">Logo Selected</div>}
              </div>

              <button
                disabled={loading.team}
                type="submit"
                className={`w-full py-4 rounded-xl font-semibold tracking-wide transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:pointer-events-none mt-4 ${editingTeamId
                  ? "bg-amber-600 hover:bg-amber-500 shadow-[0_0_20px_rgba(217,119,6,0.3)]"
                  : "bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
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
              <h2 className="text-3xl font-semibold text-white/90">{editingPlayerId ? "Edit Player" : "Add Player"}</h2>
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
                  <label className="text-sm font-medium text-zinc-400 ml-1">City/Village</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Satara, Kudal"
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
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setPlayerForm, "photo")}
                      className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all text-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-500 cursor-pointer"
                    />
                  </div>
                  {playerForm.photo && <div className="mt-2 text-[10px] text-zinc-500 truncate">Photo Selected</div>}
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
                className={`w-full py-4 rounded-xl font-semibold tracking-wide transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:pointer-events-none mt-4 ${editingPlayerId
                  ? "bg-amber-600 hover:bg-amber-500 shadow-[0_0_20px_rgba(217,119,6,0.3)]"
                  : "bg-pink-600 hover:bg-pink-500 shadow-[0_0_20px_rgba(219,39,119,0.3)]"
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
        <section className="relative bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-500 group">
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

        {/* Bulk Player Import Section */}
        <section className="relative bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden hover:border-cyan-500/30 transition-colors duration-500 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 -mr-16 -mt-16 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl">
                <Icon icon="solar:file-text-bold" className="text-2xl" />
              </div>
              <div>
                <h2 className="text-3xl font-semibold text-white/90">Bulk Import Players</h2>
                <p className="text-xs text-zinc-400 mt-1">Upload an Excel (.xlsx) or CSV (.csv) file containing player registrations</p>
              </div>
            </div>
            <button
              onClick={() => {
                const headers = ["Full Name", "Mobile Number", "Category", "Village / City (From Where)", "Player Photo (optional)"];
                const rows = [
                  ["Rohit Patil", "9876543210", "Batsman", "Kudal", ""],
                  ["Rohit Patil", "9988776655", "Bowler", "Medha", ""],
                  ["Rohit Patil", "9765432109", "All-Rounder", "Satara", ""],
                  ["Suresh Kumar", "9123456789", "Wicket Keeper", "Karad", ""]
                ];
                let csvContent = "data:text/csv;charset=utf-8," 
                  + headers.join(",") + "\n"
                  + rows.map(r => r.join(",")).join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "players_import_template.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors border border-cyan-500/20 hover:border-cyan-500/40 px-3 py-1.5 rounded-lg bg-cyan-500/5 cursor-pointer self-start"
            >
              <Icon icon="solar:download-bold" /> Download CSV Template
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* File Upload Zone */}
            <div className="lg:col-span-6 space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add("border-cyan-500", "bg-cyan-500/5");
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("border-cyan-500", "bg-cyan-500/5");
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("border-cyan-500", "bg-cyan-500/5");
                  const file = e.dataTransfer.files?.[0];
                  if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || file.name.endsWith(".csv"))) {
                    setImportFile(file);
                    setImportSummary(null);
                  } else {
                    showToast("error", "Please upload a valid Excel or CSV file.");
                  }
                }}
                onClick={() => document.getElementById("bulk-file-input")?.click()}
                className="border-2 border-dashed border-white/10 hover:border-cyan-500/50 bg-black/10 hover:bg-cyan-500/[0.02] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[180px]"
              >
                <input
                  id="bulk-file-input"
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImportFile(file);
                      setImportSummary(null);
                    }
                  }}
                />
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 border border-cyan-500/20 transition-transform">
                  <Icon icon="solar:cloud-upload-bold-duotone" className="text-2xl" />
                </div>
                {importFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white max-w-[250px] truncate">{importFile.name}</p>
                    <p className="text-xs text-zinc-500">{(importFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">Drag & drop your Excel or CSV file</p>
                    <p className="text-xs text-zinc-500">or click to browse local files</p>
                  </div>
                )}
              </div>

              {importFile && (
                <div className="flex gap-3 animate-fade-in">
                  <button
                    onClick={handleImportSubmit}
                    disabled={uploading}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Icon icon="lucide:loader-2" className="animate-spin text-lg" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Icon icon="solar:import-bold" className="text-lg" />
                        Upload & Import Players
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setImportFile(null)}
                    disabled={uploading}
                    className="px-5 border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white rounded-xl text-xs font-bold uppercase transition-all"
                  >
                    Clear
                  </button>
                </div>
              )}

              {uploading && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Uploading and parsing file...</span>
                    <span className="font-semibold text-cyan-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                    <div
                      className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Summary Dashboard / Results Zone */}
            <div className="lg:col-span-6 flex flex-col justify-between min-h-[180px]">
              {importSummary ? (
                <div className="space-y-4 flex-1 flex flex-col justify-between animate-fade-in">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
                      <Icon icon="solar:chart-square-bold" /> Import Summary
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-slate-900/60 border border-white/5 p-3 rounded-xl text-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block">Total Rows</span>
                        <span className="text-xl font-bold text-slate-100">{importSummary.totalRows}</span>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center">
                        <span className="text-[10px] text-emerald-400 uppercase font-bold block">Imported</span>
                        <span className="text-xl font-bold text-emerald-400">{importSummary.imported}</span>
                      </div>
                      <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-center">
                        <span className="text-[10px] text-amber-400 uppercase font-bold block">Duplicates</span>
                        <span className="text-xl font-bold text-amber-400">{importSummary.duplicates}</span>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center">
                        <span className="text-[10px] text-red-400 uppercase font-bold block">Invalid</span>
                        <span className="text-xl font-bold text-red-400">{importSummary.invalidRows}</span>
                      </div>
                    </div>
                  </div>

                  {importSummary.errors && importSummary.errors.length > 0 && (
                    <div className="mt-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-red-400 block mb-2 flex items-center gap-1.5">
                        <Icon icon="solar:danger-bold" /> Parsing & Database Errors ({importSummary.errors.length})
                      </span>
                      <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-3 max-h-[120px] overflow-y-auto text-xs text-red-400/90 font-mono space-y-1.5 scrollbar-thin scrollbar-thumb-red-900/30">
                        {importSummary.errors.map((err: string, idx: number) => (
                          <div key={idx} className="border-b border-red-900/10 pb-1.5 last:border-0 last:pb-0">
                            {err}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-600 border border-dashed border-white/5 rounded-2xl bg-black/5 p-6 min-h-[180px]">
                  <Icon icon="solar:info-circle-bold-duotone" className="text-3xl opacity-30 mb-2" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Ready to import</p>
                  <p className="text-[10px] text-zinc-600 max-w-[320px] mt-1">Select and upload an Excel or CSV file. Duplicate mobile numbers will automatically be skipped, and valid rows will be imported.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Auction Queue Section */}
        <section className="relative bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-500 group">
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
                  <th className="pb-4 font-medium px-4">Player Photo</th>
                  <th className="pb-4 font-medium px-4">Full Name</th>
                  <th className="pb-4 font-medium px-4">Mobile Number</th>
                  <th className="pb-4 font-medium px-4">Category</th>
                  <th className="pb-4 font-medium px-4">Village / City</th>
                  <th className="pb-4 font-medium text-right px-4">Base Price (Editable)</th>
                  <th className="pb-4 font-medium text-center px-4">Status</th>
                  <th className="pb-4 font-medium text-right px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {players.length === 0 ? (
                  <tr><td colSpan={8} className="py-12 text-center text-zinc-600">No players found. Add some above!</td></tr>
                ) : (
                  players.map((player) => (
                    <tr key={player.id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-4">
                        <img 
                          src={player.photo || "https://images.unsplash.com/photo-1624194686522-83788533d11b?q=80&w=800&auto=format&fit=crop"} 
                          className="w-10 h-10 rounded-full object-cover border border-white/5" 
                          alt="" 
                        />
                      </td>
                      <td className="py-4 px-4 font-medium text-white">{player.name}</td>
                      <td className="py-4 px-4 text-zinc-400 font-mono">{player.phoneNumber || "N/A"}</td>
                      <td className="py-4 px-4 text-zinc-400">{player.category}</td>
                      <td className="py-4 px-4 text-zinc-400">{player.fromWhere || "Local"}</td>
                      <td className="py-4 text-right px-4">
                        {editingPlayerBasePriceId === player.id ? (
                          <div className="flex justify-end items-center gap-1">
                            <input
                              type="number"
                              value={editingBasePrice}
                              onChange={(e) => setEditingBasePrice(e.target.value)}
                              className="bg-slate-900 border border-cyan-500/50 rounded px-2.5 py-1 text-xs text-right w-24 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                            />
                            <span className="text-[10px] text-zinc-500">pts</span>
                          </div>
                        ) : (
                          <span className="tabular-nums text-zinc-300 font-medium">
                            {player.basePrice.toLocaleString()} pts
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-center px-4">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${player.sold ? (player.teamId ? 'bg-red-500/10 text-red-500' : 'bg-rose-500/10 text-rose-500') : 'bg-green-500/10 text-green-500'}`}>
                          {player.sold ? (player.teamId ? 'Sold' : 'Unsold') : 'Available'}
                        </span>
                      </td>
                      <td className="py-4 text-right px-4">
                        <div className="flex items-center justify-end gap-2">
                          {editingPlayerBasePriceId === player.id ? (
                            <>
                              <button
                                onClick={() => handleSaveInlineBasePrice(player)}
                                className="p-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg transition-all text-xs font-bold flex items-center gap-1"
                              >
                                <Icon icon="lucide:check" /> Save
                              </button>
                              <button
                                onClick={() => setEditingPlayerBasePriceId(null)}
                                className="p-1.5 px-3 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg transition-all text-xs flex items-center gap-1"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              {!player.sold && (
                                <button
                                  disabled={loading.start === player.id || activeState.status === "BIDDING"}
                                  onClick={() => handleStartAuction(player.id)}
                                  className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-cyan-900/20 uppercase tracking-wider"
                                >
                                  {loading.start === player.id ? "..." : "Load to Table"}
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setEditingPlayerBasePriceId(player.id);
                                  setEditingBasePrice(player.basePrice.toString());
                                }}
                                className="p-1.5 px-2.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg transition-all text-xs flex items-center gap-1"
                              >
                                <Icon icon="lucide:edit-3" /> Edit
                              </button>
                              <button
                                onClick={() => handleDeletePlayer(player.id)}
                                className="p-1.5 px-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all text-xs flex items-center gap-1"
                              >
                                <Icon icon="lucide:trash-2" /> Delete
                              </button>
                            </>
                          )}
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
    </div>
  );
}
