document.getElementById("upload_submit")?.addEventListener("click", () => {
	const fileElem = document.getElementById("upload_file") as HTMLInputElement;
	if (fileElem.files.length === 0) return;

	(async () => {
		const uploadData: {
			filename: string;
			upload_data: {
				attachments: {
					id: number;
					upload_url: string;
					upload_filename: string;
				}[];
			};
		} = (
			await (
				await fetch(`/api/manage/upload?filename=${fileElem.files[0].name}`, {
					method: "GET",
				})
			).json()
		).data;

		try {
			await fetch(uploadData.upload_data.attachments.at(0).upload_url, {
				method: "PUT",
				body: fileElem.files[0],
				headers: {
					host: "discord.com",
					Referer: "https://discord.com/",
				},
			});
		} catch {
			// CORS issues
		}

		const dsRequest: {
			data: { url: string };
		} = await (
			await fetch("/api/manage/upload", {
				method: "POST",
				body: JSON.stringify({
					id: uploadData.upload_data.attachments.at(0).id,
					filename: uploadData.filename,
					upload_filename: uploadData.upload_data.attachments.at(0).upload_filename,
				}),
			})
		).json();

		(document.getElementById("upload_response") as HTMLSpanElement).innerText = dsRequest.data.url;
	})();
});
