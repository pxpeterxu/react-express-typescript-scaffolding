import stringify from 'json-stringify-safe';
import serialize, { SerializeJSOptions } from 'serialize-javascript';

/**
 * Serialize some data to be included in a script tag:
 * removes circular references and makes sure that we escape
 * </script> tags
 */
export function serializeForScript(data: any, options?: SerializeJSOptions) {
  if (!options) options = {};
  return serialize(JSON.parse(stringify(data)), { ...options, isJSON: true });
}
