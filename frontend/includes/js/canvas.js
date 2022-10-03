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
function drawLine(startX, startY, endX, endY, color) {
	if (CURRENT_COLOR != color) context.strokeStyle = `#${color}`;
	context.beginPath();
	context.moveTo(startX * scale, startY * scale);
	context.lineTo(endX * scale, endY * scale);
	context.stroke();
}
function drawGridLines() {
	const limit = canvasResolution / gridLineSpacing / downscaleFactor;
	for (let a = 0; a <= limit; a++) {
		drawLine(a * gridLineSpacing * downscaleFactor, 0, a * gridLineSpacing * downscaleFactor, canvasResolution, "2a2a2a");
		drawLine(0, a * gridLineSpacing * downscaleFactor, canvasResolution, a * gridLineSpacing * downscaleFactor, "2a2a2a");
	}
}

let CURRENT_FILL = "";
function drawPoint(x, y, color) {
	if (CURRENT_FILL != color) context.fillStyle = `#${color}`;

	const pointSize = POINT_SIZE * downscaleFactor * scale;
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
	console.log(mousePoint);
	createPoint(mousePoint)
});
drawGridLines();

function getMousePoint(event) {
	return {
		x: Math.round(event.offsetX / scale / downscaleFactor),
		y: Math.round(event.offsetY / scale / downscaleFactor)
	}
}

function hexToRgbA(hex){
	if(hex[0] != "#") hex = "#" + hex;

    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',1)';
    }
    return false;
}

function renderCanvas(event, left = false) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawGridLines();

	if (!left) {
		const mousePoint = getMousePoint(event);
		mousePos.innerText = mousePoint.x + ", " + mousePoint.y;


		// Draw saved points here


		drawPoint(mousePoint.x, mousePoint.y, "ffffff");
	}
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
function createPoint(coord) {
	points.push({
		id: new Date().getTime(),
		hex: "ffffff",
		alpha: "ff",
		...coord
	});
	renderPoints();
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
	renderPoints();
}
function updatePointElement(point){
	const rgbaVal = hexToRgbA(point.ele.hex.value);
	if(rgbaVal != false){
		point.ele.hex.style.color = `#${point.ele.hex.value}`;
		point.ele.background.style.background = `#${point.ele.hex.value}`;
	}
}
function renderPoints() {
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

		hex.addEventListener("input", function(event){
			if(6 < event.target.value.length) event.target.value = event.target.value.substring(0, 6);

			this.hex = event.target.value;
			updatePointElement(this);
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
}