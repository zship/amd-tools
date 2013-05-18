'use strict';


var fs = require('fs');
var path = require('path');
var requirejs = require('requirejs');
var mixin = require('mout/object/deepMixIn');

requirejs.config({
	baseUrl: path.resolve(__dirname, '../../lib/rjs'),
	nodeRequire: require
});
var parse = requirejs('parse');


var loadConfig = function(config) {
	if (config.mainConfigFile) {
		if (!fs.existsSync(config.mainConfigFile)) {
			throw new Error('requirejs config: mainConfigFile property: file cannot be found');
		}

		var mainConfig = parse.findConfig(fs.readFileSync(config.mainConfigFile, 'utf-8')).config;
		return mixin({}, mainConfig, config);
	}

	return config;
};


module.exports = loadConfig;
