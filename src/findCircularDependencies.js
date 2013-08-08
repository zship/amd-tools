define(function(require) {

	'use strict';


	var path = require('path');

	var getDependencies = require('./getDependencies');
	var resolve = require('./modules/resolve');
	var unique = require('./cycles/unique');


	var _getResolvedDependencies = function(file, rjsconfig) {
		return getDependencies(file, rjsconfig)
			.filter(function(dep) {
				return dep !== 'require';
			})
			.map(function(dep) {
				return resolve(dep, path.dirname(file), rjsconfig);
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

			try {
				depCache[file] = depCache[file] || _getResolvedDependencies(file, rjsconfig);
			}
			catch (e) {
				throw new Error('Error getting dependencies for "' + file + '":\n' + e.message);
			}

			depCache[file].forEach(function(dep) {
				collectCircular(dep, graphPath.slice());
			});
		};

		pool.forEach(function(file) {
			collectCircular(file, []);
		});

		return unique(found);
	};


	return findCircularDependencies;

});
