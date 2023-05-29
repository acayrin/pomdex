{
	let resTimeout: NodeJS.Timeout;

	const btnSubmit = document.getElementById("login_submit") as HTMLDivElement;
	const responseMessage = document.getElementById("response_message") as HTMLDivElement;
	const inputUsername = document.getElementById("login_username") as HTMLInputElement;
	const inputPassword = document.getElementById("login_password") as HTMLInputElement;

	btnSubmit.classList.remove("disabled");
	btnSubmit.addEventListener("click", () => {
		btnSubmit.classList.add("disabled");

		// @ts-ignore
		getSHA256Hash(inputPassword.value).then((hashedPassword: string) => {
			fetch("/api/user/login", {
				method: "POST",
				body: JSON.stringify({
					username: inputUsername.value,
					// @ts-ignore
					password: hashedPassword,
				}),
			})
				.then((res) => res.json())
				.then((message: MessageResponse) => {
					if (message.status !== 200) {
						displayMessage(message.message);
						return;
					}

					if (!window.localStorage) {
						displayMessage("LocalStorage is not supported by your browser");
						return;
					}

					window.location.href = "/";
				})
				.catch((err) => {
					displayMessage("An error has occured");

					console.error(err);
				});
		});
	});

	const displayMessage = (message: string) => {
		btnSubmit.classList.remove("disabled");

		responseMessage.classList.remove("hidden");
		responseMessage.innerText = message;

		if (resTimeout) clearTimeout(resTimeout);
		resTimeout = setTimeout(() => {
			responseMessage.classList.add("hidden");
		}, 10e3);
	};
}

type MessageResponse = {
	status: number;
	message: string;
	data: {
		token: string;
	};
};
