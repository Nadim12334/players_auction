"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useAuction } from "./AuctionProvider";
import { api } from "../../services/api";

const PlayerCard = () => {
    const { players, teams, currentPlayerId, auctionStatus } = useAuction();
    const [bidLoading, setBidLoading] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState<number | "">("");
    const [showAdminControls, setShowAdminControls] = useState(false);

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

    const handleNextPlayer = async () => {
        try {
            setBidLoading(true);
            await api.post("/admin/auction/next");
        } catch (error: any) {
            alert(error.response?.data?.message || error.message);
        } finally {
            setBidLoading(false);
        }
    };

    if (!activePlayer) {
        return (
            <section className="relative flex flex-col items-center justify-center p-16 bg-slate-900/60 border border-slate-800/80 rounded-3xl min-h-[500px] shadow-2xl backdrop-blur-xl text-center group overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-500">
                        <Icon icon="solar:cup-star-bold" className="text-5xl animate-bounce-slow" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                            TITAN MEGA AUCTION
                        </h2>
                        <p className="text-slate-400 max-w-md mx-auto text-base">
                            Waiting for the administrator to load the next player to the auction table...
                        </p>
                    </div>
                    
                    {/* Inline Quick Admin Trigger for testing */}
                    <button
                        onClick={() => setShowAdminControls(!showAdminControls)}
                        className="mt-4 px-4 py-2 rounded-full border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2"
                    >
                        <Icon icon="solar:settings-linear" />
                        {showAdminControls ? "Hide Admin Controls" : "Show Admin Controls"}
                    </button>

                    {showAdminControls && (
                        <div className="mt-4 p-4 rounded-xl border border-slate-700/50 bg-slate-950/80 max-w-sm flex flex-col gap-3">
                            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Operator Panel</span>
                            <button
                                onClick={handleNextPlayer}
                                disabled={bidLoading}
                                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-2 px-6 rounded-lg transition-all text-sm flex items-center justify-center gap-2"
                            >
                                <Icon icon="solar:round-alt-arrow-right-bold" />
                                Load First Player
                            </button>
                        </div>
                    )}
                </div>
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
        <section className="flex flex-col gap-6 relative">
            <div className="relative bg-slate-950 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl group min-h-[480px]">
                {/* Glow behind card */}
                <div className="absolute top-0 left-1/4 w-1/2 h-48 bg-gradient-to-b from-cyan-500/10 to-transparent blur-3xl rounded-full pointer-events-none"></div>

                <div className="flex flex-col md:flex-row min-h-[480px]">
                    {/* Left Panel: Photo */}
                    <div className="w-full md:w-5/12 relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 flex items-end justify-center overflow-hidden border-b md:border-b-0 md:border-r border-slate-800/40">
                        <img
                            src={activePlayer.photo || "https://images.unsplash.com/photo-1624194686522-83788533d11b?q=80&w=800&auto=format&fit=crop"}
                            className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                            alt={activePlayer.name}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xl border border-indigo-400/20">
                                {activePlayer.category}
                            </span>
                        </div>
                    </div>

                    {/* Right Panel: Player Details */}
                    <div className="w-full md:w-7/12 p-8 flex flex-col justify-between relative">
                        {/* Heading & Status */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                {auctionStatus === "BIDDING" ? (
                                    <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400 flex items-center gap-1.5 shadow-lg">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                        </span>
                                        LIVE BIDDING
                                    </div>
                                ) : auctionStatus === "IDLE" ? (
                                    <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400 flex items-center gap-1.5 shadow-lg">
                                        <Icon icon="solar:clock-circle-bold" />
                                        READY FOR AUCTION
                                    </div>
                                ) : auctionStatus === "SOLD" ? (
                                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 shadow-lg">
                                        <Icon icon="solar:check-circle-bold" />
                                        SOLD
                                    </div>
                                ) : (
                                    <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 flex items-center gap-1.5 shadow-lg">
                                        <Icon icon="solar:close-circle-bold" />
                                        UNSOLD
                                    </div>
                                )}
                                
                                <div className="text-right">
                                    <span className="text-[10px] uppercase tracking-widest text-slate-500 block">Base Price</span>
                                    <span className="text-lg font-bold text-slate-100">{activePlayer.basePrice.toLocaleString()} {currencyUnit}</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight uppercase leading-none">
                                    {activePlayer.name}
                                </h1>
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <Icon icon="solar:flag-bold" className="text-slate-500" />
                                    <span className="font-medium">{activePlayer.fromWhere || "Local Player"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bid Displays */}
                        <div className="mt-8 pt-6 border-t border-slate-800/60 space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                    {activePlayer.currentBid ? "Current Highest Bid" : "Opening Bid"}
                                </span>
                                {currentHighestBidTeam && (
                                    <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-full px-3 py-1">
                                        <Icon icon="solar:gavel-bold" className="text-cyan-400" />
                                        <span>Bid Held By:</span>
                                        {currentHighestBidTeam.logo && (
                                            <div className="w-5 h-5 rounded-full overflow-hidden border border-white/10">
                                                <img src={currentHighestBidTeam.logo} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <span className="text-white font-bold">{currentHighestBidTeam.name}</span>
                                    </div>
                                )}
                            </div>

                            <div className="text-6xl md:text-7xl font-black text-white tracking-tighter glow-text flex items-baseline">
                                {displayPrice}
                                <span className="text-2xl text-slate-500 font-medium ml-2">
                                    {currencyUnit}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SOLD OVERLAY BANNER */}
                {auctionStatus === "SOLD" && (
                    <div className="absolute inset-0 bg-emerald-950/95 flex flex-col items-center justify-center text-center p-8 z-30 animate-fade-in">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col items-center gap-4 animate-scale-up">
                            <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shadow-2xl shadow-emerald-500/40">
                                <Icon icon="solar:check-circle-bold" className="text-5xl" />
                            </div>
                            <h2 className="text-6xl md:text-7xl font-black text-emerald-400 tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse">
                                PLAYER SOLD
                            </h2>
                            <div className="space-y-1 mt-4">
                                <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Sold To Franchise</p>
                                <p className="text-3xl font-extrabold text-white flex items-center justify-center gap-3">
                                    {currentHighestBidTeam?.logo && (
                                        <img src={currentHighestBidTeam.logo} alt="" className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                                    )}
                                    {currentHighestBidTeam?.name || "Unknown Team"}
                                </p>
                            </div>
                            <div className="bg-slate-900/60 border border-slate-800 px-8 py-3 rounded-2xl mt-4">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Purchase Price</p>
                                <p className="text-4xl font-mono font-bold text-white">{displayPrice} {currencyUnit}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* UNSOLD OVERLAY BANNER */}
                {auctionStatus === "UNSOLD" && (
                    <div className="absolute inset-0 bg-red-950/95 flex flex-col items-center justify-center text-center p-8 z-30 animate-fade-in">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500/20 blur-[120px] rounded-full pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center gap-4 animate-scale-up">
                            <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center text-white shadow-2xl shadow-red-500/40">
                                <Icon icon="solar:close-circle-bold" className="text-5xl" />
                            </div>
                            <h2 className="text-6xl md:text-7xl font-black text-red-500 tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                                PLAYER UNSOLD
                            </h2>
                            <p className="text-slate-400 mt-2 text-base max-w-sm">
                                This player received no bids and remains unsold for this round.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* FLOATING ADMIN TRIGGER (For easy configuration/testing) */}
            <div className="flex justify-end">
                <button
                    onClick={() => setShowAdminControls(!showAdminControls)}
                    className="px-4 py-2 rounded-full border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-slate-400 hover:text-white transition-all flex items-center gap-2 shadow-lg"
                >
                    <Icon icon="solar:settings-bold" className="text-sm" />
                    {showAdminControls ? "Hide Admin Controls" : "Show Admin Controls"}
                </button>
            </div>

            {showAdminControls && (
                <div className="p-6 rounded-3xl border border-slate-800/80 bg-slate-950/90 shadow-2xl backdrop-blur-xl grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    {/* Left: Bid Placement */}
                    <div className="space-y-4">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block">Operator: Place Bid</span>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-slate-400">Select Bidding Team</label>
                            <select
                                className="bg-slate-900 border border-slate-800 text-white text-sm rounded-xl p-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                value={selectedTeamId}
                                onChange={(e) => setSelectedTeamId(e.target.value ? Number(e.target.value) : "")}
                            >
                                <option value="">-- Choose Franchise --</option>
                                {teams.map(team => (
                                    <option key={team.id} value={team.id}>{team.name} (Purse: {team.purse.toLocaleString()} pts)</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => handleBid(currentIncrement)} disabled={bidLoading || auctionStatus !== "BIDDING"} className="bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 text-white py-3 rounded-xl text-xs font-semibold transition-all">
                                + {currentIncrement.toLocaleString()} pts
                            </button>
                            <button onClick={() => handleBid(currentIncrement * 2)} disabled={bidLoading || auctionStatus !== "BIDDING"} className="bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 text-white py-3 rounded-xl text-xs font-semibold transition-all">
                                + {(currentIncrement * 2).toLocaleString()}
                            </button>
                            <button onClick={() => handleBid(currentIncrement * 4)} disabled={bidLoading || auctionStatus !== "BIDDING"} className="bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 text-white py-3 rounded-xl text-xs font-semibold transition-all">
                                + {(currentIncrement * 4).toLocaleString()}
                            </button>
                        </div>

                        <button
                            onClick={() => handleBid(activePlayer.currentBid ? currentIncrement : 0)}
                            disabled={bidLoading || auctionStatus !== "BIDDING"}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-30"
                        >
                            <Icon icon="solar:gavel-bold" className="text-lg" />
                            {bidLoading ? "Placing..." : (
                                !activePlayer.currentBid ? `Place Opening Bid (${activePlayer.basePrice})` : `Place Bid (${displayNext})`
                            )}
                        </button>
                    </div>

                    {/* Right: State Management */}
                    <div className="space-y-4 flex flex-col justify-between">
                        <div>
                            <span className="text-xs font-bold text-rose-400 uppercase tracking-widest block mb-4">Operator: Live Status Controls</span>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleSell}
                                    disabled={bidLoading || !activePlayer.teamId || auctionStatus !== "BIDDING"}
                                    className="bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-slate-950 border border-emerald-500/20 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                                >
                                    <Icon icon="solar:check-circle-linear" width="18" />
                                    Sell Player
                                </button>
                                <button
                                    onClick={handleUnsold}
                                    disabled={bidLoading || auctionStatus !== "BIDDING"}
                                    className="bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                                >
                                    <Icon icon="solar:close-circle-linear" width="18" />
                                    Unsold
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleNextPlayer}
                            disabled={bidLoading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <Icon icon="solar:round-alt-arrow-right-bold" className="text-lg" />
                            Next Player
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default PlayerCard;
