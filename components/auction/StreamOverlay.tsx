"use client";

import React, { useEffect } from "react";
import { Icon } from "@iconify/react";
import { useAuction } from "./AuctionProvider";

const StreamOverlay = () => {
    const { players, currentPlayerId, auctionStatus, teams, recalledNotice } = useAuction();

    // Ensure 100% transparency for OBS Studio Browser Source background
    useEffect(() => {
        document.documentElement.style.background = "transparent";
        document.body.style.background = "transparent";
        return () => {
            document.documentElement.style.background = "";
            document.body.style.background = "";
        };
    }, []);

    const activePlayer = players.find((p) => p.id === currentPlayerId);
    const isRecalled = recalledNotice && activePlayer && recalledNotice.player.id === activePlayer.id;

    const displayPrice = activePlayer
        ? (activePlayer.currentBid || activePlayer.basePrice).toLocaleString()
        : "0";

    const currentHighestBidTeam = activePlayer
        ? teams.find((t) => t.id === activePlayer.teamId)
        : null;

    if (!activePlayer) {
        return (
            <div className="fixed inset-0 w-full h-full pointer-events-none bg-transparent flex flex-col justify-end items-center pb-8 z-50">
                <div className="bg-slate-950/90 border-2 border-cyan-400/80 rounded-2xl px-8 py-4 shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-xl flex items-center gap-3 text-cyan-400 pointer-events-auto animate-pulse">
                    <Icon icon="solar:cup-star-bold" className="text-2xl" />
                    <span className="text-sm font-black uppercase tracking-widest text-white">
                        WAITING FOR NEXT PLAYER...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 w-full h-full pointer-events-none bg-transparent flex flex-col justify-end items-center pb-6 sm:pb-8 z-50 selection:bg-cyan-500/30">
            {/* Centered IPL-Style Broadcast Banner Container */}
            <div className="relative pointer-events-auto flex items-end justify-center transition-all duration-500">
                
                {/* FLOATING TOP PLAYER PORTRAIT BADGE (Centered above the banner) */}
                <div className="absolute -top-20 sm:-top-24 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                    
                    {/* Status / Recalled Pill on top of portrait */}
                    {isRecalled ? (
                        <div className="mb-1 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.9)] border border-amber-200 animate-pulse">
                            <Icon icon="solar:restart-bold" className="text-xs animate-spin" />
                            RE-AUCTION
                        </div>
                    ) : auctionStatus === "BIDDING" ? (
                        <div className="mb-1 px-3 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.8)] border border-cyan-300">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
                            </span>
                            LIVE
                        </div>
                    ) : auctionStatus === "SOLD" ? (
                        <div className="mb-1 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.8)] border border-emerald-300">
                            <Icon icon="solar:check-circle-bold" />
                            SOLD
                        </div>
                    ) : auctionStatus === "UNSOLD" ? (
                        <div className="mb-1 px-3 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-[0_0_15px_rgba(239,68,68,0.8)] border border-red-400">
                            <Icon icon="solar:close-circle-bold" />
                            UNSOLD
                        </div>
                    ) : (
                        <div className="mb-1 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-[0_0_15px_rgba(245,158,11,0.8)] border border-amber-300">
                            READY
                        </div>
                    )}

                    {/* Circular Photo Frame with Glowing Cyan/Gold Ring */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-b from-cyan-300 via-slate-800 to-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.6)] border-2 border-cyan-300/90">
                        <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 relative border border-cyan-400/40">
                            <img
                                src={
                                    activePlayer.photo ||
                                    "https://images.unsplash.com/photo-1624194686522-83788533d11b?q=80&w=800&auto=format&fit=crop"
                                }
                                alt={activePlayer.name}
                                className="w-full h-full object-cover object-top"
                            />
                        </div>
                    </div>
                </div>

                {/* MAIN 3-PANEL SLANTED BROADCAST TICKER */}
                <div className="flex items-center gap-1 sm:gap-2 pt-10">
                    
                    {/* LEFT PANEL: BASE PRICE */}
                    <div className="-skew-x-12 bg-slate-950/90 border-2 border-cyan-400/80 rounded-l-xl px-5 sm:px-8 py-2.5 sm:py-3.5 shadow-[0_0_20px_rgba(6,182,212,0.25)] flex flex-col items-center justify-center min-w-[140px] sm:min-w-[190px] backdrop-blur-xl">
                        <div className="skew-x-12 text-center">
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-cyan-300 block">
                                BASE PRICE
                            </span>
                            <span className="text-base sm:text-xl font-black font-mono text-white tracking-tight block mt-0.5">
                                ₹{activePlayer.basePrice.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* CENTER PANEL: PLAYER NAME & CATEGORY */}
                    <div className="-skew-x-12 bg-gradient-to-b from-cyan-950/95 to-slate-950/95 border-2 border-cyan-400/90 px-6 sm:px-10 py-2.5 sm:py-3.5 shadow-[0_0_25px_rgba(6,182,212,0.4)] flex flex-col items-center justify-center min-w-[190px] sm:min-w-[250px] backdrop-blur-xl z-10">
                        <div className="skew-x-12 text-center">
                            <h2 className="text-base sm:text-xl font-black uppercase tracking-tight text-white leading-none drop-shadow-md">
                                {activePlayer.name}
                            </h2>
                            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-cyan-300 block mt-1">
                                {activePlayer.category}
                            </span>
                            {currentHighestBidTeam && (
                                <div className="mt-1 flex items-center justify-center gap-1 text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider">
                                    <span>HELD BY: {currentHighestBidTeam.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: CURRENT BID */}
                    <div className="-skew-x-12 bg-slate-950/90 border-2 border-cyan-400/80 rounded-r-xl px-5 sm:px-8 py-2.5 sm:py-3.5 shadow-[0_0_20px_rgba(6,182,212,0.25)] flex flex-col items-center justify-center min-w-[140px] sm:min-w-[190px] backdrop-blur-xl">
                        <div className="skew-x-12 text-center">
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-cyan-300 block">
                                {activePlayer.currentBid ? "CURRENT BID" : "OPENING BID"}
                            </span>
                            <span className="text-base sm:text-xl font-black font-mono text-cyan-400 tracking-tight block mt-0.5 glow-text">
                                ₹{displayPrice}
                            </span>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default StreamOverlay;
