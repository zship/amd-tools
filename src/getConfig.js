/*jslint evil: true */
define(function(require) {

	'use strict';


	var fs = require('fs');

	var acorn = require('acorn');
	var map = require('mout/object/map');
	var isArray = require('mout/lang/isArray');

	var getCfg = require('./ast/getConfig');


	var _normalize = function(config) {
		if (!config || !config.shim) {
			return config;
		}

		config.shim = map(config.shim, function(val) {
			if (isArray(val)) {
				return {
					deps: val,
					exports: undefined
				};
			}
			return val;
		});

		return config;
	};


	var getConfig = function(file, opts) {
		var contents;
		if (fs.existsSync(file)) {
			contents = fs.readFileSync(file, 'utf8');
		}
		else {
			contents = file;
		}

		try {
			return _normalize(JSON.parse(contents));
		}
		catch(e) {}

		var ast;
		try {
			ast = acorn.parse(contents);
		}
		catch(e) {
			throw new Error('Could not parse AMD config "' + contents + '"');
		}

		var node = getCfg(ast);

		if (!node) {
			return;
		}

		var config = contents.substring(node.start, node.end);
		return _normalize(eval('(' + config + ')'));
	};


	return getConfig;

});
