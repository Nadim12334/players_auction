"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useAuction, Player, Team } from "./AuctionProvider";

const RecentlySold = () => {
    const { players, teams } = useAuction();

    const formatPrice = (amount: number) => {
        return `${amount.toLocaleString()} pts`;
    };

    const soldPlayers = players
        .filter((p: Player) => p.sold && p.teamId)
        .map((p: Player) => {
            const team = teams.find((t: Team) => t.id === p.teamId);
            return {
                name: p.name,
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
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Icon icon="solar:bag-check-linear" width="16" />
                Recently Sold
            </h2>
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
                                        <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                                            {/* Placeholder avatar */}
                                            <svg
                                                className="w-full h-full text-slate-500"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                            </svg>
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
        </section>
    );
};

export default RecentlySold;
