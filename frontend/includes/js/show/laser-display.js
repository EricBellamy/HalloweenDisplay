class LaserDisplayManager {
	downscaleFactor = 5;
	CURRENT_COLOR = "";

	designs = {};
	canvases = {};

	element = tired.html.create(`
	<div class="hidden" id="laserPopup">
		<div id="laserPopupHeader">
			<div>
				<div id="laserClose">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M6.2253 4.81108C5.83477 4.42056 5.20161 4.42056 4.81108 4.81108C4.42056 5.20161 4.42056 5.83477 4.81108 6.2253L10.5858 12L4.81114 17.7747C4.42062 18.1652 4.42062 18.7984 4.81114 19.1889C5.20167 19.5794 5.83483 19.5794 6.22535 19.1889L12 13.4142L17.7747 19.1889C18.1652 19.5794 18.7984 19.5794 19.1889 19.1889C19.5794 18.7984 19.5794 18.1652 19.1889 17.7747L13.4142 12L19.189 6.2253C19.5795 5.83477 19.5795 5.20161 19.189 4.81108C18.7985 4.42056 18.1653 4.42056 17.7748 4.81108L12 10.5858L6.2253 4.81108Z" fill="currentColor" />
					</svg>
				</div>
				<div>Close</div>
			</div>
		</div>
		<div id="laserPopupWrapper"></div>
	</div>`);

	constructor() {
		this.elementParts = tired.html.parse(this.element);
		this.elementParts[0][0].addEventListener("click", function(){
			laserInput.deactivate(true);
		});
	}

	drawLine(context, startX, startY, endX, endY, color = "ffffff", debug = false) {
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
		const newOptionElement = tired.html.create(`<div class="laser-popup-option" data-value="${name}">${name}</div>`);
		newOptionElement.addEventListener("click", function () {
			laserInput.setValue(this.dataset.value);
			laserInput.deactivate();
		});
		this.element.querySelector("#laserPopupWrapper").appendChild(newOptionElement);

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