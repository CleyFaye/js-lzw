import {CodeCompress} from "../core/codecompress";
import {BYTE_WIDTH} from "./consts";
import {bitsRequired, createResultBuffer, getBits, merge} from "./utils";

export class Compress {
  private codeCompress: CodeCompress;
  private earlyChange: boolean;
  /**
   * Should we write the output MSB first
   */
  private msb: boolean;
  /**
   * Next byte value to add to the output, being constructed with incoming codes
   */
  private nextByte = 0;
  /**
   * Next bit index
   */
  private nextBit = 0;
  /**
   * Detect the first input
   */
  private firstInput = true;

  public constructor(
    codeCompress: CodeCompress,
    earlyChange = false,
    msb = true,
  ) {
    this.codeCompress = codeCompress;
    this.earlyChange = earlyChange;
    this.msb = msb;
  }

  public static compressBytes(
    input: Uint8Array,
    maxCodeValue?: number,
    setStop?: boolean,
    earlyChange?: boolean,
    msb?: boolean,
  ): Uint8Array {
    const compress = new Compress(
      CodeCompress.createSingleBytes(maxCodeValue, setStop),
      earlyChange,
      msb,
    );
    const compressedBuffer = compress.addInput(input);
    const end = compress.endInput();
    return merge([compressedBuffer, end]);
  }

  /**
   * Compress some input.
   *
   * Will return the completely generated codes as a buffer.
   *
   * @param initialResultBuffer
   * A buffer to use to store the output.
   * This buffer will be used initially but might be replaced if the output is larger.
   * The final output is always in the returned buffer.
   */
  public addInput(
    input: Uint8Array,
    initialResultBuffer?: Uint8Array,
  ): Uint8Array {
    let initialFieldWidth = bitsRequired(this.codeCompress.currentMaxCode);
    // The initial result buffer use some optimistic size
    const chunkDivisor = 3;
    const resultChunkSize = input.length / chunkDivisor;
    let resultBuffer = createResultBuffer(resultChunkSize, initialResultBuffer);
    let cursor = 0;
    for (const inputCode of input) {
      let nextOutput;
      if (this.firstInput && this.codeCompress.clearCode !== undefined) {
        const clearOutput = this.codeCompress.addInput(this.codeCompress.clearCode);
        const dataOutput = this.codeCompress.addInput(inputCode);
        nextOutput = [
          ...clearOutput ? clearOutput : [],
          ...dataOutput ? dataOutput : [],
        ];
      } else {
        nextOutput = this.codeCompress.addInput(inputCode);
      }
      this.firstInput = false;
      if (nextOutput === undefined) {
        continue;
      }
      const newFieldWidth = bitsRequired(this.codeCompress.currentMaxCode);
      const extraBytesRequired = (newFieldWidth * nextOutput.length) / BYTE_WIDTH;
      if ((cursor + extraBytesRequired) >= resultBuffer.length) {
        // Increase result buffer to accomodate more data
        const nextResultBuffer = new Uint8Array(resultBuffer.length + resultChunkSize);
        nextResultBuffer.set(resultBuffer);
        resultBuffer = nextResultBuffer;
      }
      cursor = this.addToResult(
        resultBuffer,
        cursor,
        nextOutput,
        this.earlyChange
          ? newFieldWidth
          : initialFieldWidth,
      );
      initialFieldWidth = newFieldWidth;
    }
    return resultBuffer.slice(0, cursor);
  }

  /**
   * Must be called once to complete the output
   */
  public endInput(): Uint8Array {
    const finalCodes = this.codeCompress.endInput();
    const result = new Uint8Array(bitsRequired(this.codeCompress.currentMaxCode) + 1);
    let cursor = 0;
    if (finalCodes !== undefined) {
      cursor = this.addToResult(
        result,
        cursor,
        finalCodes,
        bitsRequired(this.codeCompress.currentMaxCode),
      );
    }

    if (this.nextBit !== 0) {
      this.nextByte <<= (BYTE_WIDTH - this.nextBit);
      result[cursor++] = this.nextByte;
    }
    return result.slice(0, cursor);
  }

  private addToResult(
    buffer: Uint8Array,
    initialCursor: number,
    values: Array<number>,
    fieldWidth: number,
  ): number {
    let cursor = initialCursor;
    const bits = [];
    for (const value of values) {
      for (const bitValue of getBits(this.msb, value, fieldWidth)) {
        this.nextByte <<= 1;
        bits.push(bitValue ? 1 : 0);
        if (bitValue) {
          this.nextByte |= 1;
        }
        ++this.nextBit;
        if (this.nextBit === BYTE_WIDTH) {
          buffer[cursor++] = this.nextByte;
          this.nextBit = 0;
          this.nextByte = 0;
        }
      }
    }
    return cursor;
  }
}
