// 0 -> 90
// pan, tilt
// state = 0, 1, 2

function createLaserProjectorPopup() {
	window.lightTurretPopup = tired.html.create(`<div id="lightTurretPopup" class="hidden">
			<div class="close">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M6.2253 4.81108C5.83477 4.42056 5.20161 4.42056 4.81108 4.81108C4.42056 5.20161 4.42056 5.83477 4.81108 6.2253L10.5858 12L4.81114 17.7747C4.42062 18.1652 4.42062 18.7984 4.81114 19.1889C5.20167 19.5794 5.83483 19.5794 6.22535 19.1889L12 13.4142L17.7747 19.1889C18.1652 19.5794 18.7984 19.5794 19.1889 19.1889C19.5794 18.7984 19.5794 18.1652 19.1889 17.7747L13.4142 12L19.189 6.2253C19.5795 5.83477 19.5795 5.20161 19.189 4.81108C18.7985 4.42056 18.1653 4.42056 17.7748 4.81108L12 10.5858L6.2253 4.81108Z" fill="currentColor" />
				</svg>
			</div>
			<div class="title">Light Turret Config</div>
			<div class="choices row">
				<div class="item">
					<div class="label">Pan <span>0</span></div>
					<div class="input"><input type="range" min="0" max="90" value="0" class="slider" id="pan"></div>
				</div>
				<div class="item">
					<div class="label">Tilt <span>0</span></div>
					<div class="input"><input type="range" min="0" max="90" value="0" class="slider" id="tilt"></div>
				</div>
				<div class="item">
					<div class="label">State</div>
					<div id="states">
						<div class="state">0</div>
						<div class="state">1</div>
						<div class="state">2</div>
					</div>
				</div>
			</div>
		</div>`);
}
createLaserProjectorPopup();

function initInput(input) {
	const debounceDeactivateInput = tired.debounce(function () {
		input.deactivate();
	}, 100, {
		maxWait: 100
	});

	input.popupElement = window.lightTurretPopup;
	input.popupElement.elements = {};
	const sliders = input.popupElement.querySelectorAll('.slider');
	for (let slider of sliders) {
		slider.setValue = function (newValue) {
			relatedSpan.innerHTML = newValue;
			input.current.device.params[this.id] = parseInt(newValue);
		}
		input.popupElement.elements[slider.id] = slider;

		const relatedSpan = slider.parentNode.parentNode.querySelector('span');
		slider.oninput = function () {
			slider.setValue(this.value);
			debounceDeactivateInput();
		}
	}

	const states = input.popupElement.querySelectorAll('#states .state');
	input.popupElement.elements.states = {};
	for (let state of states) {
		input.popupElement.elements.states[state.innerText] = state;
		state.addEventListener('click', function () {
			for (let state of states) state.classList.toggle("active", false);
			this.classList.toggle("active", true);

			input.current.device.params.state = parseInt(this.innerText);
			input.deactivate();
		});
	}


	input.popupElement.querySelector('.close')?.addEventListener('click', function () { // Close btn
		this.popupElement.classList.toggle("hidden", true);
	}.bind(input));

	input.timelineElement = function (value) {
		let extraClass = "";
		switch (value.state) {
			case 0:
				extraClass += " idle";
				break;
			case 2:
				extraClass += " flashing";
				break;

		}
		return tired.html.create(`<div class="beat${extraClass}"><div class="tiny" style="color: #000"><div>${value.pan}p</div><div>${value.tilt}t</div></div></div>`);
	}
	input.timelineElementStyles = function (element, value, device) {
		// element.style.background = value.hex;
	}
	input.deactivate = function (close = false) {
		const params = this.current.device.params;

		// Create / Update the event here
		window.timeline.addEvent({
			pan: params.pan,
			tilt: params.tilt,
			state: params.state
		});

		// Make it so that when values are added they are only 1 beat long
		let parsedX = parseInt(this.current.x);
		let parsedY = parseInt(this.current.y);
		const input = window.timeline.toggleInputLogic(parsedX + 1, parsedY, this.current.bounds);
		input.setValue(0);
		window.timeline.addEvent(0);

		window.timeline.toggleInputLogic(parsedX, parsedY, this.current.bounds);
	}.bind(input);

	input.activate = function (beatX, beatY, beatBounds, device, lastEvent) { // Open popup
		input.popupElement.elements.pan.value = 0;
		input.popupElement.elements.pan.setValue(0);
		input.popupElement.elements.tilt.value = 0;
		input.popupElement.elements.tilt.setValue(0);

		input.popupElement.elements.states[0].classList.toggle("active", false);
		input.popupElement.elements.states[1].classList.toggle("active", false);
		input.popupElement.elements.states[2].classList.toggle("active", false);

		input.popupElement.classList.toggle("hidden", false);

		window.CURRENT_CLOSE_ACTION = function () {
			input.popupElement.classList.toggle("hidden", true);
		};
	}

	input.render = function (device, value) { }
	input.unRender = function (device) { }
	input.import = function (event) {
		if (event.value === 0) {
			window.timeline.addManualEvent(0, event.device, event.beatIndex);
		} else {
			const eventValue = event.value.value;
			window.timeline.addManualEvent({
				value: eventValue,
				pan: eventValue.pan,
				tilt: eventValue.tilt,
				state: eventValue.state
			}, event.device, event.beatIndex);
		}
	}
	input.export = function (event) {
		if (event.value === 0) return event.value;

		const value = event.value;
		delete value.value;

		const EXPORT_OBJECT = {
			value: value,
			pan: value.pan,
			tilt: value.tilt,
			state: value.state
		};

		return EXPORT_OBJECT;
	}

	document.body.appendChild(input.popupElement);
}

const lightTurretInput = window.device.addInput("lightTurret");
initInput(lightTurretInput);

function addLaserDevice(elementTag) {
	const targetEle = document.getElementById("turret-1");
	const newLaserDevice = window.device.addDevice("turret", "lightTurret", targetEle, "FFD100", { pan: 0, tilt: 0, state: 0 });
}

// Register the lasers
addLaserDevice("turret-1");
addLaserDevice("turret-2");
addLaserDevice("turret-3");
addLaserDevice("turret-4");




document.addEventListener('keydown', function (event) {
	if (event.key === 'Escape' || event.key === 'Esc') { // 'Esc' is for older browsers
		if (window.CURRENT_CLOSE_ACTION) {
			window.CURRENT_CLOSE_ACTION();
			window.CURRENT_CLOSE_ACTION = undefined;
		}
	}
});