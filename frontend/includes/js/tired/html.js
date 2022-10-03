window.tired.html = {
	create: function (inputString) {
		const ele = document.createElement("div");
		ele.innerHTML = inputString.trim();
		return ele.firstChild;
	},
	script: function (id, inputString) {
		const ele = document.createElement("script");
		ele.id = id;
		ele.innerHTML = inputString.trim();
		return ele;
	},
	parse: function (parent) {
		const children = parent.childNodes;

		const items = [];
		for (let a = 0; a < children.length; a++) {
			if (children[a].nodeName != "#text") {
				const secondChilds = children[a].childNodes;
				let hasNonTextChild = false;
				for (let b = 0; b < secondChilds.length; b++) {
					if (secondChilds[b].nodeName != "#text") {
						hasNonTextChild = true;
						break;
					}
				}
				if (hasNonTextChild) {
					items.push([children[a]].concat(window.tired.html.parse(children[a])));
				} else {
					items.push(children[a]);
				}
			}
		}
		return items;
	}
}