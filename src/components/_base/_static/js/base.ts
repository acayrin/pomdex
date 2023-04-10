{
	{
		// Materialize init
		// @ts-ignore
		M.AutoInit();

		// Fetch current user info and set navigation
		fetch("/api/user/info", {
			method: "GET",
		})
			.then((res) => res.json())
			.then((res) => {
				if (!res.data) return;

				const navItems: string[] = [];
				navItems.push('<ul class="collapsible">');
				navItems.push(
					'<ul class="collapsible">',
					"<li>",
					'<a href="/user/info">',
					'<div class="collapsible-header">',
					'<iconify-icon icon="ic:outline-info"></iconify-icon>',
					"<span>My Info</span>",
					"</div>",
					"</a>",
					"</li>",
					"<li>",
					'<a href="/user/logout">',
					'<div class="collapsible-header">',
					'<iconify-icon icon="ic:twotone-logout"></iconify-icon>',
					"<span>Logout</span>",
					"</div>",
					"</a>",
					"</li>"
				);
				if (res.data?.type === "admin") {
					navItems.push(
						"<li>",
						'<a href="/manage">',
						'<div class="collapsible-header">',
						'<iconify-icon icon="material-symbols:bookmark-manager-outline"></iconify-icon>',
						"<span>Manage Entries</span>",
						"</div>",
						"</a>",
						"</li>",
						"<li>",
						'<a href="/manage/upload">',
						'<div class="collapsible-header">',
						'<iconify-icon icon="ic:baseline-file-upload"></iconify-icon>',
						"<span>Upload File</span>",
						"</div>",
						"</a>",
						"</li>"
					);
				}
				navItems.push("</ul>");
				document.getElementById("nav_account").innerHTML = navItems.join("");
			});

		/* [ Annoyance ] ==============================================================
	setInterval(() => {
		document.documentElement.style.setProperty(
			"--color-accent",
			`#${Math.floor(Math.random() * 16_777_215).toString(16)}`
		);
		document.documentElement.style.setProperty(
			"--color-accent-lighten",
			`#${Math.floor(Math.random() * 16_777_215).toString(16)}`
		);
		document.documentElement.style.setProperty(
			"--color-accent-darken",
			`#${Math.floor(Math.random() * 16_777_215).toString(16)}`
		);
	}, 1e3 / 2);
	*/
	}
}

const getItemTypeIcon = (type: string) =>
	type === "Map"
		? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" style="vertical-align:-.125em;margin-right:.3em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4c2.2 0 4 1.8 4 4c0 2.1-2.1 5.5-4 7.9c-1.9-2.5-4-5.8-4-7.9c0-2.2 1.8-4 4-4m0-2C8.7 2 6 4.7 6 8c0 4.5 6 11 6 11s6-6.6 6-11c0-3.3-2.7-6-6-6m0 4c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m8 13c0 2.2-3.6 4-8 4s-8-1.8-8-4c0-1.3 1.2-2.4 3.1-3.2l.6.9c-1 .5-1.7 1.1-1.7 1.8c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5c0-.7-.7-1.3-1.8-1.8l.6-.9c2 .8 3.2 1.9 3.2 3.2Z"/></svg>`
		: new RegExp(/(crysta)/gi).test(type)
		? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" style="vertical-align:-.125em;margin-right:.3em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2L5 12l7 10l7-10M7.44 12L12 5.5l4.56 6.5L12 18.5"/></svg>`
		: new RegExp(/(additional)|(armor)|(shield)/gi).test(type)
		? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" style="vertical-align:-.125em;margin-right:.3em" viewBox="0 0 24 24"><path fill="currentColor" d="M21 11c0 5.55-3.84 10.74-9 12c-5.16-1.26-9-6.45-9-12V5l9-4l9 4v6m-9 10c3.75-1 7-5.46 7-9.78V6.3l-7-3.12V21Z"/></svg>`
		: new RegExp(/(sword)|(staff)|(bow)|(halberd)|(katana)|(magic)|(knuck)/gi).test(type)
		? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" style="vertical-align:-.125em;margin-right:.3em" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m2.75 9.25l1.5 2.5l2 1.5m-4.5 0l1 1m1.5-2.5l-1.5 1.5m3-1l8.5-8.5v-2h-2l-8.5 8.5"/></svg>`
		: new RegExp(/(monster)|(boss)/gi).test(type)
		? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" style="vertical-align:-.125em;margin-right:.3em" viewBox="0 0 32 32"><path fill="currentColor" d="M8 3v6l-5 1.5L6.5 14L4 19h5v10h2v-9.152c1.297.562 2.66 1.14 5.004 2.074c0 .027-.004.05-.004.078c0 2.23.7 4.047 1.98 5.25C19.258 28.457 21.04 29 23 29v-2c-1.602 0-2.82-.426-3.652-1.203c-.711-.672-1.192-1.645-1.317-3.063c1.317.496 2.5.914 3.32 1.137c.286.074.579.113.868.113c1.82 0 3.582-1.453 3.914-3.297L27 16l-3 2c-4.688 0-5.8-3-5.8-3c.35-.844 1.077-1.441 1.921-1.879L21 14v-1.262c.188-.066.375-.12.563-.175L23 14v-1.781c.059-.012.125-.028.184-.035L25 14v-2l3 2V9.152c0-1.476-1-2.836-2.45-3.101A2.98 2.98 0 0 0 25 6c-.8 0-1.516.336-2.055.852L21.5 3L20 7h-6zm2 3.734l2.89 1.93l.505.336h10.277l.594-.656a.995.995 0 0 1 .922-.328c.457.086.812.582.812 1.136V10h-.395l-.015-.008L25 10h-.031c-.707.012-6.938.23-8.614 4.227l-.304.726l.273.738C16.918 17.293 19.2 20 24 20h.227l-.063.34c-.156.875-1.066 1.644-1.945 1.644a1.24 1.24 0 0 1-.348-.047c-3.082-.828-11.976-4.73-12.066-4.769L9.422 17H7.234l1.055-2.105l.645-1.29l-2.153-2.152l1.797-.535l1.422-.43zM13 10s.23 2 2 2s3-2 3-2z"/></svg>`
		: new RegExp(/(usable)/gi).test(type)
		? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" style="vertical-align:-.125em;margin-right:.3em" viewBox="0 0 24 24"><path fill="currentColor" d="M18.93 11.67a.42.42 0 0 0 0-.1A7.4 7.4 0 0 0 15 7.62V4h1a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2h1v3.62a7.4 7.4 0 0 0-3.89 4a.42.42 0 0 0 0 .1a7.5 7.5 0 1 0 13.86 0Zm-8.62-2.41a1 1 0 0 0 .69-.95V4h2v4.31a1 1 0 0 0 .69.95A5.43 5.43 0 0 1 16.23 11H7.77a5.43 5.43 0 0 1 2.54-1.74ZM12 20a5.51 5.51 0 0 1-5.5-5.5a5.34 5.34 0 0 1 .22-1.5h10.56a5.34 5.34 0 0 1 .22 1.5A5.51 5.51 0 0 1 12 20Zm2-4a1 1 0 1 0 1 1a1 1 0 0 0-1-1Zm-4-1a1 1 0 1 0 1 1a1 1 0 0 0-1-1Z" /></svg>`
		: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" style="vertical-align:-.125em;margin-right:.3em" viewBox="0 0 24 24"><path fill="currentColor" d="M0 0h7.2v2.4h9.6V0H24v7.2h-2.4v9.6H24V24h-7.2v-2.4H7.2V24H0v-7.2h2.4V7.2H0V0m16.8 7.2V4.8H7.2v2.4H4.8v9.6h2.4v2.4h9.6v-2.4h2.4V7.2M2.4 2.4v2.4h2.4V2.4m14.4 0v2.4h2.4V2.4M2.4 19.2v2.4h2.4v-2.4m14.4 0v2.4h2.4v-2.4z"/></svg>`;
