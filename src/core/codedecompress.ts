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
import {Dictionary} from "./dictionary";
import {CodeSequence} from "./types";

/**
 * Decompress a sequence of output codes into the original sequence of input codes
 */
export class CodeDecompress {
  private dictionary: Dictionary;
  private lastCode?: number;
  private maxCodeValue?: number;

  private constructor(dictionary: Dictionary, maxCodeValue?: number) {
    this.dictionary = dictionary;
    this.maxCodeValue = maxCodeValue;
  }

  public static createSingleBytes(
    maxCodeValue?: number,
    setStop = true,
  ): CodeDecompress {
    return new CodeDecompress(
      Dictionary.createSingleBytes(maxCodeValue !== undefined, setStop),
      maxCodeValue,
    );
  }

  public get currentMaxCode(): number {
    return this.dictionary.count - 1;
  }

  public get stopCode(): number | undefined {
    return this.dictionary.stopCode;
  }

  /**
   * Decode an input code.
   *
   * Passing the clear code will reset the dictionary but not output anything.
   * In that case an empty array is returned.
   */
  public addInput(code: number): CodeSequence {
    if (this.maxCodeValue !== undefined && code === this.dictionary.clearCode) {
      this.lastCode = undefined;
      this.dictionary.reset();
      return [];
    }
    if (this.lastCode !== undefined) {
      const previousSequence = this.dictionary.get(this.lastCode);
      this.lastCode = code;
      if (!previousSequence) {
        throw new Error("Should not happen");
      }
      const currentSequence = this.dictionary.get(code);
      const lastCharacter = currentSequence
        ? currentSequence[0]
        : previousSequence[0];
      const newSequence = [...previousSequence, lastCharacter];
      this.dictionary.add(newSequence);
      const result = currentSequence
        ? currentSequence
        : newSequence;
      if (result[result.length - 1] === this.stopCode) {
        result.length -= 1;
      }
      return result;
    }
    this.lastCode = code;
    const result = this.dictionary.get(code);
    if (!result) {
      throw new Error("Unknown sequence code");
    }
    return result;
  }
}
