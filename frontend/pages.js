const fs = require('fs-extra');

const html = require('./library/html.js');

// Handles the building of non-template pages that still need to process analytics
module.exports = {
	build: async function(callback){
		// Load the html files
		const dirs = await fs.readdirSync(`${__dirname}/pages`);

		for(const HTML_NAME of dirs){
			const FILE_NAME = HTML_NAME.split(".")[0];
			const JS_NAME = `${FILE_NAME}.js`;

			const htmlPath = `${__dirname}/pages/${HTML_NAME}`;

			// Process the HTML + run page script
			let processedHtml = await html.load({}, htmlPath);

			await new Promise(resolve => {
				callback(HTML_NAME, processedHtml, resolve);
			});
		}
	}
}