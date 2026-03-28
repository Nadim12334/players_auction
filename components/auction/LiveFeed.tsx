"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useAuction } from "./AuctionProvider";

const LiveFeed = () => {
    const { bids, teams, players } = useAuction();

    const topSpender = [...teams].sort((a, b) => {
        // Find how much they spent: initial purse - current purse
        // Actually purse is updated in DB so we can just sort by who has least purse relative to others or who has most players? 
        // Let's just sort by highest spent (assuming 1B initial, or just sort by who has the most players)
        return (b.players?.length || 0) - (a.players?.length || 0);
    })[0];

    const formatPrice = (amount: number) => {
        return `${amount.toLocaleString()} pts`;
    };

    return (
        <aside className="lg:col-span-3 flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Icon icon="solar:chart-linear" width="16" />
                    Live Feed
                </h2>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>

            <div className="glass-panel rounded-xl flex-1 flex flex-col p-4 overflow-hidden max-h-[600px]">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6 pb-6 border-b border-slate-800/50">
                    <div className="bg-slate-800/30 rounded p-2">
                        <div className="text-[10px] text-slate-500">Total Players</div>
                        <div className="text-lg font-mono text-white">{players.length}</div>
                    </div>
                    <div className="bg-slate-800/30 rounded p-2">
                        <div className="text-[10px] text-slate-500">Sold</div>
                        <div className="text-lg font-mono text-cyan-400">{players.filter(p => p.sold).length}</div>
                    </div>
                </div>

                <h3 className="text-xs text-slate-500 font-medium mb-3 uppercase tracking-wider">
                    Recent Bids
                </h3>

                <div className="overflow-y-auto space-y-3 pr-1 flex-1">
                    {bids.slice(0, 10).map((bid, i) => {
                        const team = teams.find(t => t.id === bid.teamId);
                        const player = players.find(p => p.id === bid.playerId);
                        const opacity = i === 0 ? "opacity-100" : i === 1 ? "opacity-80" : i === 2 ? "opacity-60" : "opacity-40";
                        return (
                            <div key={bid.id || i} className={`flex items-start gap-3 text-sm ${opacity} ${i === 0 ? "animate-pulse" : ""}`}>
                                <div className={`mt-1 min-w-[4px] h-4 rounded-full ${i === 0 ? "bg-cyan-500" : "bg-slate-700"}`}></div>
                                <div className="flex-1">
                                    <p className="text-slate-300">
                                        <span className="font-semibold text-white">{team?.name || "Unknown"}</span>{" "}
                                        bid for {player?.name || "Player"}{" "}
                                        <span className="font-mono text-cyan-400">{formatPrice(bid.amount)}</span>
                                    </p>
                                    <span className="text-[10px] text-slate-500">
                                        {new Date(bid.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    {bids.length === 0 && (
                        <div className="text-sm text-slate-500 mt-4 text-center">No bids yet for this session.</div>
                    )}
                </div>

                {/* Top Buyer Widget */}
                {topSpender && (
                    <div className="mt-4 pt-4 border-t border-slate-800/50">
                        <h3 className="text-[10px] text-slate-500 font-medium mb-2 uppercase tracking-wider">
                            Top Spender
                        </h3>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                                {topSpender.name.split(" ").map(w => w[0]).join("").toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-white">
                                    {topSpender.name}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                    {topSpender.players?.length || 0} Players
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default LiveFeed;
