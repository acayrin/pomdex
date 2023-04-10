import { transform, TransformOptions, transformSync } from "esbuild";
import { readFile, readFileSync } from "fs";
import { html } from "hono/html";
import { HtmlEscapedString } from "hono/utils/html";
import sass from "sass";
const { compile, compileAsync } = sass;

export class Precompile {
	static sass(path: string, inline?: true, esbuildOptions?: TransformOptions): HtmlEscapedString;
	static sass(path: string, inline: false, esbuildOptions?: TransformOptions): string;
	static sass(path: string, inline = true, esbuildOptions?: TransformOptions) {
		const out = transformSync(
			compile(path).css,
			esbuildOptions || {
				loader: "css",
				minify: true,
				legalComments: "external",
			}
		).code;

		return inline ? html(out as unknown as TemplateStringsArray) : out;
	}

	static sassAsync(path: string, inline?: true, esbuildOptions?: TransformOptions): Promise<HtmlEscapedString>;
	static sassAsync(path: string, inline: false, esbuildOptions?: TransformOptions): Promise<string>;
	static sassAsync(
		path: string,
		inline = true,
		esbuildOptions?: TransformOptions
	): Promise<string | TemplateStringsArray> {
		return new Promise((resolve, reject) =>
			compileAsync(path)
				.then((res) => {
					return transform(
						res.css,
						esbuildOptions || {
							loade: "css",
							minify: true,
							legalComments: "external",
						}
					)
						.then((res) => {
							resolve(inline ? html(res.code as unknown as TemplateStringsArray) : res.code);
						})
						.catch(reject);
				})
				.catch(reject)
		);
	}

	static css(path: string, inline?: true, esbuildOptions?: TransformOptions): HtmlEscapedString;
	static css(path: string, inline: false, esbuildOptions?: TransformOptions): string;
	static css(path: string, inline = true, esbuildOptions?: TransformOptions) {
		const out = transformSync(
			readFileSync(path, "utf-8"),
			esbuildOptions || {
				loader: "css",
				minify: true,
				legalComments: "external",
			}
		).code;

		return inline ? html(out as unknown as TemplateStringsArray) : out;
	}

	static cssAsync(path: string, inline?: true, esbuildOptions?: TransformOptions): Promise<HtmlEscapedString>;
	static cssAsync(path: string, inline: false, esbuildOptions?: TransformOptions): Promise<string>;
	static cssAsync(
		path: string,
		inline = true,
		esbuildOptions?: TransformOptions
	): Promise<string | TemplateStringsArray> {
		return new Promise((resolve, reject) =>
			readFile(path, "utf-8", (err, res) => {
				if (err) reject(err);

				return transform(
					res,
					esbuildOptions || {
						loade: "css",
						minify: true,
						legalComments: "external",
					}
				)
					.then((res) => {
						resolve(inline ? html(res.code as unknown as TemplateStringsArray) : res.code);
					})
					.catch(reject);
			})
		);
	}

	static typescript(path: string, inline?: true, esbuildOptions?: TransformOptions): HtmlEscapedString;
	static typescript(path: string, inline: false, esbuildOptions?: TransformOptions): TemplateStringsArray;
	static typescript(path: string, inline = true, esbuildOptions?: TransformOptions): string | TemplateStringsArray {
		const out = transformSync(
			readFileSync(path, "utf-8"),
			esbuildOptions || {
				loader: "ts",
				minify: true,
				legalComments: "external",
			}
		).code;

		return inline ? html(out as unknown as TemplateStringsArray) : out;
	}

	static typescriptAsync(path: string, inline?: true, esbuildOptions?: TransformOptions): Promise<HtmlEscapedString>;
	static typescriptAsync(path: string, inline: false, esbuildOptions?: TransformOptions): Promise<string>;
	static typescriptAsync(
		path: string,
		inline = true,
		esbuildOptions?: TransformOptions
	): Promise<string | TemplateStringsArray> {
		return new Promise((resolve, reject) => {
			readFile(path, { encoding: "utf-8" }, (err, res) => {
				if (err) reject(err);

				transform(
					res,
					esbuildOptions || {
						loader: "ts",
						minify: true,
						legalComments: "external",
					}
				).then((res) => resolve(inline ? html(res.code as unknown as TemplateStringsArray) : res.code));
			});
		});
	}

	static javascript(path: string, inline?: true, esbuildOptions?: TransformOptions): HtmlEscapedString;
	static javascript(path: string, inline: false, esbuildOptions?: TransformOptions): TemplateStringsArray;
	static javascript(path: string, inline = true, esbuildOptions?: TransformOptions): string | TemplateStringsArray {
		const out = transformSync(
			readFileSync(path, "utf-8"),
			esbuildOptions || {
				loader: "js",
				minify: true,
				legalComments: "external",
			}
		).code;

		return inline ? html(out as unknown as TemplateStringsArray) : out;
	}

	static javascriptAsync(path: string, inline?: true, esbuildOptions?: TransformOptions): Promise<HtmlEscapedString>;
	static javascriptAsync(path: string, inline: false, esbuildOptions?: TransformOptions): Promise<string>;
	static javascriptAsync(
		path: string,
		inline = true,
		esbuildOptions?: TransformOptions
	): Promise<string | TemplateStringsArray> {
		return new Promise((resolve, reject) => {
			readFile(path, { encoding: "utf-8" }, (err, res) => {
				if (err) reject(err);

				transform(
					res,
					esbuildOptions || {
						loader: "js",
						minify: true,
						legalComments: "external",
					}
				).then((res) => resolve(inline ? html(res.code as unknown as TemplateStringsArray) : res.code));
			});
		});
	}
}
