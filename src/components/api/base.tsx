import { Context } from "hono";
import { printGuide } from "../../modules/leveling/printGuide.js";
import { search } from "../../modules/search/query.js";

export const BaseApiFrontend = async (props: { c: Context }) => (
	<div class="col s12">
		<div class="card">
			<div class="card-content">
				<div class="section">
					<h4>Index count: {(await search("* -l 99999")).list.length}</h4>
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
					<pre>{JSON.stringify((await search("coin")).list, null, 2)}</pre>
					<pre>{props.c.req.url}/search/E1337</pre>
					<pre>{JSON.stringify((await search("E1337")).list, null, 2)}</pre>
				</div>

				<div class="divider" />

				<div
					id="a_level"
					class="section">
					<h4>
						<code>GET</code> /level/:query [?raw]
					</h4>
					<div>Generate a leveling guide</div>
					<pre>{props.c.req.url}/level/100</pre>
					<pre>{(await printGuide("100")).data}</pre>
					<pre>{props.c.req.url}/level/100?raw</pre>
					<pre>{JSON.stringify((await printGuide("100", true)).data, null, 2)}</pre>
					<pre>{props.c.req.url}/level/100 110?raw</pre>
					<pre>{JSON.stringify((await printGuide("100 110", true)).data, null, 2)}</pre>
				</div>
			</div>
		</div>
	</div>
);
