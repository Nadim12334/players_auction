"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useAuction } from "./AuctionProvider";

const LiveFeed = () => {
    const { bids, teams, players } = useAuction();

    const formatPrice = (amount: number) => {
        return `${amount.toLocaleString()} pts`;
    };

    return (
        <aside className="lg:col-span-3 flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Icon icon="solar:history-bold" width="16" />
                    Live Bid History
                </h2>
                <div className="flex items-center gap-2 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                     <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                     <span className="text-[10px] text-red-400 font-bold uppercase tracking-tighter">Live</span>
                </div>
            </div>

            <div className="glass-panel rounded-xl flex-1 flex flex-col p-4 overflow-hidden max-h-[700px]">
                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-3 mb-6 pb-6 border-b border-slate-800/50">
                    <div className="bg-slate-900/60 rounded-lg p-3 border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tight mb-1">Total Pool</div>
                        <div className="text-lg font-mono text-white leading-none">{players.length}</div>
                    </div>
                    <div className="bg-slate-900/60 rounded-lg p-3 border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tight mb-1">Sold</div>
                        <div className="text-lg font-mono text-emerald-400 leading-none">{players.filter(p => p.sold).length}</div>
                    </div>
                </div>

                <div className="overflow-y-auto space-y-3 pr-1 flex-1 custom-scrollbar">
                    {bids.map((bid, i) => {
                        const team = teams.find(t => t.id === bid.teamId);
                        const player = players.find(p => p.id === bid.playerId);
                        
                        return (
                            <div 
                                key={bid.id || i} 
                                className={`group relative p-3 rounded-xl border transition-all duration-500 ${
                                    i === 0 
                                    ? "bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]" 
                                    : "bg-slate-900/40 border-slate-800/50 hover:border-slate-700/80"
                                }`}
                            >
                                {i === 0 && (
                                    <div className="absolute -top-1 -right-1">
                                        <span className="flex h-3 w-3 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                                        </span>
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-3">
                                    {team?.logo ? (
                                        <img src={team.logo} className="w-8 h-8 rounded-lg object-cover border border-white/10" alt="" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center font-bold text-[10px] text-slate-500">
                                            {team?.name?.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="text-xs font-bold text-white truncate leading-tight">
                                                {team?.name || "Unknown"}
                                            </p>
                                            <p className="text-xs font-mono font-bold text-cyan-400 leading-tight">
                                                {formatPrice(bid.amount)}
                                            </p>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                            <Icon icon="solar:user-bold" className="text-[8px]" />
                                            {player?.name || "Player"}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 text-[8px] text-slate-600 flex justify-between items-center italic">
                                    <span>#{bids.length - i} sequence</span>
                                    <span>{new Date(bid.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                </div>
                            </div>
                        );
                    })}
                    
                    {bids.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                            <Icon icon="solar:clipboard-list-linear" width="32" className="opacity-20 mb-2" />
                            <p className="text-xs font-medium">No activity recorded</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default LiveFeed;
