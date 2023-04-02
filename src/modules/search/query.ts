import { Filter } from "mongodb";
import { PomdexCollection } from "../database/init.js";
import { ToramItem } from "../_types/item.js";
import { ToramMap } from "../_types/map.js";
import { ToramMonster } from "../_types/monster.js";
import { ToramObject } from "../_types/toram.js";

const regexParseArguments = /(?:[^\s"]+|"[^"]*")/g;
export const regexParseID = /^(?:[a-z][0-9]+)[a-z0-9]*$/gi;

export const search = async (
	inputString: string,
	idSearchOnly = false
): Promise<{
	list: (ToramItem | ToramMonster | ToramMap)[];
	error?: string;
}> => {
	// base entry list
	let dataList: (ToramItem | ToramMonster | ToramMap)[] = [];
	// entry type list
	let searchType: string[] = undefined;
	// stat filter list
	let searchFilters: string[] = [];
	// search page, for limiting where to look for entries
	let searchPage = -1;
	// search page, for limiting how many entries to look for
	let searchLimit = 0;
	// search queries split by space
	const searchQueryArray: string[] = [];
	// base database query condition
	const queryCondition: Filter<ToramObject> = {};

	const searchPartials = inputString.match(new RegExp(regexParseArguments));
	if (searchPartials) {
		let partial: string;
		while ((partial = searchPartials.shift())) {
			switch (partial) {
				// filter items by type
				case "-t":
				case "--type": {
					const value = searchPartials.shift();

					if (!value) {
						return { list: [], error: `Missing argument after **${partial}**` };
					}

					searchType = value.replace(/"/g, "").split(";");

					break;
				}
				// filter items by stats
				case "-f":
				case "--filter": {
					const value = searchPartials.shift();

					if (!value) {
						return { list: [], error: `Missing argument after **${partial}**` };
					}

					searchFilters = value.replace(/"/g, "").split(";");

					break;
				}
				case "-p":
				case "--page": {
					const value = searchPartials.shift();

					if (!value) {
						return { list: [], error: `Missing argument after **${partial}**` };
					}

					searchPage = Number(value);

					break;
				}
				case "-l":
				case "--limit": {
					const value = searchPartials.shift();

					if (!value) {
						return { list: [], error: `Missing argument after **${partial}**` };
					}

					searchLimit = Number(value);

					break;
				}
				default:
					searchQueryArray.push(partial);
			}
		}
	}

	// rebuild search query
	const searchQuery = searchQueryArray.length > 0 ? searchQueryArray.join(" ").trim() : "*";

	// check if query is an ID
	const matchId = searchQuery.match(new RegExp(regexParseID))?.[0];
	if (matchId) {
		return {
			list: [
				...(await PomdexCollection.find({
					id: matchId.toUpperCase(),
				}).toArray()),
			],
		};
	}

	// only for local use, if it's an ID-only search, stop the execution
	if (idSearchOnly) return { list: [] };

	// filter result by name, if query is * or 'all', return all entries
	if (searchQuery !== "*" && searchQuery !== "all") {
		try {
			queryCondition.$or = [];
			queryCondition.$or.push({
				name: {
					$regex: new RegExp(searchQuery, "gi"),
				},
			});
		} catch {
			queryCondition.$or = [{ name: null }];
		}
	}

	// filter by entry type
	if (searchType) {
		if (!queryCondition.$or) {
			queryCondition.$or = [{}];
		}

		for (const element of queryCondition.$or) {
			element.type = {
				$in: [],
			};

			for (const type of searchType) {
				if (type.startsWith("!")) {
					(element.type as Filter<ToramObject>).$in.push(new RegExp(`${type.slice(1)}(?!\\w)`, "gi"));
				} else {
					(element.type as Filter<ToramObject>).$in.push(new RegExp(type, "gi"));
				}
			}
		}
	}

	// filter by entry stats
	if (searchFilters.length > 0) {
		if (!queryCondition.$or) {
			queryCondition.$or = [{}];
		}

		for (let element of queryCondition.$or) {
			try {
				for (const filter of searchFilters) {
					const filterValue = filter
						.split(/((<|>)=)|<|>|=/g)
						.pop()
						.trim();
					const filterComparator = filter.match(/((<|>)=)|<|>|=/g).shift();
					const filterAttribute = filter
						.split(/((<|>)=)|<|>|=/g)
						.shift()
						.trim();

					// item as monster attributes
					if (new RegExp(/hp|ele|level|lv|exp|tam/gi).test(filterAttribute)) {
						const tag = new RegExp(/hp/gi).test(filterAttribute)
							? "hp"
							: new RegExp(/level|lv/gi).test(filterAttribute)
							? "level"
							: new RegExp(/ele/gi).test(filterAttribute)
							? "ele"
							: new RegExp(/exp/gi).test(filterAttribute)
							? "exp"
							: "tamable";

						element[tag] =
							filterComparator === ">"
								? {
										$gt: Number(filterValue) || filterValue,
								  }
								: new RegExp(/>=|=>/gi).test(filterComparator)
								? {
										$gte: Number(filterValue) || filterValue,
								  }
								: filterComparator === "<"
								? {
										$lt: Number(filterValue) || filterValue,
								  }
								: new RegExp(/<=|=</gi).test(filterComparator)
								? {
										$lte: Number(filterValue) || filterValue,
								  }
								: {
										$eq: Number(filterValue) || filterValue,
								  };
					}
					// item process atrribute
					else if (new RegExp(/proc/gi).test(filterAttribute)) {
						const amount = Number(filterValue.match(/\d+/g)?.shift() || 0);
						element["proc.type"] = {
							$regex: new RegExp(filterValue.replace(/\d+/g, "").trim(), "gi"),
						};
						element["proc.amount"] =
							filterComparator === ">"
								? {
										$gt: amount,
								  }
								: new RegExp(/>=|=>/gi).test(filterComparator)
								? {
										$gte: amount,
								  }
								: filterComparator === "<"
								? {
										$lt: amount,
								  }
								: new RegExp(/<=|=</gi).test(filterComparator)
								? {
										$lte: amount,
								  }
								: {
										$eq: amount,
								  };
					}
					// item drop dyes attribute
					else if (new RegExp(/dye {0,1}[abc]{0,1}/gi).test(filterAttribute)) {
						let tag: string;
						if (new RegExp(/dye {0,1}a/gi).test(filterAttribute)) {
							tag = "drops.dyes.0";
						} else if (new RegExp(/dye {0,1}b/gi).test(filterAttribute)) {
							tag = "drops.dyes.1";
						} else if (new RegExp(/dye {0,1}c/gi).test(filterAttribute)) {
							tag = "drops.dyes.2";
						} else {
							tag = "drops.dyes";
						}

						element[tag] = {
							$eq: filterValue,
						};
					}
					// item sell attribute
					else if (new RegExp(/sell/gi).test(filterAttribute)) {
						element.sell =
							filterComparator === ">"
								? {
										$gt: Number(filterValue),
								  }
								: new RegExp(/>=|=>/gi).test(filterComparator)
								? {
										$gte: Number(filterValue),
								  }
								: filterComparator === "<"
								? {
										$lt: Number(filterValue),
								  }
								: new RegExp(/<=|=</gi).test(filterComparator)
								? {
										$lte: Number(filterValue),
								  }
								: {
										$eq: Number(filterValue),
								  };
					}
					// item stats attributes
					else {
						element.stats = {
							$elemMatch: {
								$and: [
									{
										name: {
											$regex: filterAttribute.startsWith("!")
												? new RegExp(`^${filterAttribute.slice(1)}$`, "gi")
												: new RegExp(filterAttribute, "gi"),
										},
									},
									{
										val:
											filterComparator === ">"
												? {
														$gt: Number(filterValue),
												  }
												: new RegExp(/>=|=>/gi).test(filterComparator)
												? {
														$gte: Number(filterValue),
												  }
												: filterComparator === "<"
												? {
														$lt: Number(filterValue),
												  }
												: new RegExp(/<=|=</gi).test(filterComparator)
												? {
														$lte: Number(filterValue),
												  }
												: {
														$eq: Number(filterValue),
												  },
									},
								],
							},
						};
					}
				}
			} catch {
				queryCondition.$or = [
					{
						type: "NULL",
					},
				];
			}
		}
	}
	console.log(JSON.stringify(queryCondition, null, 4));

	// fetch results from database and assign to local result list
	dataList =
		searchPage >= 0
			? await PomdexCollection.find(queryCondition)
					.skip(searchPage * 20)
					.limit(searchLimit > 0 ? searchLimit : 20)
					.toArray()
			: await PomdexCollection.find(queryCondition)
					.limit(searchLimit > 0 ? searchLimit : 20)
					.toArray();

	return { list: dataList };
};
