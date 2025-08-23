export interface User {
    _id: string;
    name: string;
    email?: string;
    discord_id?: string; // Changed to string to avoid serialization issues
    discord_name?: string;
    points: number;
}