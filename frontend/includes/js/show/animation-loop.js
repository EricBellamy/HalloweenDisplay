if (!window.requestAnimationFrame) {
	window.requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
}
class AnimationManager {
	state = false;

	// The fps, delta & minimum delta
	renderFps = 60;
	renderFrameTime = 0;
	renderFrameMinimum = 0;

	constructor() {
		this.start = this.start.bind(this);
		this.run = this.run.bind(this);

		this.renderFrameMinimum = 1000 / this.renderFps;
	}
	start() {
		if (!this.state) {
			this.state = true;
			requestAnimationFrame(this.run);
		}
	}
	stop() {
		this.state = false;
	}
	updateTickSpeed(frameType, newTicksPerSecond) {
		if (this[`${frameType}FrameMinimum`] != undefined) {
			this[`${frameType}Fps`] = newTicksPerSecond;
			this[`${frameType}FrameMinimum`] = 1000 / newTicksPerSecond;
		}
	}

	RENDER_CALLBACKS = [];
	addRenderCallback(callback){
		this.RENDER_CALLBACKS.push(callback);
	}
	render(frameTime) {
		for(const callback of this.RENDER_CALLBACKS){
			callback(frameTime);
		}
	}

	last = 0;
	run(now) {
		const frameTime = now - this.last;
		this.last = now;

		this.renderFrameTime += frameTime;

		if (this.renderFrameMinimum < this.renderFrameTime) {
			this.renderFrameTime = 0;

			// Render interpolations here
			this.render(frameTime);	
		}

		if (this.state) {
			requestAnimationFrame(this.run);
		}
	}
}
window.AnimationManager = new AnimationManager();
window.AnimationManager.start();