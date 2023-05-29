import async from "async";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Helmet } from "../../../modules/helmet/helmet.js";
import { ColorMapping, getInvertedColor } from "../../../modules/color/index.js";
import { PomdexMonthlyDye } from "../../../modules/database/index.js";
import { Precompile } from "../../../modules/precompile/index.js";
import Search from "../../../modules/search/query.js";
import { MonthlyDyeEntry, MonthlyDyeListEntry, ToramMonster, ToramObject } from "../../../modules/types/index.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export const BaseMontlyDyeTable = async () => {
	const date = new Date();
	const month = {
		current: date.getMonth() + 1 > 12 ? 1 : date.getMonth() + 1,
		next: date.getMonth() + 2 > 12 ? 2 : date.getMonth() + 2,
	};

	const currentEntries = await PomdexMonthlyDye.find().toArray();
	const tables: {
		current: string[];
		next: string[];
	} = {
		current: [],
		next: [],
	};

	const renderEntry = (entry: MonthlyDyeListEntry, monster: ToramObject) => (
		<tr>
			<td class="capitalize">{monster ? <a href={`/details/${monster.id}`}>{entry.name}</a> : entry.name}</td>
			<td class="right-align">
				{entry.code === 0 ? (
					<b>Hidden by author</b>
				) : (
					["A", "B", "C"].map((slot, index) => {
						let code: "A" | "B" | "C" | number = "A";
						if (entry.slot === slot && entry.code !== 0) code = entry.code;
						else if (index === 1) code = "B";
						else if (index === 2) code = "C";

						return (
							<span
								key={slot}
								class="color-block"
								style={[
									`background: #${ColorMapping.get(code as number)}`,
									`color: #${getInvertedColor(ColorMapping.get(code as number))}`,
								].join(";")}>
								<b>{code}</b>
							</span>
						);
					})
				)}
			</td>
		</tr>
	);

	const renderMonth = async (monthEntry: MonthlyDyeEntry, which: "current" | "next") => {
		if (monthEntry.month !== month[which]) return;

		for (let i = 0; i < monthEntry.list.length; i += 12) {
			const entries = monthEntry.list.slice(i, i + 12);

			tables[which].push(
				<div class="col m6 l4">
					<table class="striped">
						<tbody>
							{await Promise.all(
								entries.map(async (entry) => {
									const results = (await Search.query(`${entry.name} --type boss`)).list;
									results.sort((e1, e2) => (e2 as ToramMonster).hp - (e1 as ToramMonster).hp);

									return renderEntry(entry, results.shift());
								})
							)}
						</tbody>
					</table>
				</div>
			);
		}
	};

	for (const currentEntry of currentEntries) {
		await new Promise((res) => {
			async.parallel(
				["current", "next"].map(
					(which: "current" | "next") => (done) => renderMonth(currentEntry, which).then(() => done(null))
				),
				() => res(undefined)
			);
		});
	}

	return (
		<div class="col s12">
			<div class="card">
				<div class="card-content">
					<span class="card-title">Monthly Dye Table</span>
					<p>
						This is only a shared version, created while following these{" "}
						<a
							target="_blank"
							href="https://tanaka0.work/AIO/jp/DyePredictor/ColorWeapon/ShareRule"
							rel="noreferrer">
							sharing rules.
						</a>
					</p>
					<p>
						Originally created by <b>Lazy Tanaka</b> on{" "}
						<a
							target="_blank"
							href="https://tanaka0.work/AIO/jp/DyePredictor/ColorWeapon"
							rel="noreferrer">
							their website.
						</a>
					</p>

					<br />
					<b style="font-size:large">Current month #{month.current}:</b>
					<div class="row dye-table">{tables.current.length > 0 ? tables.current : "No data available"}</div>

					<br />
					<b style="font-size:large">Next month #{month.next}:</b>
					<div class="row dye-table">{tables.next.length > 0 ? tables.next : "No data available"}</div>
				</div>
			</div>

			<Helmet.styles.Push>{Precompile.sass(join(__dirname, "./_static/css/base.scss"))}</Helmet.styles.Push>
		</div>
	);
};
