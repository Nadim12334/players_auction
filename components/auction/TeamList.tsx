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

        // Dynamic Maximum Available Bid Calculation
        const MIN_PLAYERS_REQUIRED = 8;
        const MIN_BASE_PRICE = 500;
        const requiredPlayersCount = Math.max(0, MIN_PLAYERS_REQUIRED - playersPurchasedCount);
        const effectivePurse = isLeadingBidder && activePlayer?.currentBid !== null && activePlayer?.currentBid !== undefined
            ? team.purse + activePlayer.currentBid
            : team.purse;
        const maxAvailableBid = effectivePurse - (requiredPlayersCount * MIN_BASE_PRICE);

        return {
            id: team.id,
            name: team.name,
            logo: team.logo,
            purse: team.purse,
            purchasedCount: playersPurchasedCount,
            isLeadingBidder,
            maxAvailableBid,
        };
    });

    const chunkArray = <T,>(arr: T[], size: number): T[][] => {
        const result: T[][] = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    };

    const teamChunks = chunkArray(formattedTeams, 7);

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Icon icon="solar:users-group-two-rounded-bold" width="16" className="text-cyan-400" />
                    Franchise Standings
                </h2>
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    Total Teams: {teams.length}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full items-start">
                {teamChunks.map((chunk, index) => (
                    <div key={index} className="flex-1 min-w-[290px] max-w-full overflow-hidden rounded-xl border border-slate-850 bg-slate-900/10 backdrop-blur-md">
                        <table className="w-full text-left table-fixed">
                            <colgroup>
                                <col />
                                <col style={{ width: "52px" }} />
                                <col style={{ width: "88px" }} />
                                <col style={{ width: "96px" }} />
                            </colgroup>
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-950/30 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                    <th className="py-2 px-3">Team Name</th>
                                    <th className="py-2 px-3 text-center whitespace-nowrap">Players</th>
                                    <th className="py-2 px-3 text-right whitespace-nowrap">Purse Left</th>
                                    <th className="py-2 px-3 text-right whitespace-nowrap text-amber-500">Max Bid</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30 text-xs">
                                {chunk.map((team) => (
                                    <tr
                                        key={team.id}
                                        className={`transition-all duration-150 ${team.isLeadingBidder
                                            ? "bg-cyan-500/15 text-cyan-400 font-bold border-y border-cyan-500/25"
                                            : "hover:bg-slate-900/30 text-slate-300 odd:bg-slate-900/10 even:bg-transparent"
                                            }`}
                                    >
                                        <td className="py-1.5 px-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700/60 overflow-hidden flex items-center justify-center font-bold text-[8px] text-slate-400 shadow-inner flex-shrink-0">
                                                    {team.logo ? (
                                                        <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        team.name.split(" ").map(w => w[0]).join("").toUpperCase()
                                                    )}
                                                </div>
                                                <span className="truncate max-w-[110px] sm:max-w-none uppercase tracking-tight text-[11px] sm:text-xs">
                                                    {team.name}
                                                </span>
                                                {team.isLeadingBidder && (
                                                    <span className="ml-0.5 flex h-1.5 w-1.5 relative flex-shrink-0">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-1.5 px-3 text-center font-mono font-bold text-xs">
                                            {team.purchasedCount}
                                        </td>
                                        <td className={`py-1.5 px-3 text-right font-mono font-bold text-xs ${team.isLeadingBidder ? 'text-cyan-400' : 'text-slate-300'}`}>
                                            ₹{team.purse.toLocaleString()}
                                        </td>
                                        <td className="py-1.5 px-3 text-right font-mono font-bold text-xs text-amber-400">
                                            ₹{Math.max(0, team.maxAvailableBid).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}

                {teams.length === 0 && (
                    <div className="w-full py-8 text-center text-slate-600 bg-slate-900/10 border border-slate-850 rounded-xl flex flex-col items-center gap-2">
                        <Icon icon="solar:users-group-two-rounded-linear" width="24" className="opacity-20" />
                        <p className="text-[11px] font-semibold">No franchises found. Create them in Setup dashboard.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamList;
