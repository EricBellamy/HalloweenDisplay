const laserInput = window.device.addInput("laserPopup");

laserInput.element = window.laserDisplay.element;
laserInput.elementParts = tired.html.parse(laserInput.element);
laserInput.timelineElement = function (value) {
	return tired.html.create(`<div class="beat"><div>${value.value}</div></div>`);
}
laserInput.timelineElementStyles = function (element, value, device) {
	// console.log("THE TIMELINE ELEMENT STYLES");
	// console.log(element);
	// console.log(value);
	element.style.background = "#" + device.params.colorOptions[value.colorIndex].dataset.hex;
}
laserInput.deactivate = function (close = false) {
	this.element.classList.toggle("hidden", true);

	// If we just need to close this window
	if (close) return;

	const params = laserInput.current.device.params;

	// Create / Update the event here
	window.timeline.addEvent({
		value: laserInput.current.value,
		colorIndex: params.colorIndex,
		hex: params.colorOptions[params.colorIndex].dataset.hex
	});
}
laserInput.activate = function (beatX, beatY, beatBounds, device) {
	this.element.classList.toggle("hidden", false);
}

laserInput.render = function (device, value) {
	device.params.colorOptions[device.params.colorIndex].classList.toggle("active", false);
	device.params.colorOptions[value.colorIndex].classList.toggle("active", true);
	device.params.colorIndex = value.colorIndex;
	
	device.value = value.value;
	window.LaserInterpolationManager.activate(device.name, value.value, value.hex, window.laserDisplay.getContext(device.name));
}
laserInput.unRender = function (device) {
	if (device.value) window.LaserInterpolationManager.deactivate(device.name);
}
laserInput.import = function (event) {
	if (event.value === 0) {
		window.timeline.addManualEvent(0, event.device, event.beatIndex);
	} else {
		const options = event.device.params.colorOptions;
		let colorIndex = 0;
		for(let a = 0; a < options.length; a++){
			if(options[a].dataset.hex === event.value.hex){
				colorIndex = a;
				break;
			}
		}
		window.timeline.addManualEvent({
			value: event.value.value,
			colorIndex: colorIndex,
			hex: event.value.hex,
		}, event.device, event.beatIndex);
	}
}
laserInput.export = function (event) {
	if (event.value === 0) return event.value;

	const LASER_DESIGN = window.laserDisplay.getDesign(event.value.value);

	const EXPORT_OBJECT = {
		// "points": [],
		"config": LASER_DESIGN.config
	};

	EXPORT_OBJECT.points = LASER_DESIGN.instructions[event.value.hex];
	EXPORT_OBJECT.hex = event.value.hex;
	EXPORT_OBJECT.value = event.value.value;


	return EXPORT_OBJECT;
}

document.body.appendChild(laserInput.element);
window.popups.laserPopup = laserInput;



function addLaserDevice(elementTag) {
	const laserEle = document.querySelector("#" + elementTag);
	const laserEleOptions = laserEle.querySelectorAll(".laser-color-option");

	const newLaserDevice = window.device.addDevice("laser", "laserPopup", laserEle, "79a8d0", { colorIndex: 0, colorOptions: laserEleOptions });

	for (const option of laserEleOptions) {
		option.laserEle = laserEle;
		option.laserDevice = newLaserDevice;
		option.addEventListener("click", function () {
			console.log("OPTION CLICKED!");
			const params = this.laserDevice.params;
			params.colorOptions[params.colorIndex].classList.toggle("active", false);

			// device.params.colorOptions[value.colorIndex].dataset.hex

			const colorIndex = parseInt(this.dataset.colorindex);
			params.colorIndex = colorIndex;
			this.classList.toggle("active", true);

			const currentEvent = window.timeline.getCurrentEventForDevice(this.laserDevice.name);
			if (currentEvent) {
				currentEvent.value.hex = params.colorOptions[params.colorIndex].dataset.hex;
				currentEvent.value.colorIndex = colorIndex;

				window.timeline.generateInstructions();
			}

			window.timeline.render();
		});
	}

	// Register the canvas
	window.laserDisplay.registerCanvas(elementTag, document.querySelector(`#${elementTag}-canvas`));
}


// Register the lasers
addLaserDevice("laser-1");
addLaserDevice("laser-2");
addLaserDevice("laser-3");
addLaserDevice("laser-4");
addLaserDevice("laser-5");

// Register the designs
// window.laserDisplay.registerDesign("shuriken", {
// 	"home": true,
// 	"speed-profile": 1
// }, "http://localhost:3000/points.html?points=0f0%2C30%2C18%2C0f0%2C60%2C0%2C00f%2C42%2C30%2C00f%2C60%2C60%2Cff0%2C30%2C42%2Cff0%2C0%2C60%2Cf00%2C18%2C30%2Cf00%2C0%2C0");
// window.laserDisplay.registerDesign("lollipop", "http://localhost:3000/points.html?points=fff%2C28%2C30%2Cfff%2C28%2C43%2Cfff%2C32%2C43%2Cfff%2C32%2C30%2Cfff%2C36%2C27%2Cfff%2C39%2C23%2Cfff%2C39%2C18%2Cfff%2C36%2C14%2Cfff%2C32%2C11%2Cfff%2C28%2C11%2Cfff%2C24%2C14%2Cfff%2C21%2C18%2Cfff%2C21%2C23%2Cfff%2C24%2C27");
// window.laserDisplay.registerDesign("rock", "?points=ffffff%2C20%2C8%2Cffffff%2C45%2C9%2Cffffff%2C54%2C17%2Cffffff%2C53%2C33%2Cffffff%2C53%2C50%2Cffffff%2C40%2C56%2Cffffff%2C24%2C57%2Cffffff%2C14%2C54%2Cffffff%2C11%2C42%2Cffffff%2C7%2C31%2Cffffff%2C7%2C22%2Cffffff%2C9%2C17%2Cffffff%2C14%2C12%2Cffffff%2C17%2C10");
// window.laserDisplay.registerDesign("hexagon", "http://localhost:3000/points.html?points=fff%2C10%2C20%2Cfff%2C20%2C10%2Cfff%2C40%2C10%2Cfff%2C50%2C20%2Cfff%2C50%2C40%2Cfff%2C40%2C50%2Cfff%2C20%2C50%2Cfff%2C10%2C40");
// window.laserDisplay.registerDesign("right arrow", "http://localhost:3000/points.html?points=fff%2C10%2C25%2Cfff%2C40%2C25%2Cfff%2C40%2C20%2Cfff%2C50%2C30%2Cfff%2C40%2C40%2Cfff%2C40%2C35%2Cfff%2C10%2C35");
// window.laserDisplay.registerDesign("maze", "http://localhost:3000/points.html?points=fff%2C30%2C30%2Cfff%2C35%2C30%2Cfff%2C35%2C35%2Cfff%2C25%2C35%2Cfff%2C25%2C25%2Cfff%2C40%2C25%2Cfff%2C40%2C40%2Cfff%2C20%2C40%2Cfff%2C20%2C20%2Cfff%2C45%2C20%2Cfff%2C45%2C45%2Cfff%2C15%2C45%2Cfff%2C15%2C15%2Cfff%2C50%2C15%2Cfff%2C50%2C50%2Cfff%2C10%2C50%2Cfff%2C10%2C10%2Cfff%2C50%2C10%2Cfff%2C50%2C30");
// window.laserDisplay.registerDesign("maze2", "http://localhost:3000/points.html?points=fff%2C30%2C30%2Cfff%2C27%2C30%2Cfff%2C27%2C24%2Cfff%2C36%2C24%2Cfff%2C36%2C36%2Cfff%2C21%2C36%2Cfff%2C21%2C18%2Cfff%2C42%2C18%2Cfff%2C42%2C42%2Cfff%2C15%2C42%2Cfff%2C15%2C12%2Cfff%2C48%2C12%2Cfff%2C48%2C48%2Cfff%2C9%2C48%2Cfff%2C9%2C6%2Cfff%2C54%2C6%2Cfff%2C54%2C54%2Cfff%2C3%2C54%2Cfff%2C3%2C6%2Cfff%2C6%2C6%2Cfff%2C6%2C51%2Cfff%2C51%2C51%2Cfff%2C51%2C9%2Cfff%2C12%2C9%2Cfff%2C12%2C45%2Cfff%2C45%2C45%2Cfff%2C45%2C15%2Cfff%2C18%2C15%2Cfff%2C18%2C39%2Cfff%2C39%2C39%2Cfff%2C39%2C21%2Cfff%2C24%2C21%2Cfff%2C24%2C33%2Cfff%2C33%2C33%2Cfff%2C33%2C27%2Cfff%2C30%2C27");
// window.laserDisplay.registerDesign("star", "?points=fff%2C30%2C6%2Cfff%2C40%2C22%2Cfff%2C55%2C23%2Cfff%2C43%2C35%2Cfff%2C49%2C53%2Cfff%2C30%2C42%2Cfff%2C11%2C53%2Cfff%2C17%2C35%2Cfff%2C5%2C23%2Cfff%2C20%2C22");
// window.laserDisplay.registerDesign("star2", "https://c712-174-112-47-90.ngrok.io/points.html?points=fff%2C30%2C10%2Cfff%2C32%2C25%2Cfff%2C47%2C13%2Cfff%2C35%2C28%2Cfff%2C50%2C30%2Cfff%2C35%2C32%2Cfff%2C47%2C47%2Cfff%2C32%2C35%2Cfff%2C30%2C50%2Cfff%2C28%2C35%2Cfff%2C13%2C47%2Cfff%2C25%2C32%2Cfff%2C10%2C30%2Cfff%2C25%2C28%2Cfff%2C13%2C13%2Cfff%2C28%2C25");