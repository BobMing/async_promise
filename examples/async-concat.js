var async = require('../lib/Async');
var fs = require('fs');

async.concat({one: 'a', two: 'h', three: 'o'}, fs.readdir, function(err, files) {
    // files is now a list of filenames that exist in the 3 directories
    if (err) {
      console.log(err);
    }
    else {
      console.log(files);
    }
});