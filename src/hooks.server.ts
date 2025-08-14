import type { Handle } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import type { Admin } from "./types/Admin";
// import type { Admin } from "mongodb";

const SECRET = process.env.VITE_SECRET_KEY;

export const handle: Handle = async ({event, resolve}) => {
    const token = event.cookies.get("token");
    
    console.log("Hook - Token exists:", !!token);
    
    if(token && SECRET){
        try {
            const decoded = jwt.verify(token, SECRET) as JwtPayload & Admin;
            console.log("Hook - Decoded token:", decoded); 
            
            if (decoded.userData) {
                event.locals.user = decoded
                console.log("Hook - User set in locals:", event.locals.user); 
            }
        } catch (error) {
            console.error("Hook - JWT verification failed:", error);
            event.locals.user = null;
        }
    } else {
        console.log("Hook - No token or secret missing"); 
        event.locals.user = null;
    }
    
    return resolve(event);
};