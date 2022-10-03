window.tired.storage = {
	set: function (key, val) {
		try {
			val = typeof val === "string" ? val : JSON.stringify(val);
			localStorage.setItem(key, val);
			return true;
		} catch (err) {
			return false;
		}
	},
	get: function (key) {
		const val = localStorage.getItem(key);
		return val != null ? val : false;
	}
};