import { FETCH_JSON_ERROR_CODE, TOKEN_EXPIRED_ERROR_CODE, UNSTABLE_NETWORK_ERROR_CODE, hasErrorMessage } from '~/lib/error';
import { Deferred, type DeferredType } from '~/utils/deferred';

type BuildApiParams = {
  url: string;
  method: string;
};
type ApiParams = {
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
};

const baseUrl = import.meta.env.VITE_API_URL + '/v1';
const refreshUrl = '/auth/refresh';

let _baseHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
export const setAccessToken = (accessToken: string) => {
  _baseHeaders = { ..._baseHeaders, Authorization: `Bearer ${accessToken}` };
};

type PendingRequest<T> = {
  deferred: DeferredType;
  api: () => Promise<T>;
};
const refreshProcessor = {
  isRefreshing: false,
  isRefreshSuccess: true,
  pendingRequests: [] as PendingRequest<unknown>[],
  processRequests: async () => {
    for (const request of refreshProcessor.pendingRequests) {
      if (refreshProcessor.isRefreshSuccess) {
        try {
          const result = await request.api();
          request.deferred.resolve(result);
        } catch (error: any) {
          request.deferred.reject({ status: error.status || 400, code: error.code || 400, message: error.message });
        }
      } else {
        request.deferred.reject({ status: 401, code: 401, message: 'token expired' });
      }
    }
    refreshProcessor.pendingRequests = [];
    refreshProcessor.isRefreshing = false;
  },
};

const refreshTokenApi = async () => {
  const refreshEndpoint = new URL(baseUrl + refreshUrl);
  const response = await fetch(refreshEndpoint, { method: 'POST', headers: _baseHeaders, credentials: 'include' });
  const result = await response.json();
  if (!response.ok) throw { url: refreshEndpoint.toString(), method: 'POST', status: response.status, message: result.message, code: result.code };
  return result.message;
};

export const buildApi = <T = unknown>({ url, method }: BuildApiParams) => {
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
        headers: { ..._baseHeaders, ...(headers && headers) },
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
      if (data.code === TOKEN_EXPIRED_ERROR_CODE) {
        if (refreshProcessor.isRefreshing) {
          const deferred = Deferred();
          refreshProcessor.pendingRequests.push({
            deferred,
            api: () => api({ params, query, body, headers }),
          });
          return deferred.promise as Promise<T>;
        }

        refreshProcessor.isRefreshing = true;
        try {
          const accessToken = await refreshTokenApi();
          setAccessToken(accessToken);
          refreshProcessor.isRefreshSuccess = true;
          return await api({ params, query, body, headers });
        } catch (error: any) {
          refreshProcessor.isRefreshSuccess = false;
          throw { status: error.status || 400, code: error.code || 400, message: error.message || 'token expired' };
        } finally {
          refreshProcessor.processRequests();
        }
      }

      throw { url, method, status: response.status, message: data.message, code: data.code };
    }

    return data.message;
  };

  return api;
};
