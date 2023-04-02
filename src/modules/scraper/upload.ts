import ky from "ky";

export const uploadFile = async (buffer: Buffer, filename?: string): Promise<string> => {
	filename ||= `${Date.now()}.jpg`;

	try {
		return await uploadFileDiscordWebhook(buffer, filename);
	} catch (err) {
		console.error(err);
		await new Promise((res) => {
			setTimeout(res, 60e3);
		});
		return await uploadFile(buffer, filename);
	}

	try {
		return await uploadFileImgbb(buffer, filename);
	} catch {
		try {
			return await uploadFileDiscord(buffer, filename);
		} catch {
			try {
				return await uploadFilePutre(buffer, filename);
			} catch {
				return await uploadFile(buffer, filename);
			}
		}
	}
};

const uploadFileDiscord = async (buffer: Buffer, filename?: string): Promise<string> => {
	// request google upload url from discord
	const uploadUrl: {
		attachments: {
			id: number;
			upload_url: string;
			upload_filename: string;
		}[];
	} = await ky
		.post(`https://discord.com/api/v9/channels/${process.env.DISCORD_CHANNEL_ID}/attachments`, {
			json: {
				files: [{ filename, file_size: buffer.byteLength, id: "3" }],
			},
			headers: {
				Authorization: process.env.DISCORD_TOKEN,
				"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0",
			},
			retry: { limit: 1e10 },
		})
		.json();

	// actually upload the file content to google storage
	await ky.put(`${uploadUrl.attachments.at(0).upload_url}`, {
		body: buffer,
		retry: { limit: 1e10 },
	});

	// send a dummy message with given file uri, then get result message object
	// and extract the attachment url hosted on discord cdn
	const message: {
		attachments: {
			url: string;
		}[];
	} = await ky
		.post(`https://discord.com/api/v9/channels/${process.env.DISCORD_CHANNEL_ID}/messages`, {
			json: {
				attachments: [
					{
						filename,
						id: "0",
						uploaded_filename: uploadUrl.attachments.at(0).upload_filename,
					},
				],
				channel_id: process.env.DISCORD_CHANNEL_ID,
				content: "ok",
				nonce: Date.now(),
				sticker_ids: [],
				type: 0,
			},
			headers: {
				Authorization: process.env.DISCORD_TOKEN,
				"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0",
			},
			retry: {
				limit: 1e10,
			},
		})
		.json();

	return message.attachments.at(0).url;
};

const uploadFileDiscordWebhook = async (buffer: Buffer, filename?: string): Promise<string> => {
	// send a dummy message with given file uri, then get result message object
	// and extract the attachment url hosted on discord cdn
	const form = new FormData();
	form.append(
		"file1",
		new File([buffer], filename, {
			type: "image/jpg",
		})
	);

	const message: {
		attachments: {
			url: string;
		}[];
	} = await ky
		.post(process.env.DISCORD_WEBHOOK, {
			body: form,
			retry: {
				limit: 1e10,
			},
		})
		.json();

	return message.attachments.at(0).url;
};

const uploadFileGofile = async (buffer: Buffer, filename?: string): Promise<string> => {
	const file = new File([buffer], filename, {
		type: "image/jpg",
	});

	const goServer: {
		status: string;
		data: {
			server: string;
		};
	} = await ky("https://api.gofile.io/getServer", {
		retry: {
			limit: 1e10,
			statusCodes: [408, 413, 429, 500, 502, 503, 504],
		},
		timeout: 60e3,
	}).json();

	const formData = new FormData();
	formData.append("file", file);
	formData.append("token", process.env.GOFILE_TOKEN);
	//formData.append("folderId", process.env.GOFILE_FOLDER);
	const goUpload: {
		status: string;
		data: {
			downloadPage: string;
			code: string;
			parentFolder: string;
			fileId: string;
			fileName: string;
			md5: string;
		};
	} = await ky(`https://${goServer.data.server}.gofile.io/uploadFile`, {
		method: "post",
		body: formData,
		retry: {
			limit: 1e10,
			statusCodes: [408, 413, 429, 500, 502, 503, 504],
		},
		timeout: 60e3,
	}).json();

	return `https://${goServer.data.server}.gofile.io/download/direct/${goUpload.data.fileId}/${filename}`;
};

const uploadFileImgbb = async (buffer: Buffer, filename: string) => {
	const formData = new FormData();
	formData.append(
		"source",
		new File([buffer], filename, {
			type: "image/jpg",
		})
	);

	const r: { data: { url: string } } = await (
		await fetch(`https://api.imgbb.com/1/upload?key=05692af62f93f587d007955017962e72&name=${filename}`, {
			method: "post",
			body: formData,
		})
	).json();

	try {
		return r.data.url;
	} catch {
		throw r;
	}
};

const uploadFilePutre = async (buffer: Buffer, filename: string) => {
	const formData = new FormData();
	formData.append(
		"file",
		new File([buffer], filename, {
			type: "image/jpg",
		})
	);

	const r: { data: { url: string } } = await (
		await ky(`https://api.put.re/upload`, {
			method: "post",
			body: formData,
		})
	).json();

	return r.data.url;
};
