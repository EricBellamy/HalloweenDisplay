window.nav = {
	ele = {
		saveBtn: document.querySelector("#saveBtn")		
	}
}

if(window.SHOW_VERSION != "demo"){
	window.nav.ele.saveBtn.addEventListener("click", function(){
		const INSTRUCTIONS = window.timeline.generateInstructions();
		window.nav.ele.saveBtn.classList.toggle("active", false);
		window.nav.ele.saveBtn.classList.toggle("pending", true);
	
		tired.xhr.post("/save", {
			show: window.SHOW_ID,
			version: window.SHOW_VERSION,
			instructions: INSTRUCTIONS
		}, function(response){
			window.nav.ele.saveBtn.classList.toggle("pending", false);
			if(response.status === 200){
				window.timeline.SONG.instructions = INSTRUCTIONS;		
			}
		}, true);
	});
} else {
	window.nav.ele.saveBtn.style.display = "none";
	document.querySelector("#timestamp").style.display = "none";
}