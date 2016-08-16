var async = require('../lib/Async');

async.parallelLimit([
    function(callback) {
        setTimeout(function() {
            callback(null, 'one');
        }, 2000);
    },
    function(callback) {
        setTimeout(function() {
            callback(null, 'two');
        }, 100);
    },
    function(callback) {
        setTimeout(function() {
            callback(null, 'three');
        }, 50);
    }
], 2,
// optional callback
function(err, results) {
    // the results array will equal ['one','two'] even though
    // the second function had a shorter timeout.
    if (err) {
      console.log(err);
    }
    else {
      console.log(results);
    }
});
