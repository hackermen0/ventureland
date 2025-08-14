import type { Handle } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import type { AuthPayload } from "./types/Auth";



const SECRET = process.env.VITE_SECRET_KEY;

export const handle: Handle = async ({event, resolve}) => {
    const token = event.cookies.get("token")
    
    if(token && SECRET){
        try {
            const decoded  = jwt.verify(token, SECRET) as JwtPayload & AuthPayload;
            if (decoded.userID) {
                event.locals.user = decoded;
            }
        } catch {
            event.locals.user = null;
        }
    }
    return resolve(event)
};