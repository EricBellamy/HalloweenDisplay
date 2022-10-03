const canvas = document.querySelector("canvas");
const scale = Math.min(
	Math.floor(window.innerWidth / 300),
	Math.floor(window.innerHeight / 300)
);

console.log(scale);