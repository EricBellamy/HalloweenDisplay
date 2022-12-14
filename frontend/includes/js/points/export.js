const button = document.querySelector("#export");

function convert_to_message(x, y, scaleFactor=5){

	x = x*scaleFactor;
	y = y*scaleFactor;

	r = 7
	g = 0
	b = 0

	let message = ((x << 23 )& 0xFF800000) | ((y << 14) & 0x007FC000) | ((r << 11) & 0x00003800) | ((g << 8) & 0x00000700) | ((b << 5) & 0x000000E0)

	let sum = message ^ (message >> 1)
	sum = sum ^ (sum >> 2)
	sum = sum ^ (sum >> 4)
	sum = sum ^ (sum >> 8)
	sum = sum ^ (sum >> 16)

	message = message ^ (sum & 1)

	let result = "message[0] = 0x"+((message >> 24) & 0xFF).toString(16).padStart(2, '0')+";\n\
message[1] = 0x"+((message >> 16) & 0xFF).toString(16).padStart(2, '0')+";\n\
message[2] = 0x"+((message >> 8) & 0xFF).toString(16).padStart(2, '0')+";\n\
message[3] = 0x"+((message >> 0) & 0xFF).toString(16).padStart(2, '0')+";\n\
spiXfer(fd, 115200, message, NULL, 4);\n\n"

	return result;
}

function convert_to_header(len){
	let id = 1
	let points = len
	let home = 0
	let enable = 1


	let message = ((id << 28 )& 0xF0000000) | ((points << 20) & 0x0FF00000) | ((home << 19) & 0x000080000) | ((enable << 18) & 0x00040000)

	let sum = message ^ (message >> 1)
	sum = sum ^ (sum >> 2)
	sum = sum ^ (sum >> 4)
	sum = sum ^ (sum >> 8)
	sum = sum ^ (sum >> 16)

	message = message ^ (sum & 1)

	let result = "message[0] = 0x"+((message >> 24) & 0xFF).toString(16).padStart(2, '0')+";\n\
message[1] = 0x"+((message >> 16) & 0xFF).toString(16).padStart(2, '0')+";\n\
message[2] = 0x"+((message >> 8) & 0xFF).toString(16).padStart(2, '0')+";\n\
message[3] = 0x"+((message >> 0) & 0xFF).toString(16).padStart(2, '0')+";\n\
spiXfer(fd, 115200, message, NULL, 4);\n\n"

	return result;
}

function verifyPoints(points){

	let last_x = -1;
	let last_y = -1;
	let illegal_points = "";

	for (let point of points){
			if(last_x == -1 && last_y == -1){
					last_x = point.x;
					last_y = point.y;
					continue;
			}

			let x_diff = Math.abs(last_x - point.x);
			let y_diff = Math.abs(last_y - point.y);

			if((x_diff == 0 || x_diff >= 3) && (y_diff == 0 || y_diff >= 3)) continue;
			illegal_points += point.x +", "+point.y+" ";

	}

	if(illegal_points != "") alert("Illegal points found at: "+illegal_points);


}

button.addEventListener("click", function () {
	console.log("Exporting...");

	verifyPoints(points);

	for (const point of points) {
		console.log(point);
		console.log(point.hex, point.x, point.y);
	}

	let source = convert_to_header(points.length);

	for (let point of points){
		source += convert_to_message(point.x, point.y);
	}

	source += "for(int i=0; i<"+(50-points.length)+"; i++){\n"+
    "    message[0] = 0x00;\n"+
    "    message[1] = 0x00;\n"+
    "    message[2] = 0x00;\n"+
    "    message[3] = 0x00;\n"+
    "    spiXfer(fd, 115200, message, NULL, 4);\n"+
    "}\n"

	console.log(source);

	tired.clipboard.copy(source);
});