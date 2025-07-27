import { FETCH_JSON_ERROR_CODE, TOKEN_EXPIRED_ERROR_CODE, TOKEN_NOT_FOUND_ERROR_CODE, UNSTABLE_NETWORK_ERROR_CODE, hasErrorMessage } from '~/lib/error';
import { RefreshProcessor, tokenManager } from './token-manger';

type BuildApiParams = {
  url: string;
  method: string;
  credentials?: RequestCredentials;
};
type ApiParams = {
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
};

const baseUrl = import.meta.env.VITE_API_URL + '/v1';
let _baseHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
const processRequestWithRefresh = RefreshProcessor();

export const buildApi = <T = unknown>({ url, method, credentials }: BuildApiParams) => {
  const api = async ({ params, query, body, headers }: ApiParams = {}): Promise<T> => {
    const apiEndpoint = new URL(baseUrl + url);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        apiEndpoint.pathname = apiEndpoint.pathname.replace(`:${key}`, String(value));
      });
    }
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        apiEndpoint.searchParams.set(key, String(value));
      });
    }

    let response: Response;
    try {
      response = await fetch(apiEndpoint, {
        method,
        credentials: credentials || 'omit',
        headers: {
          ..._baseHeaders,
          ...(headers && headers),
          ...(tokenManager.getAccessToken() && { Authorization: `Bearer ${tokenManager.getAccessToken()}` }),
        },
        ...(body && { body: JSON.stringify(body) }),
      });
    } catch (error) {
      throw {
        url,
        method,
        status: 400,
        code: UNSTABLE_NETWORK_ERROR_CODE,
        message: 'fetch error: ' + (hasErrorMessage(error) ? error.message : JSON.stringify(error)),
      };
    }

    let data: { code: number; message: T };
    try {
      data = await response.json();
    } catch (error) {
      throw {
        url,
        method,
        status: 400,
        code: FETCH_JSON_ERROR_CODE,
        message: 'response json error: ' + (hasErrorMessage(error) ? error.message : JSON.stringify(error)),
      };
    }

    if (!response.ok) {
      if (data.code === TOKEN_EXPIRED_ERROR_CODE || data.code === TOKEN_NOT_FOUND_ERROR_CODE) {
        return processRequestWithRefresh(() => api({ params, query, body, headers })) as Promise<T>;
      }
      throw { url, method, status: response.status, message: data.message, code: data.code };
    }

    return data.message;
  };

  return api;
};
