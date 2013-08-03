/*jslint evil: true */
define(function(require) {

	'use strict';


	var fs = require('fs');
	var esprima = require('esprima');
	var getCfg = require('./ast/getConfig');


	var getConfig = function(file, opts) {
		var contents;
		if (fs.existsSync(file)) {
			contents = fs.readFileSync(file, 'utf8');
		}
		else {
			contents = file;
		}

		try {
			return JSON.parse(contents);
		}
		catch(e) {}

		var ast = esprima.parse(contents, {
			range: true
		});

		var node = getCfg(ast);

		if (!node) {
			return;
		}

		var config = contents.substring(node.range[0], node.range[1]);
		return eval('(' + config + ')');
	};


	return getConfig;

});
