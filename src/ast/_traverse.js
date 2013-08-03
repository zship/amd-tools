define(function(require) {

	'use strict';


	var _traverse = function(node, visitor) {
		if (!node) {
			return;
		}

		if (visitor.call(null, node) === false) {
			return false;
		}

		for (var key in node) {
			if (node.hasOwnProperty(key)) {
				var child = node[key];
				if (typeof child === 'object' && child !== null) {
					if (_traverse(child, visitor) === false) {
						return false;
					}
				}
			}
		}
	};


	return _traverse;

});
