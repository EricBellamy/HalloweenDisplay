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
	calculateBeatIndexFromTimestamp(){
		const timestamp = this.audio.currentTime;
		
		return Math.floor((timestamp / 60) * window.timeline.SONG.scaledTempo);
	}
	isPaused(){
		return this.audio.paused;
	}


	// Hooks into the render loop, calculate when the playing audio needs to be paused
	render(frameTime){
		if(!this.audio.paused){
			this.remainingTimeMs -= frameTime;

			const beatIndex = this.calculateBeatIndexFromTimestamp();

			if(beatIndex != this.currentBeatIndex){
				this.currentBeatIndex = beatIndex;
				window.timeline.highlightBeat(beatIndex - window.timeline.view.index);

			}

			if(this.remainingTimeMs <= 0){
				this.audio.pause();
			}
		}
	}

	stop(){
		this.startBeat = 0;
		this.startBeatTime = 0;
		this.stopBeat = 0;
		this.stopBeatTime = 0;
		this.remainingTimeMs = 0;
		this.audio.pause();
	}
	playRange(maxBeats, scrollHighlighterWithAudio = false) {
		// window.timeline.SONG.tempo --> The beats per minute
		// window.timeline.SONG.duration --> The duration in seconds
		this.startBeat = window.timeline.view.index;
		this.stopBeat = this.startBeat + maxBeats;

		this.startBeatTime = this.calculateBeatTimestamp(this.startBeat);
		this.stopBeatTime = this.calculateBeatTimestamp(this.stopBeat);
		this.remainingTimeMs =  (this.stopBeatTime - this.startBeatTime) * 1000;

		this.audio.currentTime = this.startBeatTime;
		this.audio.play();
	}
	pause() {
		this.audio.pause();
	}
}