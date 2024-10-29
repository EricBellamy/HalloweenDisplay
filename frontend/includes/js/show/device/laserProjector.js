const laserProjectorInput = window.device.addInput("laserProjectorPopup");
laserProjectorInput.popupElement = window.laserProjectorPatternsPopup;
laserProjectorInput.elementParts = tired.html.parse(laserProjectorInput.popupElement);

function initListeners() {
	laserProjectorInput.popupElement.querySelector('.close')?.addEventListener('click', function () { // Close btn
		this.popupElement.classList.toggle("hidden", true);
	}.bind(laserProjectorInput));
	laserProjectorInput.patternElement = laserProjectorInput.popupElement.querySelector('#patterns');
	laserProjectorInput.patternElement?.addEventListener('change', function () { // Close btn
		const patternChoice = laserProjectorInput.patternElement.options[laserProjectorInput.patternElement.selectedIndex].text;
		laserProjectorInput.current.device.params.patternChoice = patternChoice;
		laserProjectorInput.deactivate();
	}.bind(laserProjectorInput));

	laserProjectorInput.colorElement = laserProjectorInput.popupElement.querySelector('#colors');
	laserProjectorInput.colorElement?.addEventListener('change', function () { // Close btn
		const colorChoice = laserProjectorInput.colorElement.options[laserProjectorInput.colorElement.selectedIndex].text;
		laserProjectorInput.current.device.params.colorChoice = colorChoice;
		laserProjectorInput.deactivate();
	}.bind(laserProjectorInput));
}

initListeners();

laserProjectorInput.timelineElement = function (value) {
	return tired.html.create(`<div class="beat">${value.textIcon}</div>`);
}
laserProjectorInput.timelineElementStyles = function (element, value, device) {
	element.style.background = value.hex;
}
laserProjectorInput.deactivate = function (close = false) {
	const params = this.current.device.params;

	// Create / Update the event here
	window.timeline.addEvent({
		colorChoice: params.colorChoice,
		patternChoice: params.patternChoice,
		hex: window.laserProjectorColorOptions[params.colorChoice].hex,
		textIcon: window.laserProjectorPatterns[params.patternChoice].textIcon
	});
}.bind(laserProjectorInput);

laserProjectorInput.activate = function (beatX, beatY, beatBounds, device) { // Open popup
	laserProjectorInput.patternElement.value = '';
	laserProjectorInput.colorElement.value = '';
	this.popupElement.classList.toggle("hidden", false);
}

laserProjectorInput.render = function (device, value) { }
laserProjectorInput.unRender = function (device) { }
laserProjectorInput.import = function (event) {
	if (event.value === 0) {
		window.timeline.addManualEvent(0, event.device, event.beatIndex);
	} else {
		const eventValue = event.value.value;
		window.timeline.addManualEvent({
			value: eventValue,
			colorChoice: eventValue.colorChoice, // Don't know if these are necessary
			patternChoice: eventValue.patternChoice,
			hex: eventValue.hex,
			textIcon: eventValue.textIcon,
		}, event.device, event.beatIndex);
	}
}
laserProjectorInput.export = function (event) {
	if (event.value === 0) return event.value;

	const value = event.value;
	const currentPattern = window.laserProjectorPatterns[value.patternChoice];
	const currentColor = window.laserProjectorColorOptions[value.colorChoice];

	const EXPORT_OBJECT = {
		value: value,
		pattern: currentPattern,
		patternChoice: value.patternChoice,
		color: currentColor,
		colorChoice: value.colorChoice,
	};

	return EXPORT_OBJECT;
}

document.body.appendChild(laserProjectorInput.popupElement);
window.popups.laserProjectorPopup = laserProjectorInput;



function addLaserDevice(elementTag) {
	const laserEle = document.getElementById(elementTag);

	const newLaserDevice = window.device.addDevice("lp", "laserProjectorPopup", laserEle, "A867FF", { patternChoice: 'Large_Square', colorChoice: 'default' });
}


// Register the lasers
addLaserDevice("laser-projector-1");