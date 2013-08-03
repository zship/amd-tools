define(function(require) {

	'use strict';


	var fs = require('fs');
	var path = require('path');
	var _transforms = require('./_transforms');


	var getName = function(filePath, rjsconfig) {
		var baseUrl = rjsconfig.baseUrl;
		var absolutePath = path.normalize(filePath);

		//passed a relative path
		if (!fs.existsSync(filePath)) {
			absolutePath = path.resolve(filePath);
		}

		var baseDirectory = path.resolve(baseUrl);
		var relativePath = path.relative(baseDirectory, absolutePath);

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


	return getName;

});
