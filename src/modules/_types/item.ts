export type ToramItem = {
	id: string; // item id
	name: string; // item name
	type: string; // item type
	sell: number; // item sell
	proc: {
		type: string; // material type
		amount: number; // amount to get when process
	}; // item process
	thumb: string; // item thumbnail
	stats: {
		name: string; // name of the stat
		val: number | string; // value of this stat
	}[]; // item stats
	drops: {
		from: string; // from which monster
		dyes: string[]; // optional dye color
	}[]; // item drops
	uses: {
		for: string; // target item id
		amount: number; // amount needed
	}[]; // item used for
	recipe: {
		// item recipe
		fee: number; // recipe fee
		set: number; // recipe set
		level: number; // recipe level
		difficulty: number; // recipe difficulty
		materials: {
			amount: number; // material amount
			item: string; // material item id
		}[]; // recipe materials
	};
};
