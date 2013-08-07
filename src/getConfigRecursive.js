define(function(require) {

	'use strict';


	var fs = require('fs');
	var path = require('path');
	var mixin = require('mout/object/deepMixIn');
	var isString = require('mout/lang/isString');
	var getConfig = require('./getConfig');


	var getConfigRecursive = function(config) {
		var cwd = '.';
		if (isString(config)) {
			if (fs.existsSync(config)) {
				cwd = path.dirname(config);
			}
			try {
				config = getConfig(config);
			}
			catch (e) {
				throw new Error('getConfig could not load AMD config "' + config + '"');
			}
		}

		if (!config.mainConfigFile) {
			return config;
		}

		var mainConfigFile = path.resolve(cwd, config.mainConfigFile);

		if (!fs.existsSync(mainConfigFile)) {
			throw new Error('requirejs config: mainConfigFile property: ' + config.mainConfigFile + ' cannot be found');
		}

		var mainConfig = getConfigRecursive(mainConfigFile);
		return mixin({}, mainConfig, config, {mainConfigFile: mainConfig.mainConfigFile});
	};


	return getConfigRecursive;

});
