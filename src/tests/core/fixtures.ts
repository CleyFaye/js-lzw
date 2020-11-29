/* eslint-disable @typescript-eslint/no-magic-numbers */

export interface ByteFixture {
  input: Array<number>;
  output: Array<number>;
  maxCode: number;
  /**
   * The expected max code with reset and stop
   */
  expectedMaxCode: number;
  outputStop: Array<number>;
  outputReset: Array<number>;
  outputStopReset: Array<number>;
}

// Obviously not good tests. No time to do them now.
export const bytesFixtures: Array<ByteFixture> = [
  {
    input: [1, 2, 3, 4, 5],
    output: [1, 2, 3, 4, 5],
    maxCode: 4096,
    expectedMaxCode: 261,
    outputStop: [1, 2, 3, 4, 5, 256],
    outputReset: [1, 2, 3, 4, 5],
    outputStopReset: [1, 2, 3, 4, 5, 257],
  },
  {
    input: [],
    output: [],
    maxCode: 4096,
    expectedMaxCode: 257,
    outputStop: [256],
    outputReset: [],
    outputStopReset: [257],
  },
  {
    input: [1, 1, 2, 3, 4, 1, 1, 1, 2, 6],
    output: [1, 1, 2, 3, 4, 256, 257, 6],
    maxCode: 4096,
    expectedMaxCode: 264,
    outputStop: [1, 1, 2, 3, 4, 257, 258, 6, 256],
    outputReset: [1, 1, 2, 3, 4, 257, 258, 6],
    outputStopReset: [1, 1, 2, 3, 4, 258, 259, 6, 257],
  },
  {
    input: [
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      2,
      1,
      1,
    ],
    output: [1, 256, 257, 258, 259, 260, 2, 256],
    maxCode: 259,
    expectedMaxCode: 258,
    outputStop: [1, 257, 258, 259, 260, 261, 2, 257, 256],
    outputReset: [1, 257, 258, 259, 256, 1, 257, 258, 259, 256, 1, 2, 1, 1],
    outputStopReset: [
      1, 258, 259, 256, 1, 258, 259, 256, 1, 258, 259, 256, 1, 258, 2, 256, 1, 1, 257,
    ],
  },
];

// Test a manual reset of the table (with reset and stop)
export const testForceReset = {
  input: [1, 1, 1, 1, 256, 1, 2, 3],
  output: [1, 258, 1, 256, 1, 2, 3, 257],
};

/*
Sequence for 1,1,1...,2
| id | input | current     | emit | new entry      |
| -- | ----- | ----------- | ---- | -------------- |
|  0 |     1 |           1 |      |                |
|  1 |     1 |        [1]1 |    1 | 256=11         |
|  2 |     1 |          11 |      |                |
|  3 |     1 |       [11]1 |  256 | 257=111        |
|  4 |     1 |          11 |      |                |
|  5 |     1 |         111 |      |                |
|  6 |     1 |      [111]1 |  257 | 258=1111       |
|  7 |     1 |          11 |      |                |
|  8 |     1 |         111 |      |                |
|  9 |     1 |        1111 |      |                |
| 10 |     1 |     [1111]1 |  258 | 259=11111      |
| 11 |     1 |          11 |      |                |
| 12 |     1 |         111 |      |                |
| 13 |     1 |        1111 |      |                |
| 14 |     1 |       11111 |      |                |
| 15 |     1 |    [11111]1 |  259 | 260=111111     |
| 16 |     1 |          11 |      |                |
| 17 |     1 |         111 |      |                |
| 18 |     1 |        1111 |      |                |
| 19 |     1 |       11111 |      |                |
| 20 |     1 |      111111 |      |                |
| 21 |     2 |   [111111]2 |  260 |                |
| 22 |     1 |        [2]1 |    2 | 261=21         |
| 23 |     1 |        [11] |  256 |                |
|    |       |             | STOP |                |

Sequence for 1,1,1...,2 with max 259
| id | input | current     | emit | new entry      |
| -- | ----- | ----------- | ---- | -------------- |
|  0 |     1 |           1 |      |                |
|  1 |     1 |        [1]1 |    1 | 257=11         |
|  2 |     1 |          11 |      |                |
|  3 |     1 |       [11]1 |  257 | 258=111        |
|  4 |     1 |          11 |      |                |
|  5 |     1 |         111 |      |                |
|  6 |     1 |      [111]1 |  258 | 259=1111       |
|  7 |     1 |          11 |      |                |
|  8 |     1 |         111 |      |                |
|  9 |     1 |        1111 |      |                |
| 10 |     1 |     [1111]1 |  259 | RESET          |
| 11 |     1 |        [1]1 |    1 | 257=11         |
| 12 |     1 |          11 |      |                |
| 13 |     1 |       [11]1 |  257 | 258=111        |
| 14 |     1 |          11 |      |                |
| 15 |     1 |         111 |      |                |
| 16 |     1 |      [111]1 |  258 | 259=1111       |
| 17 |     1 |          11 |      |                |
| 18 |     1 |         111 |      |                |
| 19 |     1 |        1111 |      |                |
| 20 |     1 |     [1111]1 |  259 | RESET          |
| 21 |     2 |        [1]2 |    1 | 257=12         |
| 22 |     1 |        [2]1 |    2 | 258=21         |
| 23 |     1 |        [1]1 |    1 | 259=11         |
|    |       |         [1] |    1 |                |
|    |       |             | STOP |                |

Sequence for 1,1,1...,2 with max 259 and STOP
| id | input | current     | emit | new entry      |
| -- | ----- | ----------- | ---- | -------------- |
|  0 |     1 |           1 |      |                |
|  1 |     1 |        [1]1 |    1 | 258=11         |
|  2 |     1 |          11 |      |                |
|  3 |     1 |       [11]1 |  258 | 259=111        |
|  4 |     1 |          11 |      |                |
|  5 |     1 |         111 |      |                |
|  6 |     1 |      [111]1 |  259 | RESET          |
|  7 |     1 |        [1]1 |    1 | 258=11         |
|  8 |     1 |          11 |      |                |
|  9 |     1 |       [11]1 |  258 | 259=111        |
| 10 |     1 |          11 |      |                |
| 11 |     1 |         111 |      |                |
| 12 |     1 |      [111]1 |  259 | RESET          |
| 13 |     1 |        [1]1 |    1 | 258=11         |
| 14 |     1 |          11 |      |                |
| 15 |     1 |       [11]1 |  258 | 259=111        |
| 16 |     1 |          11 |      |                |
| 17 |     1 |         111 |      |                |
| 18 |     1 |      [111]1 |  259 | RESET          |
| 19 |     1 |        [1]1 |    1 | 258=11         |
| 20 |     1 |          11 |      |                |
| 21 |     2 |       [11]2 |  258 | 259=112        |
| 22 |     1 |        [2]1 |    2 | RESET          |
| 23 |     1 |        [1]1 |    1 | 258=11         |
|    |       |         [1] |    1 |                |
|    |       |             | STOP |                |

*/
