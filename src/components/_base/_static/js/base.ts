document.addEventListener("DOMContentLoaded", () => {
	// materialize
	// @ts-ignore
	M.AutoInit();

	// scrollable sidebar
	window.addEventListener("scroll", () => {
		(document.querySelector(".sidebar") as HTMLDivElement).style.top = `${window.scrollY}px`;
	});

	// account navigation
	const navAccount = document.getElementById("nav_account") as HTMLDivElement;

	fetch("/api/user/info", {
		method: "GET",
	})
		.then((res) => res.json())
		.then((res) => {
			if (res.data?.username) {
				navAccount.innerHTML = [
					'<ul class="collapsible">',
					"<li>",
					'<a href="/user/info">',
					'<div class="collapsible-header">My Info</div>',
					"</a>",
					"</li>",
					"<li>",
					'<a href="#" id="logout">',
					'<div class="collapsible-header">Logout</div>',
					"</a>",
					"</li>",
					"</ul>",
				].join("");
			}
			if (res.data?.type === "admin") {
				navAccount.innerHTML = [
					'<ul class="collapsible">',
					"<li>",
					'<a href="/user/info">',
					'<div class="collapsible-header">My Info</div>',
					"</a>",
					"</li>",
					"<li>",
					'<a href="/manage">',
					'<div class="collapsible-header">Manage Entries</div>',
					"</a>",
					"</li>",
					"<li>",
					'<a href="/manage/upload">',
					'<div class="collapsible-header">Upload</div>',
					"</a>",
					"</li>",
					"<li>",
					'<a href="#" id="logout">',
					'<div class="collapsible-header">Logout</div>',
					"</a>",
					"</li>",
					"</ul>",
				].join("");
				document.getElementById("logout")?.addEventListener("click", () => {
					fetch("/api/user/logout", {
						method: "GET",
					})
						.then((res) => res.json())
						.then((res) => {
							window.location.href = "/";
						});
				});
			}
		});
});
