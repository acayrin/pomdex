{
	let resTimeout: NodeJS.Timeout;

	const btnSubmit = document.getElementById("register_submit") as HTMLDivElement;
	const responseMessage = document.getElementById("response_message") as HTMLDivElement;
	const inputUsername = document.getElementById("register_username") as HTMLInputElement;
	const inputPassword = document.getElementById("register_password") as HTMLInputElement;
	const inputPasswordConfirm = document.getElementById("register_password") as HTMLInputElement;

	btnSubmit.classList.remove("disabled");
	btnSubmit.addEventListener("click", () => {
		btnSubmit.classList.add("disabled");

		if (inputPassword.value !== inputPasswordConfirm.value) {
			displayMessage("Password mismatched");
			return;
		}

		// @ts-ignore
		getSHA256Hash(inputPassword.value).then((hashedPassword: string) => {
			fetch("/api/user/register", {
				method: "POST",
				body: JSON.stringify({
					username: inputUsername.value,
					// @ts-ignore
					password: hashedPassword,
				}),
			})
				.then((res) => res.json())
				.then((message: { status: number; message?: string }) => {
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
