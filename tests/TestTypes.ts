/**
 * Define a type of test that should be skipped unless
 * TEST_TYPES=blah is passed
 */
export enum TestType {
  /**
   * For example, have certain tests that hit real APIs not run
   * automatically unless TEST_TYPES=network is specified
   */
  network = 'network',
}

export const testTypeDescriptions: { [type in TestType]: string } = {
  network: 'tests that make real network calls',
};

/** Get the types of tests we should run based on environment variables */
const testTypesToRun = new Set<TestType>((process.env.TEST_TYPES || '').split(
  ',',
) as TestType[]);

/** Return whether we should run a certain test type */
export function shouldRunTestType(testType: TestType) {
  return testTypesToRun.has(testType);
}

export interface DescribeTestOptions {
  /**
   * Normally, to skip tests, we use describe.skip. This will actually totally omit
   * adding the code; useful for e.g., beforeAll/afterAll blocks that still run
   * even when skipped
   */
  hide?: boolean;
}

const loggedMessageForType: { [testType in TestType]?: boolean } = {};

/**
 * Wrap certain tests to be run only when TEST_TYPES is set to include
 * the specified TestType (and not run by default)
 */
export function describeTestType(
  testType: TestType,
  testBody: jest.EmptyFunction,
  {
    runMessage,
    hide,
  }: {
    /**
     * By default, if the test is skipped, we show a message saying
     * ```
     * Skipping <name>: run yarn cross-env TEST_TYPES=<type>,<another_type> to run
     * ```
     * If this is provided, we'll instead prompt with it
     */
    runMessage?: string;
  } & DescribeTestOptions = {},
) {
  const shouldRun = shouldRunTestType(testType);
  const description = testTypeDescriptions[testType];
  if (shouldRun) {
    return describe(description, testBody);
  } else if (!hide) {
    if (!loggedMessageForType[testType]) {
      loggedMessageForType[testType] = true;
      console.warn(
        [
          `Note: skipping ${description}`,
          ...(runMessage
            ? [runMessage]
            : [
                'If you want to run it, run',
                `yarn cross-env TEST_TYPES=${testType} yarn jest`,
                'or',
                `yarn cross-env TEST_TYPES=${testType} yarn test`,
              ]),
        ].join('\n'),
      );
    }
    return describe.skip(description, testBody);
  }

  return undefined;
}
