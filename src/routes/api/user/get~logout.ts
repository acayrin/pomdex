import { Context } from "hono";

export default async (c: Context) => {
	// request valid
	c.cookie("pomdexAccount", "", {
		path: "/",
		sameSite: "Strict",
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		maxAge: -1, // delete
	});
	return c.json({
		status: 200,
		message: "Successfully logged out",
	});
};
