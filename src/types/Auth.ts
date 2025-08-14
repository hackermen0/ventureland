export interface AuthPayload {
    userID: string;
    userData: {
        _id: string;
        name: string;
        hashedPassword: string;
        admin: boolean;
        points: number;
    };
}