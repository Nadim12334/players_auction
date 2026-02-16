"use client";

import React from "react";
import { Icon } from "@iconify/react";

const PlayerCard = () => {
    return (
        <section className="lg:col-span-6 flex flex-col gap-6">
            {/* Main Player Card */}
            <div className="glass-panel rounded-2xl p-1 relative overflow-hidden group">
                {/* Decorative Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>

                <div className="bg-slate-900/80 rounded-xl overflow-hidden relative border border-white/5">
                    {/* Top Status Bar */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                        <div className="px-3 py-1 rounded-full bg-slate-950/60 backdrop-blur border border-slate-700 text-xs font-medium text-cyan-400 flex items-center gap-1.5 shadow-lg">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            Live Auction
                        </div>
                        <div className="px-3 py-1 rounded-full bg-slate-950/60 backdrop-blur border border-slate-700 text-xs font-medium text-slate-300 shadow-lg">
                            Set No. 4 • All-Rounders
                        </div>
                    </div>

                    {/* Player Visual & Info */}
                    <div className="flex flex-col md:flex-row">
                        {/* Image Container */}
                        <div className="w-full md:w-5/12 h-64 md:h-auto relative bg-gradient-to-b from-slate-800 to-slate-900 flex items-end justify-center overflow-hidden">
                            {/* Silhouette/Image Placeholder */}
                            <img
                                src="https://images.unsplash.com/photo-1624194686522-83788533d11b?q=80&w=800&auto=format&fit=crop"
                                className="w-full h-full object-cover opacity-90 mix-blend-overlay md:opacity-100 md:mix-blend-normal absolute inset-0"
                                alt="Player"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent md:bg-gradient-to-r"></div>

                            {/* Category Badge overlaid on image for mobile, separate for desktop structure */}
                            <div className="absolute bottom-4 left-4">
                                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-lg">
                                    All-Rounder
                                </span>
                            </div>
                        </div>

                        {/* Data Container */}
                        <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-display font-semibold text-white tracking-tight leading-tight">
                                            Arjun <span className="text-slate-400">Verma</span>
                                        </h1>
                                        <div className="flex items-center gap-2 mt-2 text-slate-400 text-sm">
                                            <Icon
                                                icon="solar:flag-linear"
                                                className="text-slate-500"
                                            />
                                            <span>India (Karnataka)</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                            <span>Age: 24</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                                            Base Price
                                        </div>
                                        <div className="text-lg font-mono text-slate-300">
                                            ₹ 20 L
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-2 mt-6">
                                    <div className="bg-slate-800/40 border border-slate-700/50 rounded p-2 text-center">
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                                            Matches
                                        </div>
                                        <div className="text-sm font-medium text-white">45</div>
                                    </div>
                                    <div className="bg-slate-800/40 border border-slate-700/50 rounded p-2 text-center">
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                                            Strike Rate
                                        </div>
                                        <div className="text-sm font-medium text-white">142.5</div>
                                    </div>
                                    <div className="bg-slate-800/40 border border-slate-700/50 rounded p-2 text-center">
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                                            Wickets
                                        </div>
                                        <div className="text-sm font-medium text-white">28</div>
                                    </div>
                                </div>
                            </div>

                            {/* Bid Section */}
                            <div className="mt-8 pt-6 border-t border-slate-800/80">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs font-medium uppercase tracking-widest text-cyan-400">
                                        Current Highest Bid
                                    </span>
                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <Icon icon="solar:hammer-linear" />
                                        Held by{" "}
                                        <span className="text-white font-semibold">
                                            Mumbai Indians
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-5xl md:text-6xl font-display font-medium text-white tracking-tighter glow-text">
                                        <span className="text-2xl text-slate-500 align-top mt-2 inline-block font-sans">
                                            ₹
                                        </span>
                                        2.40
                                        <span className="text-2xl text-slate-500 align-bottom mb-2 inline-block font-sans">
                                            Cr
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Controls */}
                <div className="glass-panel p-4 rounded-xl flex flex-col justify-center">
                    <label className="text-xs text-slate-400 mb-3 flex justify-between">
                        <span>Bid Increment</span>
                        <span>Next: ₹ 2.50 Cr</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white py-2 rounded text-xs font-medium transition-colors">
                            + 5L
                        </button>
                        <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white py-2 rounded text-xs font-medium transition-colors">
                            + 10L
                        </button>
                        <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white py-2 rounded text-xs font-medium transition-colors">
                            + 20L
                        </button>
                    </div>
                </div>

                {/* Main Action */}
                <button className="relative group overflow-hidden rounded-xl bg-cyan-500 hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <span className="relative z-10 flex items-center gap-3 text-slate-950 font-bold text-xl uppercase tracking-wider">
                        <Icon icon="solar:gavel-bold" width="24" />
                        Place Bid
                    </span>
                </button>
            </div>
        </section>
    );
};

export default PlayerCard;
