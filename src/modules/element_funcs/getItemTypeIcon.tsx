export const getItemTypeIcon = (type: string) => {
	if (new RegExp(/map/gi).test(type))
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				style="vertical-align:-0.125em"
				viewBox="0 0 24 24">
				<path
					fill="currentColor"
					d="M12 4c2.2 0 4 1.8 4 4c0 2.1-2.1 5.5-4 7.9c-1.9-2.5-4-5.8-4-7.9c0-2.2 1.8-4 4-4m0-2C8.7 2 6 4.7 6 8c0 4.5 6 11 6 11s6-6.6 6-11c0-3.3-2.7-6-6-6m0 4c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m8 13c0 2.2-3.6 4-8 4s-8-1.8-8-4c0-1.3 1.2-2.4 3.1-3.2l.6.9c-1 .5-1.7 1.1-1.7 1.8c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5c0-.7-.7-1.3-1.8-1.8l.6-.9c2 .8 3.2 1.9 3.2 3.2Z"
				/>
			</svg>
		);
	else if (new RegExp(/(crysta)/gi).test(type))
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				style="vertical-align:-0.125em"
				viewBox="0 0 24 24">
				<path
					fill="currentColor"
					d="M12 2L5 12l7 10l7-10M7.44 12L12 5.5l4.56 6.5L12 18.5"
				/>
			</svg>
		);
	else if (new RegExp(/(npc)/gi).test(type))
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				style="vertical-align:-0.125em"
				viewBox="0 0 24 24">
				<path
					fill="currentColor"
					d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4Z"
				/>
			</svg>
		);
	else if (new RegExp(/(element)/gi).test(type))
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				style="vertical-align:-0.125em"
				viewBox="0 0 256 256">
				<path
					fill="currentColor"
					d="M114 102.18a19.87 19.87 0 0 0 28.08 0L170.19 74a19.86 19.86 0 0 0 0-28.07L142 17.8a19.89 19.89 0 0 0-28.08 0L85.81 46a19.86 19.86 0 0 0 0 28.07Zm14-64.47L150.28 60L128 82.28L105.72 60ZM238.19 114L210 85.81a19.88 19.88 0 0 0-28.08 0L153.81 114a19.87 19.87 0 0 0 0 28.08L182 170.19a19.89 19.89 0 0 0 28.08 0L238.19 142a19.87 19.87 0 0 0 0-28.08ZM196 150.28L173.72 128L196 105.72L218.28 128ZM108 128a19.73 19.73 0 0 0-5.81-14L74 85.81a19.88 19.88 0 0 0-28.08 0L17.81 114a19.87 19.87 0 0 0 0 28.08L46 170.19a19.89 19.89 0 0 0 28.08 0L102.19 142a19.73 19.73 0 0 0 5.81-14Zm-48 22.28L37.72 128L60 105.72L82.28 128Zm82 3.53a19.89 19.89 0 0 0-28.08 0L85.81 182a19.86 19.86 0 0 0 0 28.07L114 238.2a19.89 19.89 0 0 0 28.08 0l28.11-28.2a19.86 19.86 0 0 0 0-28.07Zm-14 64.48L105.72 196L128 173.72L150.28 196Z"
				/>
			</svg>
		);
	else if (new RegExp(/(smith)/gi).test(type))
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				style="vertical-align:-0.125em"
				viewBox="0 0 24 24">
				<g
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2">
					<path d="m15 12l-8.5 8.5c-.83.83-2.17.83-3 0c0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9m5.64 6L22 10.64" />
					<path d="m20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" />
				</g>
			</svg>
		);
	else if (new RegExp(/(coin)/gi).test(type))
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				style="vertical-align:-0.125em"
				viewBox="0 0 24 24">
				<g
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2">
					<path d="M21 8c0-1.657-3.134-3-7-3S7 6.343 7 8m14 0v4c0 1.02-1.186 1.92-3 2.462c-1.134.34-2.513.538-4 .538s-2.866-.199-4-.538C8.187 13.92 7 13.02 7 12V8m14 0c0 1.02-1.186 1.92-3 2.462c-1.134.34-2.513.538-4 .538s-2.866-.199-4-.538C8.187 9.92 7 9.02 7 8" />
					<path d="M3 12v4c0 1.02 1.187 1.92 3 2.462c1.134.34 2.513.538 4 .538s2.866-.199 4-.538c1.813-.542 3-1.442 3-2.462v-1M3 12c0-1.197 1.635-2.23 4-2.711M3 12c0 1.02 1.187 1.92 3 2.462c1.134.34 2.513.538 4 .538c.695 0 1.366-.043 2-.124" />
				</g>
			</svg>
		);
	else if (new RegExp(/(usable)/gi).test(type))
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				style="vertical-align:-0.125em"
				viewBox="0 0 24 24">
				<path
					fill="currentColor"
					d="M18.93 11.67a.42.42 0 0 0 0-.1A7.4 7.4 0 0 0 15 7.62V4h1a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2h1v3.62a7.4 7.4 0 0 0-3.89 4a.42.42 0 0 0 0 .1a7.5 7.5 0 1 0 13.86 0Zm-8.62-2.41a1 1 0 0 0 .69-.95V4h2v4.31a1 1 0 0 0 .69.95A5.43 5.43 0 0 1 16.23 11H7.77a5.43 5.43 0 0 1 2.54-1.74ZM12 20a5.51 5.51 0 0 1-5.5-5.5a5.34 5.34 0 0 1 .22-1.5h10.56a5.34 5.34 0 0 1 .22 1.5A5.51 5.51 0 0 1 12 20Zm2-4a1 1 0 1 0 1 1a1 1 0 0 0-1-1Zm-4-1a1 1 0 1 0 1 1a1 1 0 0 0-1-1Z"
				/>
			</svg>
		);
	else if (new RegExp(/(additional)|(armor)|(shield)/gi).test(type))
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				style="vertical-align:-0.125em"
				viewBox="0 0 24 24">
				<path
					fill="currentColor"
					d="M21 11c0 5.55-3.84 10.74-9 12c-5.16-1.26-9-6.45-9-12V5l9-4l9 4v6m-9 10c3.75-1 7-5.46 7-9.78V6.3l-7-3.12V21Z"
				/>
			</svg>
		);
	else if (new RegExp(/(sword)|(staff)|(bow)|(halberd)|(katana)|(magic)|(knuck)|(arrow)|(dagger)/gi).test(type))
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				style="vertical-align:-0.125em"
				viewBox="0 0 16 16">
				<path
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="m2.75 9.25l1.5 2.5l2 1.5m-4.5 0l1 1m1.5-2.5l-1.5 1.5m3-1l8.5-8.5v-2h-2l-8.5 8.5"
				/>
			</svg>
		);
	else if (new RegExp(/(monster)|(boss)/gi).test(type))
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				style="vertical-align:-0.125em"
				viewBox="0 0 32 32">
				<path
					fill="currentColor"
					d="M8 3v6l-5 1.5L6.5 14L4 19h5v10h2v-9.152c1.297.562 2.66 1.14 5.004 2.074c0 .027-.004.05-.004.078c0 2.23.7 4.047 1.98 5.25C19.258 28.457 21.04 29 23 29v-2c-1.602 0-2.82-.426-3.652-1.203c-.711-.672-1.192-1.645-1.317-3.063c1.317.496 2.5.914 3.32 1.137c.286.074.579.113.868.113c1.82 0 3.582-1.453 3.914-3.297L27 16l-3 2c-4.688 0-5.8-3-5.8-3c.35-.844 1.077-1.441 1.921-1.879L21 14v-1.262c.188-.066.375-.12.563-.175L23 14v-1.781c.059-.012.125-.028.184-.035L25 14v-2l3 2V9.152c0-1.476-1-2.836-2.45-3.101A2.98 2.98 0 0 0 25 6c-.8 0-1.516.336-2.055.852L21.5 3L20 7h-6zm2 3.734l2.89 1.93l.505.336h10.277l.594-.656a.995.995 0 0 1 .922-.328c.457.086.812.582.812 1.136V10h-.395l-.015-.008L25 10h-.031c-.707.012-6.938.23-8.614 4.227l-.304.726l.273.738C16.918 17.293 19.2 20 24 20h.227l-.063.34c-.156.875-1.066 1.644-1.945 1.644a1.24 1.24 0 0 1-.348-.047c-3.082-.828-11.976-4.73-12.066-4.769L9.422 17H7.234l1.055-2.105l.645-1.29l-2.153-2.152l1.797-.535l1.422-.43zM13 10s.23 2 2 2s3-2 3-2z"
				/>
			</svg>
		);
	else
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				style="vertical-align:-0.125em"
				viewBox="0 0 24 24">
				<path
					fill="currentColor"
					d="M20 21H4V10h2v9h12v-9h2v11M3 3h18v6H3V3m6.5 8h5c.28 0 .5.22.5.5V13H9v-1.5c0-.28.22-.5.5-.5M5 5v2h14V5H5Z"
				/>
			</svg>
		);
};
