'use strict';

var fs = require('fs');
var path = require('path');

var map = require('mout/collection/map');

var Modules = {};


//transformed paths (have 'paths' or 'packages' entries in rjsconfig)
var _transforms = function(rjsconfig) {
	var paths = rjsconfig.paths || [];
	var packages = rjsconfig.packages || [];

	return map(paths, function(val, key) {
		return {
			from: val,
			to: key
		};
	})
		.concat(packages.map(function(pkg) {
			return {
				from: pkg.location,
				to: pkg.name
			};
		}))
		.sort(function(a, b) {
			//transform in order from most complex to simplest
			return a.from.length < b.from.length;
		});
};


Modules.getId = function(filePath, rjsconfig) {
	var baseUrl = rjsconfig.baseUrl;
	var absolutePath = path.normalize(filePath);

	//passed a relative path
	if (!fs.existsSync(filePath)) {
		absolutePath = path.resolve(process.cwd() + '/' + filePath);
	}

	var baseDirectory = path.resolve(process.cwd() + '/' + baseUrl);
	var relativePath = path.relative(baseDirectory, absolutePath);

	//combine all path transformation operations together
	_transforms(rjsconfig).every(function(obj) {
		if (relativePath.search(obj.from) !== -1) {
			relativePath = relativePath.replace(obj.from, obj.to);
			return false;
		}
		return true;
	});

	return relativePath.replace('.js', '');
};


Modules.getFile = function(declaredName, directory, rjsconfig) {
	declaredName = declaredName.replace(/\.js/, '');

	var candidate;

	//relative paths
	if (declaredName.search(/^\./) !== -1) {
		candidate = path.normalize(directory + '/' + declaredName + '.js');

		if (fs.existsSync(candidate)) {
			return candidate;
		}
		else {
			return undefined;
		}
	}

	//non-transformed paths
	candidate = path.resolve(process.cwd() + '/' + rjsconfig.baseUrl + '/' + declaredName + '.js');

	if (fs.existsSync(candidate)) {
		return candidate;
	}

	var result;

	//transformed paths
	_transforms(rjsconfig).every(function(obj) {
		var candidate = declaredName;
		if (candidate.search(obj.from) !== -1) {
			candidate = candidate.replace(obj.from, obj.to);
			candidate = path.resolve(process.cwd() + '/' + rjsconfig.baseUrl + '/' + candidate + '.js');
			if (fs.existsSync(candidate)) {
				result = candidate;
				return false;
			}
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
			return path.resolve(process.cwd(), rjsconfig.baseUrl, pkg.location, pkg.main || 'main');
		})
		.filter(function(path) {
			return fs.existsSync(path) || fs.existsSync(path + '.js');
		})[0];

	if (result) {
		return result;
	}

	//path in current directory without a leading './'
	result = path.normalize(directory + '/' + declaredName + '.js');
	return result;

};


module.exports = Modules;
