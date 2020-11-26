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
import {CodeSequence} from "./types";

const MAX_NUMBER_BASE = 36;

/**
 * Store a map of existing code sequences and allow searching for their index
 */
export class CodeSequenceMap {
  private entries: Map<string, number>;

  public constructor() {
    this.entries = new Map<string, number>();
  }

  private static serializeCodeSequence(sequence: CodeSequence): string {
    return sequence.map(code => code.toString(MAX_NUMBER_BASE)).join(".");
  }

  public add(sequence: CodeSequence, index: number): void {
    this.entries.set(
      CodeSequenceMap.serializeCodeSequence(sequence),
      index,
    );
  }

  public find(sequence: CodeSequence): number | undefined {
    return this.entries.get(CodeSequenceMap.serializeCodeSequence(sequence));
  }

  public clear(): void {
    this.entries.clear();
  }
}
