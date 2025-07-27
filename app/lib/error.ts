export const UNSTABLE_NETWORK_ERROR_CODE = 1000;
export const FETCH_JSON_ERROR_CODE = 1001;
export const TOKEN_EXPIRED_ERROR_CODE = 4011;
export const UNAUTHORIZED_ERRROR_CODE = 4012;

declare global {
  interface Error {
    code?: number;
    status?: number;
    message: string;
    url?: string;
    method?: string;
  }
}

type ErrorWithMessage = {
  message: string;
};
export function hasErrorMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' && //
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}
