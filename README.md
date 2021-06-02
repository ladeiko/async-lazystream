# Async Lazy Streams

> *Create streams lazily (event using promises) when they are read from or written to.*  
> `async-lazystream: 1.0.0` [![Build Status](https://travis-ci.com/ladeiko/async-lazystream.svg?branch=main)](https://travis-ci.com/ladeiko/async-lazystream)

## Why?

Sometimes you feel the itch to open *all the files* at once. You want to pass a bunch of streams around, so the consumer does not need to worry where the data comes from.
From a software design point-of-view this sounds entirely reasonable. Then there is that neat little function `fs.createReadStream()` that opens a file and gives you a nice `fs.ReadStream` to pass around, so you use what the mighty creator deities of node bestowed upon you.

> `Error: EMFILE, too many open files`  
> ─ *node*

This package provides two classes based on the node's Streams3 API (courtesy of `readable-stream` to ensure a stable version).

## Class: lazystream.Readable

A wrapper for readable streams. Extends [`stream.PassThrough`](http://nodejs.org/api/stream.html#stream_class_stream_passthrough).

### new lazystream.Readable(fn [, options])

* `fn` *{Function}*  
  The function that the lazy stream will call to obtain the stream to actually read from.
* `options` *{Object}*  
  Options for the underlying `PassThrough` stream, accessible by `fn`.

Creates a new readable stream. Once the stream is accessed (for example when you call its `read()` method, or attach a `data`-event listener) the `fn` function is called with the outer `lazystream.Readable` instance bound to `this`.

If you pass an `options` object to the constuctor, you can access it in your `fn` function.

```javascript
const lazystream = require('async-lazystream');

new lazystream.Readable(function (options) {
  return fs.createReadStream('/dev/urandom');
});
```

or async variant:

```javascript
const lazystream = require('async-lazystream');

new lazystream.Readable(async function (options) {
  // ... some async code
  return fs.createReadStream('/dev/urandom');
});
```

## Class: lazystream.Writable

A wrapper for writable streams. Extends [`stream.PassThrough`](http://nodejs.org/api/stream.html#stream_class_stream_passthrough).

### new lazystream.Writable(fn [, options])

* `fn` *{Function}*  
  The function that the lazy stream will call to obtain the stream to actually write to.
* `options` *{Object}*  
  Options for the underlying `PassThrough` stream, accessible by `fn`.

Creates a new writable stream. Just like the one above but for writable streams.

```javascript
const lazystream = require('async-lazystream');

new lazystream.Writable(function () {
  return fs.createWriteStream('/dev/null');
});
```
or async variant:

```javascript
const lazystream = require('async-lazystream');

new lazystream.Writable(async function () {
  //... some async code
  return fs.createWriteStream('/dev/null');
});
```

## Install

```console
$ npm install async-lazystream --save
```

## Changelog

### v1.0.0

- Initial release

## Contributing

Fork it, branch it, send me a pull request. We'll work out the rest together.

## Credits

[J. Pommerening](https://github.com/jpommerening) - code for this module was based on 'lazystream'.

## LICENSE

See [License](LICENSE)