import { html } from "hono/html";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Helmet } from "../../modules/helmet/helmet.js";
import { Precompile } from "../../modules/precompile/index.js";
import { precompiled } from "./_static/precompile.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

const Html = (props: { children?: string }) =>
	// prettier-ignore
	html`<!DOCTYPE html><html>${props.children}</html>`;

export const Base = (props: { children?: string; title?: string; path?: string }) => {
	// flush old components
	Helmet.flush();

	// push base styles
	Helmet.styles.Push({
		children: [
			Precompile.css("./node_modules/@materializecss/materialize/dist/css/materialize.min.css"),
			Precompile.sass(join(__dirname, "./_static/css/base.scss")),
			Precompile.sass(join(__dirname, "./_static/css/sidebar.scss")),
		],
	});

	// push base javascript
	Helmet.scripts.Push({
		children: [
			Precompile.javascript("./node_modules/iconify-icon/dist/iconify-icon.min.js"),
			Precompile.javascript("./node_modules/@materializecss/materialize/dist/js/materialize.min.js"),
			Precompile.typescript(join(__dirname, "./_static/js/base.ts")),
		],
	});

	// push base metadata
	Helmet.metadata.Push({
		children: (
			<>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>
				<meta
					name="description"
					content="Toram Online helper site"
				/>
				<meta
					property="og:title"
					content={`Pomdex | ${props.title ?? "Home"}`}
				/>
				<meta
					property="og:description"
					content="Toram Online helper site"
				/>
			</>
		),
	});

	// parse children and add their css/js
	const children = html(props.children.toString() as unknown as TemplateStringsArray);

	return (
		<Html>
			<head>
				<title>Pomdex | {props.title ?? "Home"}</title>
				<link
					rel="icon"
					href={precompiled.logoBase64[16]}
					type="image/x-icon"
				/>

				<Helmet.metadata.Node />

				<Helmet.styles.Node />
			</head>
			<body>
				<div class="container">
					<div class="row">
						<div class="sidebar-container">
							<div class="sidebar-body animate hoverable">
								<ul class="nav collapsible">
									<li class={props.path === "/" ? "active" : ""}>
										<a href="/">
											<div class="collapsible-header">
												<iconify-icon icon="solar:home-linear" />
												<span>Home</span>
											</div>
										</a>
									</li>
									<li class={props.path === "/explorer" ? "active" : ""}>
										<a href="/explorer">
											<div class="collapsible-header">
												<iconify-icon icon="material-symbols:explore-outline-rounded" />
												<span>Explore</span>
											</div>
										</a>
									</li>
									<li class={props.path === "/level" ? "active" : ""}>
										<a href="/level">
											<div class="collapsible-header">
												<iconify-icon icon="carbon:skill-level-intermediate" />
												<span>Level</span>
											</div>
										</a>
									</li>
									<li class={props.path?.includes("others") ? "active" : ""}>
										<div class="collapsible-header">
											<iconify-icon icon="basil:other-1-outline" />
											<span>Others</span>
										</div>
										<div class="collapsible-body">
											<ul class="collapsible">
												<li>
													<a href="/others/mdt">
														<div class="collapsible-header">
															<iconify-icon icon="ic:baseline-color-lens" />
															<span>Monthly Dye Table</span>
														</div>
													</a>
												</li>
											</ul>
										</div>
									</li>
									<li class={props.path === "/api" ? "active" : ""}>
										<a href="/api">
											<div class="collapsible-header">
												<iconify-icon icon="ant-design:api-outlined" />
												<span>API</span>
											</div>
										</a>
									</li>
									<li class={props.path?.includes("user") ? "active" : ""}>
										<div class="collapsible-header">
											<iconify-icon icon="mdi:account-circle-outline" />
											<span>Account</span>
										</div>
										<div
											class="collapsible-body"
											id="nav_account">
											<ul class="collapsible">
												<li>
													<a href="/user/register">
														<div class="collapsible-header">
															<iconify-icon icon="mdi:register-outline" />
															<span>Register</span>
														</div>
													</a>
												</li>
												<li>
													<a href="/user/login">
														<div class="collapsible-header">
															<iconify-icon icon="fe:login" />
															<span>Login</span>
														</div>
													</a>
												</li>
											</ul>
										</div>
									</li>
								</ul>
							</div>
						</div>
						<div class="main">{children}</div>
					</div>
				</div>

				<Helmet.scripts.Node />
			</body>
		</Html>
	);
};
