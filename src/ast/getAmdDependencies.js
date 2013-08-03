define(function(require) {

	'use strict';


	var getDefine = require('./getDefine');


	var getAmdDependencies = function(ast) {
		var def = getDefine(ast);
		var arr = def.expression['arguments'].filter(function(arg){
			return arg.type === 'ArrayExpression';
		})[0];
		if (!arr) {
			return [];
		}
		return arr.elements;
	};


	return getAmdDependencies;

});
