{
	let resTimeoutPass: NodeJS.Timeout;
	let resTimeoutInfo: NodeJS.Timeout;

	const btnSubmitPass = document.getElementById("info_submit_password") as HTMLLinkElement;
	const btnSubmitInfo = document.getElementById("info_submit_info") as HTMLLinkElement;
	const responseMessagePass = document.getElementById("response_message_password") as HTMLDivElement;
	const responseMessageInfo = document.getElementById("response_message_info") as HTMLDivElement;

	btnSubmitPass.addEventListener("click", () => {
		const inputPassword = (document.getElementById("info_password") as HTMLInputElement).value;
		const inputPasswordConfirm = (document.getElementById("info_password_confirm") as HTMLInputElement).value;
		const displayMessage = (message: string) => {
			btnSubmitPass.classList.remove("disabled");

			responseMessagePass.classList.remove("hidden");
			responseMessagePass.innerText = message;

			if (resTimeoutPass) clearTimeout(resTimeoutPass);
			resTimeoutPass = setTimeout(() => {
				responseMessagePass.classList.add("hidden");
			}, 10e3);
		};

		if (inputPassword.length < 8) {
			return displayMessage("Password must be at least 8 characters long");
		}
		if (inputPassword !== inputPasswordConfirm) {
			return displayMessage("Password mismatched");
		}

		// @ts-ignore
		getSHA256Hash(inputPassword).then((hashedPassword: string) => {
			fetch("/api/user/update", {
				method: "POST",
				body: JSON.stringify({
					data: {
						password: hashedPassword,
					},
				}),
			})
				.then((res) => res.json())
				.then((res) => {
					displayMessage(res.message);
					if (res.error) console.error(res.error);
				})
				.catch(console.error);
		});
	});

	btnSubmitInfo.addEventListener("click", () => {
		const inputEmail = (document.getElementById("info_email_address") as HTMLInputElement).value;
		const displayMessage = (message: string) => {
			btnSubmitPass.classList.remove("disabled");

			responseMessageInfo.classList.remove("hidden");
			responseMessageInfo.innerText = message;

			if (resTimeoutInfo) clearTimeout(resTimeoutInfo);
			resTimeoutInfo = setTimeout(() => {
				responseMessageInfo.classList.add("hidden");
			}, 10e3);
		};

		fetch("/api/user/update", {
			method: "POST",
			body: JSON.stringify({
				data: {
					emailAddress: inputEmail,
				},
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				displayMessage(res.message);
				if (res.error) console.error(res.error);
			})
			.catch(console.error);
	});
}
