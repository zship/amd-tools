define(function(require) {

	'use strict';


	var rotated = function(cycle, i) {
		var ret = cycle.slice();
		for (var j = 0; j < i; j++) {
			ret = [ret[ret.length - 1]].concat(ret.slice(0, ret.length - 1));
		}
		return ret;
	};


	return rotated;

});
