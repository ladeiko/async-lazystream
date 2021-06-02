const util = require('util');
const {PassThrough} = require('readable-stream');

class InvalidLazyStreamError extends Error {
  constructor() {
    super('Invalid lazy stream');
  }
}

module.exports = {
  InvalidLazyStreamError: InvalidLazyStreamError,
  Readable: Readable,
  Writable: Writable,
};

util.inherits(Readable, PassThrough);
util.inherits(Writable, PassThrough);

function beforeFirstCall(instance, method, callback) {
  instance[method] = function() {
    delete instance[method];
    callback.call(this, (error) => {
      if (error) {
        this.emit('error', error);
      } else {
        this[method].apply(this, arguments);
      }
    });
  };
}

function Readable(fn, options) {
  if (!(this instanceof Readable)) {
    return new Readable(fn, options);
  }

  PassThrough.call(this, options);

  beforeFirstCall(this, '_read', function(completion) {
    const source = fn.call(this, options);
    if (!source || typeof source !== 'object') {
      completion(new InvalidLazyStreamError());
      return;
    }

    if (typeof source.then === 'function') {
      source.then((stream) => {
        if (!stream ||
              typeof stream !== 'object' ||
              typeof stream.pipe !== 'function') {
          completion(new InvalidLazyStreamError());
          return;
        }
        stream.on('error', this.emit.bind(this, 'error'));
        stream.pipe(this);
        completion();
      })
          .catch((error) => {
            completion(error);
          });
    } else if (typeof source.pipe === 'function') {
      source.on('error', this.emit.bind(this, 'error'));
      source.pipe(this);
      completion();
    } else {
      completion(new InvalidLazyStreamError());
    }
  });

  this.emit('readable');
}

function Writable(fn, options) {
  if (!(this instanceof Writable)) {
    return new Writable(fn, options);
  }

  PassThrough.call(this, options);

  beforeFirstCall(this, '_write', function(completion) {
    const destination = fn.call(this, options);
    if (!destination || typeof destination !== 'object') {
      completion(new InvalidLazyStreamError());
      return;
    }

    if (typeof destination.then === 'function') {
      destination.then((stream) => {
        if (!stream ||
              typeof stream !== 'object' ||
              typeof stream.pipe !== 'function') {
          completion(new InvalidLazyStreamError());
          return;
        }
        stream.on('error', this.emit.bind(this, 'error'));
        this.pipe(stream);
        completion();
      })
          .catch((error) => {
            completion(error);
          });
    } else if (typeof destination.pipe === 'function') {
      destination.on('error', this.emit.bind(this, 'error'));
      this.pipe(destination);
      completion();
    } else {
      completion(new InvalidLazyStreamError());
    }
  });

  this.emit('writable');
}
