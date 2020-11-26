/* @preserve
 * @license
 * @cley_faye/js-lzw: An LZW algorithm implementation in JavaScript
 * Copyright (C) 2020 Gabriel Paul "Cley Faye" Risterucci
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Return the number of bits required to store the given value
 */
export const bitsRequired = (value: number): number => value === 0
  ? 1
  : Math.floor(Math.log2(value)) + 1;

// eslint-disable-next-line func-style
function* getBits(msb: boolean, value: number, bitCount: number): Generator<boolean> {
  if (msb) {
    let mask = 1 << (bitCount - 1);
    while (mask > 0) {
      yield Boolean(value & mask);
      mask >>>= 1;
    }
  } else {
    let mask = 1;
    const maskMax = 1 << bitCount;
    while (mask < maskMax) {
      yield Boolean(value & mask);
      mask <<= 1;
    }
  }
}

export {getBits};

export const makeByte = (bits: Array<boolean>, msb: boolean): number => {
  let result = 0;
  for (const bit of (msb ? bits : bits.reverse())) {
    result <<= 1;
    if (bit) {
      result |= 1;
    }
  }
  return result;
};

export const merge = (buffers: Array<Uint8Array>): Uint8Array => {
  const outputSize = buffers.reduce(
    (acc, cur) => acc + cur.length,
    0,
  );
  const output = new Uint8Array(outputSize);
  let cursor = 0;
  buffers.forEach(buffer => {
    output.set(buffer, cursor);
    cursor += buffer.length;
  });
  return output;
};

export const createResultBuffer = (
  chunkSize: number,
  initialBuffer?: Uint8Array,
): Uint8Array => initialBuffer ?? new Uint8Array(chunkSize);
