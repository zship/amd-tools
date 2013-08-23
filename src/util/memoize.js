define(function(require) {

	'use strict';


	var murmur = require('murmurhash-js');
	var isObject = require('mout/lang/isObject');
	var isArray = require('mout/lang/isArray');
	var seed = new Date().getTime();


	var memoize = function(fn, hashFn) {
		hashFn = hashFn || function() {
			var args = Array.prototype.slice.call(arguments);
			var key;
			for (var i = 0; i < args.length; i++) {
				if (isObject(args[i]) || isArray(args[i])) {
					key += JSON.stringify(args[i]);
				}
				else {
					key += args[i].toString();
				}
			}
			return murmur(key, seed);
		};

		var memoized = function() {
			var key = hashFn.apply(this, arguments);

			if (!memoized.cache[key]) {
				memoized.cache[key] = fn.apply(this, arguments);
			}

			return memoized.cache[key];
		};

		memoized.cache = {};

		memoized.clear = function() {
			memoized.cache = {};
		};

		return memoized;

	};


	return memoize;

});
