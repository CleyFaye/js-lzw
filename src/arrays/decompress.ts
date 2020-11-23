/*!
 * @preserve
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
import {CodeSequence} from "../core/types";

export class Decompress {
  private codeDecompress: CodeDecompress;

  public constructor(codeDecompress: CodeDecompress) {
    this.codeDecompress = codeDecompress;
  }

  public static createBytesDecompressor(
    maxCodeValue?: number,
    setStop = true,
  ): Decompress {
    return new Decompress(CodeDecompress.createSingleBytes(maxCodeValue, setStop));
  }

  public static decompressBytes(
    input: CodeSequence,
    maxCodeValue?: number,
    setStop = true,
  ): Array<number> {
    const decompressor = Decompress.createBytesDecompressor(maxCodeValue, setStop);
    return decompressor.addInput(input);
  }

  /**
   * Add multiple input codes from an array
   */
  public addInput(codes: CodeSequence): CodeSequence {
    return codes.reduce<Array<number>>(
      (result, code) => result.concat(this.codeDecompress.addInput(code)),
      [],
    );
  }
}
