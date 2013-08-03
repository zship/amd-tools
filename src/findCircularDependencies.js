define(function(require) {

	'use strict';


	var path = require('path');

	var getDependencies = require('./getDependencies');
	var Modules = require('../util/Modules');
	var Cycles = require('../util/Cycles');


	var _getResolvedDependencies = function(file, rjsconfig) {
		return getDependencies(file)
			.filter(function(dep) {
				return dep !== 'require';
			})
			.map(function(dep) {
				return Modules.getFile(dep, path.dirname(file), rjsconfig);
			});
	};


	var findCircularDependencies = function(pool, rjsconfig, depCache) {
		depCache = depCache || (function() {
			var ret = {};
			pool.forEach(function(file) {
				ret[file] = _getResolvedDependencies(file, rjsconfig);
			});
			return ret;
		})();

		var found = [];

		/** @return Array<String> absolute file paths */
		var collectCircular = function(file, graphPath) {
			graphPath = graphPath || [];

			var i = graphPath.indexOf(file);
			if (i !== -1) {
				found.push(graphPath.slice(i));
				return;
			}
			graphPath.push(file);

			if (depCache[file] === undefined) {
				depCache[file] = _getResolvedDependencies(file, rjsconfig);
			}

			depCache[file].forEach(function(dep) {
				collectCircular(dep, graphPath.slice());
			});
		};

		pool.forEach(function(file) {
			collectCircular(file, []);
		});

		return Cycles.unique(found);
	};


	return findCircularDependencies;

});
