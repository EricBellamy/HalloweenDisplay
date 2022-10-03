const canvas = document.querySelector("canvas");

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

