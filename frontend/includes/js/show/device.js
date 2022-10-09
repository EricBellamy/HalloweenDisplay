class DeviceManager {
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
	types = {
		// binary: {
		// 	edit: function () {

		// 	}
		// },
		// float: {
		// 	edit: function () {

		// 	}
		// }
	};

	findAt(index){
		let count = 0;
		let nextCount = 0;

		for (let DEVICE_KEY in this.devices) {
			nextCount += this.devices[DEVICE_KEY].length;
			if(index < nextCount){
				// Loop through this list and return the index
				console.log("IN HERE SOMEWHERE!");
				console.log(index);
				console.log(nextCount);
			}
		}
	}

	count(){
		let count = 0;

		for (let DEVICE_KEY in this.devices) {
			count += this.devices[DEVICE_KEY].length;
		}

		return count;
	}
	select(device) {
		window.timeline.selected = device;

		// Update the device selection here
		const selected = document.querySelector(".selected");
		if (selected) selected.classList.toggle("selected", false);
		if (device) device.classList.toggle("selected", true);
	}
	
	addType(name, params) {
		this.types[name] = params;
	}
	addDevice(name, type, element, color = "79a8d0") {
		if (this.types[type] === undefined) throw new Error("addDevice :: Not a valid device type");
		if (!element) throw new Error("addDevice :: Element does not exist");
		if (this.devices[name] === undefined) this.devices[name] = [];

		element.classList.toggle("pointer", true);
		element.addEventListener("click", function (event) {
			event.stopPropagation();
			selectDevice(this);
		});

		this.devices[name].push({
			id: this.devices[name].length + 1,
			type: type,
			color: color,
			element: element
		});
	}
}
window.device = new DeviceManager();