// src/routes/+layout.server.ts
import type { ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async({ locals }) => {
    console.log("Layout - locals.user:", locals.user);
    
    return ({
        userData: locals?.user
    });
};