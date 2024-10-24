const floatInput = window.device.addInput("float");

floatInput.element = tired.html.create(`
<div class="hidden" id="lightPopup">
	<input id="lightPopupValue" />
</div>`);
floatInput.elementParts = tired.html.parse(floatInput.element);

floatInput.deactivate = function () {
	this.element.classList.toggle("hidden", true);

	floatInput.elementParts[0].blur();
	if (floatInput.elementParts[0].value === "") floatInput.elementParts[0].value = 0;
	const value = Math.min(100, Math.max(0, parseInt(floatInput.elementParts[0].value)));

	// Create / Update the event here
	window.timeline.addEvent(value);
}
floatInput.activate = function (beatX, beatY, beatBounds, device) {
	this.elementParts[0].value = "";

	this.element.classList.toggle("hidden", false);
	this.element.style.left = `${beatBounds.x}px`;
	this.element.style.top = `${beatBounds.y}px`;

	this.element.style.width = `${beatBounds.width}px`;
	this.element.style.height = `${beatBounds.width}px`;

	this.elementParts[0].focus();
}

floatInput.render = function (device, value) {
	device.element.style.background = "#fff";
	device.element.style.opacity = value / 100;
}
floatInput.unRender = function (device) {
	device.element.style.background = null;
	device.element.style.opacity = null;
}
floatInput.import = function (event) {
	window.timeline.addManualEvent(event.value * 100, event.device, event.beatIndex)
}
floatInput.export = function (event) {
	return event.value / 100;
}

// Listen for select
floatInput.elementParts[0].addEventListener('input', function () {
	floatInput.setValue(this.value);
});
floatInput.elementParts[0].addEventListener('keyup', function (event) {
	if (event.code === "Enter") floatInput.deactivate();
});

document.body.appendChild(floatInput.element);
window.popups.float = floatInput;





// Register the lights
const lights = document.querySelectorAll('#lights .light');
for (let i = 0; i < lights.length; i++) {
	window.device.addDevice("light", "float", lights[i], "438f65");
}