import { connectToDatabase } from "$lib/db";
import type { User } from "../../types/User.js";

export const load = async ():Promise<{data : User[]}> => {
    const db = await connectToDatabase();
    const collection = db.collection<User>("Leaderboard");

    const data = await collection.find({}, {sort : {"points" : -1}}).toArray();
    return { data }
}


