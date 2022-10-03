const maxCanvasFps = 10;
const gridLineSpacing = 10;
const canvasResolution = 300;

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const mousePos = document.querySelector("#mousePos");
const rightColumn = document.querySelector("#right");


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
function drawLine(startX, startY, endX, endY, color){
	if(CURRENT_COLOR != color) context.strokeStyle = `#${color}`;
	context.beginPath();
	context.moveTo(startX * scale, startY * scale);
	context.lineTo(endX * scale, endY * scale);
	context.stroke();
}
function drawGridLines(){
	const limit = canvasResolution / gridLineSpacing;
	for(let a = 0; a <= limit; a++){
		drawLine(a * gridLineSpacing, 0, a * gridLineSpacing, canvasResolution, "2a2a2a");
		drawLine(0, a * gridLineSpacing, canvasResolution, a * gridLineSpacing, "2a2a2a");
	}
}

const canvasDelayMs = Math.floor(1000 / maxCanvasFps);
const debouncedRenderCanvas = tired.debounce(renderCanvas, canvasDelayMs, {
	maxWait: canvasDelayMs
});
canvas.addEventListener("mousemove", function(event){
	debouncedRenderCanvas(event);
});
drawGridLines();

function renderCanvas(event){
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawGridLines();

	// const nearestPoint = 
	const nearestX = Math.round(event.offsetX / scale);
	const nearestY = Math.round(event.offsetY / scale);
	mousePos.innerText = nearestX + ", " + nearestY;
}