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

            <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/20 backdrop-blur-md">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800/80 bg-slate-950/40 text-xs font-bold uppercase tracking-widest text-slate-400">
                            <th className="py-3.5 px-4">Team Name</th>
                            <th className="py-3.5 px-4 text-center">Players</th>
                            <th className="py-3.5 px-4 text-right">Purse Left</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-sm">
                        {formattedTeams.map((team) => (
                            <tr
                                key={team.id}
                                className={`transition-all duration-200 ${
                                    team.isLeadingBidder
                                        ? "bg-cyan-500/10 text-cyan-400 font-bold border-y border-cyan-500/30"
                                        : "hover:bg-slate-900/30 text-slate-300 odd:bg-slate-900/10 even:bg-transparent"
                                }`}
                            >
                                <td className="py-2.5 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-300 shadow-inner flex-shrink-0">
                                            {team.logo ? (
                                                <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                                            ) : (
                                                team.name.split(" ").map(w => w[0]).join("").toUpperCase()
                                            )}
                                        </div>
                                        <span className="truncate max-w-[150px] sm:max-w-none uppercase tracking-tight text-xs sm:text-sm">
                                            {team.name}
                                        </span>
                                        {team.isLeadingBidder && (
                                            <span className="ml-1 flex h-2 w-2 relative flex-shrink-0">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-2.5 px-4 text-center font-mono font-bold text-xs sm:text-sm">
                                    {team.purchasedCount}
                                </td>
                                <td className={`py-2.5 px-4 text-right font-mono font-bold text-xs sm:text-sm ${team.isLeadingBidder ? 'text-cyan-400' : 'text-emerald-400'}`}>
                                    ₹{team.purse.toLocaleString()}
                                </td>
                            </tr>
                        ))}

                        {teams.length === 0 && (
                            <tr>
                                <td colSpan={3} className="py-12 text-center text-slate-600 bg-slate-900/5">
                                    <div className="flex flex-col items-center gap-2">
                                        <Icon icon="solar:users-group-two-rounded-linear" width="32" className="opacity-20" />
                                        <p className="text-xs font-semibold">No franchises found. Create them in Setup dashboard.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamList;
