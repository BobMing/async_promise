'use strict';

function count(obj) {
  var coun = 0;
  for (var i in obj) {
      coun += 1;
  }
  return coun;
}

function isEmpty(obj)
{
    for (var name in obj) 
    {
        return false;
    }
    return true;
};

module.exports = {
  each: function each(coll, iteratee, callback) {
    var len = count(coll);
    var num = 0;
    for (index in coll) {
      iterator(iteratee, index);
    }

    function iterator(fn, ind) {
      fn(coll[ind], cb);
      function cb(e) {
        if (e) {
          callback(e);
        }
        else {
          num += 1;
          if (num == len) {
            callback(null);
          }
        }
      }
    }
  },

  map: function map(coll, iteratee, callback) {
    var len = count(coll);
    var results = [];
    var num = 0;
    for (index in coll) {
      iterator(iteratee, index);
    }

    function iterator(fn, ind) {
      fn(coll[ind], cb);
      function cb(e, r) {
        if (e) {
          callback(e, results);
        }
        else {
          //map 要按调用序添加结果，内部不拼接，一个萝卜一个坑
          results[ind] = r;
          num += 1;
          if (num == len) {
            callback(null, results);
          }
        }
      }
    }
  },

  concat: function concat(coll, iteratee, callback) {
    var len = count(coll);
    var results = [];
    var num = 0;
    for (index in coll) {
      iteratee(coll[index], cb);
    }

    function cb(e, r) {
      if (e) {
        callback(e, results);
      }
      else {
        //concat 按返回序添加结果,内部拼接，多个萝卜一个坑
        for (r_i in r) {
          results.push(r[r_i]);
        }
        num += 1;
        if (num == len) {
          callback(null, results);
        }
      }
    }
  },

  parallel: function parallel(tasks, callback) {
    if (tasks instanceof Array) {
      if (tasks.length == 0) {
        callback(null, []);
      }
      else {
        var results = [];
        var load = 0; //当前任务完成度
        //并行执行任务
        for (index in tasks) {
          iterator(tasks[index], index);
        }
      }
      
      function iterator(fn, index) {
          fn(cb);
          function cb(e, r) {
              if (e) {
                  callback(e, results);
              }
              else {
                  //按调用顺序添加到结果数组中
                  results[index] = r; //含在闭包中，保证index为上层函数传入的参数（作用域）
                  //console.log(results);
              }
              load += 1;
              if (load == tasks.length) {
                  callback(null, results);
              }
          }
      }

    }
  },

  parallelLimit: function parallelLimit(tasks, limit, callback) {
      var len = count(tasks);
      // if (isEmpty(tasks)) {
      if (!len) {
          if (tasks instanceof Array) {
              callback(null, []);
          }
          else if (tasks instanceof Object) {
              callback(null, {});
          }
      }
      if (len < limit) {
          parallel(tasks, callback);
      }
      var results = {};
      var complete = 0;
      var index = 0;
      for (;index < limit;index++) {
          iterator(tasks[index], index);
      }
      var index0 = index - 1;

      function iterator(fn, index) {
          fn(cb);
          function cb(e, r) {
              if (e) {
                  callback(e, results);
              }
              else {
                  //按调用顺序添加到结果中
                  results[index] = r;
              }
              complete += 1;
              if (complete == len) {
                  //若传入数组则输出数组
                  if (tasks instanceof Array) {
                      res = [];
                      for (i in results) {
                          res[i] = results[i];
                      }
                      results = res;
                  }
                  
                  callback(null, results);
              }
              //若剩余有任务未执行，则迭代执行
              if (index0 < len - 1) {
                  index0 += 1;
                  iterator(tasks[index0], index0);
              }
          }
      }
  },

  race: function race(arr, callback) {
    if (!(arr instanceof Array)) {
      var err = new Error('First argument to waterfall must be an array of functions');
      callback(err, null);
    }
    if (arr.length == 0) {
      callback(null, []);
    }
    var finish = false;
    for (index in arr) {
      if (!finish) {
        arr[index](cb);
        //console.log(index);
      }
    }

    function cb(e, r) {
      if (e) {
        callback(e, null);
      }
      else {
        if (!finish) {
          callback(null, r);
          finish = true;
        }
      }
    }
  },

  series: function series(tasks, callback) {
    var err = new Error();
    if (tasks instanceof Array) {
      var results = [];
      var index = 0;
      if (tasks.length == 0) {
        callback(null, []);
      }
      tasks[index](cb);
      function cb(e, result) {
        if (e) {
          err = e;
          // deal with whether callback is optional
          if (typeof callback === 'function') {
            callback(err, results);
          }
        }
        else {
          results.push(result);
          if (index != tasks.length - 1) {
            index += 1;
            tasks[index](cb);
          }
          else {
            if (typeof callback === 'function') {
              callback(null, results);
            }
          }
        }
      };
    }
    else if (tasks instanceof Object) {
      var results = {};
      var keys = Object.keys(tasks);
      var key = keys[0];
      if (keys.length == 0) {
        callback(null, {});
      }
      tasks[key](cb);
      function cb(e, result) {
        if (e) {
          err = e;
          if (typeof callback === 'function') {
            callback(err, results);
          }
        }
        else {
          results[key] = result;
          keys.shift();
          if (keys.length > 0) {
            key = keys[0];
            tasks[key](cb);
          }
          else {
            if (typeof callback === 'function') {
              callback(null, results);
            }
          }
        }
      };
    }
  },

  waterfall: function waterfall(arr, callback) {
    if (!(arr instanceof Array)) {
      var err = new Error('First argument to waterfall must be an array of functions');
      callback(err, null);
    }
    if (arr.length == 0) {
      callback(null, []);
    }
    var index = 0;
    arr[index](cb);

    function cb(e, r) {
      if (e) {
        var err = e;
        if (typeof callback === 'function') {
          callback(err, result);
        }
      }
      else {
        var result = [];
        for (i in arguments) {
          if (i == 0) {
            continue;
          }
          result[i-1] = arguments[i];
        }

        if (index != arr.length - 1) {
          index += 1;
          result.push(cb);
          arr[index].apply(null, result);
        }
        else {
          if (typeof callback === 'function') {
            callback.apply(null, result);
          }
        }
      }
    };
  }
}