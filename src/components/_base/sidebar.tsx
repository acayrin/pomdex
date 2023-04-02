import { PomdexAccounts } from "../../modules/database/init.js";
import { precompiled } from "./_static/precompile.js";

export const Sidebar = (props: { path: string }) => (
	<div class="sidebar animate card">
		<div class="card-content">
			<div class="section">
				<img
					class="responsive-img"
					src={precompiled.logoBase64[96]}
					alt="logo"
				/>

				<h4>Pomdex</h4>
				<p>simple and usable Toram Online related website</p>
			</div>
			<div class="divider" />
			<div class="section">
				<ul class="nav collapsible">
					<li class={props.path === "/" ? "active" : ""}>
						<a href="/">
							<div class="collapsible-header">Home</div>
						</a>
					</li>
					<li class={props.path === "/explore" ? "active" : ""}>
						<a href="/explore">
							<div class="collapsible-header">Explore</div>
						</a>
					</li>
					<li class={props.path === "/level" ? "active" : ""}>
						<a href="/level">
							<div class="collapsible-header">Level</div>
						</a>
					</li>
					<li class={props.path === "/api" ? "active" : ""}>
						<a href="/api">
							<div class="collapsible-header">API</div>
						</a>
					</li>
					<li>
						<div class="collapsible-header">Account</div>
						<div
							class="collapsible-body"
							id="nav_account">
							<ul class="collapsible">
								<li>
									<a href="/user/register">
										<div class="collapsible-header">Register</div>
									</a>
								</li>
								<li>
									<a href="/user/login">
										<div class="collapsible-header">Login</div>
									</a>
								</li>
							</ul>
						</div>
					</li>
					<li class="hidden active" />
				</ul>
			</div>
			<div class="divider" />
			<div class="section">
				<p>
					not related to <b>Asobimo</b>
					{". "}data by <b>Coryn.club</b>
					{". "}made by <b>acayrin</b>
				</p>
				<pre>
					pomdex - 0.0.1
					<br />
					node - {process.version}
				</pre>
			</div>
		</div>
	</div>
);
