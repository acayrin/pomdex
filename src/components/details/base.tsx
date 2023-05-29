import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Precompile } from "../../modules/precompile/index.js";
import Search from "../../modules/search/query.js";
import { ToramItem, ToramMap, ToramMonster, ToramObject } from "../../modules/types/index.js";
import { Helmet } from "../../modules/helmet/helmet.js";
import { ItemDetails } from "./item.js";
import { MapDetails } from "./map.js";
import { MonsterDetails } from "./monster.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export const BaseDetails = async (props: { item: ToramObject }) => {
	const similarEntries = (await Search.query(`${props.item.name}`)).list.filter(
		(entry) => entry.id !== props.item.id
	);

	const SimilarNode = (props: { entry: ToramObject }) => (
		<div class="col s6">
			<div
				class="card hoverable"
				style="cursor:pointer"
				onclick={`(()=>window.location.href='/details/${props.entry.id}')()`}>
				<div class="card-content">
					<span class="card-title">{props.entry.name}</span>
					<p>
						<b>{props.entry.type}</b>
					</p>
				</div>
			</div>
		</div>
	);

	return (
		<>
			<div class="col s12">
				<div class="card">
					<div class="card-content">
						<span class="card-title">{props.item.name}</span>
						<div class="section card-display-item">
							{(props.item as ToramItem).proc !== undefined &&
								(await ItemDetails({ item: props.item as ToramItem }))}
							{(props.item as ToramMonster).level !== undefined &&
								(await MonsterDetails({ item: props.item as ToramMonster }))}
							{props.item.type === "Map" && (await MapDetails({ item: props.item as ToramMap }))}
						</div>
						<div class="section">
							<p>
								<a
									href={`/api/search/${props.item.id}`}
									target="_blank"
									rel="noreferrer">
									View API
								</a>
							</p>
						</div>
					</div>
				</div>
			</div>
			{similarEntries.at(0) && <SimilarNode entry={similarEntries.at(0)} />}
			{similarEntries.at(1) && <SimilarNode entry={similarEntries.at(1)} />}

			{(props.item as ToramItem).thumb && (
				<Helmet.metadata.Push>
					<meta
						property="og:image"
						content={(props.item as ToramItem).thumb}
					/>
				</Helmet.metadata.Push>
			)}
			<Helmet.styles.Push>{Precompile.sass(join(__dirname, "./_static/css/base.scss"))}</Helmet.styles.Push>
		</>
	);
};
