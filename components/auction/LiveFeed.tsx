"use client";

import React from "react";
import { Icon } from "@iconify/react";

const LiveFeed = () => {
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
                        <div className="text-[10px] text-slate-500">Remaining</div>
                        <div className="text-lg font-mono text-white">124</div>
                    </div>
                    <div className="bg-slate-800/30 rounded p-2">
                        <div className="text-[10px] text-slate-500">Sold</div>
                        <div className="text-lg font-mono text-cyan-400">42</div>
                    </div>
                </div>

                <h3 className="text-xs text-slate-500 font-medium mb-3 uppercase tracking-wider">
                    Recent Bids
                </h3>

                <div className="overflow-y-auto space-y-3 pr-1 flex-1">
                    {/* Feed Item */}
                    <div className="flex items-start gap-3 text-sm animate-pulse">
                        <div className="mt-1 min-w-[4px] h-4 rounded-full bg-cyan-500"></div>
                        <div className="flex-1">
                            <p className="text-slate-300">
                                <span className="font-semibold text-white">Mumbai Indians</span>{" "}
                                raised bid to{" "}
                                <span className="font-mono text-cyan-400">₹ 2.40 Cr</span>
                            </p>
                            <span className="text-[10px] text-slate-500">Just now</span>
                        </div>
                    </div>

                    {/* Feed Item */}
                    <div className="flex items-start gap-3 text-sm opacity-70">
                        <div className="mt-1 min-w-[4px] h-4 rounded-full bg-slate-700"></div>
                        <div className="flex-1">
                            <p className="text-slate-300">
                                <span className="font-semibold text-white">RCB</span> raised bid
                                to <span className="font-mono text-slate-400">₹ 2.20 Cr</span>
                            </p>
                            <span className="text-[10px] text-slate-500">12s ago</span>
                        </div>
                    </div>

                    {/* Feed Item */}
                    <div className="flex items-start gap-3 text-sm opacity-50">
                        <div className="mt-1 min-w-[4px] h-4 rounded-full bg-slate-700"></div>
                        <div className="flex-1">
                            <p className="text-slate-300">
                                <span className="font-semibold text-white">Mumbai Indians</span>{" "}
                                entered bidding at{" "}
                                <span className="font-mono text-slate-400">₹ 2.00 Cr</span>
                            </p>
                            <span className="text-[10px] text-slate-500">25s ago</span>
                        </div>
                    </div>

                    {/* Feed Item */}
                    <div className="flex items-start gap-3 text-sm opacity-40">
                        <div className="mt-1 min-w-[4px] h-4 rounded-full bg-slate-700"></div>
                        <div className="flex-1">
                            <p className="text-slate-300">
                                <span className="font-semibold text-white">CSK</span> opened bid
                                at <span className="font-mono text-slate-400">₹ 0.20 Cr</span>
                            </p>
                            <span className="text-[10px] text-slate-500">45s ago</span>
                        </div>
                    </div>
                </div>

                {/* Top Buyer Widget */}
                <div className="mt-4 pt-4 border-t border-slate-800/50">
                    <h3 className="text-[10px] text-slate-500 font-medium mb-2 uppercase tracking-wider">
                        Top Spender
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center text-xs font-bold text-white">
                            RCB
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-white">
                                Royal Challengers
                            </span>
                            <span className="text-[10px] text-slate-400">
                                ₹ 32.0 Cr Spent
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default LiveFeed;
