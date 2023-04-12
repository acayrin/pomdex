import "colors";
import { createHash } from "crypto";
import { readdirSync, statSync } from "fs";
import { getElementColor } from "./getElementColor.js";
import { getItemTypeIcon } from "./getItemTypeIcon.js";

export default class Utils {
	/**
	 * Clean up duplicates in an array
	 * @param a An array
	 * @returns Modified array
	 */
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

	/**
	 * Format timestamp to a human readable string
	 * @param time Timestamp in ms
	 * @returns Formatted time string
	 */
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

	/**
	 * Faster array filtering?
	 * @param a An array
	 * @param cb Callback function applied to filter entries
	 * @returns A new filtered array
	 */
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

	/**
	 * Recursive lookup a folder and apply callback function to each found file path
	 * @param path Path to lookup
	 * @param callback Function callback applied to each found file path
	 */
	static recursiveLookup = async (path: string, callback: (path: string) => Promise<unknown>): Promise<void> => {
		for (const name of readdirSync(path)) {
			if (statSync(`${path}/${name}`).isDirectory()) {
				await Utils.recursiveLookup(`${path}/${name}`, callback);
			} else {
				await new Promise((res) => callback(`${path}/${name}`).then(res));
			}
		}
	};

	/**
	 * Generate hash
	 * @param input Input string or buffer
	 * @param algorithm Algorithm, default "md5"
	 * @returns Generated hash
	 */
	static hash = (input: string | NodeJS.ArrayBufferView, algorithm = "md5"): string =>
		createHash(algorithm).update(input).digest("hex");

	/**
	 * Info level logging
	 * @param args Messages
	 */
	static info = (...args: unknown[]) => process.stdout.write(`${new Date().toISOString().grey} ${args.join(" ")}\n`);

	/**
	 * Error level logging
	 * @param args Messages
	 */
	static error = (...args: unknown[]) => {
		const errorIndex = args.findIndex((arg) => arg instanceof Error);
		let errorObject: Error;

		if (errorIndex !== -1) {
			errorObject = args.splice(errorIndex, 1)[0] as Error;
		}

		process.stdout.write(`${new Date().toISOString().red} ${args.join(" ")}\n`);
		errorObject && console.error(errorObject);
	};

	/**
	 * Warning level logging
	 * @param args Messages
	 */
	static warn = (...args: unknown[]) =>
		process.stdout.write(`${new Date().toISOString().yellow} ${args.join(" ")}\n`);

	/**
	 * Generate an array of numbers within range
	 * @param start Starting point
	 * @param stop Ending point
	 * @param step Step
	 * @returns Array of generated numbers
	 */
	static range = (start: number, stop: number, step = 1): number[] =>
		Array(Math.ceil((stop - start) / step))
			.fill(start)
			.map((x, y) => x + y * step);

	/**
	 * Get display color of an element
	 * @param element Element string
	 * @returns Hex color
	 */
	static getElementColor = getElementColor;

	/**
	 * Get display icon of a entry type
	 * @param type Type string
	 * @returns Svg icon component
	 */
	static getItemTypeIcon = getItemTypeIcon;
}
