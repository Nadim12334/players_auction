"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../../services/api";
import { socket } from "../../services/socket";

export type Team = {
    id: number;
    name: string;
    logo?: string;
    purse: number;
    players: Player[];
};

export type Player = {
    id: number;
    name: string;
    photo?: string;
    phoneNumber?: string;
    teamId: number | null;
    basePrice: number;
    sold: boolean;
    currentBid: number | null;
    category: string;
    fromWhere: string;
};

export type Bid = {
    id: number;
    playerId: number;
    teamId: number;
    amount: number;
    createdAt: string;
};

type AuctionContextType = {
    teams: Team[];
    players: Player[];
    bids: Bid[];
    unsoldPlayers: Player[];
    recalledNotice: { player: Player; mode: string } | null;
    currentPlayerId: number | null;
    auctionStatus: "IDLE" | "BIDDING" | "SOLD" | "UNSOLD";
    loading: boolean;
    error: string | null;
    fetchUnsoldPlayers: () => Promise<void>;
};

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const AuctionProvider = ({ children }: { children: React.ReactNode }) => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [bids, setBids] = useState<Bid[]>([]);
    const [unsoldPlayers, setUnsoldPlayers] = useState<Player[]>([]);
    const [recalledNotice, setRecalledNotice] = useState<{ player: Player; mode: string } | null>(null);
    const [activePlayerId, setActivePlayerId] = useState<number | null>(null);
    const [auctionStatus, setAuctionStatus] = useState<"IDLE" | "BIDDING" | "SOLD" | "UNSOLD">("IDLE");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentPlayerId = activePlayerId;

    const fetchUnsoldPlayers = async () => {
        try {
            const res = await api.get("/admin/unsold-players");
            setUnsoldPlayers(res.data);
        } catch (err: any) {
            console.error("Failed to fetch unsold players:", err);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [teamsRes, playersRes, bidsRes, stateRes, unsoldRes] = await Promise.all([
                    api.get("/teams"),
                    api.get("/players"),
                    api.get("/auction/history"),
                    api.get("/auction/state"),
                    api.get("/admin/unsold-players"),
                ]);
                setTeams(teamsRes.data);
                setPlayers(playersRes.data);
                setBids(bidsRes.data);
                setActivePlayerId(stateRes.data.currentPlayerId);
                setAuctionStatus(stateRes.data.status);
                setUnsoldPlayers(unsoldRes.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        socket.on("connect", () => console.log("Connected to socket:", socket.id));

        socket.on("auctionStateUpdate", (state: { currentPlayerId: number | null, status: "IDLE" | "BIDDING" | "SOLD" | "UNSOLD" }) => {
            console.log("Auction state updated:", state);
            setActivePlayerId(state.currentPlayerId);
            setAuctionStatus(state.status);

            // Refetch active datasets
            api.get("/teams").then(res => setTeams(res.data));
            api.get("/players").then(res => setPlayers(res.data));
            api.get("/auction/history").then(res => setBids(res.data));
            fetchUnsoldPlayers();
        });

        socket.on("newBid", (bidResult: Bid) => {
            setBids((prev) => [bidResult, ...prev]);
            api.get("/teams").then(res => setTeams(res.data));
            api.get("/players").then(res => setPlayers(res.data));
        });

        socket.on("playerSold", ({ playerId }) => {
            api.get("/teams").then(res => setTeams(res.data));
            api.get("/players").then(res => setPlayers(res.data));
            api.get("/auction/history").then(res => setBids(res.data));
            fetchUnsoldPlayers();
        });

        socket.on("auctionStarted", (data) => {
            console.log("Auction started for player:", data.playerId);
            setActivePlayerId(data.playerId);
            api.get("/players").then(res => setPlayers(res.data));
            api.get("/auction/history").then(res => setBids(res.data));
            fetchUnsoldPlayers();
        });

        socket.on("auctionNext", (data) => {
            console.log("Auction advanced to next player:", data.playerId);
            setActivePlayerId(data.playerId);
            setAuctionStatus("IDLE");
            api.get("/players").then(res => setPlayers(res.data));
            api.get("/auction/history").then(res => setBids(res.data));
            fetchUnsoldPlayers();
        });

        socket.on("unsoldUpdated", () => {
            fetchUnsoldPlayers();
            api.get("/players").then(res => setPlayers(res.data));
        });

        socket.on("playerRecalled", (data: { player: Player; mode: string }) => {
            setRecalledNotice(data);
            // Hide notification banner after 6 seconds
            setTimeout(() => {
                setRecalledNotice((current) => (current?.player.id === data.player.id ? null : current));
            }, 6000);
            fetchUnsoldPlayers();
            api.get("/players").then(res => setPlayers(res.data));
        });

        return () => {
            socket.off("connect");
            socket.off("auctionStateUpdate");
            socket.off("newBid");
            socket.off("playerSold");
            socket.off("auctionStarted");
            socket.off("auctionNext");
            socket.off("unsoldUpdated");
            socket.off("playerRecalled");
        };
    }, []);

    return (
        <AuctionContext.Provider
            value={{
                teams,
                players,
                bids,
                unsoldPlayers,
                recalledNotice,
                currentPlayerId,
                auctionStatus,
                loading,
                error,
                fetchUnsoldPlayers,
            }}
        >
            {children}
        </AuctionContext.Provider>
    );
};

export const useAuction = () => {
    const context = useContext(AuctionContext);
    if (context === undefined) {
        throw new Error("useAuction must be used within an AuctionProvider");
    }
    return context;
};
