import { connectToDatabase } from "$lib/db";
import type { LeaderboardEntry } from "../../types/LeaderboardEntry.js";

export const load = async ():Promise<{data : LeaderboardEntry[]}> => {
    const db = await connectToDatabase();
    const collection = db.collection<LeaderboardEntry>("Leaderboard");

    const data = await collection.find({}, {sort : {"points" : -1}}).toArray();
    return { data }
}


