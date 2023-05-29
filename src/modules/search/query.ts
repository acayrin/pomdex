import { Filter } from "mongodb";
import { PomdexCollection } from "../database/index.js";
import { ToramObject } from "../types/ToramObject.js";

type SearchOptions = {
	types: string[];
	filters: string[];
	queryArray: string[];
	page: number;
	limit: number;
};

type SearchResult = {
	list: ToramObject[];
	error?: string;
};

const regexParseArguments = /(?:[^\s"]+|"[^"]*")/g;
const regexParseID = /^(?:[a-z]\d+)[a-z0-9]*$/i;

export default class Search {
	/**
	 * Query for an entry from database
	 * @param inputString Command string
	 * @param idSearchOnly ID search, for local use only
	 * @returns List of matching entries or error
	 */
	static query = async (inputString: string, idSearchOnly = false): Promise<SearchResult> => {
		const queryCondition: Filter<ToramObject> = {};
		const searchOptions: SearchOptions = {
			types: [],
			filters: [],
			queryArray: [],
			page: 0,
			limit: 0,
		};

		// process command
		try {
			this.#processCommand(inputString, searchOptions);
		} catch (error) {
			return { list: [], error };
		}

		// rebuild search query
		const searchQuery = searchOptions.queryArray.length > 0 ? searchOptions.queryArray.join(" ").trim() : "*";

		// check if query is an ID
		const isQueryIdMatched = RegExp(new RegExp(regexParseID)).exec(searchQuery)?.[0];
		if (isQueryIdMatched) {
			return {
				list: [
					...((await PomdexCollection.find(
						{
							id: isQueryIdMatched.toUpperCase(),
						},
						{ projection: { _id: 0 } }
					).toArray()) as ToramObject[]),
				],
			};
		}

		// only for local use, if it's an ID-only search, stop the execution
		if (idSearchOnly) return { list: [] };

		// filter result by name, if query is * or 'all', return all entries
		if (searchQuery !== "*") {
			if (searchQuery.startsWith("!")) {
				queryCondition.name = {
					$regex: new RegExp(searchQuery.slice(1), "i"),
				};
			} else {
				queryCondition.$text = {
					$search: searchQuery,
				};
			}
		}

		// filter by entry type
		if (searchOptions.types.length > 0) {
			this.#appendTypeCondition(searchOptions.types, queryCondition);
		}

		// filter by entry stats
		if (searchOptions.filters.length > 0) {
			try {
				this.#appendStatFilterCondition(searchOptions, queryCondition);
			} catch (error) {
				return { list: [], error };
			}
		}

		// create a result cursor
		const cursor = PomdexCollection.find(queryCondition)
			.limit(searchOptions.limit > 0 ? searchOptions.limit : 50)
			.skip(searchOptions.page * 50);
		if (queryCondition.$text) {
			// if condition is name based, sort by name first then id
			cursor.sort({ score: { $meta: "textScore" }, _id: 1 });
		} else {
			// else sort by id
			cursor.sort({ _id: 1 });
		}

		return { list: await cursor.toArray() };
	};

	/**
	 * Parse command and addition arguments
	 * @param inputString Input command
	 */
	static #processCommand = (inputString: string, searchOptions: SearchOptions) => {
		const searchArguments = inputString.match(new RegExp(regexParseArguments));
		let searchSingleArgument: string;

		while ((searchSingleArgument = searchArguments.shift())) {
			switch (searchSingleArgument) {
				// filter items by type
				case "-t":
				case "--type": {
					const value = searchArguments.shift();

					if (!value) {
						throw new Error(`Missing argument after **${searchSingleArgument}**`);
					}

					searchOptions.types.push(...value.replace(/"/g, "").split(";"));

					break;
				}
				// filter items by stats
				case "-f":
				case "--filter": {
					const value = searchArguments.shift();

					if (!value) {
						throw new Error(`Missing argument after **${searchSingleArgument}**`);
					}

					searchOptions.filters.push(...value.replace(/"/g, "").split(";"));

					break;
				}
				case "-p":
				case "--page": {
					const value = searchArguments.shift();

					searchOptions.page = Math.abs((Number(value) || 1) - 1);

					break;
				}
				case "-l":
				case "--limit": {
					const value = searchArguments.shift();

					if (!value) {
						throw new Error(`Missing argument after **${searchSingleArgument}**`);
					}

					searchOptions.limit = Number(value);

					break;
				}
				default:
					searchOptions.queryArray.push(searchSingleArgument);
			}
		}
	};

	/**
	 * Append type constraints to query condition
	 * @param types List of types
	 */
	static #appendTypeCondition = (types: string[], queryCondition: Filter<ToramObject>) => {
		queryCondition.type = {
			$in: [],
		};

		for (const type of types) {
			if (type.startsWith("!")) {
				(queryCondition.type as Filter<ToramObject>).$in.push(new RegExp(`^${type.slice(1)}$`, "i"));
			} else {
				(queryCondition.type as Filter<ToramObject>).$in.push(new RegExp(type, "i"));
			}
		}
	};

	/**
	 * Append stat constraints to query condition
	 * @param filters List of stat filters
	 */
	static #appendStatFilterCondition = (searchOptions: SearchOptions, queryCondition: Filter<ToramObject>) => {
		for (const filter of searchOptions.filters) {
			const filterValue = filter
				.split(/[<>=]{1,2}/)
				.pop()
				.trim();
			const filterComparator = RegExp(/[<>=]{1,2}/)
				.exec(filter)
				.shift();
			const filterAttribute = filter
				.split(/[<>=]{1,2}/)
				.shift()
				.trim();

			let queryComparator = "$eq";
			if (filterComparator === ">") queryComparator = "$gt";
			else if (new RegExp(/>=|=>/).test(filterComparator)) queryComparator = "$gte";
			else if (queryComparator === "<") queryComparator = "$lt";
			else if (new RegExp(/<=|=</).test(filterComparator)) queryComparator = "$lte";

			// item as monster attributes
			if (new RegExp(/hp|ele|level|lv|exp|tam/i).test(filterAttribute)) {
				let tag = "tamable";
				if (new RegExp(/hp/i).test(filterAttribute)) tag = "hp";
				else if (new RegExp(/ele/i).test(filterAttribute)) tag = "ele";
				else if (new RegExp(/exp/i).test(filterAttribute)) tag = "exp";
				else if (new RegExp(/level|lv/i).test(filterAttribute)) tag = "level";

				queryCondition[tag] = {
					[queryComparator]: Number(filterValue) || filterValue,
				};
			}
			// item process atrribute
			else if (new RegExp(/proc/i).test(filterAttribute)) {
				const amount = Number(filterValue.match(/\d+/g)?.shift() || 0);
				queryCondition["proc.type"] = {
					$regex: new RegExp(filterValue.replace(/\d+/g, "").trim(), "i"),
				};
				queryCondition["proc.amount"] = {
					[queryComparator]: amount,
				};
			}
			// item drop dyes attribute
			else if (new RegExp(/dye ?[abc]?/i).test(filterAttribute)) {
				let tag = "drops.dyes";
				if (new RegExp(/dye ?a/i).test(filterAttribute)) tag = "drops.dyes.0";
				else if (new RegExp(/dye ?b/i).test(filterAttribute)) tag = "drops.dyes.1";
				else if (new RegExp(/dye ?c/i).test(filterAttribute)) tag = "drops.dyes.2";

				queryCondition[tag] = {
					$eq: filterValue,
				};
			}
			// item sell attribute
			else if (new RegExp(/sell/i).test(filterAttribute)) {
				queryCondition.sell = {
					[queryComparator]: Number(filterValue),
				};
			}
			// item stats attributes
			else {
				queryCondition.stats = {
					$elemMatch: {
						$and: [
							{
								name: {
									$regex: filterAttribute.startsWith("!")
										? new RegExp(`^${filterAttribute.slice(1)}$`, "i")
										: new RegExp(filterAttribute, "i"),
								},
							},
							{
								val: {
									[queryComparator]: Number(filterValue),
								},
							},
						],
					},
				};
			}
		}
	};
}
