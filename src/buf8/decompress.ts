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
import {CodeDecompress} from "../core/codedecompress";
import {BYTE_WIDTH} from "./consts";
import {bitsRequired, createResultBuffer, getBits, makeByte} from "./utils";

export class Decompress {
  private codeDecompress: CodeDecompress;
  private earlyChange: boolean;
  /**
   * Are data stored MSB first
   */
  private msb: boolean;
  private pendingBits: Array<boolean> = [];

  public constructor(
    codeDecompress: CodeDecompress,
    earlyChange = false,
    msb = true,
  ) {
    this.codeDecompress = codeDecompress;
    this.earlyChange = earlyChange;
    this.msb = msb;
  }

  public static decompressBytes(
    input: Uint8Array,
    maxCodeValue?: number,
    setStop?: boolean,
    earlyChange?: boolean,
    msb?: boolean,
  ): Uint8Array {
    const decompress = new Decompress(
      CodeDecompress.createSingleBytes(maxCodeValue, setStop),
      earlyChange,
      msb,
    );
    return decompress.addInput(input);
  }

  public addInput(input: Uint8Array, initialResultBuffer?: Uint8Array): Uint8Array {
    let fieldWidth = bitsRequired(
      this.codeDecompress.currentMaxCode + (this.earlyChange ? 1 : 0),
    );
    // The initial result buffer use some pessimistic size ;)
    const chunkMultiplier = 1.5;
    const resultChunkSize = input.length * chunkMultiplier;
    let resultBuffer = createResultBuffer(resultChunkSize, initialResultBuffer);
    let cursor = 0;
    for (const inputByte of input) {
      this.addBytes(inputByte);
      while (this.pendingBits.length >= fieldWidth) {
        const nextCode = this.extractCode(fieldWidth);
        const nextOutput = this.codeDecompress.addInput(nextCode);
        fieldWidth = bitsRequired(
          this.codeDecompress.currentMaxCode + (this.earlyChange ? 1 : 0),
        );
        // Append nextOutput to resultBuffer
        if ((cursor + nextOutput.length) > resultBuffer.length) {
          const nextResultBuffer = new Uint8Array(resultBuffer.length + resultChunkSize);
          nextResultBuffer.set(resultBuffer);
          resultBuffer = nextResultBuffer;
        }
        resultBuffer.set(nextOutput, cursor);
        cursor += nextOutput.length;
      }
    }
    return resultBuffer.slice(0, cursor);
  }

  /**
   * Add a byte to the bit input
   */
  private addBytes(inputByte: number): void {
    this.pendingBits.push(...getBits(true, inputByte, BYTE_WIDTH));
  }

  /**
   * Return the next code using the given number of bits
   *
   * No check are done, fieldWidth must be checked by the caller
   */
  private extractCode(fieldWidth: number): number {
    const result = makeByte(this.pendingBits.splice(0, fieldWidth), this.msb);
    return result;
  }
}
