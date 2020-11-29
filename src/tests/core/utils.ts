import {ByteFixture} from "./fixtures";

export const getOutputFromByteFixture = (
  fixture: ByteFixture,
  useReset: boolean,
  useStop: boolean,
): Array<number> => {
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
