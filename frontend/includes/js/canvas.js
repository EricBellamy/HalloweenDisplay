const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const mousePos = document.querySelector("#mousePos");


const canvasPadding = 20;
const canvasResolution = 300;
const scale = Math.min(
	Math.floor((window.innerWidth - canvasPadding) / 300),
	Math.floor((window.innerHeight - canvasPadding) / 300)
);
const canvasSize = canvasResolution * scale;

canvas.width = canvasSize;
canvas.style.width = `${canvasSize}px`;
canvas.height = canvasSize;
canvas.style.height = `${canvasSize}px`;

let CURRENT_COLOR = "";
function drawLine(startX, startY, endX, endY, color){
	if(CURRENT_COLOR != color) context.strokeStyle = `#${color}`;
	context.beginPath();
	context.moveTo(startX * scale, startY * scale);
	context.lineTo(endX * scale, endY * scale);
	context.stroke();
}
function drawGridLines(){
	for(let a = 0; a < 31; a++){
		drawLine(a * 10, 0, a * 10, 300, "2a2a2a");
		drawLine(0, a * 10, 300, a * 10, "2a2a2a");
	}
}

const maxCanvasFps = 10;
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