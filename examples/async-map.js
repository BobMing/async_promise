var async = require('../lib/Async');
var fs = require('fs');

async.map(['async-race.js','async-series.js','async-waterfall.js'], fs.stat, function(err, results) {
    // results is now an array of stats for each file
    if (err) {
      console.log(err);
    }
    else {
      console.log(results);
    }
});
