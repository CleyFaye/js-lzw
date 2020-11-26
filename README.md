@cley_faye/js-lzw
=================
Pure JavaScript implementation of LZW compression

Provide a low-level implementation of the LZW algorithm as well as minimal
support for compression/decompression of byte buffers.

Installation
------------

```shell
npm install @cley_faye/js-lzw
```

Usage
-----
The package uses the JavaScript ES module syntax.
This should work fine with webpack or using `esm` in Node.

### Low-level usage
At low-level, LZW only handle numeric "codes" for both input and output.
It is possible to create an instance able to compress any input dictionary, but
for convenience functions to create a "byte" dictionary (handling all 256
values) is provided.

How to compress and decompress a sequence of input codes:

```JavaScript
import {CodeCompress} from "@cley_faye/js-lzw/lib/core/codecompress";
import {CodeCompress} from "@cley_faye/js-lzw/lib/core/codecompress";

const input = [1, 2, 3, 4];
// Compression
const compress = CodeCompress.createSingleBytes();
const compressed = [];
input.forEach(inputCode => {
  const outputCodes = compress.addInput(inputCode);
  if (outputCodes) {
    compressed.push(...outputCodes);
  }
});
const finalCodes = compress.endInput();
if (finalCodes) {
  compressed.push(...finalCodes);
}
console.log(compressed);
// Decompression
const decompress = CodeD
const decompressed = [];
compressed.forEach(inputCode => {
  const outputCodes = decompress.addInput(inputCode);
  decompressed.push(...outputCodes);
});
console.log(decompressed);
```

### Usage in Uint8Array
Encoding of output codes into sequence of bits/bytes is also included.

Here's a basic example:

```JavaScript
import {Compress} from "@cley_faye/js-lzw/lib/buf8/compress";
import {Decompress} from "@cley_faye/js-lzw/lib/buf8/decompress";

const input = new Uint8Array([1, 2, 3, 4]);
// Compression
const compressed = Compress.compressBytes(input);
// Decompression
const decompressed = Decompress.decompressBytes(compressed);
```

Settings
--------
The library exposes most settings expected when handling LZW.
Most notably:

- Using a limit to the dictionary size can be done using the `maxCodeValue`
  argument, either when creating a custom dictionary or with helper functions.
- Outputing a "stop" code can be disabled with the `setStop` argument
- Using early change for bits output in byte buffer is controled with the
  `earlyChange` argument on the Uint8Array manipulation classes.
- Storage order (most significant bit first or not) is handled with the `msb`
  argument.
