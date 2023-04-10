export type Account = {
	username: string;
	password: string;
	token: string;
	type: "user" | "admin";
	joinDate: number;
	lastOnline: number;
	emailAddress?: string;
	favorites?: string[];
};
