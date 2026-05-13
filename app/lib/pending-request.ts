import { globalErrorHandler } from "~/providers/error-handler-provider";
import { tokenManager } from "./token-manger";
import { Deferred, type DeferredType } from "./utils/deferred";

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
    } catch (error) {
      isRefreshSuccess = false;
      const formattedError = { status: error.status || 401, code: error.code || 401, message: error.message || 'token expired' };
      return globalErrorHandler(formattedError);
    }

    try {
      return await originRequest();
    } catch (error: any) {
      const formattedError = { status: error.status || 401, code: error.code || 401, message: error.message || 'token expired' };
      if (error.status === 401 || error.status === 403) {
        return globalErrorHandler(formattedError);
      }
      throw formattedError;
    } finally {
      processRequests();
    }
  };
};
