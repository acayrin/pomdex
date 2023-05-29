import { Context } from "hono";

export default (c: Context) =>
	Promise.resolve(() => {
		c.cookie("pomdexAccount", "", {
			path: "/",
			sameSite: "Strict",
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: -1, // delete
		});

		return c.redirect("/");
	});
