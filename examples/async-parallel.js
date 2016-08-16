var async = require('../lib/Async');

// an example using an object instead of an array
async.parallel({
    one: function(callback) {
        setTimeout(function() {
            callback(null, 1);
        }, 200);
    },
    two: function(callback) {
        setTimeout(function() {
            callback(null, 2);
        }, 50);
    },
    three: function(callback) {
        setTimeout(function() {
            callback(null, 3);
        }, 100);
    }
}, function(err, results) {
    // results is now equals to: {one: 1, two: 2}
    if (err) {
      console.log(err);
    }
    else {
      console.log(results);
    }
    // 此处有坑
    // Actually results is equals to: {two: 2, three: 3, one: 1,}
});
