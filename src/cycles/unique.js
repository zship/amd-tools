define(function(require) {

	'use strict';


	var equal = require('./equal');


	var unique = function(loops) {
		return loops
			.filter(function(loop) {
				return loop && loop.length;
			})
			.filter(function(loop, i, loopsCopy) {
				return loopsCopy.slice(0, i).every(function hasDupe(loop2, j) {
					return !equal(loop, loop2);
				});
			});
	};


	return unique;

});
