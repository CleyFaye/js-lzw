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
