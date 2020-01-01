import { OptionsWithUrl } from 'request-promise-native';
import _ from 'lodash';
import crypto from 'crypto';
import stableStringify from 'fast-json-stable-stringify';
import { makeMockedPassThroughFunction } from '../../tests/MockFunctions';
import { getCurrentTestFile } from '../../tests/TestState';

const rp = require.requireActual('request-promise-native');

/**
 * Creates a smaller set of options to stringify, since some options like
 * `jar` can change every time.
 */
function getMinimalOptions(options: OptionsWithUrl) {
  const {
    url,
    method,
    qs,
    headers,
    form,
    formData,
    body,
    json,
    multipart,
  } = options;

  // Don't require tests to change when we change the crawler reported
  // user-agent, which may happen as browsers update
  const minimalHeaders = headers
    ? _.omit(headers, ['User-Agent', 'user-agent'])
    : headers;
  return {
    url,
    method,
    qs,
    headers: minimalHeaders,
    form,
    formData,
    body,
    json,
    multipart,
  };
}

/**
 * For tests, cache the results of request-promise requests so
 * that they run faster and don't hit any sites or DoS anyone
 */
const modifiedRp = makeMockedPassThroughFunction(rp, __filename, {
  shouldUseCache: (options: OptionsWithUrl) => {
    // Google Maps APIs have a token in the URL that changes
    const url = options.url.toString();
    if (url.startsWith('https://www.google.com/maps')) {
      return false;
    }

    return true;
  },
  makeFilename: ((options: OptionsWithUrl) => {
    const url = new URL((options.url as string) || '');
    const host = url.host;
    const hashed = crypto
      .createHash('md5')
      .update(stableStringify(getMinimalOptions(options)))
      .digest('hex')
      .substr(0, 8);
    const testFile = getCurrentTestFile();

    return `${testFile}_${host}_${hashed}`;
  }) as any,
});

modifiedRp.jar = rp.jar;

export default modifiedRp;
