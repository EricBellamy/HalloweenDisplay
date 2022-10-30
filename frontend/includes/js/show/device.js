class DeviceManager {
	current = undefined; // The currently active input
	devices = {
		// "laser": [
		// 	{
		// 		id: 1,
		// 		type: "binary"
		// 	},
		// 	{
		// 		id: 2,
		// 		type: "binary"
		// 	},
		// 	{
		// 		id: 3,
		// 		type: "binary"
		// 	}
		// ],
		// "light": [
		// 	{
		// 		id: 1,
		// 		type: "float"
		// 	},
		// 	{
		// 		id: 2,
		// 		type: "float"
		// 	},
		// 	{
		// 		id: 3,
		// 		type: "float"
		// 	},
		// 	{
		// 		id: 4,
		// 		type: "float"
		// 	},
		// 	{
		// 		id: 5,
		// 		type: "float"
		// 	},
		// 	{
		// 		id: 6,
		// 		type: "float"
		// 	},
		// 	{
		// 		id: 7,
		// 		type: "float"
		// 	}
		// ]
	};
	deviceList = [];
	inputs = {
		// binary: {
		// 	edit: function () {

		// 	}
		// },
		// float: {
		// 	edit: function () {

		// 	}
		// }
	};

	
	findAt(index) {
		if(index < this.deviceList.length) return this.deviceList[index];
		return false;
	}
	getInput(inputType){
		return this.inputs[inputType];
	}
	setCurrent(input){
		this.current = input;
	}

	count = 0;
	getDeviceCount(DEVICE_KEY) {
		return this.devices[DEVICE_KEY].length;
	}
	select(device) {
		window.timeline.selected = device;

		// Update the device selection here
		const selected = document.querySelector(".selected");
		if (selected) selected.classList.toggle("selected", false);
		if (device) device.classList.toggle("selected", true);
	}

	addInput(name, params = {}) {
		params.current = {};
		params.setValue = function(value){
			this.current.value = value;
		}

		this.inputs[name] = params;
		return params;
	}
	addDevice(name, inputType, element, color = "ffffff", params) {
		if (this.inputs[inputType] === undefined) throw new Error("addDevice :: Not a valid input type");
		if (!element) throw new Error("addDevice :: Element does not exist");
		if (this.devices[name] === undefined) this.devices[name] = [];

		element.classList.toggle("pointer", true);

		const id = this.devices[name].length + 1;
		const newDevice = {
			name: `${name}-${id}`,
			id: id,
			input: this.inputs[inputType],
			color: color,
			element: element,
			boxes: [],
			params: params
		};
		this.devices[name].push(newDevice);
		this.deviceList.push(newDevice);

		this.count++;

		return newDevice;
	}
	findDeviceWithName(name){
		for(const INPUT_TYPE in this.devices){
			const INPUT_DEVICES = this.devices[INPUT_TYPE];
			for(const INPUT_DEVICE of INPUT_DEVICES){
				if(INPUT_DEVICE.name === name) return INPUT_DEVICE;
			}
		}
		return false;
	}
}
window.device = new DeviceManager();