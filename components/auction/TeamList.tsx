"use client";

import React from "react";
import { Icon } from "@iconify/react";

const TeamList = () => {
    const teams = [
        {
            id: "MI",
            name: "Mumbai Indians",
            slots: "18/25",
            purse: "₹ 24.5 Cr",
            active: true,
            color: "bg-blue-600",
        },
        {
            id: "CSK",
            name: "Chennai Kings",
            slots: "21/25",
            purse: "₹ 12.2 Cr",
            active: false,
            color: "bg-yellow-500",
        },
        {
            id: "RCB",
            name: "Royal Challengers",
            slots: "15/25",
            purse: "₹ 32.0 Cr",
            active: false,
            color: "bg-red-600",
        },
        {
            id: "KKR",
            name: "Knight Riders",
            slots: "22/25",
            purse: "₹ 8.5 Cr",
            active: false,
            color: "bg-purple-600",
        },
        {
            id: "SRH",
            name: "Sunrisers",
            slots: "19/25",
            purse: "₹ 18.0 Cr",
            active: false,
            color: "bg-orange-500",
        },
    ];

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
                    {teams.map((team) => (
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
                                        } flex items-center justify-center text-xs font-bold ${team.id === "CSK" ? "text-slate-900" : "text-white"
                                        } ${team.active ? "shadow-lg shadow-blue-900/50" : ""}`}
                                >
                                    {team.id}
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
