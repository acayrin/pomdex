import { App } from "../app.js";
import ky from "ky";

export const uploadFile = async (buffer: Buffer, filename?: string): Promise<string> => {
	filename ||= `${Date.now()}.jpg`;

	try {
		return await uploadFileDiscord(buffer, filename);
	} catch {
		App.error(`Failed to upload file ${filename}, retrying in 60 seconds`);

		await new Promise((res) => {
			setTimeout(res, 60e3);
		});

		return await uploadFile(buffer, filename);
	}
};

// [ DISCORD USER UPLOAD ]=======================================================================================================
const uploadFileDiscord = async (buffer: Buffer, filename?: string): Promise<string> => {
	// request google upload url from discord
	const uploadData = (await requestDiscordUploadURL(filename)).attachments.at(0);

	// actually upload the file content to google storage
	await requestUploadFileStorage(uploadData.upload_url, buffer);

	// send a dummy message with given file uri, then get result message object
	// and extract the attachment url hosted on discord cdn
	const message = await requestGetFileUrl(uploadData.id, filename, uploadData.upload_filename);

	return message.attachments.at(0).url;
};
export const requestDiscordUploadURL = async (filename: string) => {
	const uploadUrl: {
		attachments: {
			id: number;
			upload_url: string;
			upload_filename: string;
		}[];
	} = await ky
		.post(`https://discord.com/api/v9/channels/${process.env.DISCORD_CHANNEL_ID}/attachments`, {
			json: {
				files: [{ filename, file_size: 50e6, id: Date.now() }],
			},
			headers: {
				Authorization: process.env.DISCORD_TOKEN,
				"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0",
			},
			retry: { limit: 1e10 },
		})
		.json();

	return uploadUrl;
};
export const requestUploadFileStorage = (uploadUrl: string, buffer: Buffer) =>
	// actually upload the file content to google storage
	ky.put(uploadUrl, {
		body: buffer,
		retry: { limit: 1e10 },
	});
export const requestGetFileUrl = async (id: number, filename: string, uploadFilename: string) => {
	const message: {
		attachments: {
			url: string;
		}[];
	} = await ky
		.post(`https://discord.com/api/v9/channels/${process.env.DISCORD_CHANNEL_ID}/messages`, {
			json: {
				attachments: [
					{
						id,
						filename,
						uploaded_filename: uploadFilename,
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

	return message;
};

// [ DISCORD WEBHOOK UPLOAD ]==================================================================================================
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

// [ GO FILE UPLOAD ]=============================================================================================================
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

// [ PUTRE UPLOAD ]=============================================================================================================
const uploadFilePutre = async (buffer: Buffer, filename: string) => {
	const formData = new FormData();
	formData.append(
		"file",
		new File([buffer], filename, {
			type: "image/jpg",
		})
	);

	const r: { data: { url: string } } = await (
		await ky("https://api.put.re/upload", {
			method: "post",
			body: formData,
		})
	).json();

	return r.data.url;
};
