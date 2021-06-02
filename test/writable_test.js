
const Writable = require('../lib/lazystream').Writable;
const InvalidLazyStreamError = require('../lib/lazystream').InvalidLazyStreamError;
const DummyWritable = require('./helper').DummyWritable;

exports.writable = {
  options: function(test) {
    test.expect(3);

    const writable = new Writable(function(options) {
      test.ok(this instanceof Writable, 'Writable should bind itself to callback\'s this');
      test.equal(options.encoding, 'utf-8', 'Writable should make options accessible to callback');
      this.ok = true;
      return new DummyWritable([]);
    }, {encoding: 'utf-8'});

    writable.write('test');

    test.ok(writable.ok);

    test.done();
  },
  async_options: function(test) {
    test.expect(3);

    const writable = new Writable(function(options) {
      test.ok(this instanceof Writable, 'Writable should bind itself to callback\'s this');
      test.equal(options.encoding, 'utf-8', 'Writable should make options accessible to callback');
      this.ok = true;
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(new DummyWritable([]));
        }, 10);
      });
    }, {encoding: 'utf-8'});

    writable.write('test');

    test.ok(writable.ok);

    test.done();
  },
  async_creation_failure_null: function(test) {
    test.expect(3);

    const writable = new Writable(function(options) {
      test.ok(this instanceof Writable, 'Writable should bind itself to callback\'s this');
      test.equal(options.encoding, 'utf-8', 'Writable should make options accessible to callback');
      this.ok = true;
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 10);
      });
    }, {encoding: 'utf-8'});

    writable.on('error', (error) => {
      test.ok(error instanceof InvalidLazyStreamError);
      test.done();
    });

    writable.write('test');
  },
  async_creation_failure_error: function(test) {
    test.expect(3);

    const someError = new Error('Some error');
    const writable = new Writable(function(options) {
      test.ok(this instanceof Writable, 'Writable should bind itself to callback\'s this');
      test.equal(options.encoding, 'utf-8', 'Writable should make options accessible to callback');
      this.ok = true;
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(someError);
        }, 10);
      });
    }, {encoding: 'utf-8'});

    writable.on('error', (error) => {
      test.ok(error.message === someError.message);
      test.done();
    });

    writable.write('test');
  },
  dummy: function(test) {
    const expected = ['line1\n', 'line2\n'];
    const actual = [];

    test.expect(0);

    const dummy = new DummyWritable(actual);

    expected.forEach(function(item) {
      dummy.write(Buffer.from(item));
    });
    test.done();
  },
  streams2: function(test) {
    const expected = ['line1\n', 'line2\n'];
    const actual = [];
    let instantiated = false;

    test.expect(2);

    const writable = new Writable(function() {
      instantiated = true;
      return new DummyWritable(actual);
    });

    test.equal(instantiated, false, 'DummyWritable should only be instantiated when it is needed');

    writable.on('end', function() {
      test.equal(actual.join(''), expected.join(''), 'Writable should not change the data of the underlying stream');
      test.done();
    });

    expected.forEach(function(item) {
      writable.write(Buffer.from(item));
    });
    writable.end();
  },
  async_streams2: function(test) {
    const expected = ['line1\n', 'line2\n'];
    const actual = [];
    let instantiated = false;

    test.expect(2);

    const writable = new Writable(function() {
      return new Promise((resolve) => {
        setTimeout(() => {
          instantiated = true;
          resolve(new DummyWritable(actual));
        }, 10);
      });
    });

    test.equal(instantiated, false, 'DummyWritable should only be instantiated when it is needed');

    writable.on('end', function() {
      test.equal(actual.join(''), expected.join(''), 'Writable should not change the data of the underlying stream');
      test.done();
    });

    expected.forEach(function(item) {
      writable.write(Buffer.from(item));
    });
    writable.end();
  },
};
