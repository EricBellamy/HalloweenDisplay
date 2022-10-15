class LaserDisplayManager {
	downscaleFactor = 5;
	CURRENT_COLOR = "";

	designs = {};
	canvases = {};
	constructor() {

	}

	drawLine(context, startX, startY, endX, endY, color, debug = false) {
		startX *= this.downscaleFactor;
		startY *= this.downscaleFactor;
		endX *= this.downscaleFactor;
		endY *= this.downscaleFactor;

		// if (this.CURRENT_COLOR != color) {
		// 	this.CURRENT_COLOR = color;
		// 	context.strokeStyle = `#${color}`;
		// }

		context.strokeStyle = `#${color}`;
		context.beginPath();
		context.moveTo(startX, startY);
		context.lineTo(endX, endY);
		context.stroke();
	}

	renderCanvasLines(context, points) {
		const pointsLen = points.length;
		if (pointsLen <= 1) return;

		let point, next, a;
		for (a = 0; a < pointsLen - 1; a++) {
			point = points[a];
			next = points[a + 1];

			this.drawLine(context, point.x, point.y, next.x, next.y, point.hex);
		}
		if (2 < pointsLen) {
			point = points[a];
			next = points[0];
			this.drawLine(context, point.x, point.y, next.x, next.y, point.hex);
		}
	}

	renderCanvas(name, laserDisplayName) {
		const context = this.canvases[name].context;
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);

		// Draw canvas lines
		this.renderCanvasLines(context, this.designs[laserDisplayName].points);
	}
	clearCanvas(name) {
		const context = this.canvases[name].context;
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	}

	createPoint(coord, hex = "fff", pointIndex) {
		return {
			id: new Date().getTime() + "|" + pointIndex,
			hex: hex,
			alpha: "ff",
			...coord
		};
	}

	registerDesign(name, URL) {
		const newLaserDisplay = {
			URL: URL,
			len: 0,
			points: []
		};

		const substringIndex = "?points=";
		const urlPoints = decodeURIComponent(URL.substring(URL.indexOf(substringIndex) + substringIndex.length));
		const savedPoints = urlPoints.split(",");

		const pointData = 3;
		const goodPoints = Math.floor(savedPoints.length / pointData);
		for (let a = 0; a < goodPoints; a++) {
			newLaserDisplay.points.push(this.createPoint({
				x: parseInt(savedPoints[a * pointData + 1]),
				y: parseInt(savedPoints[a * pointData + 2])
			}, savedPoints[a * pointData], a));
		}

		this.designs[name] = newLaserDisplay;
	}

	registerCanvas(name, canvas) {
		const context = canvas.getContext("2d");
		canvas.width = 300;
		canvas.height = 300;

		this.canvases[name] = {
			canvas: canvas,
			context: context
		};
	}
}
window.laserDisplay = new LaserDisplayManager();