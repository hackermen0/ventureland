export interface User{
    _id : string;
    name : string;
    hashedPassword : string;
    admin : boolean;
    points : number;
}