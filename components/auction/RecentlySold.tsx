"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useAuction, Player, Team } from "./AuctionProvider";
import { getImageUrl } from "../../services/image";

const RecentlySold = () => {
    const { players, teams } = useAuction();
    const [isExpanded, setIsExpanded] = useState(true);

    const formatPrice = (amount: number) => {
        return `${amount.toLocaleString()} pts`;
    };

    const soldPlayers = players
        .filter((p: Player) => p.sold && p.teamId)
        .map((p: Player) => {
            const team = teams.find((t: Team) => t.id === p.teamId);
            return {
                name: p.name,
                photo: p.photo,
                category: p.category,
                soldTo: team ? team.name.split(" ").map((w: string) => w[0]).join("").toUpperCase() : "Unknown",
                price: formatPrice(p.currentBid || p.basePrice),
                bgColor: "bg-green-500/10",
                textColor: "text-green-500",
                borderColor: "border-green-500/20",
            };
        });

    return (
        <section className="lg:col-span-12 mt-2">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-sm font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer group focus:outline-none"
            >
                <span className="flex items-center gap-2">
                    <Icon icon="solar:bag-check-linear" width="16" />
                    Recently Sold
                </span>
                <Icon
                    icon="solar:alt-arrow-down-bold"
                    className={`transition-transform duration-300 ${isExpanded ? "rotate-0" : "-rotate-95"}`}
                    width="16"
                />
            </button>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? "max-h-[600px] opacity-100 mt-4" : "max-h-0 opacity-0 pointer-events-none"}`}>
                <div className="glass-panel rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800/50 bg-slate-900/40">
                            <th className="p-4 font-medium">Player</th>
                            <th className="p-4 font-medium">Category</th>
                            <th className="p-4 font-medium">Sold To</th>
                            <th className="p-4 font-medium text-right">Price</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {soldPlayers.map((player: any, index: number) => (
                            <tr
                                key={index}
                                className={`${index !== soldPlayers.length - 1
                                    ? "border-b border-slate-800/30"
                                    : ""
                                    } hover:bg-slate-800/20 transition-colors`}
                            >
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                                            <img
                                                src={getImageUrl(player.photo)}
                                                alt={player.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="font-medium text-white">{player.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-400">{player.category}</td>
                                <td className="p-4">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${player.bgColor} ${player.textColor} text-xs font-medium border ${player.borderColor}`}
                                    >
                                        {player.soldTo}
                                    </span>
                                </td>
                                <td className="p-4 text-right font-mono text-white">
                                    {player.price}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            </div>
        </section>
    );
};

export default RecentlySold;
