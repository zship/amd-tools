define(function(require) {

	'use strict';


	var deepEquals = require('mout/object/deepEquals');

	var rotated = require('./rotated');


	var _equal = function(first, second) {
		//return JSON.stringify(first) === JSON.stringify(second);
		if (first.length !== second.length) {
			return false;
		}

		for (var i = 0; i < first.length; i++) {
			if (!deepEquals(first[i], second[i])) {
				return false;
			}
		}

		return true;
	};


	var equal = function(first, second) {
		if (_equal(first, second)) {
			return true;
		}
		for (var i = 1; i <= first.length; i++) {
			if (_equal(first, rotated(second, i))) {
				return true;
			}
		}
		return false;
	};


	return equal;

});
