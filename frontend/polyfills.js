// Polyfills for older browsers and environments
require('regenerator-runtime/runtime');

// Ensure regeneratorRuntime is available globally
if (typeof globalThis !== 'undefined') {
  if (!globalThis.regeneratorRuntime) {
    globalThis.regeneratorRuntime = require('regenerator-runtime/runtime');
  }
} else if (typeof window !== 'undefined') {
  if (!window.regeneratorRuntime) {
    window.regeneratorRuntime = require('regenerator-runtime/runtime');
  }
} else if (typeof global !== 'undefined') {
  if (!global.regeneratorRuntime) {
    global.regeneratorRuntime = require('regenerator-runtime/runtime');
  }
}

// Object.assign polyfill
if (typeof Object.assign !== 'function') {
  Object.assign = function(target) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    var to = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];
      if (nextSource != null) {
        for (var nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

// Array.from polyfill
if (!Array.from) {
  Array.from = function(arrayLike, mapFn, thisArg) {
    var C = this;
    var items = Object(arrayLike);
    if (arrayLike == null) {
      throw new TypeError('Array.from requires an array-like object - not null or undefined');
    }
    var mapFunction = mapFn === undefined ? undefined : mapFn;
    var T;
    if (typeof mapFunction !== 'undefined') {
      if (typeof mapFunction !== 'function') {
        throw new TypeError('Array.from: when provided, the second argument must be a function');
      }
      if (arguments.length > 2) {
        T = thisArg;
      }
    }
    var len = parseInt(items.length);
    var A = typeof C === 'function' ? Object(new C(len)) : new Array(len);
    var k = 0;
    var kValue;
    while (k < len) {
      kValue = items[k];
      if (mapFunction) {
        A[k] = typeof T === 'undefined' ? mapFunction(kValue, k) : mapFunction.call(T, kValue, k);
      } else {
        A[k] = kValue;
      }
      k += 1;
    }
    A.length = len;
    return A;
  };
}
