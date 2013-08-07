define(function(require) {

	'use strict';


	var equal = require('./equal');


	var unique = function(loops) {
		return loops.filter(function(loop, i) {
			return !loops.some(function hasDupe(otherLoop, j) {
				if (j >= i) {
					return false;
				}
				return equal(loop, otherLoop);
			});
		});
	};


	return unique;

});
