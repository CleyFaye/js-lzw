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
import {CodeSequenceMap} from "./codesequencemap";
import {CodeSequence} from "./types";

export class Dictionary {
  /**
   * Initial value for reset
   */
  private initialEntries: Array<CodeSequence>;

  /**
   * All entries in the dictionary
   */
  private entries: Array<CodeSequence> = [];

  /**
   * Mapping between code sequence and entry index.
   *
   * Code sequences are serialized as a string for comparison.
   */
  private entriesReverse: CodeSequenceMap = new CodeSequenceMap();

  /**
   * Value of the clear code, stored for convenience
   */
  private clearCodeValue?: number;

  /**
   * Value of the stop code, stored for convenience
   */
  private stopCodeValue?: number;

  public constructor(
    initialEntries: Array<CodeSequence>,
    clearCode?: number,
    stopCode?: number,
  ) {
    this.initialEntries = initialEntries;
    this.clearCodeValue = clearCode;
    this.stopCodeValue = stopCode;
    this.reset();
  }

  /**
   * Return the current number of entries
   */
  public get count(): number {
    return this.entries.length;
  }

  public get clearCode(): number | undefined {
    return this.clearCodeValue;
  }

  public get stopCode(): number | undefined {
    return this.stopCodeValue;
  }

  /**
   * Create a dictionary for bytes encoding.
   * The first 256 entries represents bytes from 0 to 255.
   *
   * @param setClearAndStop
   * Add two codes as 256 and 257 repectively for CLEAR and STOP.
   */
  public static createSingleBytes(
    setClear = true,
    setStop = true,
  ): Dictionary {
    const BYTES_COUNT = 256;
    let CLEAR_CODE;
    let STOP_CODE;
    const sequences = [];
    for (let i = 0; i < BYTES_COUNT; ++i) {
      sequences.push([i]);
    }
    if (setClear) {
      CLEAR_CODE = sequences.length;
      sequences.push([CLEAR_CODE]);
    }
    if (setStop) {
      STOP_CODE = sequences.length;
      sequences.push([STOP_CODE]);
    }
    return new Dictionary(
      sequences,
      CLEAR_CODE,
      STOP_CODE,
    );
  }

  /**
   * Add a new sequence to the dictionary and returns its index
   */
  public add(sequence: CodeSequence): number {
    const newIndex = this.entries.length;
    this.entries.push(sequence);
    this.entriesReverse.add(sequence, newIndex);
    return newIndex;
  }

  /**
   * Return the index of an existing sequence
   */
  public find(sequence: CodeSequence): number | undefined {
    return this.entriesReverse.find(sequence);
  }

  /**
   * Return a sequence from an index code
   */
  public get(index: number): CodeSequence | undefined {
    return this.entries[index];
  }

  /**
   * Reset the dictionary to the initial state
   */
  public reset(): void {
    this.entries.length = 0;
    this.entriesReverse.clear();
    this.initialEntries.forEach(entry => {
      this.add(entry);
    });
  }
}
