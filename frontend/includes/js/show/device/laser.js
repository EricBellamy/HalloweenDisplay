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
	console.log("ACTIVATE THE LASER SELECT HERE!");
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