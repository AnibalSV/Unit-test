import { buildUrl, handleError, handleJson } from './utils';

interface FetchProps {
  url       : string
  urlParams?: Record<string, string>
  baseUrl?  : string
  method?   : string
  headers?  : Record<string, string>
  body?     : Record<string, string>
  transform?: (data: any) => any
}

/**
 * Wrapper around fetch that handles JSON and errors
 */
export const fetcher = ({ url, urlParams, baseUrl, ...fetchProps }: FetchProps) => {
  const fullUrl = buildUrl(url, urlParams, baseUrl);

  const { body, method, headers } = fetchProps;
  let promise = fetch(fullUrl, {
    body   : typeof body !== 'string' ? JSON.stringify(body) : body,
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    method
  }).then(handleError).then(handleJson);

  if (fetchProps.transform) {
    promise = promise.then(fetchProps.transform);
  }

  return promise;
};

export const get  = (props: FetchProps) => fetcher({ ...props, method: 'GET' });
export const post = (props: FetchProps) => fetcher({ ...props, method: 'POST' });
export const put  = (props: FetchProps) => fetcher({ ...props, method: 'PUT' });
export const del  = (props: FetchProps) => fetcher({ ...props, method: 'DELETE' });

export default fetcher;
