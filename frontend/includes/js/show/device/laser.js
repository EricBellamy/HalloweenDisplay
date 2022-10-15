const laserInput = window.device.addInput("laserPopup");

laserInput.element = tired.html.create(`
<div class="hidden" id="laserPopup">
	<select name="designs" id="laser-select">
		<option value="dog">Dog</option>
		<option value="cat">Cat</option>
		<option value="hamster">Hamster</option>
		<option value="parrot">Parrot</option>
		<option value="spider">Spider</option>
		<option value="goldfish">Goldfish</option>
	</select>
</div>`);

laserInput.elementParts = tired.html.parse(laserInput.element);
laserInput.activate = function (beatX, beatY, beatBounds, device) {
	// console.log("ACTIVATING THIS INPUT!");
	// console.log(beatX);
	// console.log(beatY);
	// console.log(beatBounds);
	// console.log(this);
	// this.element.classList.toggle("hidden", false);
	// this.element.style.left = `${beatBounds.x}px`;
	// this.element.style.top = `${beatBounds.y}px`;
}

laserInput.render = function (device, value) {
	device.element.style.background = "#fff";
	device.element.style.opacity = value / 100;
}
laserInput.unRender = function(device){
	device.element.style.background = null;
	device.element.style.opacity = null;
}

// Listen for select
laserInput.elementParts[0][0].addEventListener('change', function () {
	laserInput.setValue(this.value);
});

document.body.appendChild(laserInput.element);
window.popups.laserPopup = laserInput;





// Register the lasers
window.device.addDevice("laser", "laserPopup", document.querySelector("#laser-1"));
window.device.addDevice("laser", "laserPopup", document.querySelector("#laser-2"));
window.device.addDevice("laser", "laserPopup", document.querySelector("#laser-3"));