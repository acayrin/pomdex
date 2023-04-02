import { html } from "hono/html";
import { Helmet } from "./helmet.js";
import { Sidebar } from "./sidebar.js";
import { precompiled } from "./_static/precompile.js";

const Html = (props: { children?: string }) =>
	html`<!DOCTYPE html>
		<html>
			${props.children}
		</html>`;

export const Base = (props: { children?: string; title?: string; path?: string }) => {
	// flush any old components
	Helmet.flush();

	return (
		<Html>
			<head>
				<title>Pomdex | {props.title ?? "Home"}</title>

				<link
					rel="icon"
					href={precompiled.logoBase64[16]}
					type="image/x-icon"
				/>
				<link
					href="https://api.fonts.coollabs.io/icon?family=Material+Icons"
					rel="stylesheet"
				/>
				<style>
					{precompiled.styles.materialize}
					{precompiled.styles.base}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="row">
						<div class="col s4 m4 l3">
							<Sidebar path={props.path} />
						</div>
						<div class="col s8 m8 l9">{props.children}</div>
					</div>
				</div>
				<Helmet.scripts.Push>
					{precompiled.scripts.materialize}
					{precompiled.scripts.base}
				</Helmet.scripts.Push>
				<Helmet.scripts.Node />
			</body>
		</Html>
	);
};
