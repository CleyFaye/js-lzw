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
