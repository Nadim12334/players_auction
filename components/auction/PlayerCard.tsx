"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useAuction } from "./AuctionProvider";
import { getImageUrl } from "../../services/image";

const PlayerCard = () => {
    const { players, teams, currentPlayerId, auctionStatus, recalledNotice } = useAuction();

    const activePlayer = players.find((p) => p.id === currentPlayerId);

    if (!activePlayer) {
        return (
            <section className="relative flex flex-col items-center justify-center p-12 bg-slate-950 border border-slate-800/80 rounded-2xl min-h-[480px] md:min-h-[520px] shadow-2xl backdrop-blur-xl text-center group overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-2xl shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-500">
                        <Icon icon="solar:cup-star-bold" className="text-6xl animate-bounce-slow" />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent uppercase tracking-tight">
                            TITAN MEGA AUCTION
                        </h2>
                        <p className="text-slate-400 max-w-md mx-auto text-sm md:text-base font-medium">
                            Waiting for the auctioneer to load the next player to the auction table...
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    const currentHighestBidTeam = teams.find((t) => t.id === activePlayer.teamId);
    const displayPrice = (activePlayer.currentBid || activePlayer.basePrice).toLocaleString();
    const isRecalled = recalledNotice && recalledNotice.player.id === activePlayer.id;

    return (
        <section className="flex flex-col gap-4 relative w-full">
            {/* RE-AUCTION RECALLED PLAYER BANNER */}
            {isRecalled && (
                <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black px-6 py-2.5 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.8)] border border-amber-300 flex items-center justify-center gap-3 animate-pulse text-xs sm:text-sm uppercase tracking-widest z-20">
                    <Icon icon="solar:restart-bold" className="text-xl animate-spin" />
                    <span>
                        {recalledNotice.mode === "AUCTION_NOW" ? "RE-AUCTION • RECALLED PLAYER BACK ON TABLE!" : "RE-AUCTION • COMING BACK TO AUCTION!"}
                    </span>
                </div>
            )}

            <div className="relative bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl group min-h-[480px] md:min-h-[520px] flex flex-col">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/3 w-1/2 h-40 bg-gradient-to-b from-cyan-500/15 to-transparent blur-3xl rounded-full pointer-events-none"></div>

                <div className="flex flex-col md:flex-row flex-1 min-h-[480px] md:min-h-[520px]">
                    {/* Left Panel: Large Player Photo (7 of 12 columns = ~58% width) */}
                    <div className="w-full md:w-7/12 relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-slate-800/60 min-h-[320px] md:min-h-[520px]">
                        <img
                            src={getImageUrl(activePlayer.photo)}
                            className="w-full h-full object-cover object-top opacity-95 transition-transform duration-700 group-hover:scale-105"
                            alt={activePlayer.name}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30"></div>

                        {/* Category Badge */}
                        <div className="absolute top-4 left-4 z-10">
                            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-2xl border border-indigo-400/30">
                                {activePlayer.category}
                            </span>
                        </div>
                    </div>

                    {/* Right Panel: Player Details (5 of 12 columns = ~42% width) */}
                    <div className="w-full md:w-5/12 p-6 md:p-8 flex flex-col justify-between relative gap-6">
                        {/* Header: Live Status & Base Price */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center gap-2">
                                {auctionStatus === "BIDDING" ? (
                                    <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-black text-cyan-400 flex items-center gap-2 shadow-lg">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                        </span>
                                        LIVE BIDDING
                                    </div>
                                ) : auctionStatus === "IDLE" ? (
                                    <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-black text-amber-400 flex items-center gap-1.5 shadow-lg">
                                        <Icon icon="solar:clock-circle-bold" />
                                        READY
                                    </div>
                                ) : auctionStatus === "SOLD" ? (
                                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-black text-emerald-400 flex items-center gap-1.5 shadow-lg">
                                        <Icon icon="solar:check-circle-bold" />
                                        SOLD
                                    </div>
                                ) : (
                                    <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-black text-red-400 flex items-center gap-1.5 shadow-lg">
                                        <Icon icon="solar:close-circle-bold" />
                                        UNSOLD
                                    </div>
                                )}
                            </div>

                            {/* Player Name & Location */}
                            <div className="space-y-2">
                                <h1 className="text-2xl md:text-3xl lg:text-2xl font-black text-white tracking-tight uppercase leading-none drop-shadow-md">
                                    {activePlayer.name}
                                </h1>
                                <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold">
                                    <Icon icon="solar:flag-bold" className="text-cyan-400 text-base" />
                                    <span>{activePlayer.fromWhere || "Local Player"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Base Price & Current Bid Section */}
                        <div className="space-y-4 pt-4 border-t border-slate-800/80">
                            {/* Base Price */}
                            <div className="flex justify-between items-center bg-slate-900/60 border border-slate-800 px-4 py-2.5 rounded-xl">
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                    Base Price
                                </span>
                                <span className="text-lg font-extrabold text-slate-100 font-mono">
                                    ₹{activePlayer.basePrice.toLocaleString()}
                                </span>
                            </div>

                            {/* Current Bid Display */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                        {activePlayer.currentBid ? "Current Highest Bid" : "Opening Bid"}
                                    </span>
                                </div>

                                <div className="text-3xl  font-black text-white tracking-tight glow-text flex items-baseline gap-2 font-mono">
                                    <span className="text-3xl sm:text-4xl text-cyan-400">₹</span>
                                    {displayPrice}
                                </div>

                                {/* Leading Team Indicator */}
                                {currentHighestBidTeam && (
                                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-300 bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-2.5 shadow-lg">
                                        <Icon icon="solar:gavel-bold" className="text-cyan-400 text-base flex-shrink-0" />
                                        <span className="text-slate-400 font-medium">Leading Team:</span>
                                        {currentHighestBidTeam.logo && (
                                            <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                                                <img
                                                    src={getImageUrl(currentHighestBidTeam.logo)}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <span className="text-cyan-300 font-bold truncate text-sm">
                                            {currentHighestBidTeam.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SOLD OVERLAY BANNER */}
                {auctionStatus === "SOLD" && (
                    <div className="absolute inset-0 bg-emerald-950/95 flex flex-col items-center justify-center text-center p-6 z-30 animate-fade-in">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center gap-3 animate-scale-up">
                            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shadow-2xl shadow-emerald-500/40">
                                <Icon icon="solar:check-circle-bold" className="text-4xl" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-emerald-400 tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                PLAYER SOLD
                            </h2>
                            <div className="space-y-1 mt-2">
                                <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">
                                    Sold To Franchise
                                </p>
                                <p className="text-2xl font-black text-white flex items-center justify-center gap-3">
                                    {currentHighestBidTeam?.logo && (
                                        <img
                                            src={getImageUrl(currentHighestBidTeam.logo)}
                                            alt=""
                                            className="w-9 h-9 rounded-lg object-cover border border-white/20"
                                        />
                                    )}
                                    {currentHighestBidTeam?.name || "Unknown Team"}
                                </p>
                            </div>
                            <div className="bg-slate-900/80 border border-slate-800 px-6 py-2 rounded-xl mt-3">
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                    Winning Amount
                                </p>
                                <p className="text-2xl font-mono font-black text-emerald-400">
                                    ₹{displayPrice}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* UNSOLD OVERLAY BANNER */}
                {auctionStatus === "UNSOLD" && (
                    <div className="absolute inset-0 bg-red-950/95 flex flex-col items-center justify-center text-center p-6 z-30 animate-fade-in">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-500/20 blur-[100px] rounded-full pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center gap-3 animate-scale-up">
                            <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-2xl shadow-red-500/40">
                                <Icon icon="solar:close-circle-bold" className="text-4xl" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-red-500 tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                                PLAYER UNSOLD
                            </h2>
                            <p className="text-slate-300 mt-2 text-sm max-w-sm font-medium">
                                This player received no bids and remains unsold for this round.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default PlayerCard;
