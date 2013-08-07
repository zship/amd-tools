define(function(require) {

	'use strict';


	var path = require('path');
	var getDependencies = require('./getDependencies');
	var getFile = require('./modules/getFile');


	var depCache = {};


	var _getResolvedDependencies = function(file, rjsconfig) {
		return getDependencies(file, rjsconfig)
			.filter(function(dep) {
				return dep !== 'require';
			})
			.map(function(dep) {
				return getFile(dep, path.dirname(file), rjsconfig);
			});
	};


	var getDependencyGraph = function(file, rjsconfig) {

		var _getDependencyGraphRecursive = function(file, graphPath) {
			var node = {
				file: file,
				deps: []
			};

			graphPath = graphPath || [];

			var i = graphPath.indexOf(file);
			if (i !== -1) {
				return node; // circular dependency
			}
			graphPath.push(file);

			if (depCache[file] === undefined) {
				depCache[file] = _getResolvedDependencies(file, rjsconfig);
			}

			depCache[file].forEach(function(dep) {
				node.deps.push(_getDependencyGraphRecursive(dep, graphPath.slice()));
			});

			return node;
		};

		return _getDependencyGraphRecursive(file, []);

	};


	return getDependencyGraph;

});
