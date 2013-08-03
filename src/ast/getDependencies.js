define(function(require) {

	'use strict';


	var getAmdDependencies = require('./getAmdDependencies');
	var getCjsDependencies = require('./getCjsDependencies');


	var getDependencies = function(ast) {
		return getAmdDependencies(ast)
			.concat(getCjsDependencies(ast));
	};


	return getDependencies;

});
