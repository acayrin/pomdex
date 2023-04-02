import { transform } from "esbuild";
import { readFileSync } from "fs";
import { html } from "hono/html";
import { join } from "path";
import sass from "sass";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const { compile } = sass;

export const precompiled = {
	logoBase64: {
		128: "",
		96: "",
		64: "",
		48: "",
		32: "",
		16: "",
	},
	scripts: {
		base: "",
		materialize: "",
	},
	styles: {
		materialize: "",
		base: "",
	},
};
export const precompileComponents = async () => {
	// Logo
	for (const size of [128, 96, 64, 48, 32, 16]) {
		fetch(`https://cdn.discordapp.com/avatars/828605986511388733/b8f1959c5a5d08825bbba7089b9fcd4e.png?size=${size}`)
			.then((res) => res.arrayBuffer())
			.then((buffer) => {
				precompiled.logoBase64[size] = `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
			});
	}

	// Base script
	transform(readFileSync(join(__dirname, "./js/base.ts"), "utf-8"), {
		loader: "ts",
		minify: true,
	}).then((result) => {
		precompiled.scripts.base = html(result.code as unknown as TemplateStringsArray);
	});

	// Materialize script
	transform(
		readFileSync(
			join(__dirname, "../../../../node_modules/@materializecss/materialize/dist/js/materialize.min.js")
		),
		{
			loader: "js",
			minify: true,
			legalComments: "none",
		}
	).then((result) => {
		precompiled.scripts.materialize = html(result.code as unknown as TemplateStringsArray);
	});

	// Materialize stylesheet
	transform(
		readFileSync(
			join(__dirname, "../../../../node_modules/@materializecss/materialize/dist/css/materialize.min.css")
		),
		{
			loader: "css",
			minify: true,
			legalComments: "none",
		}
	).then((result) => {
		precompiled.styles.materialize = html(result.code as unknown as TemplateStringsArray);
	});

	// Base stylesheet
	transform(compile(join(__dirname, "./css/base.scss")).css, {
		loader: "css",
		minify: true,
	}).then((result) => {
		precompiled.styles.base = html(result.code as unknown as TemplateStringsArray);
	});
};
