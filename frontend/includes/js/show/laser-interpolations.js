class LaserInterpolationManager {
	REGISTERED = {};
	register(id, points, interpolation_points) {
		this.REGISTERED[id] = {
			id,
			points,
			len: points.length,
			interpolation_points,
			interpolation_len: interpolation_points.length
		};
	}
	ACTIVE = [];
	activate(deviceName, id, hex, context) {
		for (let a = 0; a < this.ACTIVE.length; a++) {
			if (this.ACTIVE[a].deviceName === deviceName) {
				this.ACTIVE[a] = {
					...this.REGISTERED[id],
					deviceName,
					context,
					hex,
					frame: this.ACTIVE[a].frame
				};
				return;
			};
		}
		this.ACTIVE.push({
			...this.REGISTERED[id],
			deviceName,
			context,
			hex,
			frame: 0
		});
	}
	deactivate(deviceName) {
		for (let a = 0; a < this.ACTIVE.length; a++) {
			if (this.ACTIVE[a].deviceName === deviceName) {
				this.ACTIVE[a].context.clearRect(0, 0, this.ACTIVE[a].context.canvas.width, this.ACTIVE[a].context.canvas.height);
				return this.ACTIVE.splice(a, 1);
			}
		}
	}
	frameMinimum = 60;
	frameTime = 0;
	render(renderFrameTime) {
		this.frameTime -= renderFrameTime;
		if (this.frameTime <= 0) {
			this.frameTime = this.frameMinimum;

			// const frames = 8;
			let interpolation, context, currentPoint, nextPoint;
			let interLen, interLenFraction, hasDrawn;
			for (let a = 0; a < this.ACTIVE.length; a++) {
				interpolation = this.ACTIVE[a];
				context = interpolation.context;
				context.clearRect(0, 0, context.canvas.width, context.canvas.height);

				const interLen = interpolation.interpolation_len;
				const interLenFraction = Math.floor(interLen / 4);

				for (let b = 0; b < interLen; b++) {
					currentPoint = interpolation.interpolation_points[b];
					nextPoint = interpolation.interpolation_points[(b + 1) % interLen];

					hasDrawn = false
					for (let c = 0; c < interLenFraction; c++) {
						if ((interLen + (interpolation.frame - c)) % interLen === b || b === (interpolation.frame + c) % interpolation.interpolation_len) {
							window.laserDisplay.drawLine(context, currentPoint.x, currentPoint.y, nextPoint.x, nextPoint.y, interpolation.hex, 1);
							hasDrawn = true;
							break;
						}
					}
					if (!hasDrawn) window.laserDisplay.drawLine(context, currentPoint.x, currentPoint.y, nextPoint.x, nextPoint.y, interpolation.hex, 0.6);
				}
				interpolation.frame = (interpolation.frame + 1) % interpolation.interpolation_len;
			}
		}
	}
}
window.LaserInterpolationManager = new LaserInterpolationManager();
window.AnimationManager.addRenderCallback(window.LaserInterpolationManager.render.bind(window.LaserInterpolationManager));