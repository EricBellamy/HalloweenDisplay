const params = new URLSearchParams(location.search);
window.SHOW_ID = params.get('show');

async function loadShowData() {
	await new Promise(function (resolve, reject, returned = 0) {
		tired.xhr.get("/metadata?show=" + window.SHOW_ID, function (err, response, status) {
			if (status === 200) window.SHOW_META = JSON.parse(response);

			returned++;
			if (returned === 4) resolve();
		});
		tired.xhr.get("/instructions?show=" + window.SHOW_ID, function (err, response, status) {
			if (status === 200) console.log(response);
			else window.SHOW_INSTRUCTIONS = {};

			returned++;
			if (returned === 4) resolve();
		});
		window.LOADED_AUDIO_FILE = new Audio("/mp3?show=" + window.SHOW_ID);
		window.LOADED_AUDIO_FILE.addEventListener('loadeddata', () => {
			window.audio = new AudioManager(window.LOADED_AUDIO_FILE);
			window.AnimationManager.addRenderCallback(window.audio.render.bind(window.audio));

			returned++;
			if (returned === 4) resolve();
		});
		var xhr = new XMLHttpRequest();
		xhr.open('GET', window.LOADED_AUDIO_FILE.src);
		xhr.responseType = 'blob';
		xhr.onload = async function (e) {
			let fileReader = new FileReader();
			fileReader.onloadend = () => {
				var context = new AudioContext();
				context.decodeAudioData(fileReader.result, function (buffer) {
					var audioData = [];
					// Take the average of the two channels
					if (buffer.numberOfChannels == 2) {
						var channel1Data = buffer.getChannelData(0);
						var channel2Data = buffer.getChannelData(1);
						var length = channel1Data.length;
						for (var i = 0; i < length; i++) {
							audioData[i] = (channel1Data[i] + channel2Data[i]) / 2;
						}
					} else {
						audioData = buffer.getChannelData(0);
					}
					var mt = new MusicTempo(audioData);

					window.LOADED_SONG_ANALYSIS = mt;

					returned++;
					if(returned === 4) resolve();
				});
			}
			fileReader.readAsArrayBuffer(xhr.response);
		}
		xhr.send();
	});
	window.timeline.SONG = JSON.parse(JSON.stringify(window.SHOW_META));
	window.timeline.SONG.duration = window.audio.getDuration();
	// window.timeline.SONG.tempo = window.LOADED_SONG_ANALYSIS;
	window.timeline.SONG.tempo = parseFloat(window.LOADED_SONG_ANALYSIS.tempo);
	window.timeline.SONG.beats = window.LOADED_SONG_ANALYSIS.beats;
	console.log(window.LOADED_SONG_ANALYSIS);
	window.timeline.loadFromInstructions(JSON.parse(JSON.stringify(window.SHOW_INSTRUCTIONS)));

	initTimeline();
}
loadShowData();