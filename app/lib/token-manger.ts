import { BASE_URL } from '~/constants';
import { Deferred, type DeferredType } from '~/lib/utils/deferred';

const refreshPath = '/auth/refresh';

class TokenManager {
  private readonly TOKEN_KEY = 'access_token';

  setAccessToken(token: string) {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  getAccessToken(): string {
    return sessionStorage.getItem(this.TOKEN_KEY) || '';
  }

  clearAccessToken() {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  async refreshAccessToken(): Promise<void> {
    const response = await fetch(new URL(BASE_URL + refreshPath), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Refresh failed');
    const result = await response.json();
    this.setAccessToken(result.message);
  }
}
export const tokenManager = new TokenManager();

type PendingRequest<T> = {
  deferred: DeferredType;
  api: () => Promise<T>;
};
export const RefreshProcessor = () => {
  let isRefreshing = false;
  let isRefreshSuccess = true;
  let pendingRequests = [] as PendingRequest<unknown>[];

  const processRequests = async () => {
    for (const request of pendingRequests) {
      if (isRefreshSuccess) {
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
    pendingRequests = [];
    isRefreshing = false;
  };

  return async (originRequest: () => Promise<unknown>) => {
    if (isRefreshing) {
      const deferred = Deferred();
      pendingRequests.push({
        deferred,
        api: () => originRequest(),
      });
      return deferred.promise as Promise<unknown>;
    }

    isRefreshing = true;
    try {
      await tokenManager.refreshAccessToken();
      isRefreshSuccess = true;
      return await originRequest();
    } catch (error: any) {
      isRefreshSuccess = false;
      throw { status: error.status || 400, code: error.code || 400, message: error.message || 'token expired' };
    } finally {
      processRequests();
    }
  };
};
