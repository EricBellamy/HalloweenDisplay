class AudioManager {
	audio;

	// Beat Index
	start = 0;
	stop = 0; 

	// Beat Index Timestamps
	startTime = 0;
	endTime = 0;
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
		return (beatIndex / (window.timeline.SONG.tempo * window.timeline.view.bpmScale)) * 60;
	}


	// Hooks into the render loop, calculate when the playing audio needs to be paused
	render(frameTime){
		if(!this.audio.paused){
			this.remainingTimeMs -= frameTime;

			console.log(this.remainingTimeMs);
			if(this.remainingTimeMs <= 0){
				this.audio.pause();
			}
		}
	}


	playRange() {
		// window.timeline.SONG.tempo --> The beats per minute
		// window.timeline.SONG.duration --> The duration in seconds
		// console.log((window.timeline.SONG.duration / 60) * window.timeline.SONG.tempo);
		console.log(window.timeline.SONG);
		// console.log(window.timeline.view.bpmScale);
		this.start = window.timeline.view.index;
		this.stop = this.start + window.timeline.view.max;

		this.startTime = this.calculateBeatTimestamp(this.start);
		this.stopTime = this.calculateBeatTimestamp(this.stop);
		this.remainingTimeMs =  (this.stopTime - this.startTime) * 1000;

		this.audio.currentTime = this.startTime;
		this.audio.play();
	}
	pause() {
		this.audio.pause();
	}
}