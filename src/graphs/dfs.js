define(function(require) {

	'use strict';


	var dfs = function(graph, iterator) {

		var visit = function(node, parents) {
			parents = parents || [];

			iterator(node, parents);

			if (parents.indexOf(node) !== -1) {
				return; // cycle
			}

			node.deps.forEach(function(dep) {
				visit(dep, parents.concat(node));
			});
		};

		visit(graph);

	};


	return dfs;

});
