import { Context } from "hono";
import { PomdexCollection } from "../../modules/database/index.js";
import { printGuide } from "../../modules/leveling/printGuide.js";
import { Helmet } from "../_base/helmet.js";
import Search from "../../modules/search/query.js";

export const BaseApiFrontend = async (props: { c: Context }) => (
	<>
		<Helmet.metadata.Push>
			<meta
				name="description"
				content="Pomdex API for something"
			/>
		</Helmet.metadata.Push>

		<div class="col s12">
			<div class="card">
				<div class="card-content">
					<div class="section">
						<h4>Index count: {await PomdexCollection.countDocuments()}</h4>
					</div>

					<div class="divider" />

					<div
						id="a_search"
						class="section">
						<h4>
							<code>GET</code> /search [/:query] [?limit=X]
						</h4>
						<div>Search for an item by name or ID</div>
						<pre>{props.c.req.url}/search/coin</pre>
						<pre>{JSON.stringify((await Search.query("coin")).list, null, 2)}</pre>
						<pre>{props.c.req.url}/search/E1337</pre>
						<pre>{JSON.stringify((await Search.query("E1337")).list, null, 2)}</pre>
					</div>

					<div class="divider" />

					<div
						id="a_level"
						class="section">
						<h4>
							<code>GET</code> /level/:query
						</h4>
						<div>Generate a leveling guide</div>
						<pre>{props.c.req.url}/level/100</pre>
						<pre>{JSON.stringify(await printGuide("100", true), null, 2)}</pre>
						<pre>{props.c.req.url}/level/100 110</pre>
						<pre>{JSON.stringify(await printGuide("100 110", true), null, 2)}</pre>
					</div>
				</div>
			</div>
		</div>
	</>
);
