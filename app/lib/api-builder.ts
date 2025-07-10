import { UNSTABLE_NETWORK_ERROR_CODE } from "~/constants/error";

type ErrorWithMessage = {
  message: string;
};
function hasErrorMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  );
}

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

const baseUrl = import.meta.env.VITE_API_URL + "/store-service/v1";
const defaultToken = import.meta.env.VITE_DEFAULT_TOKEN;

let _baseHeaders = {
  Authorization: `Bearer ${defaultToken}`,
};
export const setBaseHeaders = (headers: Record<string, string>) => {
  _baseHeaders = {
    Authorization: `Bearer ${defaultToken}`,
    ...headers,
  };
};

export const buildApi = <T = unknown>({ url, method }: BuildApiParams) => {
  const api = async ({
    params,
    query,
    body,
    headers,
  }: ApiParams = {}): Promise<T> => {
    const apiEndpoint = new URL(baseUrl + url);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        apiEndpoint.pathname = apiEndpoint.pathname.replace(
          `:${key}`,
          String(value)
        );
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
        headers: {
          "Content-Type": "application/json",
          ..._baseHeaders,
          ...(headers && headers),
        },
        ...(body && { body: JSON.stringify(body) }),
      });
    } catch (error) {
      throw {
        url,
        method,
        status: 500,
        errorCode: UNSTABLE_NETWORK_ERROR_CODE,
        message:
          "fetch error: " +
          (hasErrorMessage(error) ? error.message : JSON.stringify(error)),
      };
    }

    let data: { resultCode: number; resultMessage: T };
    try {
      data = await response.json();
    } catch (error) {
      throw {
        url,
        method,
        status: 500,
        errorCode: 502,
        message:
          "response json error: " +
          (hasErrorMessage(error) ? error.message : JSON.stringify(error)),
      };
    }

    if (!response.ok) {
      throw {
        url,
        method,
        status: response.status,
        message: data.resultMessage,
        errorCode: data.resultCode,
      };
    }

    return data.resultMessage;
  };

  return api;
};
