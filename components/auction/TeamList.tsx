"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useAuction } from "./AuctionProvider";

const TeamList = () => {
    const { teams, players, currentPlayerId } = useAuction();
    const activePlayer = players.find(p => p.id === currentPlayerId);

    const formattedTeams = teams.map((team) => {
        // Count ONLY sold players assigned to this team
        const playersPurchasedCount = team.players?.filter(p => p.sold && p.teamId === team.id).length || 0;
        
        // Check if this team is the current leading bidder for the active player
        const isLeadingBidder = activePlayer && !activePlayer.sold && activePlayer.teamId === team.id;

        return {
            id: team.id,
            name: team.name,
            logo: team.logo,
            purse: team.purse,
            purchasedCount: playersPurchasedCount,
            isLeadingBidder,
        };
    });

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Icon icon="solar:users-group-two-rounded-bold" width="18" className="text-cyan-400" />
                    Franchise Standings
                </h2>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    Total Teams: {teams.length}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formattedTeams.map((team) => (
                    <div
                        key={team.id}
                        className={`relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 min-h-[140px] bg-slate-900/40 ${
                            team.isLeadingBidder
                            ? "border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)] bg-gradient-to-b from-slate-950 to-slate-900 scale-[1.02]"
                            : "border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/50"
                        }`}
                    >
                        {/* Leading Bidder Pulsing Border */}
                        {team.isLeadingBidder && (
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 shadow-md">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                </span>
                                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">
                                    LEADING BID
                                </span>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-slate-300 text-lg shadow-inner">
                                {team.logo ? (
                                    <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                                ) : (
                                    team.name.split(" ").map(w => w[0]).join("").toUpperCase()
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-white truncate uppercase tracking-tight">
                                    {team.name}
                                </div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
                                    Players: <span className="text-slate-300 font-mono font-bold">{team.purchasedCount}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/40 flex justify-between items-baseline">
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Remaining Purse</span>
                            <span className="text-xl font-bold font-mono text-cyan-400">
                                {team.purse.toLocaleString()} <span className="text-xs text-slate-500 font-sans font-normal ml-0.5">pts</span>
                            </span>
                        </div>
                    </div>
                ))}

                {teams.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-600 bg-slate-900/20 border border-slate-800 rounded-2xl flex flex-col items-center gap-2">
                        <Icon icon="solar:users-group-two-rounded-linear" width="32" className="opacity-20" />
                        <p className="text-xs font-semibold">No franchises found. Create them in Setup dashboard.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamList;
