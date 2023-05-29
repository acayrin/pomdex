const precompiled = {
	logoBase64: {
		128: "",
		96: "",
		64: "",
		48: "",
		32: "",
		16: "",
	},
};
const taskCompileComponents = async () => {
	// Logo
	for (const size of [128, 96, 64, 48, 32, 16]) {
		fetch(`https://cdn.discordapp.com/avatars/828605986511388733/b8f1959c5a5d08825bbba7089b9fcd4e.png?size=${size}`)
			.then((res) => res.arrayBuffer())
			.then((buffer) => {
				precompiled.logoBase64[size] = `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
			})
			.catch(console.error);
	}
};

export { precompiled, taskCompileComponents };
