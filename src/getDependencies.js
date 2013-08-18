define(function(require) {

	'use strict';


	var fs = require('fs');

	var acorn = require('acorn');
	var get = require('mout/object/get');
	var mixin = require('mout/object/mixIn');

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
			var ast = acorn.parse(fs.readFileSync(file, 'utf8'));
			deps = getDeps(ast);
		}
		catch (e) {
			//if it's shimmed, consider it a valid module and use shim deps
			var id = normalize(rjsconfig, file);
			deps = get(rjsconfig, 'shim.' + id + '.deps') || [];
			deps = deps.map(function(name) {
				return {
					value: name,
					shimmed: true
				};
			});
		}

		return deps
			.map(function(node) {
				return mixin({
					name: node.value
				}, node);
			})
			.filter(function(dep, i, list) {
				return dep.name && list.slice(0, i).every(function(dep2) {
					return dep.name !== dep2.name;
				});
			});
	});


	return getDependencies;

});
