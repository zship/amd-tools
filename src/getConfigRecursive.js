define(function(require) {

	'use strict';


	var fs = require('fs');
	var mixin = require('mout/object/deepMixIn');
	var getConfig = require('./getConfig');


	var getConfigRecursive = function(file) {
		var config = getConfig(file);

		if (!config.mainConfigFile) {
			return config;
		}

		if (!fs.existsSync(config.mainConfigFile)) {
			throw new Error('requirejs config: mainConfigFile property: ' + config.mainConfigFile + ' cannot be found');
		}

		var mainConfig = getConfigRecursive(config.mainConfigFile);
		return mixin({}, mainConfig, config);
	};


	return getConfigRecursive;

});
