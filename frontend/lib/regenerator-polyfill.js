// Self-contained regenerator runtime polyfill
// This provides basic support for async/await without external dependencies

(function() {
  'use strict';
  
  if (typeof regeneratorRuntime !== 'undefined') {
    return; // Already defined
  }
  
  // Simple regenerator runtime implementation
  var regeneratorRuntime = {
    mark: function(genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        if (!(toStringTagSymbol in genFun)) {
          genFun[toStringTagSymbol] = "GeneratorFunction";
        }
      }
      genFun.prototype = Object.create(Gp);
      return genFun;
    },
    
    awrap: function(arg) {
      return { __await: arg };
    },
    
    async: function(innerFn, outerFn, self, tryLocsList) {
      var iter = new AsyncIterator(
        wrap(innerFn, outerFn, self, tryLocsList)
      );
      
      return Promise.resolve().then(function () {
        return iter.next().then(function (result) {
          return result.done ? result.value : iter.next();
        });
      });
    },
    
    keys: function(object) {
      var keys = [];
      for (var key in object) {
        keys.push(key);
      }
      keys.reverse();
      
      return function next() {
        while (keys.length) {
          var key = keys.pop();
          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        }
        next.done = true;
        return next;
      };
    },
    
    values: function(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }
        
        if (typeof iterable.next === "function") {
          return iterable;
        }
        
        if (!isNaN(iterable.length)) {
          var i = -1, next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }
            next.value = undefined;
            next.done = true;
            return next;
          };
          
          return next.next = next;
        }
      }
      
      return { next: doneResult };
    },
    
    wrap: wrap
  };
  
  // Helper functions
  var hasOwn = Object.prototype.hasOwnProperty;
  var toStringTagSymbol = (typeof Symbol !== "undefined" && Symbol.toStringTag) || "@@toStringTag";
  var iteratorSymbol = (typeof Symbol !== "undefined" && Symbol.iterator) || "@@iterator";
  
  var GeneratorFunctionPrototype = {};
  var Gp = GeneratorFunctionPrototype.prototype = {};
  
  function wrap(innerFn, outerFn, self, tryLocsList) {
    var generator = Object.create(Gp);
    generator._invoke = makeInvokeMethod(innerFn, self || null, new Context(tryLocsList || []));
    return generator;
  }
  
  function makeInvokeMethod(innerFn, self, context) {
    var state = "start";
    
    return function invoke(method, arg) {
      if (state === "completed") {
        if (method === "throw") {
          throw arg;
        }
        return doneResult();
      }
      
      context.method = method;
      context.arg = arg;
      
      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }
        
        if (context.method === "next") {
          context.sent = context._sent = context.arg;
        } else if (context.method === "throw") {
          if (state === "start") {
            state = "completed";
            throw context.arg;
          }
          context.dispatchException(context.arg);
        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }
        
        state = "executing";
        
        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          state = context.done ? "completed" : "suspendedYield";
          
          if (record.arg === ContinueSentinel) {
            continue;
          }
          
          return {
            value: record.arg,
            done: context.done
          };
        } else if (record.type === "throw") {
          state = "completed";
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }
  
  function maybeInvokeDelegate(delegate, context) {
    var method = context.method;
    var arg = context.arg;
    var iter = delegate.iterator;
    
    if (method === "return") {
      if (iter.return === undefined) {
        context.delegate = null;
        return ContinueSentinel;
      }
      
      var record = tryCatch(iter.return, iter, arg);
      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }
      
      var info = record.arg;
      if (info.done) {
        context[delegate.resultName] = info.value;
        context.next = delegate.nextLoc;
      } else {
        return info;
      }
      
      context.delegate = null;
      return ContinueSentinel;
    }
    
    var record = tryCatch(iter[method], iter, arg);
    
    if (record.type === "throw") {
      context.delegate = null;
      context.method = "throw";
      context.arg = record.arg;
      return ContinueSentinel;
    }
    
    var info = record.arg;
    if (info.done) {
      context[delegate.resultName] = info.value;
      context.next = delegate.nextLoc;
    } else {
      return info;
    }
    
    context.delegate = null;
    return ContinueSentinel;
  }
  
  function Context(tryLocsList) {
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }
  
  Context.prototype = {
    constructor: Context,
    
    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;
      
      this.method = "next";
      this.arg = undefined;
      
      this.tryEntries.forEach(resetTryEntry);
      
      if (!skipTempReset) {
        for (var name in this) {
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },
    
    stop: function() {
      this.done = true;
      
      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }
      
      return this.rval;
    },
    
    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }
      
      const handle = (loc, caught) => {
        record.type = "throw";
        record.arg = exception;
        this.next = loc;
        
        if (caught) {
          this.method = "next";
          this.arg = undefined;
        }
        
        return !!caught;
      };
      
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;
        
        if (entry.tryLoc === "root") {
          return handle("end");
        }
        
        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");
          
          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }
          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },
    
    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }
      
      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        finallyEntry = null;
      }
      
      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;
      
      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }
      
      return this.complete(record);
    },
    
    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }
      
      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }
      
      return ContinueSentinel;
    },
    
    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },
    
    catch: function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }
      
      throw new Error("illegal catch attempt");
    },
    
    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: regeneratorRuntime.values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };
      
      if (this.method === "next") {
        this.arg = undefined;
      }
      
      return ContinueSentinel;
    }
  };
  
  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }
        
        return Promise.resolve(value).then(function(unwrapped) {
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          return invoke("throw", error, resolve, reject);
        });
      }
    }
    
    var previousPromise;
    
    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }
      
      return previousPromise =
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }
    
    this._invoke = enqueue;
  }
  
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }
  
  var ContinueSentinel = {};
  
  function doneResult() {
    return { value: undefined, done: true };
  }
  
  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };
    
    if (1 in locs) {
      entry.catchLoc = locs[1];
    }
    
    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }
    
    this.tryEntries.push(entry);
  }
  
  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }
  
  // Make regeneratorRuntime available globally
  if (typeof globalThis !== 'undefined') {
    globalThis.regeneratorRuntime = regeneratorRuntime;
  } else if (typeof window !== 'undefined') {
    window.regeneratorRuntime = regeneratorRuntime;
  } else if (typeof global !== 'undefined') {
    global.regeneratorRuntime = regeneratorRuntime;
  }
  
  // For module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = regeneratorRuntime;
  }
  
})();
