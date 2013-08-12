define(function(require) {

	'use strict';


	var path = require('path');
	var _transforms = require('./_transforms');
	var resolve = require('./resolve');


	var normalize = function(rjsconfig, directory, file) {
		if (arguments.length === 2) {
			file = directory;
			directory = '.';
		}

		file = resolve(rjsconfig, directory, file);

		var baseDirectory = path.resolve(rjsconfig.baseUrl);
		var relativePath = path.relative(baseDirectory, file);

		//combine all path transformation operations together
		_transforms(rjsconfig).every(function(obj) {
			if (relativePath.search(obj.to) !== -1) {
				relativePath = relativePath.replace(obj.to, obj.from);
				return false;
			}
			return true;
		});

		return relativePath.replace('.js', '');
	};


	return normalize;

});
