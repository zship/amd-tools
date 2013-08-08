define(function(require) {

	'use strict';


	var path = require('path');
	var _transforms = require('./_transforms');
	var resolve = require('./resolve');


	var normalize = function(file, rjsconfig) {
		var baseUrl = rjsconfig.baseUrl;

		if (file.indexOf('/') !== 0) {
			file = resolve(file);
		}

		var baseDirectory = path.resolve(baseUrl);
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
