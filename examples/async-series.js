var async = require('../lib/Async');

async.series([
    function(callback) {
        // do some stuff ...
        callback(null, 'one');
    },
    function(callback) {
        var err = new Error('err two');
        // do some more stuff ...
        callback(null, 'two');
    }
],
// optional callback
function(err, results) {
    // results is now equal to ['one', 'two']
    if(err) {
      console.log(err);
    }
    else {
      console.log(results);
    }
});

async.series({
    one: function(callback) {
        setTimeout(function() {
          callback(null, 1);
        }, 200);
    },
    two: function(callback){
        setTimeout(function() {
          callback(null, 2);
        }, 100);
    }
}, function(err, results) {
    // results is now equal to: {one: 1, two: 2}
    console.log(results);
});
