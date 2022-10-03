window.tired.xhr = {
	get: function (url, callback, progressCallback) {
		const xhr = new XMLHttpRequest();
		if (progressCallback) {
			xhr.addEventListener("progress", progressCallback);
		}
		xhr.addEventListener('loadend', function () {
			if ([404].indexOf(xhr.status) != -1) {
				console.error(`[TIRED.XHR] 404 loading: ${url}`);
				callback(404);
			} else {
				callback(null, xhr.response);
			}
		});
		xhr.addEventListener('error', function () {
			console.error(`[TIRED.XHR] Error loading: ${url}`);
			callback(400);
		});
		xhr.addEventListener('abort', function () {
			console.error(`[TIRED.XHR] Aborted loading: ${url}`);
			callback(400);
		});

		xhr.open("GET", url);
		xhr.send();
	},
	post: function (url, body, callback, notJson, headers) {
		const options = {
			method: "POST"
		};
		if (body) {
			options.body = JSON.stringify(body);
		}
		if (headers === undefined) headers = { 'Content-Type': 'application/json' };
		options.headers = headers;

		if (notJson) {
			return fetch(url, options).then(response => {
				return callback(response);
			});
		} else {
			return fetch(url, options).then(res => res.json()).then(response => {
				return callback(response);
			});
		}
	},
	uploadFile: function (url, body, callback, progressCallback, headers) {
		// const blob = new Blob(file); // any Blob, including a File
		// const uploadProgress = document.getElementById("upload-progress");
		// const downloadProgress = document.getElementById("download-progress");

		const xhr = new XMLHttpRequest();
		xhr.upload.addEventListener("progress", (event) => {
			if (event.lengthComputable) {
				console.log("upload progress:", event.loaded / event.total);
				progressCallback(event.loaded / event.total);
				// uploadProgress.value = event.loaded / event.total;
			}
		});
		xhr.addEventListener("loadend", () => {
			try {
				return callback(JSON.parse(xhr.response));
			} catch (err) {
				return callback(false);
			}
		});
		xhr.open("POST", url, true);
		// xhr.setRequestHeader("Content-Type", "application/octet-stream");
		for (const header in headers) xhr.setRequestHeader(header, headers[header]);
		xhr.send(body);
	}
}