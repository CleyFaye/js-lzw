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
import {CodeCompress} from "../core/codecompress";
import {CodeSequence} from "../core/types";

/**
 * Compress an array of codes
 */
export class Compress {
  private codeCompress: CodeCompress;

  public constructor(codeCompress: CodeCompress) {
    this.codeCompress = codeCompress;
  }

  public static createBytesCompressor(
    maxCodeValue?: number,
    setStop?: boolean,
  ): Compress {
    return new Compress(
      CodeCompress.createSingleBytes(maxCodeValue, setStop),
    );
  }

  /**
   * Compress an array of bytes into an array of codes
   */
  public static compressBytes(
    input: Array<number>,
    maxCodeValue?: number,
    setStop?: boolean,
  ): CodeSequence {
    const compressor = Compress.createBytesCompressor(maxCodeValue, setStop);
    const result = compressor.addInput(input);
    const endValue = compressor.endInput();
    if (endValue !== undefined) {
      result.push(...endValue);
    }
    return result;
  }

  /**
   * Add multiple input codes from an array
   */
  public addInput(codes: Array<number>): CodeSequence {
    return codes.reduce<Array<number>>(
      (result, code) => {
        const newValue = this.codeCompress.addInput(code);
        if (newValue !== undefined) {
          result.push(...newValue);
        }
        return result;
      },
      [],
    );
  }

  /**
   * Close the input.
   *
   * If a last output code is needed, it is returned here.
   */
  public endInput(): Array<number> | undefined {
    return this.codeCompress.endInput();
  }
}
