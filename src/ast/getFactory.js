define(function(require) {

	'use strict';


	var getDefine = require('./getDefine');


	var getFactory = function(ast) {
		var def = getDefine(ast);
		return def.expression['arguments'].filter(function(arg) {
			return arg.type === 'FunctionExpression';
		})[0];
	};


	return getFactory;

});
