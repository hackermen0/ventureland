import type { Admin } from "./Admin";

export interface AuthPayload {
    userData: Admin;
    // exp: number;
    // iat: number;
}