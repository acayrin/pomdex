export const BaseHome = () => (
	<div class="col s12">
		<div class="card">
			<div class="card-content">
				<h4>Pomdex</h4>
				<p>a website made from scrambling things into one abomination</p>
				<p>well at least it worked ain't it</p>
				<br />
				<p>what's included</p>
				<p>- item explorer</p>
				<p>- level guide generator</p>
				<p>- rest api for something</p>
			</div>
		</div>
		<div class="card">
			<div class="card-content">
				<span class="card-title">Searching guide</span>

				<p>Search for items by its name, ID, or most supported attributes.</p>
				<p>
					<b>Use</b> <code>[query] [args]</code>
				</p>
				<ul>
					<li>
						<code>[query]</code> - Search query, can be a name or item ID.
					</li>
					<li>
						<code>[args]</code> - Additional arguments &amp; values (if any), list below.
					</li>
				</ul>
				<p>
					<b>Arguments</b>
				</p>
				<ul>
					<li>
						<code>-t/--type [type, ...]</code> - Search for items with given type(s), [type] cannot contain
						numbers and if [types] has multiple words, please put them in double-quotes <code>"type1"</code>
						, you can also add multiple types by adding them between <code>;</code> -{" "}
						<code>"type1; type2; ..."</code>. By adding <code>!</code> in front of a type, it will limit to
						items with type <b>EXACT</b> to that given type
					</li>
					<li>
						<code>-f/--filter [comparator, ...]</code> - Search for items that has the matching attribute
						(works with <b>Sell/Process/Item or Monster stats/Dyes</b> values), [comparator] has format of{" "}
						<code>attribute_name &gt;|&lt;|=|&gt;=|&lt;= value</code>, you can add multiple [comparator] by
						adding them between <code>;</code> - <code>"atk % &gt; 1; matk % &gt; 1; ..."</code>, if an
						atrribute has spaces in it, please put it inside double-quotes, ex: <code>"atk % &gt;= 8"</code>
						. By adding <code>!</code> in front of an attribute, it will limit to items with stat{" "}
						<b>EXACT</b> to that given attribute
					</li>
				</ul>
				<p>All arguments can be used at the same time:</p>
				<ul>
					<li>
						<code>* -t "crysta blue" -f "atk % &gt;= 8"</code>
					</li>
				</ul>
				<p>
					Using with the <b>--type</b> tag:
				</p>
				<ul>
					<li>
						<code>* -t "sword"</code> return a list of results with matching type of "1 handed sword" and "2
						handed sword"
					</li>
					<li>
						<code>* -t "sword; staff"</code> return a list of results with matching type of "1 handed
						sword", "2 handed sword" and "staff"
					</li>
					<li>
						<code>* -t "!bow"</code> return a list of results with <b>EXACT</b> matching type of "bow"
					</li>
				</ul>
				<p>
					Using with the <b>--filter</b> tag:
				</p>
				<ul>
					<li>
						<code>* -f atk &gt;= 10</code> return a list of results with any ATK (ATK, ATK %, MATK, MATK %,
						Weapon ATK) stat that is <em>higher or equals</em> (&gt;=) to 10
					</li>
					<li>
						<code>* -f atk &lt;= 10</code> you can also search for items with stats that are <em>equal</em>{" "}
						(=), <em>lower or equal</em> (&lt;=), <em>lower</em> (&lt;)
					</li>
					<li>
						<code>* -f "!atk % &lt; 8"</code> return a list of results with "ATK %" stat that is{" "}
						<em>lower</em> (&lt;) than 10
					</li>
					<li>
						<code>* -f "!atk % &gt;= 8; critical rate = 20"</code> return a list of results with "ATK %"
						that is <em>higher or equal</em> (&gt;=) to 8 AND "Critical Rate" that is <em>equal</em> (=) to
						20
					</li>
					<li>
						<code>* -f "proc &gt; 69 beast"</code> you can also search for items by process value by using{" "}
						<code>"proc &lt;= [number] [material_type]"</code>
					</li>
					<li>
						<code>* -f "sell &gt;= 1000"</code> you can also search for items by sell value by using{" "}
						<code>"sell &gt; [number]"</code>
					</li>
					<li>
						<code>* -f "dye = 1"</code> you can also search for items by its dye value by using{" "}
						<code>"dye [a/b/c] &gt; [1-84]"</code>
					</li>
					<li>
						<code>* -f "dye a = 38"</code> this will return results with dye slot A with the color code 38
						(red), you can change to other dye slots by replacing the <code>dye a</code> with{" "}
						<code>dye [a/b/c]</code>, if no slot was given then it will match any dye slot
					</li>
					<li>
						<code>* -f "hp &gt;= 10000000; level &gt; 100; ele = Fire"</code> you can also search for
						monsters by using its stats such as <b>hp, element, level and exp</b>
					</li>
				</ul>
			</div>
		</div>
	</div>
);
