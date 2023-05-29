export const getElementColor = (element: string) => {
	if (element.includes("Dark")) {
		return "#aa80ff";
	}

	if (element.includes("Light")) {
		return "#99ffcc";
	}

	if (element.includes("Fire")) {
		return "#ff1a1a";
	}

	if (element.includes("Earth")) {
		return "#ff8000";
	}

	if (element.includes("Wind")) {
		return "#66ff33";
	}

	if (element.includes("Water")) {
		return "#33ccff";
	}

	return "#f2f2f2";
};
