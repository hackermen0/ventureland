import type { Actions } from "@sveltejs/kit";
import { connectToDatabase } from "$lib/db";
import type { Admin } from "../../types/Admin";
import { randomUUID, randomBytes } from "crypto";
import bcrypt from "bcryptjs"

export const actions: Actions = {

    update: async({ request }) => {

        const db = await connectToDatabase();
        const collection = db.collection<Admin>("Admins")

        const data = await request.formData();
        const name = data.get("name") as string | null;
        const password = data.get("password") as string | null;
        const id = randomUUID()
        // const password = randomBytes(4).toString("hex");

        console.log(name, id, password)


        if(password) {
            const hashedPassword = await bcrypt.hash(password, 4);

            const insertDict = {
                _id : id,
                name : name ? name : "",
                hashedPassword : hashedPassword,
                // points : points ? parseInt(points) : 0
            }
    
            collection.insertOne(insertDict)
    
            return (
                {
                    success : true,
                    userData : insertDict,
                })
        } else {
            console.error("ERROR IN PASSWORD HASHING");
        }
    }
    
};
