define(function(require) {

	'use strict';


	var rotated = require('./rotated');


	var contains = function(first, second) {
		var smaller = first;
		var larger = second;

		if (first.length > second.length) {
			smaller = second;
			larger = first;
		}

		for (var i = 0; i < larger.length; i++) {
			var rotatedCopy = rotated(larger, i);
			for (var j = 0; j < smaller.length; j++) {
				if (smaller[j] !== rotatedCopy[j]) {
					break;
				}
				else if (j === smaller.length - 1) {
					return true;
				}
			}
		}

		return false;
	};


	return contains;

});
