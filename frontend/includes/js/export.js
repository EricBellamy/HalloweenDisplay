const button = document.querySelector("#export");

button.addEventListener("click", function () {
	console.log("Exporting...");

	for (const point of points) {
		console.log(point);
		console.log(point.hex, point.x, point.y);
	}

	tired.clipboard.copy("this is in your clipboard");
});