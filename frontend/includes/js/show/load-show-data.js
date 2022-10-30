const params = new URLSearchParams(location.search);
window.SHOW_ID = params.get('show');
window.SHOW_VERSION = params.get('version');
if(window.SHOW_VERSION === null || window.SHOW_VERSION.length === 0) {
	window.SHOW_VERSION = new Date().getTime();
	params.set('version', window.SHOW_VERSION);
	window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
}

async function loadShowData() {
	await new Promise(function (resolve, reject, returned = 0) {
		tired.xhr.get("/metadata?show=" + window.SHOW_ID, function (err, response, status) {
			if (status === 200) window.SHOW_META = JSON.parse(response);

			console.log(window.SHOW_META);

			returned++;
			if (returned === 3) resolve();
		});
		tired.xhr.get(`/instructions?show=${window.SHOW_ID}&version=${window.SHOW_VERSION}`, function (err, response, status) {
			if (status === 200) window.SHOW_INSTRUCTIONS = response
			else window.SHOW_INSTRUCTIONS = {};

			returned++;
			if (returned === 3) resolve();
		});
		window.LOADED_AUDIO_FILE = new Audio("/mp3?show=" + window.SHOW_ID);
		window.LOADED_AUDIO_FILE.addEventListener('loadeddata', () => {
			window.audio = new AudioManager(window.LOADED_AUDIO_FILE);
			window.AnimationManager.addRenderCallback(window.audio.render.bind(window.audio));

			returned++;
			if (returned === 3) resolve();
		});
	});

	for(const LASER_DESIGN_KEY in window.LASER_DESIGNS){
		const LASER_DESIGN = window.LASER_DESIGNS[LASER_DESIGN_KEY];
		window.laserDisplay.registerDesign(LASER_DESIGN_KEY, LASER_DESIGN[0], LASER_DESIGN[1]);
	}

	window.timeline.SONG = JSON.parse(JSON.stringify(window.SHOW_META));
	window.timeline.SONG.duration = window.audio.getDuration();
	window.timeline.SONG.instructions = JSON.parse(window.SHOW_INSTRUCTIONS);

	window.timeline.SONG.tempo = parseFloat(window.SHOW_META.tempo);
	window.timeline.SONG.beats = window.SHOW_META.beats;

	initTimeline();

	window.timeline.loadFromInstructions(JSON.parse(window.SHOW_INSTRUCTIONS));
}
loadShowData();