type MonthlyDyeEntry = {
	_lastUpdated: number;
	month: number;
	list: MonthlyDyeListEntry[];
};

type MonthlyDyeListEntry = {
	name: string;
	slot: "A" | "B" | "C";
	code: number;
};

export { MonthlyDyeEntry, MonthlyDyeListEntry };
