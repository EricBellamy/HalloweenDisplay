global.__rootdir = __dirname;
const distPath = `${__dirname}/../dist/`;

const fs = require('fs-extra');
const env = require('./env.js');
const DATA_TYPES = Object.freeze({
	BLOG: "blog",
	DRINK_COLLECTION: "drinks",
	RECIPE: "recipe"
});
const BUILD_DATA = {
	// recipe: []
	updated: {}
};

const html = require('./library/html.js');
const pages = require('./pages.js');


const FILES = {};

function shallowEqual(object1, object2) {
	const keys1 = Object.keys(object1);
	const keys2 = Object.keys(object2);
	if (keys1.length !== keys2.length) {
		return false;
	}
	for (let key of keys1) {
		if (object1[key] !== object2[key]) {
			return false;
		}
	}
	return true;
}

let LAST_BUILD_DATA = { updated: {} };
(async function build() {
	global.__currentbuild = { updated: {} };

	// Build init
	__currentbuild.created_at = new Date().getTime();

	// FIX THIS TO USE NEW MODIFIED DATE SYSTEM

	// Build all the page files in the folder
	await pages.build(async function(path, PAGE_HTML, resolve){
		fs.writeFileSync(distPath + path, PAGE_HTML.html);
		resolve();
	});

	__currentbuild.finished_at = new Date().getTime();
})();