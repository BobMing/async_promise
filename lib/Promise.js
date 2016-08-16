'use strict';

module.exports = Promise;
// function noop() {};

var PENDING = 0;  // 进行中  
var FULFILLED = 1; // 成功  
var REJECTED = 2;  // 失败

function Promise(fn) {  
  // 存储状态：PENDING, FULFILLED或者REJECTED
  var state = PENDING;

  // 存储成功或失败的结果值
  var value = null;
  
  // 存储成功或失败的处理程序，通过调用`.then`或者`.done`方法
  var handlers = [];

  // 成功状态变化
  function fulfill(result) {
    state = FULFILLED;
    value = result;
    handlers.forEach(handle);
    handlers = null;
  }
  // 失败状态变化
  function reject(error) {
    state = REJECTED;
    value = error;
    handlers.forEach(handle);
    handlers = null;
  }
  
  // resolve 方法可接收的参数有两种：一个普通的值/对象或者一个 Promise 对象
  // 如果是普通的值/对象，则直接把结果传递到下一个对象；
  // 如果是一个 Promise 对象，则必须先等待这个子任务序列完成。
  function resolve(result) {
    try {
      var then = getThen(result);
      // 若参数为一个 Promise 对象，则其then方法有效（为真）
      if (then) {
        // 解析 Promise，以result作参数（作为then运行时的 this 指向）调用then方法
        doResolve(then.bind(result), resolve, reject)
        return;
      }
      // 若参数为普通的值或对象，then方法无效，直接传值
      fulfill(result);
    } catch (e) {
      reject(e);
    }
  }

  // 不同的状态进行不同的处理
  function handle(handler) {
    if (state === PENDING) {
      handlers.push(handler);
    }
    else {
      // promise被resolved或rejected时，保证handlers被通知
      if (state === FULFILLED &&
        typeof handler.onFulfilled === 'function') {
        handler.onFulfilled(value);
      }
      if (state === REJECTED &&
        typeof handler.onRejected === 'function') {
        handler.onRejected(value);
      }
    }
  }

  // 一旦调用done方法，promise链式调用结束
  this.done = function (onFulfilled, onRejected) {
    // 保证异步
    setTimeout(function () {
      handle({
        onFulfilled: onFulfilled,
        onRejected: onRejected
      });
    }, 0);
  }

  // 观测状态机的变化
  this.then = function (onFulfilled, onRejected) {  
    var self = this;
    // 需返回一个promise对象
    return new Promise(function (resolve, reject) {
      return self.done(function (result) {
        if (typeof onFulfilled === 'function') {
          try {
            return resolve(onFulfilled(result));
          } catch (ex) {
            return reject(ex);
          }
        } else {
          return resolve(result);
        }
      }, function (error) {
        if (typeof onRejected === 'function') {
          try {
            return resolve(onRejected(error));
          } catch (ex) {
            return reject(ex);
          }
        } else {
          return reject(error);
        }
      });
    });
  }

  this.catch = function (onRejected) {
    return this.then(null, onRejected);
  }

  // 对初始化的fn进行（执行）控制
  doResolve(fn, resolve, reject);
}

/**
 * Check if a value is a Promise and, if it is,
 * return the `then` method of that promise.
 *
 * @param {Promise|Any} value
 * @return {Function|Null}
 */
function getThen(value) {  
  var t = typeof value;
  if (value && (t === 'object' || t === 'function')) {
    var then = value.then;
    if (typeof then === 'function') {
      return then;
    }
  }
  return null;
}
/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 *
 * @param {Function} fn A resolver function that may not be trusted
 * @param {Function} onFulfilled
 * @param {Function} onRejected
 */
 function doResolve(fn, onFulfilled, onRejected) {
   var done = false;
   try {
     fn(function(value) {
       if (done) return;
       done = true;
       onFulfilled(value);
     }, function(reason) {
       if (done) return;
       done = true;
       onRejected(reason);
     });
   } catch(ex) {
     if (done) return;
     done = true;
     onRejected(ex);
   }
 }

// 当且仅当入参数组中所有Promise元素状态均为fulfilled时返回状态fulfilled
 Promise.all = function(arr) {
   return new Promise(function (resolve, reject) {
     if (arr.length === 0) {
       return resolve([]);
     }
     var args = Array.prototype.slice.call(arr);
     var remaining = args.length;
     for (var i = 0;i < args.length;i++) {
       res(i, args[i]);
     }
     function res(i, val) {
       try {
         if (val && (typeof val === 'object' || typeof val === 'function')) {
           var then = val.then;
           if (typeof then === 'function') {
             then.call(val, function (val) {
               // 对于promise对象递归自身获取处理结果值
               return res(i, val);
             }, reject);
             return;
           }
         }
         args[i] = val;
         // 检验是否所有元素都成功返回值
         if (--remaining === 0) {
           return resolve(args);
         }
       } catch (ex) {
         return reject(ex);
       }
     }
   });
 }

// 入参中一旦某个promise对象状态为fulfilled，返回状态fulfilled
Promise.race = function(arr) {
  return new Promise(function (resolve, reject) {
    var over = false;
    for (var i = 0, len = arr.length;i < len && !over;++i) {
      // 以下的try/catch部分也可封装成一个函数
      try {
        var val = arr[i];
        if (val && typeof val.then === 'function') {
          val.then(function (res) {
            if (!over) {
              over = true;
              return resolve(res);
            }
          }, reject);
        }
        else {
          if (!over) {
            over = true;
            return resolve(res);
          }
        }
      }
      catch (ex) {
        over = true;
        return reject(ex);
      }
    }
  });
}