const fs = require('fs-extra');
const HTMLParser = require('node-html-parser');

const includes = require('./includes.js');

let TEMPLATES = {};

function renderDataIntoHtml(HTML_STRING, data) {
	let HTML_COPY = HTML_STRING;
	// Replace all regex matches
	while (true) {
		const regex = /{{([^{]*)}}/;
		const match = HTML_COPY.match(regex);
		if (match) {
			try {
				// Grab the parts
				const matchContents = match[1];
				const beforeMatch = HTML_COPY.substring(0, match.index);
				const afterMatch = HTML_COPY.substring(match.index + match[0].length);

				// Replace the match with data or nothing
				if (data[matchContents]) {
					HTML_COPY = beforeMatch + data[matchContents] + afterMatch;
				} else HTML_COPY = beforeMatch + afterMatch;
			} catch (err) {
				console.error(err);
				return HTML_STRING;
			}
		} else break;
	}
	return HTML_COPY;
}

function loadHtml(FILE_PATH){
	return fs.readFileSync(FILE_PATH, 'utf8');
}
function loadStats(FILE_PATH){
	return fs.statSync(FILE_PATH);
}

async function processIncludeTags(HTML_STRING, OUTPUT){
	const parsedTemplate = HTMLParser.parse(HTML_STRING);
	parsedTemplate.removeWhitespace();

	// Include all files into the HTML
	const includeNodes = parsedTemplate.querySelectorAll('include');
	if (0 < includeNodes.length) {
		for (const includeNode of includeNodes) {
			const src = includeNode.getAttribute('src');
			const includeResults = await includes.load(src);
			
			// Log the modified time
			OUTPUT.updated[src] = includeResults[1];
			__currentbuild.updated[src] = includeResults[1];

			// Recursive, treats an includes as if it was a top level HTML file. Render, then process nested includes.
			const processedIncludeContents = await renderAndProcessHtml(includeResults[0], includeNode.attributes, OUTPUT);

			// Replace the tag in the HTML with the loaded file contents
			includeNode.replaceWith(processedIncludeContents);
		}
	}
	return parsedTemplate.toString();
}

async function renderAndProcessHtml(HTML_STRING, DATA, OUTPUT){
	// Render the data
	const renderedHtml = renderDataIntoHtml(HTML_STRING, DATA);

	// Load the includes
	// Repeat same steps for each include
	return await processIncludeTags(renderedHtml, OUTPUT);
}

module.exports = {
	// If all of the keys in object1 exist in object2 and are equal values
	hasChanged: function(object1, object2){
		const keys1 = Object.keys(object1);
		const keys2 = Object.keys(object2);
		// If object1 has more keys
		if (keys2.length < keys1.length) {
			return true;
		}
		// Are any of the object1 values not the same in object2
		for (let key of keys1) {
			if (object1[key] !== object2[key]) {
				return true;
			}
		}
		return false;
	},
	parse: function(HTML_STRING){
		return HTMLParser.parse(HTML_STRING).removeWhitespace();
	},
	path: function(key){
		return `${__rootdir}/includes/html/${key}`;
	},
	load: async function (DATA, FILE_PATH) {
		// Load the file contents
		const html = loadHtml(FILE_PATH);
		const stats = loadStats(FILE_PATH);

		const OUTPUT = {
			updated: {}
		};
		OUTPUT.updated[FILE_PATH] = stats.mtimeMs;
		__currentbuild.updated[FILE_PATH] = stats.mtimeMs;

		const processedHtml = await renderAndProcessHtml(html, DATA, OUTPUT);

		OUTPUT.html = processedHtml
		return OUTPUT; // html, modified
	}
}