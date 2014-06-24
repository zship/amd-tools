define(function(require) {

	'use strict';


	var path = require('path');

	var getDependencies = require('./getDependencies');
	var resolve = require('./modules/resolve');


	var getDependencyGraph = function(rjsconfig, file) {

		var visited = {};

		var graph = function(file) {
			var node = {
				file: file,
				resolved: true,
				deps: []
			};

			if (visited[file]) {
				return visited[file]; // cycle
			}

			visited[file] = node;

			getDependencies(rjsconfig, file)
				.filter(function(dep) {
					return dep.name !== 'require' && (dep.name.search(/:\/\//) === -1);
				})
				.map(function(dep) {
					var resolved = resolve(rjsconfig, path.dirname(file), dep.name);
					if (!resolved) {
						// can't resolve the file? we won't be able to trace deeper.
						node.deps.push({
							file: '??/' + dep.name,
							resolved: false,
							deps: []
						});
						return;
					}
					return resolved;
				})
				.filter(function(dep) {
					return !!dep;
				})
				.forEach(function(dep) {
					node.deps.push(graph(dep));
				});

			return node;
		};

		return graph(file);

	};


	return getDependencyGraph;

});
