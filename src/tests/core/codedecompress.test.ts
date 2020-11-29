import assert from "assert";
import {CodeDecompress} from "../../core/codedecompress";
import {bytesFixtures} from "./fixtures";
import {getOutputFromByteFixture} from "./utils";

const testBytesDictionaryWith = (useReset: boolean, useStop: boolean) => {
  bytesFixtures.forEach((fixture, id) => {
    it(`#${id}`, () => {
      const codeDecompress = CodeDecompress.createSingleBytes(
        useReset,
        useStop,
      );
      const input = getOutputFromByteFixture(
        fixture,
        useReset,
        useStop,
      );
      const decompressed = [];
      for (const inputCode of input) {
        const outputCode = codeDecompress.addInput(inputCode);
        decompressed.push(...outputCode);
        if (useReset && codeDecompress.currentMaxCode > fixture.maxCode) {
          assert.fail("Max emitted code greater than max expected code");
        }
      }
      assert.deepStrictEqual(decompressed, fixture.input);
      // This is mostly a getter test for coverage, no need to be extensive
      if (useReset && useStop) {
        assert.strictEqual(codeDecompress.currentMaxCode, fixture.expectedMaxCode);
      }
    });
  });
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

const testCodeDecompress = () => {
  describe("Bytes dictionary", testBytesDictionary);
};

describe("core/CodeDecompress", testCodeDecompress);
