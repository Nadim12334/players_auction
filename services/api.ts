export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const fetchTeams = async () => {
    const res = await fetch(`${API_URL}/api/teams`);
    if (!res.ok) throw new Error("Failed to fetch teams");
    return res.json();
};

export const fetchPlayers = async () => {
    const res = await fetch(`${API_URL}/api/players`);
    if (!res.ok) throw new Error("Failed to fetch players");
    return res.json();
};

export const placeBid = async (playerId: number, teamId: number, amount: number) => {
    const res = await fetch(`${API_URL}/api/auction/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, teamId, amount })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to place bid");
    }
    return res.json();
};
