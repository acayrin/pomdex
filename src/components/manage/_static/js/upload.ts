document.getElementById("upload_submit")?.addEventListener("click", () => {
	const fileElem = document.getElementById("upload_file") as HTMLInputElement;

	fetch("/api/manage/upload", {
		method: "POST",
		body: fileElem.files?.[0],
	})
		.then((res) => res.json())
		.then((res) => {
			(document.getElementById("upload_response") as HTMLSpanElement).innerText = res.data?.url || res.message;
		});
});
