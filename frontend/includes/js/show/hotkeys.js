document.addEventListener("keydown", function (event) {
	switch (event.key) {
		case "a":
		case "ArrowLeft":
			// Move index left
			window.timeline.decreaseIndex();
			break;
		case "d":
		case "ArrowRight":
			// Move index right
			window.timeline.increaseIndex();
			break;
	}
});