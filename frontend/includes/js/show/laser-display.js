class LaserDisplayManager {
	INTERPOLATION_FPS = 10;
	MAX_RGB_VALUE = 7;

	downscaleFactor = 1;
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
		this.registerIconCanvas();
	}

	drawLine(context, startX, startY, endX, endY, color = "ffffff", alpha = 1, ignoreDownscale = false) {
		if(!this.ignoreDownscale){
			startX *= this.downscaleFactor;
			startY *= this.downscaleFactor;
			endX *= this.downscaleFactor;
			endY *= this.downscaleFactor;
		}

		// if (this.CURRENT_COLOR != color) {
		// 	this.CURRENT_COLOR = color;
		// 	context.strokeStyle = `#${color}`;
		// }

		context.globalAlpha = alpha;
		context.strokeStyle = `#${color}`;
		context.beginPath();
		context.moveTo(startX, startY);
		context.lineTo(endX, endY);
		context.stroke();
	}

	renderCanvasLines(context, points, ignoreDownscale = false) {
		const pointsLen = points.length;
		if (pointsLen <= 1) return;

		let point, next, a;
		for (a = 0; a < pointsLen - 1; a++) {
			point = points[a];
			next = points[a + 1];

			this.drawLine(context, point.x, point.y, next.x, next.y, point.hex, ignoreDownscale);
		}

		// Draw line back to origin
		if (2 < pointsLen) {
			point = points[a];
			next = points[0];
			this.drawLine(context, point.x, point.y, next.x, next.y, point.hex, ignoreDownscale);
		}
	}

	getContext(name){
		return this.canvases[name].context;
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

	registerDesign(name, designConfig, URL) {
		// Support 2 arguments only
		if(typeof designConfig === "string") {
			URL = designConfig;
			designConfig = {};
		}

		const newOptionElement = tired.html.create(`<div class="laser-popup-option" data-value="${name}">${name}</div>`);
		newOptionElement.addEventListener("click", function () {
			laserInput.setValue(this.dataset.value);
			laserInput.deactivate();
		});
		this.element.querySelector("#laserPopupWrapper").appendChild(newOptionElement);

		const newLaserDisplay = {
			URL: URL,
			len: 0,
			points: [],
			config: designConfig
		};

		const scaleFactor = designConfig["scaleFactor"] ? designConfig["scaleFactor"] : 5;

		const substringIndex = "?points=";
		const urlPoints = decodeURIComponent(URL.substring(URL.indexOf(substringIndex) + substringIndex.length));
		const savedPoints = urlPoints.split(",");

		const pointData = 3;
		const goodPoints = Math.floor(savedPoints.length / pointData);
		for (let a = 0; a < goodPoints; a++) {
			newLaserDisplay.points.push(this.createPoint({
				x: parseInt(savedPoints[a * pointData + 1]) * scaleFactor + (30*(5-scaleFactor)),
				y: parseInt(savedPoints[a * pointData + 2]) * scaleFactor + (30*(5-scaleFactor))
			}, savedPoints[a * pointData], a));
		}

		if(newLaserDisplay.URL === "https://draw.halloween.ayyws.com/?points=fff%2C45%2C25%2Cfff%2C42%2C14%2Cfff%2C30%2C10%2Cfff%2C20%2C15%2Cfff%2C15%2C30%2Cfff%2C20%2C45%2Cfff%2C30%2C50%2Cfff%2C42%2C47%2Cfff%2C45%2C35%2Cfff%2C36%2C42%2Cfff%2C24%2C40%2Cfff%2C24%2C30%2Cfff%2C24%2C20%2Cfff%2C37%2C17"){
			console.log(newLaserDisplay);
			console.log(this.iconContext);
			this.renderCanvasLines(this.iconContext, newLaserDisplay.points, true);
		}

		// ["x-pos", "y-pos", "r", "g", "b"]
		newLaserDisplay.instructions = {
			"f00": [],
			"0f0": [],
			"00f": []
		}
		let MAX_RGB_VALUE = 0;
		for(const point of newLaserDisplay.points){
			if(point.hex === "000") MAX_RGB_VALUE = 0;
			else MAX_RGB_VALUE = this.MAX_RGB_VALUE;
			newLaserDisplay.instructions["f00"].push([point.x, point.y, MAX_RGB_VALUE, 0, 0]);
			newLaserDisplay.instructions["0f0"].push([point.x, point.y, 0, MAX_RGB_VALUE, 0]);
			newLaserDisplay.instructions["00f"].push([point.x, point.y, 0, 0, MAX_RGB_VALUE]);
		}


		// Generate the interpolation instructions here for the point set
		newLaserDisplay.INTERPOLATION_STEPS = Math.floor(this.INTERPOLATION_FPS / newLaserDisplay.points.length) + 1;
		newLaserDisplay.INTERPOLATION_FRAME = 0;
		newLaserDisplay.INTERPOLATION_POINTS = [];
		let currentPoint, nextPoint;
		for(let a = 0; a < newLaserDisplay.points.length; a++){
			currentPoint = newLaserDisplay.points[a];

			// Loop back to beginning point at end
			if(a != newLaserDisplay.points.length - 1) nextPoint = newLaserDisplay.points[a + 1];
			else nextPoint = newLaserDisplay.points[0];

			const xDiff = (nextPoint.x - currentPoint.x) / newLaserDisplay.INTERPOLATION_STEPS;
			const yDiff = (nextPoint.y - currentPoint.y) / newLaserDisplay.INTERPOLATION_STEPS;
			for(let step = 0; step < newLaserDisplay.INTERPOLATION_STEPS; step++){
				newLaserDisplay.INTERPOLATION_POINTS.push({
					x: currentPoint.x + xDiff * step,
					y: currentPoint.y + yDiff * step,
					hex: currentPoint.hex,
					alpha: currentPoint.alpha
				});
			}
			// console.log(currentPoint);
			// console.log(nextPoint);
			// if(a === 1) break;
		}

		window.LaserInterpolationManager.register(name, newLaserDisplay.points, newLaserDisplay.INTERPOLATION_POINTS);


		this.designs[name] = newLaserDisplay;
	}

	getDesign(name){
		return this.designs[name];
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
	registerIconCanvas(){
		this.iconCanvas = document.querySelector("#laserIconCanvas");
		this.iconContext = this.iconCanvas.getContext("2d");
		this.iconCanvas.width = 60;
		this.iconCanvas.height = 60;
	}
}
window.laserDisplay = new LaserDisplayManager();