import { connectToDatabase } from "$lib/db";
import type { Actions, ServerLoad } from "@sveltejs/kit";
import type { Admin } from "../../types/Admin";
import type { WithId } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { redirect } from "@sveltejs/kit";

export const load: ServerLoad = async ({ locals }) => {
    return ({
        userData : locals?.user
    })
}

export const actions : Actions =  {
    login: async({ request, cookies, locals }) => {

        console.log("LOGIN INITIATION")

        const SECRET = process.env.VITE_SECRET_KEY;

        const data = await request.formData();
        const username = data.get("username");
        const password : string | null = data.get("password") as string;

        

        const db = await connectToDatabase();
        const collection = db.collection<Admin>("Admins");

        if(username && password){
            const userData : WithId<Admin> | null = await collection.findOne({name : username});

            console.log("USER DATA SERVER: ", userData);

            if(!userData){
                return {error : "User not found"}
            }

            const passwordMatch = await bcrypt.compare(password, userData.hashedPassword);

            console.log(passwordMatch)

            if(passwordMatch){

                const userID = userData._id;
                if(SECRET){
                    const token = jwt.sign(userData, SECRET, {expiresIn : "24h"});

                    cookies.set("token", token, {
                        httpOnly : true,
                        secure: false,
                        sameSite: 'lax',
                        path : "/",
                        maxAge : 86400,
                    })

                    console.log("LOGIN SUCCESSFUL");

                    locals.user = userData;

                    throw redirect(302, "/leaderboard")

                } else {
                    console.error("SECRET MISSING");
                }

            } else {
                console.log("WRONG PASSWORD");
            }
        }



    }
}