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

  /**
   * Decode multiple inputs code
   */
  public addInputs(codes: Array<number>): CodeSequence {
    return codes.reduce<CodeSequence>(
      (result, code) => {
        const codeOutput = this.addInput(code);
        return result.concat(codeOutput);
      },
      [],
    );
  }
}
