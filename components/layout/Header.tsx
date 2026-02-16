"use client";

import React from "react";
import { Icon } from "@iconify/react";

const Header = () => {
    return (
        <header className="h-16 border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-[1600px] mx-auto px-4 h-full flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
                        <Icon icon="solar:cup-star-linear" width="20" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-display uppercase tracking-tight text-white text-lg leading-none">
                            Titan<span className="text-cyan-400">League</span>
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">
                            Mega Auction 2025
                        </span>
                    </div>
                </div>

                {/* Timer */}
                <div className="hidden md:flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                        Lot Closes In
                    </span>
                    <div className="flex items-center gap-1 font-display text-2xl text-white tracking-tight">
                        <span className="bg-slate-900/80 border border-slate-800 rounded px-2 py-0.5 min-w-[2rem] text-center">
                            00
                        </span>
                        <span className="text-slate-600">:</span>
                        <span className="bg-slate-900/80 border border-slate-800 rounded px-2 py-0.5 min-w-[2rem] text-center text-red-500 animate-pulse">
                            45
                        </span>
                    </div>
                </div>

                {/* Admin Controls */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 transition-colors cursor-pointer">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        <span className="text-xs font-medium text-slate-400">
                            System Live
                        </span>
                    </div>
                    <button className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition-all">
                        <Icon icon="solar:settings-linear" width="20" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-xs font-semibold text-white cursor-pointer hover:ring-2 hover:ring-cyan-500/50 transition-all">
                        AD
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
