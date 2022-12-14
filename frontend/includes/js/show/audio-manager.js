class AudioManager {
	audio;

	currentBeatIndex = -1;


	// Beat Index
	startBeat = 0;
	stopBeat = 0;

	// Beat Index Timestamps
	startBeatTime = 0;
	stopBeatTime = 0;
	remainingTimeMs = 0;

	timestampStart;
	timestampEnd;
	constructor(audio) {
		this.audio = audio;

		this.timestampStart = document.querySelector("#timestampStart");
		this.timestampEnd = document.querySelector("#timestampEnd");
		this.timestamp = document.querySelector("#timestamp");

		this.timestamp.addEventListener("click", function(){
			if(this.playing) this.stop();
			else this.play();
		}.bind(this));

		this.timestampStart.innerHTML = this.getFormattedTimestampFromSeconds(0);
		this.timestampEnd.innerHTML = this.getFormattedTimestampFromSeconds(audio.duration);

		// this.audio.duration
		// this.audio.currentTime = float value of seconds
		// this.audio.volume = 0 -> 1 

		// src, currentTime, duration, paused, muted, and volume.
	}
	getDuration() {
		return this.audio.duration;
	}
	calculateBeatTimestamp(beatIndex) {
		return (beatIndex / (window.timeline.SONG.scaledTempo)) * 60;
	}
	calculateBeatIndexFromTimestamp(timestamp) {
		if (timestamp === undefined) timestamp = this.audio.currentTime;

		const beatIndexVal = (timestamp / 60) * window.timeline.SONG.scaledTempo;
		// return Math.floor(Math.round(beatIndexVal * 1000) / 1000);
		return Math.round(beatIndexVal);
	}
	isPaused() {
		return this.audio.paused;
	}


	// Hooks into the render loop, calculate when the playing audio needs to be paused
	render(frameTime, firstRender = false) {
		if (this.playing) {
			this.updateTimestamp(this.audio.currentTime);
			this.remainingTimeMs -= frameTime;

			const beatIndex = this.calculateBeatIndexFromTimestamp();

			if (this.stopBeat < beatIndex || this.audio.currentTime === this.audio.duration) return this.stop();

			if (this.updateHighlighter && beatIndex != this.currentBeatIndex) {
				window.timeline.updateHighlighterIndex(beatIndex - this.startBeat, this.scrollWithHighlighter, firstRender);
				this.currentBeatIndex = beatIndex;
			}
		}
	}

	playing = false;
	stop() {
		if (this.playing) {
			if (this.updateHighlighter) {
				// Reset the highlighter position
				if (this.scrollWithHighlighter) window.timeline.highlightBaseBeat();
				else window.timeline.highlightBeat(this.startingHighlighterIndex);
			}

			this.playing = false;
			this.startBeat = 0;
			this.startBeatTime = 0;
			this.stopBeat = 0;
			this.stopBeatTime = 0;
			this.remainingTimeMs = 0;
			this.currentBeatIndex = -1;
			this.startingHighlighterIndex = 0;
			this.updateHighlighter = true;
			this.scrollWithHighlighter = false;

			this.timestamp.classList.toggle("playing", false);

			this.audio.pause();
		}
	}

	startingHighlighterIndex = -1;
	scrollWithHighlighter = false;
	updateHighlighter = true;
	updatePlayElements(){
		this.timestamp.classList.toggle("playing", true);
	}
	playRange(maxBeats, scrollWithHighlighter = false) {
		if (window.mouseDownOn === undefined) {
			this.scrollWithHighlighter = scrollWithHighlighter;

			// Save the starting highlighter position for reset
			if (!this.scrollWithHighlighter) this.startingHighlighterIndex = window.timeline.view.highlightIndex;

			// window.timeline.SONG.tempo --> The beats per minute
			// window.timeline.SONG.duration --> The duration in seconds
			this.startBeat = window.timeline.view.index;
			this.stopBeat = this.startBeat + maxBeats;

			this.startBeatTime = this.calculateBeatTimestamp(this.startBeat);
			this.stopBeatTime = this.calculateBeatTimestamp(this.stopBeat);

			this.remainingTimeMs = (this.stopBeatTime - this.startBeatTime) * 1000;

			this.audio.currentTime = this.startBeatTime;

			window.timeline.resetHighlighterIndex();

			this.playing = true;
			this.render(0, true);
			this.audio.play();
			this.updatePlayElements();
		}
	}
	playSingle() {
		this.updateHighlighter = false;

		// window.timeline.SONG.tempo --> The beats per minute
		// window.timeline.SONG.duration --> The duration in seconds
		this.startBeat = window.timeline.view.index + window.timeline.view.highlightIndex;
		this.stopBeat = this.startBeat + 2;

		this.startBeatTime = this.calculateBeatTimestamp(this.startBeat);
		this.stopBeatTime = this.calculateBeatTimestamp(this.stopBeat);

		this.remainingTimeMs = (this.stopBeatTime - this.startBeatTime) * 1000;

		this.audio.currentTime = this.startBeatTime;

		this.render(0, true);

		if(!this.playing) this.audio.play();
		this.playing = true;

		this.updatePlayElements();
	}
	updateTimestamp(seconds){
		this.timestampStart.innerHTML = this.getFormattedTimestampFromSeconds(seconds);
	}
	updateTimestampFromIndex(index){
		this.updateTimestamp(this.calculateBeatTimestamp(index));
	}
	getFormattedTimestampFromSeconds(seconds){
		const minutes = Math.floor(seconds % 60);
		return `${Math.floor(seconds / 60)}:${minutes < 10 ? 0 : ""}${minutes}`;
	}
	pause() {
		this.audio.pause();
	}
}