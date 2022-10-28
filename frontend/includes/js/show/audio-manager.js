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

	constructor(audio) {
		this.audio = audio;
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
	calculateBeatIndexFromTimestamp() {
		const timestamp = this.audio.currentTime;

		const beatIndexVal = (timestamp / 60) * window.timeline.SONG.scaledTempo;
		return Math.floor(Math.round(beatIndexVal * 1000) / 1000);
	}
	isPaused() {
		return this.audio.paused;
	}


	// Hooks into the render loop, calculate when the playing audio needs to be paused
	render(frameTime, firstRender = false) {
		if (this.playing) {
			this.remainingTimeMs -= frameTime;

			const beatIndex = this.calculateBeatIndexFromTimestamp();

			if (this.stopBeat < beatIndex || this.audio.currentTime === this.audio.duration) return this.stop();

			if (beatIndex != this.currentBeatIndex) {
				window.timeline.updateHighlighterIndex(beatIndex - this.startBeat, this.scrollWithHighlighter, firstRender);
				this.currentBeatIndex = beatIndex;
			}
		}
	}

	playing = false;
	stop() {
		if (this.playing) {
			// Reset the highlighter position
			if (this.scrollWithHighlighter) window.timeline.highlightBaseBeat();
			else window.timeline.highlightBeat(this.startingHighlighterIndex);

			this.playing = false;
			this.startBeat = 0;
			this.startBeatTime = 0;
			this.stopBeat = 0;
			this.stopBeatTime = 0;
			this.remainingTimeMs = 0;
			this.currentBeatIndex = -1;
			this.startingHighlighterIndex = 0;
			this.scrollWithHighlighter = false;

			this.audio.pause();
		}
	}

	startingHighlighterIndex = -1;
	scrollWithHighlighter = false;
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
		}
	}
	pause() {
		this.audio.pause();
	}
}