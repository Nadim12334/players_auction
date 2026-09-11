"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useAuction } from "./AuctionProvider";
import { getImageUrl } from "../../services/image";

const TeamList = () => {
    const { teams, players, currentPlayerId } = useAuction();
    const activePlayer = players.find(p => p.id === currentPlayerId);

    const formattedTeams = teams.map((team) => {
        // Count ONLY sold players assigned to this team
        const playersPurchasedCount =
            team.players?.filter(p => p.sold && p.teamId === team.id).length || 0;

        // Check if this team is the current leading bidder for the active player
        const isLeadingBidder =
            activePlayer && !activePlayer.sold && activePlayer.teamId === team.id;

        // Dynamic Maximum Available Bid
        const MIN_PLAYERS_REQUIRED = 8;
        const MIN_BASE_PRICE = 500;
        const requiredPlayersCount = Math.max(0, MIN_PLAYERS_REQUIRED - playersPurchasedCount);
        const effectivePurse =
            isLeadingBidder &&
            activePlayer?.currentBid !== null &&
            activePlayer?.currentBid !== undefined
                ? team.purse + activePlayer.currentBid
                : team.purse;
        const maxAvailableBid = effectivePurse - requiredPlayersCount * MIN_BASE_PRICE;

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

    return (
        <div className="flex flex-col gap-3 w-full h-full">

            {/* Section Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Icon
                        icon="solar:users-group-two-rounded-bold"
                        width="16"
                        className="text-cyan-400"
                    />
                    Franchise Standings
                </h2>
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    {teams.length} {teams.length === 1 ? "Team" : "Teams"}
                </div>
            </div>

            {/* Empty State */}
            {teams.length === 0 && (
                <div className="w-full py-10 text-center text-slate-600 bg-slate-900/10 border border-slate-800 rounded-2xl flex flex-col items-center gap-3">
                    <Icon
                        icon="solar:users-group-two-rounded-linear"
                        width="28"
                        className="opacity-20"
                    />
                    <p className="text-xs font-semibold">
                        No franchises found. Create them in the Setup dashboard.
                    </p>
                </div>
            )}

            {/* Single Scrollable Table */}
            {teams.length > 0 && (
                <div className="w-full rounded-xl border border-slate-800/70 bg-slate-900/10 backdrop-blur-md overflow-hidden">
                    {/* Scrollable body — max height syncs visually with PlayerCard (~520px) */}
                    <div className="overflow-y-auto max-h-[520px] custom-scrollbar">
                        <table className="w-full text-left table-fixed">
                            <colgroup>
                                {/* Team Name — takes remaining space */}
                                <col />
                                {/* Players */}
                                <col style={{ width: "72px" }} />
                                {/* Purse Left */}
                                <col style={{ width: "110px" }} />
                                {/* Max Bid */}
                                <col style={{ width: "115px" }} />
                            </colgroup>

                            {/* Sticky Header */}
                            <thead className="sticky top-0 z-10">
                                <tr className="border-b border-slate-700 bg-slate-950 text-[10px] font-bold uppercase tracking-widest">
                                    <th className="py-2.5 px-4 text-slate-400">Team Name</th>
                                    <th className="py-2.5 px-4 text-center text-slate-400 whitespace-nowrap">
                                        Players
                                    </th>
                                    <th className="py-2.5 px-4 text-right text-slate-400 whitespace-nowrap">
                                        Purse Left
                                    </th>
                                    <th className="py-2.5 px-4 text-right text-amber-500 whitespace-nowrap">
                                        Max Bid
                                    </th>
                                </tr>
                            </thead>

                            {/* Scrollable Body */}
                            <tbody className="divide-y divide-slate-800/40">
                                {formattedTeams.map((team) => (
                                    <tr
                                        key={team.id}
                                        className={`transition-colors duration-150 ${
                                            team.isLeadingBidder
                                                ? "bg-cyan-500/10 border-y border-cyan-500/20"
                                                : "hover:bg-slate-800/20 odd:bg-slate-900/10 even:bg-transparent"
                                        }`}
                                    >
                                        {/* Team Name — wraps onto next line */}
                                        <td className="py-2.5 px-4 align-middle">
                                            <div className="flex items-center gap-2.5">
                                                {/* Logo / Initials */}
                                                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/60 overflow-hidden flex items-center justify-center font-bold text-[9px] text-slate-400 shadow-inner flex-shrink-0">
                                                    {team.logo ? (
                                                        <img
                                                            src={getImageUrl(team.logo)}
                                                            alt={team.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        team.name
                                                            .split(" ")
                                                            .map(w => w[0])
                                                            .join("")
                                                            .toUpperCase()
                                                    )}
                                                </div>

                                                {/* Name wraps freely */}
                                                <span
                                                    className={`font-semibold text-xs uppercase tracking-tight leading-snug break-words whitespace-normal ${
                                                        team.isLeadingBidder
                                                            ? "text-cyan-300"
                                                            : "text-white"
                                                    }`}
                                                >
                                                    {team.name}
                                                </span>

                                                {/* Live pulse for leading bidder */}
                                                {team.isLeadingBidder && (
                                                    <span className="flex h-1.5 w-1.5 relative flex-shrink-0">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500" />
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Players Purchased */}
                                        <td className="py-2.5 px-4 text-center align-middle">
                                            <span
                                                className={`font-mono font-bold text-sm ${
                                                    team.isLeadingBidder
                                                        ? "text-cyan-400"
                                                        : "text-slate-200"
                                                }`}
                                            >
                                                {team.purchasedCount}
                                            </span>
                                        </td>

                                        {/* Purse Left */}
                                        <td className="py-2.5 px-4 text-right align-middle">
                                            <span
                                                className={`font-mono font-bold text-xs whitespace-nowrap ${
                                                    team.isLeadingBidder
                                                        ? "text-cyan-400"
                                                        : "text-emerald-400"
                                                }`}
                                            >
                                                ₹{team.purse.toLocaleString()}
                                            </span>
                                        </td>

                                        {/* Max Available Bid */}
                                        <td className="py-2.5 px-4 text-right align-middle">
                                            <span className="font-mono font-bold text-xs text-amber-400 whitespace-nowrap">
                                                ₹{Math.max(0, team.maxAvailableBid).toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamList;
