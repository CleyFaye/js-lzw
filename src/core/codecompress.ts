import {Dictionary} from "./dictionary";
import {CodeSequence} from "./types";

/**
 * Compress a sequence of input codes into a sequence of output codes
 */
export class CodeCompress {
  private dictionary: Dictionary;
  private currentSequence: CodeSequence = [];
  private maxCodeValue?: number;

  public constructor(
    dictionary: Dictionary,
    maxCodeValue?: number,
  ) {
    this.dictionary = dictionary;
    this.maxCodeValue = maxCodeValue;
  }

  public static createSingleBytes(
    maxCodeValue?: number,
    setStop = true,
  ): CodeCompress {
    return new CodeCompress(
      Dictionary.createSingleBytes(maxCodeValue !== undefined, setStop),
      maxCodeValue,
    );
  }

  /**
   * Return the current largest code value
   */
  public get currentMaxCode(): number {
    return this.dictionary.count - 1;
  }

  public get clearCode(): number | undefined {
    return this.dictionary.clearCode;
  }

  public get stopCode(): number | undefined {
    return this.dictionary.stopCode;
  }

  /**
   * Add an input code to the sequence
   *
   * If an output code is available it is returned.
   *
   * @return
   * If an array is returned it always contains either one or two code.
   * If there's two code, the second is always the clear code.
   * The clear code can not come first with two return values.
   */
  public addInput(code: number): Array<number> | undefined {
    if (code === this.clearCode) {
      let result;
      if (this.currentSequence.length > 0) {
        const currentSequenceCode = this.dictionary.find(this.currentSequence);
        if (currentSequenceCode === undefined) {
          throw new Error("Missing dictionary entry");
        }
        result = [currentSequenceCode, this.clearCode];
        this.currentSequence = [];
      } else {
        result = [this.clearCode];
      }
      this.dictionary.reset();
      return result;
    }
    this.currentSequence.push(code);
    const sequenceIndex = this.dictionary.find(this.currentSequence);
    if (sequenceIndex === undefined) {
      const newIndex = this.dictionary.find(this.currentSequence.slice(
        0,
        this.currentSequence.length - 1,
      ));
      if (newIndex === undefined) {
        throw new Error("Missing index?");
      }
      const addedIndex = this.dictionary.add(this.currentSequence);
      this.currentSequence = [this.currentSequence[this.currentSequence.length - 1]];
      if (this.maxCodeValue !== undefined && addedIndex === this.maxCodeValue) {
        this.dictionary.reset();
        return [newIndex, this.clearCode as number];
      }
      return [newIndex];
    }
  }

  /**
   * Close the input.
   *
   * If an output code is needed, it is returned.
   */
  public endInput(): Array<number> | undefined {
    const result = [];
    if (this.currentSequence.length > 0) {
      const sequenceIndex = this.dictionary.find(this.currentSequence);
      if (sequenceIndex === undefined) {
        throw new Error("Missing index");
      }
      result.push(sequenceIndex);
    }
    if (this.stopCode !== undefined) {
      result.push(this.stopCode);
    }
    return result.length === 0
      ? undefined
      : result;
  }
}
