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

		this.updateTickSpeed(60);
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
	updateTickSpeed(newTicksPerSecond) {
		this.renderFps = newTicksPerSecond;
		this.renderFrameMinimum = Math.floor(1000 / newTicksPerSecond);
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
			// Render interpolations here
			this.render(this.renderFrameTime);
			this.renderFrameTime = 0;
		}

		if (this.state) {
			requestAnimationFrame(this.run);
		}
	}
}
window.AnimationManager = new AnimationManager();
window.AnimationManager.start();