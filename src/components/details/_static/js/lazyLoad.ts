document.addEventListener("DOMContentLoaded", () => {
	const lazyUrl = `${new URL(window.location.href).pathname}/lazy`.replace(/\/\//g, "/");
	const lazyRender = document.getElementById("lazyRender");
	fetch(lazyUrl, {
		method: "GET",
	}).then((res) =>
		res
			.text()
			.then((body) => _render(body, res))
			.catch((_) => {
				_render(
					[
						`<div class="card">`,
						`<div class="card-content">`,
						`<span class="card-title">Oops!</span>`,
						"<p>This wasn't suppose to happend, did you forget to add an entry ID to the url?</p>",
						"<p><a href='/details/E1'>Maybe try again</a></p>",
						"</div>",
						"</div>",
					].join("")
				);
			})
	);

	const _render = (body: string, res?: Response) => {
		lazyRender.innerHTML = body;

		if (res) {
			document.getElementById("lastModified").innerText = res.headers.get("last-modified");
		}
	};
});
