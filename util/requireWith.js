'use strict';


var requirejs = require('../components/r.js/dist/r.js');


var requireWith = function(moduleName, config) {
	var prev = requirejs.s.contexts._.config;
	requirejs.config(config);
	var ret = requirejs(moduleName);
	requirejs.config(prev);
	return ret;
};


module.exports = requireWith;
