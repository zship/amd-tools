define(function(require) {

	'use strict';


	var fs = require('fs');
	var path = require('path');

	var escapeRegExp = require('mout/string/escapeRegExp');

	var _transforms = require('./_transforms');
	var memoize = require('../util/memoize');


	var _resolve = function(declaredName, directory, rjsconfig) {
		// already absolute
		if (declaredName.indexOf('/') === 0) {
			return declaredName;
		}

		// plugin
		if (declaredName.indexOf('!') !== -1) {
			return _resolve(declaredName.split('!')[0], directory, rjsconfig);
		}

		var ext = '.js';
		declaredName = declaredName.replace(ext, '');

		// (explicitly) relative paths
		if (declaredName.search(/^\.+?\//) !== -1) {
			return path.resolve(directory, declaredName + ext);
		}

		var result;

		// transformed paths
		_transforms(rjsconfig).every(function(obj) {
			var candidate = declaredName;
			if (candidate.search(new RegExp('^' + escapeRegExp(obj.from))) !== -1) {
				candidate = candidate.replace(obj.from, obj.to);
				candidate = path.resolve(rjsconfig.baseUrl, candidate + ext);
				result = candidate;
				return false;
			}
			return true;
		});

		if (result) {
			return result;
		}

		// try CommonJS Packages directory structure
		var packages = rjsconfig.packages || [];
		result = packages
			.filter(function(pkg) {
				return pkg.name === declaredName;
			})
			.map(function(pkg) {
				return path.resolve(rjsconfig.baseUrl, pkg.location, (pkg.main || 'main') + ext);
			})[0];

		if (result) {
			return result;
		}

		// relative to baseUrl
		return path.resolve(rjsconfig.baseUrl, declaredName + ext);
	};


	var resolve = memoize(function(declaredName, directory, rjsconfig) {
		var file = _resolve(declaredName, directory, rjsconfig);
		if (!fs.existsSync(file)) {
			return;
		}
		return file;
	}, function hash(declaredName, directory, rjsconfig) {
		if (declaredName.search(/^\.+\//) !== -1) {
			return directory + '|' + declaredName;
		}
		return declaredName;
	});


	return resolve;

});
