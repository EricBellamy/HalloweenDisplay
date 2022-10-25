const params = new URLSearchParams(location.search);
window.SHOW_ID = params.get('show');

async function loadShowData() {
	await new Promise(function(resolve, reject, returned = 0) {
		tired.xhr.get("/metadata?show=" + window.SHOW_ID, function (err, response, status) {
			if (status === 200) window.SHOW_META = JSON.parse(response);

			returned++;
			if(returned === 3) resolve();
		});
		tired.xhr.get("/instructions?show=" + window.SHOW_ID, function (err, response, status) {
			if (status === 200) console.log(response);
			else window.SHOW_INSTRUCTIONS = {};

			returned++;
			if(returned === 3) resolve();
		});
		window.LOADED_AUDIO_FILE = new Audio("/mp3?show=" + window.SHOW_ID);
		window.LOADED_AUDIO_FILE.addEventListener('loadeddata', () => {
			window.audio = new AudioManager(window.LOADED_AUDIO_FILE);
			window.AnimationManager.addRenderCallback(window.audio.render.bind(window.audio));

			returned++;
			if(returned === 3) resolve();
		})
	});
	window.timeline.SONG = JSON.parse(JSON.stringify(window.SHOW_META));
	window.timeline.SONG.duration = window.audio.getDuration();
	window.timeline.SONG.tempo = parseFloat(window.timeline.SONG.tempo);
	window.timeline.loadFromInstructions(JSON.parse(JSON.stringify(window.SHOW_INSTRUCTIONS)));

	initTimeline();
}
loadShowData();