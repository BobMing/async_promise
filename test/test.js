var should = require('should');
var series = require('../lib/Async').series;
var race = require('../lib/Promise').race;

// test async.series when ie it successes
series([
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
  function (err, results) {
    should.deepEqual(results, ['one', 'two']);
  });
  
// test async.series when it fails
series([
    function(callback) {
        // do some stuff ...
        callback(null, 'one');
    },
    function(callback) {
        var err = new Error('err two');
        // do some more stuff ...
        callback(err, 'two');
    }
  ],
  function (err, results) {
    // console.log(err.message);
    should.deepEqual(err.message, 'err two');
  });  

// test Promise.race
function timerPromisefy(delay) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(delay);
    }, delay);
  });
}
function errorPromisefy() {
  return new Promise(function (resolve, reject) {
    reject(new Error('I am an error'));
  });
}
// when it successes
Promise.race([
  timerPromisefy(32),
  timerPromisefy(64),
  timerPromisefy(128),
  timerPromisefy(1)
])
.then(function (value) {
  should.equal(value, 1);
});
// when it fails
Promise.race([
  timerPromisefy(''),
  errorPromisefy(),
  timerPromisefy(undefined),
  timerPromisefy(null)
])
.then(function (value) {
  console.log(value); // if this line is reached, you'll see another empty line
})
.catch(function (err) {
  should.equal(err.message, 'I am an error');
});

console.info('OK');
console.info('There are more examples to test every function of the package.');