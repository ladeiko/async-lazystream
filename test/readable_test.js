
const Readable = require('../lib/lazystream').Readable;
const InvalidLazyStreamError = require('../lib/lazystream').InvalidLazyStreamError;
const DummyReadable = require('./helper').DummyReadable;

exports.readable = {
  dummy: function(test) {
    const expected = ['line1\n', 'line2\n'];
    const actual = [];

    test.expect(1);

    new DummyReadable([].concat(expected))
        .on('data', function(chunk) {
          actual.push(chunk.toString());
        })
        .on('end', function() {
          test.equal(actual.join(''), expected.join(''), 'DummyReadable should produce the data it was created with');
          test.done();
        });
  },
  options: function(test) {
    test.expect(3);

    const readable = new Readable(function(options) {
      test.ok(this instanceof Readable, 'Readable should bind itself to callback\'s this');
      test.equal(options.encoding, 'utf-8', 'Readable should make options accessible to callback');
      this.ok = true;
      return new DummyReadable(['test']);
    }, {encoding: 'utf-8'});

    readable.read(4);

    test.ok(readable.ok);

    test.done();
  },
  async_options: function(test) {
    test.expect(3);

    const readable = new Readable(function(options) {
      test.ok(this instanceof Readable, 'Readable should bind itself to callback\'s this');
      test.equal(options.encoding, 'utf-8', 'Readable should make options accessible to callback');
      this.ok = true;
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(new DummyReadable(['test']));
        }, 10);
      });
    }, {encoding: 'utf-8'});

    readable.read(4);

    test.ok(readable.ok);

    test.done();
  },
  async_creation_failure_null: function(test) {
    test.expect(3);

    const readable = new Readable(function(options) {
      test.ok(this instanceof Readable, 'Readable should bind itself to callback\'s this');
      test.equal(options.encoding, 'utf-8', 'Readable should make options accessible to callback');
      this.ok = true;
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 10);
      });
    }, {encoding: 'utf-8'});

    readable.on('error', (error) => {
      test.ok(error instanceof InvalidLazyStreamError);
      test.done();
    });

    readable.read(4);
  },
  async_creation_failure_error: function(test) {
    test.expect(3);
    const someError = new Error('Some error');
    const readable = new Readable(function(options) {
      test.ok(this instanceof Readable, 'Readable should bind itself to callback\'s this');
      test.equal(options.encoding, 'utf-8', 'Readable should make options accessible to callback');
      this.ok = true;
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(someError);
        }, 10);
      });
    }, {encoding: 'utf-8'});

    readable.on('error', (error) => {
      test.ok(error.message === someError.message);
      test.done();
    });

    readable.read(4);
  },
  streams2: function(test) {
    const expected = ['line1\n', 'line2\n'];
    const actual = [];
    let instantiated = false;

    test.expect(2);

    const readable = new Readable(function() {
      instantiated = true;
      return new DummyReadable([].concat(expected));
    });

    test.equal(instantiated, false, 'DummyReadable should only be instantiated when it is needed');

    readable.on('readable', function() {
      let chunk;
      while ((chunk = readable.read())) {
        actual.push(chunk.toString());
      }
    });
    readable.on('end', function() {
      test.equal(actual.join(''), expected.join(''), 'Readable should not change the data of the underlying stream');
      test.done();
    });

    readable.read(0);
  },
  async_streams2: function(test) {
    const expected = ['line1\n', 'line2\n'];
    const actual = [];
    let instantiated = false;

    test.expect(2);

    const readable = new Readable(function() {
      return new Promise((resolve) => {
        setTimeout(() => {
          instantiated = true;
          resolve(new DummyReadable([].concat(expected)));
        }, 10);
      });
    });

    test.equal(instantiated, false, 'DummyReadable should only be instantiated when it is needed');

    readable.on('readable', function() {
      let chunk;
      while ((chunk = readable.read())) {
        actual.push(chunk.toString());
      }
    });
    readable.on('end', function() {
      test.equal(actual.join(''), expected.join(''), 'Readable should not change the data of the underlying stream');
      test.done();
    });

    readable.read(0);
  },
  resume: function(test) {
    const expected = ['line1\n', 'line2\n'];
    const actual = [];
    let instantiated = false;

    test.expect(2);

    const readable = new Readable(function() {
      instantiated = true;
      return new DummyReadable([].concat(expected));
    });

    readable.pause();

    readable.on('data', function(chunk) {
      actual.push(chunk.toString());
    });
    readable.on('end', function() {
      test.equal(actual.join(''), expected.join(''), 'Readable should not change the data of the underlying stream');
      test.done();
    });

    test.equal(instantiated, false, 'DummyReadable should only be instantiated when it is needed');

    readable.resume();
  },
  async_resume: function(test) {
    const expected = ['line1\n', 'line2\n'];
    const actual = [];
    let instantiated = false;

    test.expect(2);

    const readable = new Readable(function() {
      return new Promise((resolve) => {
        setTimeout(() => {
          instantiated = true;
          resolve(new DummyReadable([].concat(expected)));
        }, 10);
      });
    });

    readable.pause();

    readable.on('data', function(chunk) {
      actual.push(chunk.toString());
    });
    readable.on('end', function() {
      test.equal(actual.join(''), expected.join(''), 'Readable should not change the data of the underlying stream');
      test.done();
    });

    test.equal(instantiated, false, 'DummyReadable should only be instantiated when it is needed');

    readable.resume();
  },
};
