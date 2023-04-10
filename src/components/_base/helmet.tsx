import { html } from "hono/html";
import { JSXNode } from "hono/jsx";

export class Helmet {
	static #_scripts: string[] = [];
	static #_styles: string[] = [];
	static #_metadata: {
		[key: string]: string;
	}[] = [];

	static flush = () => {
		this.#_scripts.length = 0;
		this.#_styles.length = 0;
		this.#_metadata.length = 0;
	};

	static scripts = {
		Push: (props: { children?: string | string[] }) => {
			if (Array.isArray(props.children)) this.#_scripts.push(...props.children);
			else this.#_scripts.push(props.children);
			return <></>;
		},
		Node: () => (
			<script>
				{html(
					[
						// prettier-ignore
						'document.addEventListener("DOMContentLoaded",()=>{',
						this.#_scripts.join(""),
						"})",
					].join("") as unknown as TemplateStringsArray
				)}
			</script>
		),
	};

	static styles = {
		Push: (props: { children?: string | string[] }) => {
			if (Array.isArray(props.children)) this.#_styles.push(...props.children);
			else this.#_styles.push(props.children);
			return <></>;
		},
		Node: () =>
			html(this.#_styles.map((style) => `<style>${style}</style>`).join("\n") as unknown as TemplateStringsArray),
	};

	static metadata = {
		Push: (props: { children?: string | string[] }) => {
			const { children } = props;
			if (Array.isArray(children)) {
				this.#checkMetadata(children as unknown as JSXNode[]);
			} else {
				this.#checkMetadata(children as unknown as JSXNode);
			}
			return <></>;
		},
		Node: () =>
			html(
				this.#_metadata
					.map((meta) => {
						return `<meta ${Object.entries(meta)
							.map((entry) => `${entry[0]}="${entry[1]}"`)
							.join(" ")}>`;
					})
					.join("") as unknown as TemplateStringsArray
			),
	};

	static #checkMetadata = (component: JSXNode | JSXNode[]) => {
		if (Array.isArray(component)) {
			for (const child of component) {
				if (!child || child.tag !== "meta") {
					return this.#checkMetadata(child.children.shift() as JSXNode[]);
				}

				this.#pushMetadata(child);
			}

			return;
		}

		if (component.tag !== "meta") {
			return this.#checkMetadata(component.children.shift() as JSXNode[]);
		}

		this.#pushMetadata(component);
	};

	static #pushMetadata = (component: JSXNode) => {
		const metaTag: {
			[key: string]: string;
		} = {};
		for (const prop of Object.entries((component as unknown as JSXNode).props)) {
			metaTag[prop[0]] = prop[1];
		}

		const existingMeta = this.#_metadata.find(
			(meta) =>
				(meta.name && metaTag.name && meta.name === metaTag.name) ||
				(meta.property && metaTag.property && meta.property === metaTag.property)
		);
		if (existingMeta) {
			this.#_metadata[this.#_metadata.indexOf(existingMeta)] = metaTag;
		} else {
			this.#_metadata.push(metaTag);
		}
	};
}
