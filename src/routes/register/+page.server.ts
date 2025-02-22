import type { Actions } from "@sveltejs/kit";
import { connectToDatabase } from "$lib/db";
import type { LeaderboardEntry } from "../../types/LeaderboardEntry.js";
import { randomUUID } from "crypto";

export const actions: Actions = {

    update: async({ request }) => {

        const db = await connectToDatabase();
        const collection = db.collection<LeaderboardEntry>("Leaderboard");

        const data = await request.formData();
        const name = data.get("name") as string | null;
        const points = data.get("points") as string | null;

        console.log(name, points)

        const insertDict = {
            _id : randomUUID(),
            name : name ? name : "",
            points : points ? parseInt(points) : 0
        }

        collection.insertOne(insertDict)

        return {success : true}
    }
    
};
