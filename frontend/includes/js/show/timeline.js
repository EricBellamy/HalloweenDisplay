class Timeline {
	selected = undefined;
	view = {
		index: 0, // The index of the first beat shown on the timeline
		max: 20, // The max beats that can be shown
	};

	ele = {
		main: document.querySelector("#timeline"),
		minimap: document.querySelector("#minimap"),
		events: document.querySelector("#timelineEvents"),
		background: document.querySelector("#timelineBackground"),
		background_columns: [],
		background_boxes: [],

		display: document.querySelector("#display"),
		container: document.querySelector("#ShowHorzContainer")
	};
	events = {};

	rows = 0;
	init() {
		// Render the max number of background boxes
		this.rows = window.device.count();

		// Reset
		this.ele.background.innerHTML = "";
		this.ele.background_columns = [];
		this.ele.background_boxes = [];


		// Calculate beat box dimensions
		let displayBounds = this.ele.display.getBoundingClientRect();
		let remainingHeight = Math.floor(
			this.ele.container.getBoundingClientRect().height -
			(displayBounds.height +
				this.ele.minimap.getBoundingClientRect().height +
				parseInt(window.getComputedStyle(this.ele.minimap).marginBottom) +
				parseInt(window.getComputedStyle(this.ele.container).paddingTop) +
				parseInt(window.getComputedStyle(this.ele.container).paddingBottom))
		);

		// Subtract the 1px margin & calculate box dimension
		console.log(remainingHeight);
		const boxPadding = 2;
		const boxDim = (remainingHeight - this.rows * (2 * boxPadding)) / this.rows;
		const boxesPerRow = Math.floor(displayBounds.width / boxDim);
		this.view.max = boxesPerRow;


		window.device.findAt(4);

		// Create the boxes
		for (let a = 0; a < boxesPerRow; a++) {
			const timelineColumn = tired.html.create(`<div class="column"></div>`);
			this.ele.background_columns.push(timelineColumn);
			this.ele.background_boxes.push([]);

			for (let b = 0; b < this.rows; b++) {
				const box = tired.html.create(`<div class="box"></div>`);

				box.addEventListener("click", function(boxIndex){
					console.log("THE BOX INDEX:");
					console.log(boxIndex);
					this.classList.toggle("active");
				}.bind(box, b));

				this.ele.background_boxes[a].push(box);
				timelineColumn.appendChild(box);
			}
			this.ele.background.appendChild(timelineColumn);
		}

		document.body.appendChild(tired.html.create(`<style id="timelineStyles">.box {height: ${boxDim}px; width: ${boxDim}px}</style>`));
	}

	// "0": {
	// 	"laser-1": [],
	// 	"light-1": 1.0
	// },
	// "1000": {
	// 	"laser-1": 0,
	// 	"light-1": 0,
	// 	"fog-1": 0.6
	// }

	addEvent(timestamp) {

	}
	removeEvent(timestamp, key) {

	}

	renderMinimap() {

	}

	render() {
		// tired.html.create(``);
	}
}

window.timeline = new Timeline();