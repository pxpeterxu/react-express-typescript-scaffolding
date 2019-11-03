// We use axios for front-end HTTP requests
import { AxiosError } from 'axios';

// We use request-promise-native for back-end HTTP requests
import { StatusCodeError } from 'request-promise-native/errors';
import { OptionsWithUrl } from 'request-promise-native';

/** Log an error, including the HTTP request/response data if relevant */
export function logError(
  loggerFunc: Function,
  err: AxiosError | Error,
  storytime?: Object,
) {
  const axiosError = err as AxiosError;
  const dbError = err as any;
  if (err.name === 'StatusCodeError' || err instanceof StatusCodeError) {
    const statusError = err as StatusCodeError;
    const options = statusError.options as OptionsWithUrl;
    loggerFunc(err.stack, {
      statusCode: statusError.statusCode,
      response: statusError.response && (statusError.response as any).body,
      url: options.url,
      qs: options.qs,
    });
  } else if (axiosError.response) {
    const response = axiosError.response;
    loggerFunc(axiosError.stack, {
      ...storytime,
      ...(response.config
        ? {
            url: response.config.url,
            params: response.config.params,
            response: response.data,
            // Don't log POST data or headers: more sensitive
          }
        : {}),
    });
  } else {
    loggerFunc(err instanceof Error ? err.stack : err, {
      ...storytime,
      ...(dbError.sql ? { sql: dbError.sql } : {}),
      ...(typeof dbError.message === 'function'
        ? { dbMessage: dbError.message() }
        : {}),
    });
  }
}
