
const {Readable, Writable} = require('readable-stream');
const util = require('util');

module.exports = {
  DummyReadable: DummyReadable,
  DummyWritable: DummyWritable,
};

function DummyReadable(strings) {
  Readable.call(this);
  this.strings = strings;
  this.emit('readable');
}

util.inherits(DummyReadable, Readable);

DummyReadable.prototype._read = function _read(n) {
  if (this.strings.length) {
    this.push(Buffer.from(this.strings.shift()));
  } else {
    this.push(null);
  }
};

function DummyWritable(strings) {
  Writable.call(this);
  this.strings = strings;
  this.emit('writable');
}

util.inherits(DummyWritable, Writable);

DummyWritable.prototype._write = function _write(chunk, encoding, callback) {
  this.strings.push(chunk.toString());
  if (callback) callback();
};
