import { FETCH_JSON_ERROR_CODE, TOKEN_EXPIRED_ERROR_CODE, TOKEN_NOT_FOUND_ERROR_CODE, UNSTABLE_NETWORK_ERROR_CODE, hasErrorMessage } from '~/lib/error';
import { RefreshProcessor } from './pending-request'
import { BASE_URL } from '~/constants';
import { tokenManager } from './token-manger';
import { globalErrorHandler } from '~/providers/error-handler-provider';

type BuildApiParams = {
  path: string;
  method: string;
  credentials?: RequestCredentials;
};
type ApiParams = {
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
};

let _baseHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
const processRequestWithRefresh = RefreshProcessor();

export const buildApi = <T = unknown>({ path, method, credentials }: BuildApiParams) => {
  const api = async ({ params, query, body, headers }: ApiParams = {}): Promise<T> => {
    const apiEndpoint = new URL(BASE_URL + path);
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
          ...tokenManager.getAccessToken() && { Authorization: `Bearer ${tokenManager.getAccessToken()}` },
        },
        ...(body && { body: JSON.stringify(body) }),
      });
    } catch (error) {
      throw {
        path,
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
        path,
        method,
        status: 400,
        code: FETCH_JSON_ERROR_CODE,
        message: 'response json error: ' + (hasErrorMessage(error) ? error.message : JSON.stringify(error)),
      };
    }

    if (!response.ok) {
      if (data.message === 'token-expired') {
        return processRequestWithRefresh(() => api({ params, query, body, headers })) as Promise<T>;
      }
      // if (response.status === 401 || response.status === 403) {
      //   globalErrorHandler({ status: response.status, code: data.code || TOKEN_EXPIRED_ERROR_CODE, message: '인증 오류가 발생했습니다. 다시 로그인해주세요.' });
      // }
      throw { path, method, status: response.status, message: data.message, code: data.code };
    }

    return data.message;
  };

  return api;
};
