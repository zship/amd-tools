define(function(require) {

	'use strict';


	var rotated = require('./rotated');


	var rotateUntil = function(cycle, callback) {
		var ret = cycle.slice();
		var i = 0;
		while (!callback(ret) && i < cycle.length) {
			ret = rotated(cycle, i);
			i++;
		}
		return ret;
	};


	return rotateUntil;

});
