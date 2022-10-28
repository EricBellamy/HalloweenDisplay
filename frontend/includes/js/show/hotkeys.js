document.addEventListener("keydown", function (event) {
	switch (event.key) {
		case "a":
		case "ArrowLeft":
			window.audio.stop();
			// Move index left
			window.timeline.decreaseIndex();
			break;
		case "d":
		case "ArrowRight":
			window.audio.stop();
			// Move index right
			window.timeline.increaseIndex();
			break;
	}
});
document.addEventListener("keypress", function (event) {
	switch (event.key) {
		case "o":
			if (window.audio.isPaused()) {
				window.audio.playRange(window.timeline.SONG.beatCount - window.timeline.view.index, true);
			} else window.audio.stop();
			break;
		case "p":
			if (window.audio.isPaused()) {
				window.timeline.view.index = 0;
				window.audio.playRange(window.timeline.SONG.beatCount, true);
			} else window.audio.stop();
			break;
		case " ":
			// Play audio for given frame
			if (window.audio.isPaused()) window.audio.playRange(window.timeline.view.max);
			else window.audio.stop();
			break;
	}
});