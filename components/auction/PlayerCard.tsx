"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useAuction } from "./AuctionProvider";
import { api } from "../../services/api";

const PlayerCard = () => {
    const { players, teams, currentPlayerId } = useAuction();
    const [bidLoading, setBidLoading] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState<number | "">("");

    const activePlayer = players.find((p) => p.id === currentPlayerId);

    const handleBid = async (increment: number) => {
        if (!activePlayer) return;

        if (!selectedTeamId) {
            alert("Please select a team to bid");
            return;
        }

        const nextAmount = (activePlayer.currentBid || activePlayer.basePrice) + increment;

        try {
            setBidLoading(true);
            await api.post("/auction/bid", { playerId: activePlayer.id, teamId: Number(selectedTeamId), amount: nextAmount });
        } catch (error: any) {
            alert(error.response?.data?.message || error.message);
        } finally {
            setBidLoading(false);
        }
    };

    const handleSell = async () => {
        if (!activePlayer) return;
        if (!activePlayer.teamId) {
            alert("Cannot sell without any bids. Use Unsold instead.");
            return;
        }
        try {
            setBidLoading(true);
            await api.post(`/admin/auction/sell/${activePlayer.id}`);
        } catch (error: any) {
            alert(error.response?.data?.message || error.message);
        } finally {
            setBidLoading(false);
        }
    };

    const handleUnsold = async () => {
        if (!activePlayer) return;
        try {
            setBidLoading(true);
            await api.post(`/admin/auction/unsold/${activePlayer.id}`);
        } catch (error: any) {
            alert(error.response?.data?.message || error.message);
        } finally {
            setBidLoading(false);
        }
    };

    if (!activePlayer) {
        return (
            <section className="lg:col-span-6 flex flex-col items-center justify-center p-12 glass-panel rounded-2xl">
                <Icon icon="solar:hourglass-linear" width="48" className="text-slate-500 mb-4 animate-spin-slow" />
                <h2 className="text-xl font-medium text-slate-300">Waiting for next player...</h2>
            </section>
        );
    }

    const currentHighestBidTeam = teams.find(t => t.id === activePlayer.teamId);
    const currentPrice = activePlayer.currentBid || activePlayer.basePrice;
    
    const currentIncrement = currentPrice >= 5000 ? 1000 : 500;
    const nextSuggestedAmount = activePlayer.currentBid ? currentPrice + currentIncrement : activePlayer.basePrice;
    
    const displayPrice = (activePlayer.currentBid || activePlayer.basePrice).toLocaleString();
    const displayNext = nextSuggestedAmount.toLocaleString();
    const currencyUnit = "pts";

    return (
        <section className="lg:col-span-6 flex flex-col gap-6">
            <div className="glass-panel rounded-2xl p-1 relative overflow-hidden group">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>

                <div className="bg-slate-900/80 rounded-xl overflow-hidden relative border border-white/5">
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                        <div className="px-3 py-1 rounded-full bg-slate-950/60 backdrop-blur border border-slate-700 text-xs font-medium text-cyan-400 flex items-center gap-1.5 shadow-lg">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            Live Auction
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-5/12 h-64 md:h-auto relative bg-gradient-to-b from-slate-800 to-slate-900 flex items-end justify-center overflow-hidden">
                            <img
                                src={activePlayer.photo || "https://images.unsplash.com/photo-1624194686522-83788533d11b?q=80&w=800&auto=format&fit=crop"}
                                className="w-full h-full object-cover opacity-90 mix-blend-overlay md:opacity-100 md:mix-blend-normal absolute inset-0"
                                alt={activePlayer.name}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent md:bg-gradient-to-r"></div>

                            <div className="absolute bottom-4 left-4">
                                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-lg">
                                    {activePlayer.category}
                                </span>
                            </div>
                        </div>

                        <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-display font-semibold text-white tracking-tight leading-tight uppercase">
                                            {activePlayer.name}
                                        </h1>
                                        <div className="flex flex-col gap-1 mt-2">
                                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                <Icon icon="solar:flag-linear" className="text-slate-500" />
                                                <span>{activePlayer.fromWhere || "Unknown"}</span>
                                            </div>
                                            {activePlayer.phoneNumber && (
                                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                    <Icon icon="solar:phone-linear" className="text-slate-500" />
                                                    <span>{activePlayer.phoneNumber}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                                            Base Price
                                        </div>
                                        <div className="text-white font-semibold">
                                            {activePlayer.basePrice.toLocaleString()} pts
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-800/80">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs font-medium uppercase tracking-widest text-cyan-400">
                                        {activePlayer.currentBid ? "Current Highest Bid" : "Opening Bid"}
                                    </span>
                                    {currentHighestBidTeam && (
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <Icon icon="solar:hammer-linear" />
                                            Held by{" "}
                                            {currentHighestBidTeam.logo && (
                                                <div className="w-5 h-5 rounded-full overflow-hidden border border-white/10">
                                                    <img src={currentHighestBidTeam.logo} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <span className="text-white font-semibold">
                                                {currentHighestBidTeam.name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-5xl md:text-6xl font-display font-medium text-white tracking-tighter glow-text">
                                        {displayPrice}
                                        <span className="text-2xl text-slate-500 align-bottom mb-2 inline-block font-sans ml-1">
                                            {currencyUnit}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel p-4 rounded-xl flex flex-col justify-center gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400">Select Bidding Team</label>
                        <select
                            className="bg-slate-800 border border-slate-700 text-white text-sm rounded p-2 focus:outline-none focus:border-cyan-500 transition-colors"
                            value={selectedTeamId}
                            onChange={(e) => setSelectedTeamId(e.target.value ? Number(e.target.value) : "")}
                        >
                            <option value="">-- Choose Team --</option>
                            {teams.map(team => (
                                <option key={team.id} value={team.id}>{team.name} (Bal: {team.purse.toLocaleString()} pts)</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 mb-2 block">Quick Increments</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => handleBid(currentIncrement)} disabled={bidLoading} className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 text-white py-2 rounded text-xs font-medium transition-colors">
                                + {currentIncrement.toLocaleString()} pts
                            </button>
                            <button onClick={() => handleBid(currentIncrement * 2)} disabled={bidLoading} className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 text-white py-2 rounded text-xs font-medium transition-colors">
                                + {(currentIncrement * 2).toLocaleString()} pts
                            </button>
                            <button onClick={() => handleBid(currentIncrement * 4)} disabled={bidLoading} className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 text-white py-2 rounded text-xs font-medium transition-colors">
                                + {(currentIncrement * 4).toLocaleString()} pts
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <button onClick={() => handleBid(activePlayer.currentBid ? currentIncrement : 0)} disabled={bidLoading} className="flex-1 relative group overflow-hidden rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <span className="relative z-10 flex items-center gap-2 text-slate-950 font-bold text-lg uppercase tracking-wider">
                            <Icon icon="solar:gavel-bold" width="20" />
                            {bidLoading ? "Placing..." : (
                                !activePlayer.currentBid ? `Place Opening Bid (${activePlayer.basePrice})` : `Bid ${displayNext} (+${currentIncrement})`
                            )}
                        </span>
                    </button>

                    <div className="grid grid-cols-2 gap-2 mt-auto">
                        <button onClick={handleSell} disabled={bidLoading} className="bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 font-medium p-3 rounded-lg text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                            <Icon icon="solar:check-circle-linear" width="18" />
                            Sell Player
                        </button>
                        <button onClick={handleUnsold} disabled={bidLoading} className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-medium p-3 rounded-lg text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                            <Icon icon="solar:close-circle-linear" width="18" />
                            Unsold
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PlayerCard;
