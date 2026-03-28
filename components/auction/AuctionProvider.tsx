"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchTeams, fetchPlayers } from "../../services/api";
import { socket } from "../../services/socket";

export type Team = {
    id: number;
    name: string;
    purse: number;
    players: Player[];
};

export type Player = {
    id: number;
    name: string;
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
    loading: boolean;
    error: string | null;
};

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const AuctionProvider = ({ children }: { children: React.ReactNode }) => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Ideally backend emits current active player, for now we will pick the first unsold player
    const unsoldPlayers = players.filter((p) => !p.sold && !p.teamId);
    const currentPlayerId = unsoldPlayers.length > 0 ? unsoldPlayers[0].id : null;

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [teamsData, playersData] = await Promise.all([
                    fetchTeams(),
                    fetchPlayers(),
                ]);
                setTeams(teamsData);
                setPlayers(playersData);
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

        socket.on("newBid", (bidResult: Bid) => {
            setBids((prev) => [bidResult, ...prev]);

            // We must reload players and teams to get updated purse and currentBid
            // A more optimized way would be to just update state manually
            fetchTeams().then(setTeams);
            fetchPlayers().then(setPlayers);
        });

        socket.on("playerSold", ({ playerId }) => {
            fetchTeams().then(setTeams);
            fetchPlayers().then(setPlayers);
        });

        socket.on("auctionStarted", (data) => {
            // handle admin started auction
            fetchPlayers().then(setPlayers);
        });

        return () => {
            socket.off("connect");
            socket.off("newBid");
            socket.off("playerSold");
            socket.off("auctionStarted");
        };
    }, []);

    return (
        <AuctionContext.Provider
            value={{
                teams,
                players,
                bids,
                currentPlayerId,
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
