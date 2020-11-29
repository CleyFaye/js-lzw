/* eslint-disable @typescript-eslint/no-magic-numbers */
import assert from "assert";
import {CodeCompress} from "../../core/codecompress";
import {
  ByteFixture,
  bytesFixtures,
  testForceReset as forceFixture,
} from "./fixtures";

const createCodeCompressBytes = (
  fixture: ByteFixture,
  useReset: boolean,
  useStop: boolean,
): CodeCompress => CodeCompress.createSingleBytes(
  useReset ? fixture.maxCode : undefined,
  useStop,
);

const getOutput = (fixture:ByteFixture, useReset: boolean, useStop: boolean): Array<number> => {
  if (useReset) {
    if (useStop) {
      return fixture.outputStopReset;
    }
    return fixture.outputReset;
  }
  if (useStop) {
    return fixture.outputStop;
  }
  return fixture.output;
};

const testFixtures = (prefixReset: boolean, useReset: boolean, useStop: boolean) => {
  bytesFixtures.forEach((fixture, id) => {
    it(`#${id}`, () => {
      const codeCompress = createCodeCompressBytes(fixture, useReset, useStop);
      const output = getOutput(fixture, useReset, useStop);
      const compressed = [];
      if (prefixReset && codeCompress.clearCode !== undefined) {
        const outputCode = codeCompress.addInput(codeCompress.clearCode);
        assert.deepStrictEqual(outputCode, [codeCompress.clearCode]);
      }
      for (const inputCode of fixture.input) {
        const outputCode = codeCompress.addInput(inputCode);
        compressed.push(...outputCode);
        if (useReset && codeCompress.currentMaxCode > fixture.maxCode) {
          assert.fail("Max emitted code greater than max expected code");
        }
      }
      const outputCode = codeCompress.endInput();
      compressed.push(...outputCode);
      assert.deepStrictEqual(compressed, output);
      // This is mostly a getter test for coverage, no need to be extensive
      if (useReset && useStop) {
        assert.strictEqual(codeCompress.currentMaxCode, fixture.expectedMaxCode);
      }
    });
  });
};

/**
 * Process the bytes test fixtures
 */
const testBytesDictionaryWith = (useReset: boolean, useStop: boolean) => {
  if (useReset) {
    describe("Without prepending reset", () => testFixtures(false, true, useStop));
    describe("With prepending reset", () => testFixtures(true, true, useStop));
  } else {
    testFixtures(false, false, useStop);
  }
};

const testBytesDictionary = () => {
  for (const stop of [false, true]) {
    for (const reset of [false, true]) {
      describe(
        `Stop: ${stop ? "true" : "false"}, Reset: ${reset ? "true" : "false"}`,
        () => testBytesDictionaryWith(reset, stop),
      );
    }
  }
};

const testForceReset = () => {
  const codeCompress = CodeCompress.createSingleBytes(4096, true);
  const compressed = [];
  for (const inputCode of forceFixture.input) {
    const outputCodes = codeCompress.addInput(inputCode);
    compressed.push(...outputCodes);
  }
  const outputCodes = codeCompress.endInput();
  compressed.push(...outputCodes);
  assert.deepStrictEqual(compressed, forceFixture.output);
};

const testCodeCompress = () => {
  describe("Bytes dictionary", testBytesDictionary);
  it("Force reset", testForceReset);
};

describe("core/CodeCompress", testCodeCompress);
