import { html } from "hono/html";

export class Helmet {
	static #_scripts: string[] = [];
	static #_styles: string[] = [];

	static flush = () => {
		this.#_scripts.length = 0;
		this.#_styles.length = 0;
	};

	static scripts = {
		Push: (props: { children?: string | string[] }) => {
			if (Array.isArray(props.children)) this.#_scripts.push(...props.children);
			else this.#_scripts.push(props.children);
			return <></>;
		},
		Raw: () => html(this.#_scripts.join("") as unknown as TemplateStringsArray),
		Node: () => html(`<script>${this.#_scripts.join("\n")}</script>` as unknown as TemplateStringsArray),
	};

	/*
	static styles = {
		Push: (props: { children?: string | string[] }) => {
			if (Array.isArray(props.children)) this.#_styles.push(...props.children);
			else this.#_styles.push(props.children);
			return <></>;
		},
		Raw: () => html(this.#_styles.join("") as unknown as TemplateStringsArray),
		Node: () =>
			html(this.#_styles.map((style) => `<style>${style}</style>`).join("\n") as unknown as TemplateStringsArray),
	};
    */
}
