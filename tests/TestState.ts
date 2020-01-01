import path from 'path';

/** Information about the current test that's running */
export interface TestInfo {
  /** Random unique identifier, like `spec6` */
  id: string;
  /**
   * Description inside the it('') call, like
   * `fetches data for #sanfrancisco`
   */
  description: string;
  /**
   * Concatenated description, consisting of any describe() and it() contents
   * like `network-based test fetchHashtagPosts fetches data for #sanfrancisco`
   */
  fullName: string;
  failedExpectations: any[];
  passedExpectations: any[];
  pendingReason: string;
  /** Full path to test file */
  testPath: string;
}

export interface SuiteInfo {
  /** unique identifier, like `suite1` */
  id: string;
  /**
   * Description inside the it('') call, like
   * `fetches data for #sanfrancisco`
   */
  description: string;
  /**
   * Concatenated description, consisting of any describe() and parent contents
   * like `network-based test fetchHashtagPosts`
   */
  fullName: string;
  failedExpectations: any[];
  /** Full path to test file */
  testPath: string;
}

let currentTest: TestInfo | null = null;
let currentSuite: SuiteInfo | null = null;

export function setCurrentTest(currentTestToSet: TestInfo) {
  currentTest = currentTestToSet;
}

export function setCurrentSuite(currentSuiteToSet: SuiteInfo) {
  currentSuite = currentSuiteToSet;
}

export function clearCurrentTest() {
  currentTest = null;
}

export function clearCurrentSuite() {
  currentSuite = null;
}

export function getCurrentTest() {
  return currentTest;
}

export function getCurrentSuite() {
  return currentSuite;
}

export function getCurrentTestFile() {
  return currentSuite
    ? path.basename(currentSuite.testPath)
    : // In theory, no files should ever be saved in this case because
      // `shouldUseCache` above will return false. We return rather than
      // throw to avoid emitting errors in that case
      'unknownTestFileDeleteThis';
}
