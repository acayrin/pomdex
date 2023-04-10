import { Context } from "hono";

export default (c: Context) =>
	new Promise((res) => {
		c.cookie("pomdexAccount", "", {
			path: "/",
			sameSite: "Strict",
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: -1, // delete
		});

		res(c.redirect("/"));
	});
