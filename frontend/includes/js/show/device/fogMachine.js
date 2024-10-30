const fogMachineInput = window.device.addInput("fogMachine");

fogMachineInput.timelineElement = function (value) {
	return tired.html.create(`<div class="beat"></div>`);
}
fogMachineInput.timelineElementStyles = function (element, value, device) {
	// element.style.background = value.hex;
}
fogMachineInput.deactivate = function (close = false) {
	const params = this.current.device.params;

	// Create / Update the event here
	window.timeline.addEvent({
		running: params.running
	});
}.bind(fogMachineInput);

fogMachineInput.activate = function (beatX, beatY, beatBounds, device, lastEvent) { // Open popup
	console.log('ACTIVATE!');
	console.log(device);
	// fogMachineInput.current.device.params.running
	fogMachineInput.current.device.params.running = 1;
	fogMachineInput.deactivate();
}

fogMachineInput.render = function (device, value) { }
fogMachineInput.unRender = function (device) { }
fogMachineInput.import = function (event) {
	if (event.value === 0) {
		window.timeline.addManualEvent(0, event.device, event.beatIndex);
	} else {
		const eventValue = event.value.value;
		window.timeline.addManualEvent({
			value: eventValue,
			running: eventValue.running
		}, event.device, event.beatIndex);
	}
}
fogMachineInput.export = function (event) {
	if (event.value === 0) return event.value;

	const value = event.value;
	delete value.value;

	const EXPORT_OBJECT = {
		value: value,
		running: value.running
	};

	return EXPORT_OBJECT;
}

function addLaserDevice(elementTag) {
	const targetEle = document.getElementById(elementTag);
	const newLaserDevice = window.device.addDevice("fog", "fogMachine", targetEle, "FF7000", { running: 0 });
}

// Register the lasers
addLaserDevice("fog-1");
addLaserDevice("fog-2");