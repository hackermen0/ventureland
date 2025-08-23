import { connectToDatabase } from "$lib/db";
import type { Actions } from "@sveltejs/kit";
import type { User } from "../../types/User.js";

export const load = async (): Promise<{data: User[]}> => {
    const db = await connectToDatabase();
    const collection = db.collection<User>("Leaderboard");

    let rawData = await collection.find({}, {sort: {"points": -1}}).toArray();
    
    // Convert the data to plain objects to ensure serialization
    let data: User[] = rawData.map(item => ({
        _id: item._id.toString(), // Ensure _id is a string
        name: item.name,
        email: item.email || "", // Handle optional fields
        discord_id: item.discord_id ? String(item.discord_id) : "", // Convert discord_id to string
        discord_name: item.discord_name || "",
        points: Number(item.points) || 0 // Ensure points is a number
    }));
    
    return { data };
}

export const actions: Actions = {
    delete: async({ request }) => {
        const data = await request.formData();
        const delete_id = data.get("id");

        if (delete_id) {
            const db = await connectToDatabase();
            const collection = db.collection<User>("Leaderboard");
            await collection.deleteOne({ "_id": delete_id });
        } else {
            console.error(`DELETE ID NOT DEFINED: ${delete_id}`);
        }
    }
};