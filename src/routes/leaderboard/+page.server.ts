import { connectToDatabase } from "$lib/db";
import type { Actions } from "@sveltejs/kit";
import type { User } from "../../types/User.js";

export const load = async ():Promise<{data : User[]}> => {
    const db = await connectToDatabase();
    const collection = db.collection<User>("Leaderboard");

    let data = await collection.find({}, {sort : {"points" : -1}}).toArray();
    return { data }
}


export const actions: Actions = {
    
    delete : async({ request }) => {

        const data = await request.formData();
        const delete_id = data.get("id");

        if (delete_id) {
            const db = await connectToDatabase();
            const collection = db.collection<User>("Leaderboard");
            await collection.deleteOne({ "_id": delete_id });
        }

        else {
            console.error(`DELETE ID NOT DEFINED: ${delete_id}`)
        }

    }
};