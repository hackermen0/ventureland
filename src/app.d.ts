// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user? : {
				userID : string;
				userData : {
					_id : string;
					name : string;
					hashedPassword : string;
					admin : boolean;
					points : number;
				};
			} | null
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
