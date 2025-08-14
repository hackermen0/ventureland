import type { ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async({ locals }) => {
    return ({
        userData : locals?.user
    })
}