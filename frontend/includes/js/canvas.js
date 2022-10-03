const maxCanvasFps = 60;
const POINT_SIZE = 1; // Even number

const gridLineSpacing = 10;
const canvasResolution = 300;
const downscaleFactor = 5;

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const mousePos = document.querySelector("#mousePos");
const rightColumn = document.querySelector("#right");
const pointsContainer = document.querySelector("#points");


// Bounds
const rightColumnBounds = rightColumn.getBoundingClientRect();


// Initialize the canvas
const canvasPadding = parseInt(getComputedStyle(document.querySelector("#container")).padding);
const scale = Math.min(
	Math.floor((window.innerWidth - canvasPadding - rightColumnBounds.width) / canvasResolution),
	Math.floor((window.innerHeight - canvasPadding) / canvasResolution)
);
const canvasSize = canvasResolution * scale;

canvas.width = canvasSize;
canvas.style.width = `${canvasSize}px`;
canvas.height = canvasSize;
canvas.style.height = `${canvasSize}px`;


// Rendering functions
let CURRENT_COLOR = "";
function drawLine(startX, startY, endX, endY, color, debug = false) {
	startX *= downscaleFactor;
	startY *= downscaleFactor;
	endX *= downscaleFactor;
	endY *= downscaleFactor;

	if (CURRENT_COLOR != color) context.strokeStyle = `#${color}`;
	context.beginPath();
	context.moveTo(startX * scale, startY * scale);
	context.lineTo(endX * scale, endY * scale);
	context.stroke();
}
function drawGridLines() {
	const limit = canvasResolution / gridLineSpacing / downscaleFactor;
	for (let a = 0; a <= limit; a++) {
		let linePos = a * gridLineSpacing;
		drawLine(linePos, 0, linePos, canvasResolution / downscaleFactor, "2a2a2a");
		drawLine(0, linePos, canvasResolution / downscaleFactor, linePos, "2a2a2a");
	}
}

let CURRENT_FILL = "";
let CURRENT_ALPHA = -1;
function drawPoint(x, y, hex, alpha = 1, POINT_SCALE = 1) {
	if (hexToRgba(hex, alpha) != false && (CURRENT_FILL != hex || CURRENT_ALPHA != alpha)) {
		context.fillStyle = hexToRgba(hex, alpha);
		CURRENT_FILL = hex;
		CURRENT_ALPHA = alpha;
	};
	
	const pointSize = POINT_SIZE * downscaleFactor * scale * POINT_SCALE;
	context.fillRect((x * downscaleFactor * scale) - pointSize / 2, (y * downscaleFactor * scale) - pointSize / 2, pointSize, pointSize);
}

const canvasDelayMs = Math.floor(1000 / maxCanvasFps);
const debouncedRenderCanvas = tired.debounce(renderCanvas, canvasDelayMs, {
	maxWait: canvasDelayMs
});
canvas.addEventListener("mousemove", function (event) {
	debouncedRenderCanvas(event);
});
canvas.addEventListener("mouseleave", function (event) {
	debouncedRenderCanvas(event, true);
});
canvas.addEventListener("click", function (event) {
	const mousePoint = getMousePoint(event);
	createPoint(mousePoint);
	encodeURI();
});
drawGridLines();

function getMousePoint(event) {
	return {
		x: Math.round(event.offsetX / scale / downscaleFactor),
		y: Math.round(event.offsetY / scale / downscaleFactor)
	}
}

function hexToRgba(hex, alpha = 1){
	if(hex[0] != "#") hex = "#" + hex;

    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
		return `rgba(${[(c>>16)&255, (c>>8)&255, c&255].join(',')},${alpha})`;
    }
    return false;
}


let LAST_MOUSE_POINT = { x: -1, y: -1 };
function renderCanvas(event, left = false) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawGridLines();

	if (!left && event) {
		const mousePoint = getMousePoint(event);
		mousePos.innerText = mousePoint.x + ", " + mousePoint.y;
		LAST_MOUSE_POINT = mousePoint;
	}

	// Draw canvas lines
	renderCanvasLines();

	// Draw saved points here
	const matched = renderCanvasPoints(LAST_MOUSE_POINT);
	
	// Draw mouse indicator
	if(!left && !matched) drawPoint(LAST_MOUSE_POINT.x, LAST_MOUSE_POINT.y, "fff", 0.1);
}


// Points rendering
const points = [];
function pointExists(coord) {
	let matched = false;
	for (const point of points) {
		if (point.x === coord.x && point.y === coord.y) {
			matched = true;
			point.alpha = "33";
		} else point.alpha = "ff";
	}
}
function deletePoint(coord){
	for(let a = 0; a < points.length; a++){
		if(points[a].x === coord.x && points[a].y === coord.y){
			points.splice(a, 1);

			renderPointList();

			return true;
		}
	}
	return false;
}
function createPoint(coord, hex = "ffffff") {
	if(deletePoint(coord)) return;
	points.push({
		id: new Date().getTime(),
		hex: hex,
		alpha: "ff",
		...coord
	});
	renderPointList();
}
function movePoint(pointRef, direction) {
	if (points.length === 1) return;
	// direction --> -1 = up, 1 = down the array

	let moved = false;
	let index = 0;
	for (let a = 0; a < points.length; a++) {
		if (points[a].id === pointRef.id) {

			// Check if desired position is legal
			const newIndex = a + direction;
			if (0 <= newIndex && newIndex < points.length) {
				[points[newIndex], points[a]] = [points[a], points[newIndex]];
				moved = true;
				break;
			}
		}
	}
	encodeURI();
	renderPointList();
}
function updatePointElement(point){
	const rgbaVal = hexToRgba(point.ele.hex.value);
	if(rgbaVal != false){
		point.ele.hex.style.color = `#${point.ele.hex.value}`;
		point.ele.background.style.background = `#${point.ele.hex.value}`;
	}
}
function renderPointList() {
	pointsContainer.innerHTML = "";
	for (const point of points) {
		const pointEle = tired.html.create(`<div class="point">
			<div class="controls">
				<div class="icon"><i class="gg-chevron-up"></i></div>
				<div class="icon"><i class="gg-chevron-down"></i></div>
			</div>
			<div class="background" style="background: #${point.hex}"></div>
			<div class="coord noselect">${point.x + ", " + point.y}</div>
			<input class="hex" style="color: #${point.hex}" value="${point.hex}" />
		</div>`);
		pointEle.dataset.color = point.hex;

		const parts = tired.html.parse(pointEle);
		const chevronUp = parts[0][1][0];
		const chevronDown = parts[0][2][0];
		const hex = parts[3];

		point.ele = {
			hex: hex,
			background: parts[1]
		};

		pointEle.addEventListener("mouseover", function(event){
			LAST_MOUSE_POINT.x = this.x;
			LAST_MOUSE_POINT.y = this.y;
			renderCanvas();
		}.bind(point));

		hex.addEventListener("input", function(event){
			if(6 < event.target.value.length) event.target.value = event.target.value.substring(0, 6);

			this.hex = event.target.value;
			updatePointElement(this);
			encodeURI();
			renderCanvas();
		}.bind(point));
		hex.addEventListener("focus", function(event){
			const that = this;
			setTimeout(function(){ that.selectionStart = that.selectionEnd = 10000; }, 0);
		});

		chevronUp.addEventListener("click", function (pointRef) {
			movePoint(pointRef, -1);
		}.bind(null, point));
		chevronDown.addEventListener("click", function (pointRef) {
			movePoint(pointRef, 1);
		}.bind(null, point));

		pointsContainer.appendChild(pointEle);
	}
	renderCanvas();
}
function renderCanvasPoints(mousePoint = false){
	let matchedCanvasPoint = false;
	for (const point of points) {
		if(mousePoint != false && (mousePoint.x === point.x && mousePoint.y === point.y)){
			matchedCanvasPoint = true;
			drawPoint(point.x, point.y, point.hex, 0.6, 3);
		} else drawPoint(point.x, point.y, point.hex);
	}
	return matchedCanvasPoint;
}
function renderCanvasLines(){
	const pointsLen = points.length;
	if(pointsLen <= 1) return;

	let point, next, a;
	for(a = 0; a < pointsLen - 1; a++){
		point = points[a];
		next = points[a + 1];

		drawLine(point.x, point.y, next.x, next.y, point.hex);
	}
	if(2 < pointsLen){
		point = points[a];
		next = points[0];
		drawLine(point.x, point.y, next.x, next.y, point.hex);
	}
}

function encodeURI(){
	let pointString = "";
	for(const point of points){
		pointString += `${point.hex},${point.x},${point.y},`;
	}
	pointString = pointString.substring(0, pointString.length - 1);

	const params = new URLSearchParams(location.search);
	params.set('points', pointString);
	params.toString(); // => points=ffffff|1|2
	window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
}
function loadURI(){
	const savedPointInfo = new URLSearchParams(location.search).get("points");
	if(savedPointInfo != null){
		const savedPoints = savedPointInfo.split(",");
		
		const pointData = 3;
		const goodPoints = Math.floor(savedPoints.length / pointData);
		for(let a = 0; a < goodPoints; a++){
			createPoint({
				x: parseInt(savedPoints[a * pointData + 1]),
				y: parseInt(savedPoints[a * pointData + 2])
			}, savedPoints[a * pointData]);
		}
	}
}
loadURI();