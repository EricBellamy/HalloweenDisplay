class Timeline {
	selected = undefined;
	view = {
		hightlightIndex: 0,
		index: 10, // The index of the first beat shown on the timeline
		max: 20, // The max beats that can be shown
		bpmScale: 2, // How many beats per beat
		minimapFps: 60,
		minimapScale: 2
	};
	SONG = {
		"title": "Gimme! Gimme! Gimme! (A Man After Midnight), performed by Victor Frankenstein | AAAH!BBA",
		"channel": "brian david gilbert",
		"duration": 225,
		"tempo": 108.347,
		count: 407
	};
	SAVE = {
		instructions: {}
	};

	// Instructions gets decoded into events on load
	events = {};
	timelineElements = {};
	// "0": {
	// 	"laser-1": [],
	// 	"light-1": 1.0
	// },
	// "1000": {
	// 	"laser-1": 0,
	// 	"light-1": 0,
	// 	"fog-1": 0.6
	// }

	ele = {
		timeline: document.querySelector("#timeline"),
		sidebar: document.querySelector("#timelineSidebar"),

		minimap: document.querySelector("#minimap"),
		minimapContainer: document.querySelector("#minimapContainer"),
		minimapWindow: document.querySelector("#minimapWindow"),

		events: document.querySelector("#timelineEvents"),
		background: document.querySelector("#timelineBackground"),

		sidebar: document.querySelector("#timelineSidebar"),

		timeline_columns: [],
		timeline_boxes: [],
		timeline_markers: [],

		display: document.querySelector("#display"),
		container: document.querySelector("#ShowHorzContainer")
	};

	rows = 0;
	init() {
		// Initialize the canvas context
		this.ele.minimapContext = this.ele.minimap.getContext("2d");



		this.ele.minimapContainer.addEventListener("mousedown", function (event) {
			window.mouseDownOn = "minimap";

			const timelineProgress = Math.min(this.ele.minimapContainer.bounds.width, Math.max(0, event.screenX - this.ele.minimapContainer.bounds.x)) / this.ele.minimapContainer.bounds.width;
			const timelineIndex = Math.min(this.SONG.maxWindowCount, Math.max(0, Math.floor(timelineProgress * this.SONG.count - this.view.max / 2)));
			this.setIndex(timelineIndex);
		}.bind(this));

		document.addEventListener("mouseup", function () {
			window.mouseDownOn = undefined;
		});
		window.addEventListener("blur", function () {
			window.mouseDownOn = undefined;
		});
		document.addEventListener("mousemove", tired.debounce(function (event) {
			if (window.mouseDownOn === "minimap") {
				const timelineProgress = Math.min(this.ele.minimapContainer.bounds.width, Math.max(0, event.screenX - this.ele.minimapContainer.bounds.x)) / this.ele.minimapContainer.bounds.width;
				const timelineIndex = Math.min(this.SONG.maxWindowCount, Math.max(0, Math.floor(timelineProgress * this.SONG.count - this.view.max / 2)));


				this.setIndex(timelineIndex);
			}
		}.bind(this), 1000 / this.view.minimapFps, {
			leading: true,
			maxWait: 1000 / this.view.minimapFps
		}));

		this.resize();
	}
	resize() {
		// Render the max number of background boxes
		this.rows = window.device.count;

		// Reset
		this.ele.background.innerHTML = "";
		this.ele.sidebar.innerHTML = "";

		this.ele.timeline_columns = [];
		this.ele.timeline_boxes = [];
		this.ele.timeline_markers = [];






		// Update minimap size
		const minimapBounds = this.ele.minimap.getBoundingClientRect();
		this.view.beatWidth = minimapBounds.width / this.SONG.count
		this.SONG.maxWindowCount = window.timeline.SONG.count - window.timeline.view.max;

		this.ele.minimap.width = minimapBounds.width * this.view.minimapScale;
		this.ele.minimap.height = this.rows * this.view.beatWidth * this.view.minimapScale;
		this.ele.minimap.style.height = this.rows * this.view.beatWidth + "px";





		// Update labels
		for (let a = 0; a < this.rows; a++) {
			const device = window.device.findAt(a);
			const sidebarLabel = tired.html.create(`<div class="device noselect">${device.name}</div>`);
			sidebarLabel.style.color = `#${device.color}`;
			this.ele.sidebar.appendChild(sidebarLabel);
		}



		// Calculate beat box dimensions
		let displayBounds = this.ele.display.getBoundingClientRect();
		let remainingHeight = Math.floor(
			this.ele.container.getBoundingClientRect().height -
			(displayBounds.height +
				this.ele.minimap.getBoundingClientRect().height +
				parseInt(window.getComputedStyle(this.ele.minimapContainer).marginBottom) +
				parseInt(window.getComputedStyle(this.ele.container).paddingTop) +
				parseInt(window.getComputedStyle(this.ele.container).paddingBottom))
		);

		// Subtract the 1px margin & calculate box dimension
		const boxPadding = 2;
		const rowCount = this.rows + 1; // Add 1 for the marker at the top of the beat column
		const boxDim = (remainingHeight - rowCount * (2 * boxPadding)) / rowCount;
		const availableWidth = this.ele.timeline.getBoundingClientRect().width - this.ele.sidebar.getBoundingClientRect().width;
		const boxesPerRow = Math.floor(availableWidth / boxDim);
		this.view.max = boxesPerRow;



		// Update styling on the page
		const existingStyle = document.querySelector("#timelineStyles");
		if (existingStyle) existingStyle.parentNode.removeChild(existingStyle);
		document.body.appendChild(tired.html.create(`<style id="timelineStyles">.box, .beat {height: ${boxDim}px; width: ${boxDim}px} #timelineSidebar .device {height: ${boxDim}px}</style>`));



		// Clear all box references for devices
		for (let b = 0; b < this.rows; b++) {
			const relatedDevice = window.device.findAt(b);
			relatedDevice.boxes = [];
		}



		// Create the boxes
		for (let a = 0; a < boxesPerRow; a++) {
			const timelineColumn = tired.html.create(`<div class="column"></div>`);
			this.ele.timeline_columns.push(timelineColumn);
			this.ele.timeline_boxes.push([]);


			// Create the beat boxes
			const boxes = tired.html.create(`<div class="boxes"></div>`);
			for (let b = 0; b < this.rows; b++) {
				const box = tired.html.create(`<div class="box"></div>`);
				box.dataset.x = a;
				box.dataset.y = b;

				box.addEventListener("click", function () {
					window.timeline.toggleInput(this.dataset.x, this.dataset.y, this.bounds);
				}.bind(box));

				this.ele.timeline_boxes[a].push(box);
				boxes.appendChild(box);

				// Store the box reference on the related device
				const relatedDevice = window.device.findAt(b);
				relatedDevice.boxes.push(box);
			}
			timelineColumn.appendChild(boxes);


			// The beat marker & activate all devices when clicked
			const marker = tired.html.create(`<div class="marker noselect"><div>${this.view.index + a}</div></div>`);
			marker.addEventListener("click", function (boxIndex) {
				window.timeline.view.index = Math.min(window.timeline.SONG.maxWindowCount, Math.max(0, (window.timeline.view.index + boxIndex) - 1));
				window.timeline.render();

			}.bind(marker, a));
			marker.childTextElement = tired.html.parse(marker)[0];
			this.ele.timeline_markers.push(marker);
			timelineColumn.appendChild(marker);



			this.ele.background.appendChild(timelineColumn);
		}


		// Calculate the box bounds
		for (const timelineColumn of this.ele.timeline_boxes) {
			for (const timelineBox of timelineColumn) {
				timelineBox.bounds = timelineBox.getBoundingClientRect();
			}
		}





		// Update the minimap window
		this.updateMinimapWindowSize();
	}

	initSong() {
		const Beats = this.SONG.beats;
		const BeatTime = 60 / parseInt(this.SONG.tempo);
		for (let a = 0; a < Beats.length; a++) {
			Beats[a] = (Math.round((Beats[a] / BeatTime) * 2) / 2);
		};

		this.SONG.count = Math.ceil((this.SONG.duration / 60) * this.SONG.tempo);
	}



	setIndex(index) {
		this.view.index = Math.min(this.SONG.maxWindowCount, Math.max(0, index));
		this.updateMinimapWindowPosition();
		this.render();
	}
	decreaseIndex() {
		this.view.index = Math.max(0, this.view.index - 1);
		this.updateMinimapWindowPosition();
		this.render();
	}
	increaseIndex() {
		this.view.index = Math.min(this.SONG.maxWindowCount, this.view.index + 1);
		this.updateMinimapWindowPosition();
		this.render();
	}
	updateMinimapWindowSize() {
		this.view.minimapWidth = this.ele.minimap.getBoundingClientRect().width;
		this.view.minimapWindowWidth = (this.view.minimapWidth / this.SONG.count) * this.view.max;
		this.view.minimapDiffWidth = this.view.minimapWidth - this.view.minimapWindowWidth;
		this.ele.minimapWindow.style.width = this.view.minimapWindowWidth + "px";

		this.ele.minimapContainer.bounds = this.ele.minimapContainer.getBoundingClientRect();
	}
	updateMinimapWindowPosition() {
		this.ele.minimapWindow.style.left = (this.view.index / this.SONG.count) * this.view.minimapWidth + "px";
	}





	highlightBeat(index) {
		this.ele.timeline_columns[this.view.hightlightIndex].classList.toggle("active", false);
		this.view.hightlightIndex = index;
		this.ele.timeline_columns[index].classList.toggle("active", true);
	}
	highlightNextBeat() {
		this.highlightBeat(this.view.index + 1);
	}

	toggleInput(x, y, bounds) {
		const targetDevice = window.device.findAt(y);
		const input = this.toggleInputLogic(x, y, bounds);
		input.activate(x, y, bounds, targetDevice);
	}
	toggleInputLogic(x, y, bounds) {
		const targetDevice = window.device.findAt(y);
		const input = targetDevice.input;
		window.device.setCurrent(input);

		input.current.x = x;
		input.current.y = y;
		input.current.bounds = bounds;
		input.current.device = targetDevice;

		return input;
	}

	getTimestampFromBeatIndex(index) {
		// Calculate timestamp using BPM & Beat Index
		return Math.round(
			(((60 / this.SONG.tempo) * index) / this.view.bpmScale) * 1000
		);

		// return 
	}

	// Merge events that connect to each other with the same value
	mergeSameEventValues() {
		const TIMELINE_EVENTS = this.getScopedTimelineEventsPerDevice();

		for (const DEVICE_KEY in TIMELINE_EVENTS) {
			const DEVICE_EVENTS = TIMELINE_EVENTS[DEVICE_KEY];
			const DEVICE_EVENT_KEYS = Object.keys(DEVICE_EVENTS);
			for (let a = 0; a < DEVICE_EVENT_KEYS.length - 1; a++) {
				const currentEvent = DEVICE_EVENTS[DEVICE_EVENT_KEYS[a]];
				const nextEvent = DEVICE_EVENTS[DEVICE_EVENT_KEYS[a + 1]];
				if (currentEvent.value === nextEvent.value) {
					const targetSameEvent = this.events[DEVICE_EVENT_KEYS[a + 1]];
					if (Object.keys(targetSameEvent).length === 1) delete this.events[DEVICE_EVENT_KEYS[a + 1]];
					else delete this.events[DEVICE_EVENT_KEYS[a + 1]][DEVICE_KEY];
				}
			}
		}
	}
	updateEventValue(beatIndex, targetDevice, value) {
		const eventDict = this.events[beatIndex];

		// Delete either the value for this name or the whole beatIndex
		if (value === undefined) {
			if (eventDict[targetDevice.name] && Object.keys(eventDict).length === 1) delete this.events[beatIndex];
			else delete this.events[beatIndex][targetDevice.name];
		} else {
			if (eventDict === undefined) this.events[beatIndex] = {};

			this.events[beatIndex][targetDevice.name] = {
				device: targetDevice,
				beat: beatIndex,
				value: value,
			};
		}
		this.mergeSameEventValues();
	}
	addEvent(value) {
		const targetDevice = window.device.current.current.device;
		const beatIndex = this.view.index + parseInt(window.device.current.current.x);

		this.updateEventValue(beatIndex, targetDevice, value);

		this.render();
	}
	removeEvent(timelineIndex, key) {
		const deviceName = window.device.current.current.device.name;
		this.updateEventValue(this.view.index + timelineIndex, deviceName);

		this.render();
	}

	updateBeatDisplayElement(beatIndex, eventInfo) {
		const device = eventInfo.device;
		const value = eventInfo.value;

		// This function either generates a new element for the given position
		// Or updates the position of the existing element
		const key = beatIndex + "-" + device.name;
		const relativeBeatIndex = beatIndex - this.view.index;
		if (relativeBeatIndex < 0) return;

		// Update the element
		if (this.timelineElements[key]) {
			console.log("\n\n")
			console.log(beatIndex);
			console.log(value);
		} else {
			let newElement;
			if (device.input.timelineElement) newElement = device.input.timelineElement(value, device);
			else newElement = tired.html.create(`<div class="beat"><div>${value}</div></div>`);

			const beatBounds = device.boxes[relativeBeatIndex].bounds;
			newElement.style.top = beatBounds.y + "px";
			newElement.style.left = beatBounds.x + "px";
			newElement.style.background = `#${device.color}`;
			newElement.style.opacity = `${((value - value % 10) / 100) * 0.75 + 0.25}`;

			if (device.input.timelineElementStyles) device.input.timelineElementStyles(newElement, value, device, eventInfo);

			newElement.addEventListener("click", function (clickedBeat) {
				this.toggleInput(clickedBeat.dataset.x, clickedBeat.dataset.y, clickedBeat.bounds);
			}.bind(this, device.boxes[relativeBeatIndex]));

			// Add the ability to right click and create a new event with value 0
			newElement.addEventListener('contextmenu', function (clickedBeat, clickedValue, ev) {
				if (clickedValue != 0) {
					// Make it seem like the user input this value
					const input = this.toggleInputLogic(clickedBeat.dataset.x, clickedBeat.dataset.y, clickedBeat.bounds);
					input.setValue(0);

					// Add the event to the timeline
					this.addEvent(0);
				}

				ev.preventDefault();
				return false;
			}.bind(this, device.boxes[relativeBeatIndex], value), false);

			this.timelineElements[key] = {
				beatIndex: beatIndex,
				value: value,
				element: newElement
			};
			this.ele.events.appendChild(newElement);
		}
	}

	getScopedTimelineEventsPerDevice() {
		const lowestIndex = this.view.index;
		const maxIndex = this.view.index + this.view.max;


		const PRE_TIMELINE_VALUES = {};

		const EVENT_KEYS_TO_RENDER = {};
		const eventKeys = Object.keys(this.events);
		for (let EVENT_KEY of eventKeys) {
			EVENT_KEY = parseInt(EVENT_KEY);

			const beatEvents = this.events[EVENT_KEY];

			// If we're past the scope
			if (maxIndex < EVENT_KEY) break;


			for (const DEVICE_NAME in beatEvents) {
				const beatEvent = beatEvents[DEVICE_NAME];

				if (lowestIndex <= EVENT_KEY) { // If we're inside the timeline scope
					if (EVENT_KEYS_TO_RENDER[DEVICE_NAME] === undefined) EVENT_KEYS_TO_RENDER[DEVICE_NAME] = {};
					EVENT_KEYS_TO_RENDER[DEVICE_NAME][EVENT_KEY] = {
						value: beatEvent.value,
						device: beatEvent.device
					};
				} else {
					if (beatEvent.value === 0) delete PRE_TIMELINE_VALUES[DEVICE_NAME];
					else PRE_TIMELINE_VALUES[DEVICE_NAME] = {
						value: beatEvent.value,
						device: beatEvent.device,
						key: EVENT_KEY
					};
				}
			}
		}

		// Add pre timeline events to the list
		for (const PRE_TIMELINE_KEY in PRE_TIMELINE_VALUES) {
			const PRE_TIMELINE_EVENT = PRE_TIMELINE_VALUES[PRE_TIMELINE_KEY];

			if (EVENT_KEYS_TO_RENDER[PRE_TIMELINE_EVENT.device.name] === undefined) EVENT_KEYS_TO_RENDER[PRE_TIMELINE_EVENT.device.name] = {};
			EVENT_KEYS_TO_RENDER[PRE_TIMELINE_EVENT.device.name][PRE_TIMELINE_EVENT.key] = {
				value: PRE_TIMELINE_EVENT.value,
				device: PRE_TIMELINE_EVENT.device
			};
		}

		return EVENT_KEYS_TO_RENDER;
	}


	updateMarkerText() {
		let count = 0;
		for (const marker of this.ele.timeline_markers) {
			marker.childTextElement.innerText = this.view.index + count++;
		}
	}

	render() {
		// Update & Clear the timeline
		this.timelineElements = [];
		this.ele.events.innerHTML = "";
		this.updateMarkerText();
		this.updateMinimapWindowPosition();

		// Get formatted events
		const EVENT_KEYS_TO_RENDER = this.getScopedTimelineEventsPerDevice();

		const currentViewIndex = this.view.index;

		const RENDERED_DEVICES = [];
		let eventInfo;
		let currentKey, nextKey, difference;
		for (const EVENT_KEY in EVENT_KEYS_TO_RENDER) {
			const DEVICE_EVENTS = EVENT_KEYS_TO_RENDER[EVENT_KEY];
			const DEVICE_EVENT_KEYS = Object.keys(DEVICE_EVENTS);
			for (let a = 0; a < DEVICE_EVENT_KEYS.length; a++) DEVICE_EVENT_KEYS[a] = parseInt(DEVICE_EVENT_KEYS[a]);

			for (let a = 0; a < DEVICE_EVENT_KEYS.length; a++) {
				currentKey = DEVICE_EVENT_KEYS[a];
				nextKey = a != DEVICE_EVENT_KEYS.length - 1 ? DEVICE_EVENT_KEYS[a + 1] : undefined;

				eventInfo = DEVICE_EVENTS[currentKey];

				// Skip drawing display element if === 0
				if (eventInfo.value === 0)
					continue;
				else if (nextKey === undefined) nextKey = this.view.index + this.view.max;

				difference = nextKey - currentKey;
				for (let b = 0; b < difference; b++) {
					// Activate the device
					if (currentViewIndex - (currentKey + b) === 0) {
						RENDERED_DEVICES.push(eventInfo.device.name);
						eventInfo.device.input.render(eventInfo.device, eventInfo.value);
					}
					this.updateBeatDisplayElement(currentKey + b, eventInfo);
				}
			}
		}



		// Unrender the devices that are not currently active
		const DEVICE_LIST = window.device.deviceList;
		for (const DEVICE of DEVICE_LIST) {
			if (RENDERED_DEVICES.indexOf(DEVICE.name) === -1) {
				DEVICE.input.unRender(DEVICE);
			}
		}

		this.renderMinimap();
	}

	drawMinimapRect(startY, startX, endX, color) {
		this.ele.minimapContext.fillStyle = "#" + color;
		this.ele.minimapContext.fillRect(
			startX * this.view.beatWidth * this.view.minimapScale,
			startY * this.view.beatWidth * this.view.minimapScale,
			(endX - startX) * this.view.beatWidth * this.view.minimapScale,
			this.view.beatWidth * this.view.minimapScale);
	}
	renderMinimap() {
		this.ele.minimapContext.clearRect(0, 0, this.ele.minimapContext.canvas.width, this.ele.minimapContext.canvas.height)

		// Draw the events to the canvas
		const DEVICE_VALUE_INFO = {};
		let index = 0;
		for (const DEVICE of window.device.deviceList) {
			DEVICE_VALUE_INFO[DEVICE.name] = {
				index: index,
				device: DEVICE,
				value: 0,
				startingBeat: undefined,
				startingValue: undefined,
			};
			index++;
		}
		let targetEvents, targetEventKeys, targetDeviceInfo;
		for (let BEAT_INDEX = 0; BEAT_INDEX < this.SONG.count; BEAT_INDEX++) {
			if (this.events[BEAT_INDEX]) {
				targetEvents = this.events[BEAT_INDEX];
				targetEventKeys = Object.keys(targetEvents);

				for (const targetEventKey of targetEventKeys) {
					const DEVICE_VALUE = DEVICE_VALUE_INFO[targetEventKey];

					// If we already have a starting beat
					if (DEVICE_VALUE.startingBeat != undefined && DEVICE_VALUE.value != targetEvents[targetEventKey].value) {
						this.drawMinimapRect(
							DEVICE_VALUE.index,
							DEVICE_VALUE.startingBeat,
							BEAT_INDEX,
							DEVICE_VALUE.device.color
						);

						if (targetEvents[targetEventKey].value === 0) {
							DEVICE_VALUE.startingBeat = undefined;
							DEVICE_VALUE.startingValue = undefined;
						} else {
							DEVICE_VALUE.startingBeat = BEAT_INDEX;
							DEVICE_VALUE.startingValue = targetEvents[targetEventKey].value;
						}
					} else {
						// Start the beat rectangle
						DEVICE_VALUE.startingBeat = BEAT_INDEX;
						DEVICE_VALUE.startingValue = targetEvents[targetEventKey].value;
					}
					DEVICE_VALUE.value = targetEvents[targetEventKey].value;
				}
			}
		}

		// Draw the beats that are active
		for (const DEVICE_KEY in DEVICE_VALUE_INFO) {
			targetDeviceInfo = DEVICE_VALUE_INFO[DEVICE_KEY];
			if (targetDeviceInfo.startingBeat != undefined) {
				if(targetDeviceInfo.value != 0){
					this.drawMinimapRect(
						targetDeviceInfo.index,
						targetDeviceInfo.startingBeat,
						this.SONG.count - 1,
						targetDeviceInfo.device.color
					);
				}
			}
		}
	}

	getCurrentEventForDevice(deviceName){
		const targetEvents = this.events[this.view.index];
		if(targetEvents) if(targetEvents[deviceName]) return this.events[this.view.index][deviceName];
		return false;
	}

	loadFromInstructions(instructions){
		// Load the events from the instructions provided
	}
}

window.timeline = new Timeline();