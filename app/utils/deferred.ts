export type DeferredType = {
  promise: Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};

export type DeferredOptions = {
  timeout: number; // milliseconds
};

export class TimeoutError extends Error {
  constructor(timeout: number) {
    super(`Operation timed out after ${timeout}ms`);
    this.name = "TimeoutError";
  }
}

export const Deferred = (
  options: DeferredOptions = { timeout: 30_000 }
): DeferredType => {
  let resolve: (value: unknown) => void = () => {};
  let reject: (reason?: unknown) => void = () => {};
  let timeoutId: NodeJS.Timeout | null = null;

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
    timeoutId = setTimeout(() => {
      reject(new TimeoutError(options.timeout));
    }, options.timeout);
  });

  const originalResolve = resolve;
  const originalReject = reject;

  // Wrap resolve to clear timeout
  const wrappedResolve = (value: unknown) => {
    timeoutId && clearTimeout(timeoutId);
    timeoutId = null;
    originalResolve(value);
  };

  // Wrap reject to clear timeout
  const wrappedReject = (reason?: unknown) => {
    timeoutId && clearTimeout(timeoutId);
    timeoutId = null;
    originalReject(reason);
  };

  return { promise, resolve: wrappedResolve, reject: wrappedReject };
};
