define(function(require) {

	'use strict';


	var path = require('path');
	var escapeRegExp = require('mout/string/escapeRegExp');
	var _transforms = require('./_transforms');


	var getFile = function(declaredName, directory, rjsconfig) {
		declaredName = declaredName.replace(/\.js/, '');

		//relative paths
		if (declaredName.search(/^\./) !== -1) {
			return path.resolve(directory, declaredName + '.js');
		}

		var result;

		//transformed paths
		_transforms(rjsconfig).every(function(obj) {
			var candidate = declaredName;
			if (candidate.search(new RegExp('^' + escapeRegExp(obj.from))) !== -1) {
				candidate = candidate.replace(obj.from, obj.to);
				candidate = path.resolve(rjsconfig.baseUrl, candidate + '.js');
				result = candidate;
				return false;
			}
			return true;
		});

		if (result) {
			return result;
		}

		//try CommonJS Packages directory structure
		var packages = rjsconfig.packages || [];
		result = packages
			.filter(function(pkg) {
				return pkg.name === declaredName;
			})
			.map(function(pkg) {
				return path.resolve(rjsconfig.baseUrl, pkg.location, pkg.main || 'main');
			})[0];

		if (result) {
			return result;
		}
	};


	return getFile;

});
