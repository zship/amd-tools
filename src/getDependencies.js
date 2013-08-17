define(function(require) {

	'use strict';


	var fs = require('fs');

	var esprima = require('esprima');
	var get = require('mout/object/get');

	var memoize = require('./util/memoize');
	var getDeps = require('./ast/getDependencies');
	var normalize = require('./modules/normalize');


	var getDependencies = memoize(function(rjsconfig, file) {
		if (getDependencies.cache[file]) {
			return getDependencies.cache[file];
		}

		rjsconfig = rjsconfig || {};
		var deps = [];

		try {
			//can throw an Error if a module is not a valid AMD module
			var ast = esprima.parse(fs.readFileSync(file, 'utf8'));
			deps = getDeps(ast);
		}
		catch (e) {
			//if it's shimmed, consider it a valid module and use shim deps
			var id = normalize(rjsconfig, file);
			deps = get(rjsconfig, 'shim.' + id + '.deps') || [];
		}

		return deps
			.map(function(node) {
				return node.value;
			})
			.reverse()
			.filter(function(name, i, list) {
				return name && list.indexOf(name, i+1) === -1;
			})
			.reverse();
	});


	return getDependencies;

});
