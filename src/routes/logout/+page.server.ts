// src/routes/logout/+page.server.ts
import type { Actions } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";

export const actions: Actions = {
    logout: async ({ cookies, locals }) => {
        console.log("LOGOUT INITIATION");
        
        cookies.set("token", "", {
            httpOnly: true,
            secure: false, 
            sameSite: 'lax',
            path: "/",
            maxAge: 0
        });
        
        locals.user = null;
        
        console.log("LOGOUT SUCCESSFUL - Cookie cleared");
        
        throw redirect(302, "/");
    }
};