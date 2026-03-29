"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useAuction, Team as AuctionTeam, Bid } from "./AuctionProvider";

const TeamList = () => {
    const { teams, players, currentPlayerId } = useAuction();
    const activePlayer = players.find(p => p.id === currentPlayerId);

    const formattedTeams = teams.map((team: AuctionTeam) => {
        const slotsFilled = team.players?.length || 0;
        const _id = team.name.split(" ").map((w: string) => w[0]).join("").toUpperCase();
        
        const active = activePlayer?.teamId === team.id;

        const formatPurse = (amount: number) => {
            return `${amount.toLocaleString()} pts`;
        };

        return {
            id: team.id,
            displayId: _id,
            name: team.name,
            logo: team.logo,
            slots: `${slotsFilled}/25`,
            purse: formatPurse(team.purse), 
            active,
            color: "bg-slate-700", // Fallback color since it's not in db
        };
    });

    return (
        <aside className="lg:col-span-3 flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Icon
                        icon="solar:users-group-two-rounded-linear"
                        width="16"
                    />
                    Franchises
                </h2>
                <button className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
                    View All
                </button>
            </div>

            <div className="glass-panel rounded-xl overflow-hidden flex-1 flex flex-col max-h-[600px]">
                <div className="overflow-y-auto p-1 space-y-1">
                    {formattedTeams.map((team) => (
                        <div
                            key={team.id}
                            className={`p-3 rounded-lg border flex items-center justify-between group cursor-pointer transition-all ${team.active
                                ? "bg-gradient-to-r from-blue-900/20 to-transparent border-blue-500/30"
                                : "border-transparent hover:bg-slate-800/40 hover:border-slate-700"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-lg ${team.color
                                        } flex items-center justify-center text-xs font-bold overflow-hidden ${team.displayId === "CSK" ? "text-slate-900" : "text-white"
                                        } ${team.active ? "shadow-lg shadow-blue-900/50" : ""}`}
                                >
                                    {team.logo ? (
                                        <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                                    ) : (
                                        team.displayId
                                    )}
                                </div>
                                <div>
                                    <div
                                        className={`text-sm font-semibold ${team.active ? "text-white" : "text-slate-200"
                                            }`}
                                    >
                                        {team.name}
                                    </div>
                                    <div
                                        className={`text-[10px] ${team.active ? "text-slate-400" : "text-slate-500"
                                            }`}
                                    >
                                        Slots: {team.slots}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div
                                    className={`text-sm font-mono font-medium ${team.active ? "text-white" : "text-slate-400"
                                        }`}
                                >
                                    {team.purse}
                                </div>
                                {team.active && (
                                    <div className="text-[10px] text-green-400">
                                        Active Bidder
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default TeamList;
