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
    currentPlayerId: number | null;
    auctionStatus: "IDLE" | "BIDDING" | "SOLD" | "UNSOLD";
    loading: boolean;
    error: string | null;
};

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const AuctionProvider = ({ children }: { children: React.ReactNode }) => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [bids, setBids] = useState<Bid[]>([]);
    const [activePlayerId, setActivePlayerId] = useState<number | null>(null);
    const [auctionStatus, setAuctionStatus] = useState<"IDLE" | "BIDDING" | "SOLD" | "UNSOLD">("IDLE");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentPlayerId = activePlayerId;

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [teamsRes, playersRes, bidsRes, stateRes] = await Promise.all([
                    api.get("/teams"),
                    api.get("/players"),
                    api.get("/auction/history"),
                    api.get("/auction/state"),
                ]);
                setTeams(teamsRes.data);
                setPlayers(playersRes.data);
                setBids(bidsRes.data);
                setActivePlayerId(stateRes.data.currentPlayerId);
                setAuctionStatus(stateRes.data.status);
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

            // Refetch active datasets to get correct remaining purses and bids
            api.get("/teams").then(res => setTeams(res.data));
            api.get("/players").then(res => setPlayers(res.data));
            api.get("/auction/history").then(res => setBids(res.data));
        });

        socket.on("newBid", (bidResult: Bid) => {
            setBids((prev) => [bidResult, ...prev]);

            // We must reload players and teams to get updated purse and currentBid
            api.get("/teams").then(res => setTeams(res.data));
            api.get("/players").then(res => setPlayers(res.data));
        });

        socket.on("playerSold", ({ playerId }) => {
            api.get("/teams").then(res => setTeams(res.data));
            api.get("/players").then(res => setPlayers(res.data));
            api.get("/auction/history").then(res => setBids(res.data));
        });

        socket.on("auctionStarted", (data) => {
            console.log("Auction started for player:", data.playerId);
            setActivePlayerId(data.playerId);
            api.get("/players").then(res => setPlayers(res.data));
            api.get("/auction/history").then(res => setBids(res.data));
        });

        socket.on("auctionNext", (data) => {
            console.log("Auction advanced to next player:", data.playerId);
            setActivePlayerId(data.playerId);
            setAuctionStatus("IDLE");
            api.get("/players").then(res => setPlayers(res.data));
            api.get("/auction/history").then(res => setBids(res.data));
        });

        return () => {
            socket.off("connect");
            socket.off("auctionStateUpdate");
            socket.off("newBid");
            socket.off("playerSold");
            socket.off("auctionStarted");
            socket.off("auctionNext");
        };
    }, []);

    return (
        <AuctionContext.Provider
            value={{
                teams,
                players,
                bids,
                currentPlayerId,
                auctionStatus,
                loading,
                error,
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
