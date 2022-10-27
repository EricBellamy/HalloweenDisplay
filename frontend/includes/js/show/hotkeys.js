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
document.addEventListener("keypress", function (event) {
	switch (event.key) {
		case "p":
			window.audio.stop();
			if(window.audio.isPaused()){
				window.timeline.view.index = 0;
				window.audio.playRange(window.timeline.SONG.beatCount);
				window.timeline.render();
			}
			break;
		case " ":
			// Play audio for given frame
			if(window.audio.isPaused()) window.audio.playRange(window.timeline.view.max);
			else window.audio.stop();
			break;
	}
});