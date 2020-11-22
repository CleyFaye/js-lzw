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
    setStop = true,
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
    setStop = true,
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
