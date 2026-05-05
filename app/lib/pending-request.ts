import { tokenManager } from "./token-manger";
import { Deferred, type DeferredType } from "./utils/deferred";

type PendingRequest<T> = {
  deferred: DeferredType;
  api: () => Promise<T>;
};

type ErrorHandler = (error: any) => void;

let globalErrorHandler: ErrorHandler | null = null;

export const setGlobalErrorHandler = (handler: ErrorHandler) => {
  globalErrorHandler = handler;
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
      const formattedError = { status: error.status || 401, code: error.code || 401, message: error.message || 'token expired' };

      if (globalErrorHandler) {
        globalErrorHandler(formattedError);
      }

      throw formattedError;
    } finally {
      processRequests();
    }
  };
};
