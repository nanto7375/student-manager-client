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
