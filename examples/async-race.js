var async = require('../lib/Async');

async.race([
    function(callback) {
        setTimeout(function() {
            callback(null, 'one');
        }, 200);
    },
    function(callback) {
        setTimeout(function() {
            callback(null, 'two');
        }, 50);
    },
    function(callback) {
        setTimeout(function() {
            callback(null, 'three');
        }, 100);
    }
],
// main callback
function(err, result) {
    // the result will be equal to 'two' as it finishes earlier
    if (err) {
      console.log(err);
    }
    else {
      console.log(result);
    }
});
