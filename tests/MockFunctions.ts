import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import { getCurrentTest, getCurrentTestFile } from './TestState';
import { UnpackPromise } from '../common/types';
import { TestType, testTypeDescriptions } from './TestTypes';

const isCI = !!process.env.CI;

/** If specified, will re-run even if we do have a cached version */
const forceUpdateCache = process.env.UPDATE_MOCK_FUNCTIONS_CACHE;

/**
 * Create a function that will run for real for its first run and if
 * an environment variable is passed, but rely on saved cache data
 * otherwise (e.g., in CI)
 *
 * This will work fine for both JSONable data and plain Buffers. For
 * functions that return other data types, override the `serializeFile`
 * and `deserializeFile` functions.
 */
export function makeMockedPassThroughFunction<
  Fn extends (...args: any[]) => Promise<any>
>(
  origFunction: Fn,
  /** The __filename of the containing script */
  scriptFileName: string,
  options: {
    /**
     * By default, we cache every call of the underlying function. This allows
     * the user to disable storing to and using cache for some parameters.
     */
    shouldUseCache?: (...args: any) => boolean;
    /**
     * By default, we'll create cache files as upper-case camel-cased versions
     * of all arguments joined with underscores (truncated to 32 characters).
     * This allows overriding it
     */
    makeFilename?: (...args: any) => string;
    /**
     * By default, we use fs.readFileSync(JSON.parse(...)) to
     * deserialize content from files. This lets us override that
     */
    deserializeFile?: (filename: string) => UnpackPromise<ReturnType<Fn>>;
    /**
     * By default, we use fs.writeFileSync(filename, JSON.stringify(...), 'utf8') to
     * deserialize content from files. This lets us override that
     */
    serializeFile?: (
      filename: string,
      data: UnpackPromise<ReturnType<Fn>>,
    ) => any;
  } = {},
): Fn {
  return (async (...args: any) => {
    let shouldUseCache = allowCacheForCurrentTestType();
    if (options.shouldUseCache) {
      shouldUseCache = shouldUseCache && options.shouldUseCache(...args);
    }
    if (forceUpdateCache) shouldUseCache = false;

    // Initialize paths and variables
    const key = options.makeFilename
      ? options.makeFilename(...args)
      : defaultMakeFilename(...args);
    const deserialize = options.deserializeFile || defaultDeserializeFile;

    const parsed = path.parse(scriptFileName);
    const { name, dir } = parsed;

    const cacheDir = `${dir}/__testData__/${name}/${origFunction.name}`;

    // Depending on whether the response was JSON-serialized, we'll have either a
    // regular file or a JSON file
    const file = `${cacheDir}/${key}`;
    const jsonFile = `${file}.json`;

    // Fetch from cache if exists
    if (shouldUseCache) {
      if (fs.existsSync(file)) {
        return deserialize(file);
      } else if (fs.existsSync(jsonFile)) {
        return deserialize(jsonFile);
      }
    }

    throwIfInCI(
      `Detailed error: we couldn't find the missing cache file ${file}`,
    );

    const result = await origFunction(...args);

    // Write to cache if needed
    if (shouldUseCache) {
      fs.mkdirSync(cacheDir, { recursive: true });
      const serialize = options.serializeFile || defaultSerializeFile;
      serialize(file, result);
    }

    return result;
  }) as any;
}

/** We don't want to use the cache for network/manual tests */
function allowCacheForCurrentTestType() {
  const currentTest = getCurrentTest();
  if (!currentTest) {
    // This is usually the case if the test has already ended or timed out by
    // the time we get to this
    return false;
  }

  const testName = currentTest.fullName;

  const shouldNotCacheTestTypes: TestType[] = [TestType.network];
  const shouldNotCacheTestDescriptions = shouldNotCacheTestTypes.map(
    type => testTypeDescriptions[type],
  );

  for (const shouldNotCacheTestName of shouldNotCacheTestDescriptions) {
    if (testName.indexOf(shouldNotCacheTestName) !== -1) {
      return false;
    }
  }

  return true;
}

function defaultMakeFilename(...args: any) {
  const testFile = getCurrentTestFile();

  return args
    .map(
      (arg: any) =>
        `${testFile}-${_.upperFirst(
          _.camelCase(arg && arg.toString ? arg.toString() : ''),
        )}`,
    )
    .join('_');
}

/**
 * Return an error for developers that shows only in CI, asking them
 * to cache any network calls
 */
export function throwIfInCI(extraErrorText?: string) {
  if (isCI) {
    const instructions = [
      'To avoid hitting network resources in automated testing, we mock them out.',
      'Help us by adding mocked data:',
      '',
      '1. Run your test locally on your machine',
      '2. Add and commit the files in `__testData__` that get created/changed',
      '',
      'This will cache the results of your network calls for use in tests',
    ];

    if (extraErrorText) instructions.push(extraErrorText);

    throw new Error(instructions.join('\n'));
  }
}

/**
 * A smart file deserializer that will first try to decode as JSON,
 * and on failure, return the standard buffer
 */
function defaultDeserializeFile(filename: string) {
  const buffer = fs.readFileSync(filename);
  if (filename.endsWith('.json')) {
    try {
      return JSON.parse(buffer.toString('utf8'));
    } catch (err) {
      return buffer;
    }
  } else {
    return buffer;
  }
}

/**
 * A smart file serializer that will save buffers (binary data) as Buffers, and
 * everything else as JSON
 */
function defaultSerializeFile(filename: string, data: any) {
  if (data instanceof Buffer) {
    return fs.writeFileSync(filename, data);
  } else {
    return fs.writeFileSync(
      `${filename}.json`,
      JSON.stringify(data, null, 2),
      'utf8',
    );
  }
}
