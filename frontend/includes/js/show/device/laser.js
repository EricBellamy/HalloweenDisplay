const laserInput = window.device.addInput("laserPopup");

laserInput.element = window.laserDisplay.element;
laserInput.elementParts = tired.html.parse(laserInput.element);
laserInput.deactivate = function (close = false) {
	this.element.classList.toggle("hidden", true);

	// If we just need to close this window
	if(close) return;

	// Create / Update the event here
	window.timeline.addEvent(laserInput.current.value);
}
laserInput.activate = function (beatX, beatY, beatBounds, device) {
	this.element.classList.toggle("hidden", false);
}

laserInput.render = function (device, value) {
	// window.laserDisplay.renderCanvas(device.name, value);

	device.value = value;
	window.LaserInterpolationManager.activate(device.name, value, window.laserDisplay.getContext(device.name));
}
laserInput.unRender = function(device){
	// window.laserDisplay.clearCanvas(device.name);

	if(device.value) window.LaserInterpolationManager.deactivate(device.value);
}

document.body.appendChild(laserInput.element);
window.popups.laserPopup = laserInput;





// Register the lasers
window.device.addDevice("laser", "laserPopup", document.querySelector("#laser-1"));
window.device.addDevice("laser", "laserPopup", document.querySelector("#laser-2"));
window.device.addDevice("laser", "laserPopup", document.querySelector("#laser-3"));

// Register the canvases
window.laserDisplay.registerCanvas("laser-1", document.querySelector("#laser-1-canvas"));
window.laserDisplay.registerCanvas("laser-2", document.querySelector("#laser-2-canvas"));
window.laserDisplay.registerCanvas("laser-3", document.querySelector("#laser-3-canvas"));

// Register the designs
window.laserDisplay.registerDesign("shuriken", "http://localhost:3000/points.html?points=0f0%2C30%2C18%2C0f0%2C60%2C0%2C00f%2C42%2C30%2C00f%2C60%2C60%2Cff0%2C30%2C42%2Cff0%2C0%2C60%2Cf00%2C18%2C30%2Cf00%2C0%2C0");
window.laserDisplay.registerDesign("lollipop", "http://localhost:3000/points.html?points=fff%2C28%2C30%2Cfff%2C28%2C43%2Cfff%2C32%2C43%2Cfff%2C32%2C30%2Cfff%2C36%2C27%2Cfff%2C39%2C23%2Cfff%2C39%2C18%2Cfff%2C36%2C14%2Cfff%2C32%2C11%2Cfff%2C28%2C11%2Cfff%2C24%2C14%2Cfff%2C21%2C18%2Cfff%2C21%2C23%2Cfff%2C24%2C27");
window.laserDisplay.registerDesign("rock", "?points=ffffff%2C20%2C8%2Cffffff%2C45%2C9%2Cffffff%2C54%2C17%2Cffffff%2C53%2C33%2Cffffff%2C53%2C50%2Cffffff%2C40%2C56%2Cffffff%2C24%2C57%2Cffffff%2C14%2C54%2Cffffff%2C11%2C42%2Cffffff%2C7%2C31%2Cffffff%2C7%2C22%2Cffffff%2C9%2C17%2Cffffff%2C14%2C12%2Cffffff%2C17%2C10");
window.laserDisplay.registerDesign("hexagon", "http://localhost:3000/points.html?points=fff%2C10%2C20%2Cfff%2C20%2C10%2Cfff%2C40%2C10%2Cfff%2C50%2C20%2Cfff%2C50%2C40%2Cfff%2C40%2C50%2Cfff%2C20%2C50%2Cfff%2C10%2C40");
window.laserDisplay.registerDesign("star", "?points=fff%2C30%2C6%2Cfff%2C40%2C22%2Cfff%2C55%2C23%2Cfff%2C43%2C35%2Cfff%2C49%2C53%2Cfff%2C30%2C42%2Cfff%2C11%2C53%2Cfff%2C17%2C35%2Cfff%2C5%2C23%2Cfff%2C20%2C22");