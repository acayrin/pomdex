import "colors";

export default class Utils {
	static uniqueArray = <T>(a: T[]) => {
		const seen: any = {};
		const out = [];
		let j = 0;
		for (const i of a) {
			if (seen[i] !== 1) {
				seen[i] = 1;
				out[j] = i;
				j++;
			}
		}
		return out;
	};

	static formatTime = (time: number): string => {
		time = Math.floor(time);
		const hrs = ~~(time / 3600);
		const mins = ~~((time % 3600) / 60);
		const secs = ~~time % 60;
		let ret = "";
		if (hrs > 0) {
			ret += `${hrs}:${mins < 10 ? "0" : ""}`;
		}
		ret += `${mins}:${secs < 10 ? "0" : ""}`;
		ret += `${secs}`;
		return ret;
	};

	static filter = <T>(a: T[], cb: (b: T, i?: number) => boolean) => {
		const f: typeof a = [];
		let i = 0;
		const y = a.length;
		while (i < y) {
			if (cb(a[i], i)) {
				f.push(a[i]);
			}
			++i;
		}
		return f;
	};

	static rgb2hex = (rgb: string): string =>
		rgb
			.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
			.slice(1)
			.map((n) => parseInt(n, 10).toString(16).padStart(2, "0"))
			.join("");

	static jsonDiff = (_a: any, _b: any): boolean => {
		if (_a instanceof Function) {
			if (_b instanceof Function) {
				return _a.toString() === _b.toString();
			}
			return true;
		} else if (!(_a && _b)) {
			return _a !== _b;
		} else if (_a === _b || _a.valueOf() === _b.valueOf()) {
			return false;
		} else if (Array.isArray(_a)) {
			if (Array.isArray(_b)) {
				if (_a.sort().length !== _b.sort().length) {
					return true;
				}
				for (const _aa of _a) {
					if (_b.indexOf(_aa) === -1) {
						const test = this.jsonDiff(_b[_a.indexOf(_aa)], _aa);
						if (test) {
							return true;
						}
					}
				}
				return false;
			}
			return true;
		} else if (Object.keys(_a).length !== Object.keys(_b).length) {
			return true;
		} else {
			for (const _k in _a) {
				const test = this.jsonDiff(_a[_k], _b[_k]);
				if (test) {
					return true;
				}
			}
		}
		return false;
	};

	static info = (...args: unknown[]) => process.stdout.write(`${new Date().toISOString().grey} ${args.join(" ")}\n`);

	static error = (...args: unknown[]) => process.stdout.write(`${new Date().toISOString().red} ${args.join(" ")}\n`);

	static warn = (...args: unknown[]) =>
		process.stdout.write(`${new Date().toISOString().yellow} ${args.join(" ")}\n`);

	static range = (start: number, stop: number, step = 1): number[] =>
		Array(Math.ceil((stop - start) / step))
			.fill(start)
			.map((x, y) => x + y * step);
}
