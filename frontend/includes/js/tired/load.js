// Upgrades:
// Add loadGroups which are bunches of urls
// Anytime a url finishes, evaluate all load groups that url belongs to and execute
// When a load starts, mark the urls in that load group as unloaded --> use this to decide when to callback
// Add loading callback for backgrounds when also loading image with same src
// Add progress callback & switch loadinggrid to batch
class NewLazyLoader {
	files = {};
	errors = {};
	types = {};
	constructor() {
		this.apply = this.apply.bind(this);
		this.loadFiles = this.loadFiles.bind(this);
		this.update = this.update.bind(this);
		this.loadBackgrounds = this.loadBackgrounds.bind(this);
	}
	apply(url, selector, result, IS_UPDATE) {
		const lastSlash = url.lastIndexOf("/");
		const lastPeriod = url.lastIndexOf(".");
		let filetype = lastSlash < lastPeriod ? url.substring(lastPeriod + 1) : "";
		if ((IS_UPDATE && ["gif", "jpg", "jpeg", "png", "webp", "svg"].indexOf(filetype) === -1) || result === undefined) return;

		const TARGET_ELEMENT = selector ? document.querySelector(selector) : document;
		if (TARGET_ELEMENT === undefined) {
			console.error("[TIRED.LOAD] Invalid selector provided.");
			return callback(url);
		}
		let newElement, replacements;
		switch (filetype) {
			case "css":
				newElement = tired.html.create(`<style id="${url}">${result}</style>`);
				document.body.appendChild(newElement);
				break;
			case "gif":
			case "jpg":
			case "jpeg":
			case "png":
			case "webp":
				replacements = TARGET_ELEMENT.querySelectorAll(`[data-src="${url}"`);
				for (const replacement of replacements) {
					if (replacement.src === "") {
						replacement.src = url;
					}
				}
				const hasBackground = this.types[url].indexOf("background") != -1;
				replacements = TARGET_ELEMENT.querySelectorAll(`[data-bg="${url}"`);
				for (const replacement of replacements) {
					if (hasBackground && replacement.style.backgroundImage === "") {
						replacement.style.backgroundImage = `url(${url})`;
					}
				}
				break;
			case "js":
				if (result.indexOf("return") === 0) {
					try {
						result = result.substring("return".length).trim();
						result = new Function(`return ${result}`)();
						this.files[url] = result;
					} catch (err) { console.error(err); };
				} else {
					newElement = tired.html.script(url, result);
					document.body.appendChild(newElement);
				}
				break;
			case "json":
				this.files[url] = this.files[url].length > 0 ? JSON.parse(this.files[url]) : {};
				break;
			case "svg":
				let svgImg = document.createElement('svg');
				svgImg.innerHTML = result;
				svgImg = svgImg.getElementsByTagName('svg')[0];

				replacements = TARGET_ELEMENT.querySelectorAll(`[data-src="${url}"`);
				for (const replacement of replacements) {
					const svgEle = svgImg.cloneNode(true);
					replacement.className ? svgEle.className.baseVal = replacement.className : console.log("CLASSY");
					replacement.id ? svgEle.id = replacement.id : console.log("NO ID");
					replacement.getAttribute("fill") ? svgEle.style.fill = replacement.getAttribute("fill") : console.log("NO FILL");
					replacement.parentNode.replaceChild(svgEle, replacement);
				}
				break;
		}
	}
	load(url, params, callback) {
		if (this.files[url] === undefined) {
			this.files[url] = false;
			this.types[url] === undefined ? this.types[url] = [] : undefined;
			window.tired.xhr.get(url, function (err, result) {
				this.files[url] = result;
				if (!err) {
					this.errors[url] = err;
					this.apply(url, params.selector, result);
					return callback();
				} else {
					return callback(url);
				}
			}.bind(this));

			// If we're not currently requesting this url
		} else if (this.files[url] != false) {
			if (this.files[url][0]) {
				return callback(url);
			} else {
				// Handle this already loaded file if needed
				this.apply(url, params.selector, this.files[url]);
				return callback();
			}
		}
	}
	loadFiles(urls, params = {}, runtime) {
		typeof urls === "string" ? urls = [urls] : undefined;
		runtime = {
			done: false,
			errors: [],
			count: 0,
			maxCount: urls.length
		};
		// callback, parentSelector, callback_error 
		for (const url of urls) {
			this.load(url, params, function (error_url) {
				if (error_url) {
					runtime.errors.push(error_url);
				}
				runtime.count++;
				if (!runtime.done && runtime.count === runtime.maxCount) {
					runtime.done = true;
					// 1 = success
					// 2 = errors
					const returnObj = { status: runtime.errors.length > 0 ? false : true, code: runtime.errors.length > 0 ? 0 : 1 };
					if (runtime.errors.length > 0) returnObj.errors = runtime.errors;
					params.callback?.(returnObj);
				}
			}.bind(this));
		}
		if (params.timeout) {
			setTimeout(function () {
				if (!runtime.done) {
					runtime.done = true;
					params.callback?.({ error: "Resource requests timed out.", status: false, code: -1 });
				}
			}.bind(this), params.timeout);
		}
	}
	update() {
		for (const url in this.files) {
			this.apply(url, undefined, this.files[url], true);
		}
	}
	loadBackgrounds(callback) {
		const elements = document.querySelectorAll('img[data-bg]');
		const urls = [];
		for (const element of elements) {
			if (element.style.backgroundImage === "" && element.dataset.bg.length > 0) {
				const url = element.dataset.bg;
				this.types[url] === undefined ? this.types[url] = [] : undefined;
				if (this.types[url].indexOf("background") === -1) {
					this.types[url].push("background");
				}
				urls.push(url);
			}
		}
		this.loadFiles(urls);
	}
}


const TIRED_LOADER = new NewLazyLoader();
window.tired.load = TIRED_LOADER.loadFiles;
window.tired.load.update = TIRED_LOADER.update;
window.tired.load.backgrounds = TIRED_LOADER.loadBackgrounds;
window.tired.load.files = TIRED_LOADER.files;