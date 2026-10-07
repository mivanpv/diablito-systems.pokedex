const SESSION_PREFIX = 'pokedex:';
const memoryCache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    // Keep `instanceof` working when compiled to ES5.
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

interface FetchJsonOptions<T> {
  /** Also persist the response in sessionStorage so it survives page reloads. */
  persist?: boolean;
  /** Rejects this caller's promise on abort; the shared network request keeps going. */
  signal?: AbortSignal;
  /** Throw here to reject a 200 response that is semantically an error (it won't be cached). */
  validate?: (data: T) => void;
}

function readSession<T>(key: string): T | undefined {
  try {
    const raw = sessionStorage.getItem(SESSION_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

function writeSession(key: string, value: unknown): void {
  try {
    sessionStorage.setItem(SESSION_PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable (private mode): the memory cache is enough.
  }
}

async function load<T>(url: string, persist: boolean, validate?: (data: T) => void): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new HttpError(response.status, `Error ${response.status} al consultar ${url}`);
  }

  const data = (await response.json()) as T;
  validate?.(data);

  memoryCache.set(url, data);
  if (persist) writeSession(url, data);
  return data;
}

function abortable<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'));
  return new Promise<T>((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    promise.then(resolve, reject);
  });
}

/**
 * GET a JSON resource with an in-memory cache (and optional sessionStorage cache).
 * Concurrent calls for the same URL share a single network request.
 */
export function fetchJson<T>(
  url: string,
  { persist = false, signal, validate }: FetchJsonOptions<T> = {}
): Promise<T> {
  if (memoryCache.has(url)) return Promise.resolve(memoryCache.get(url) as T);

  if (persist) {
    const stored = readSession<T>(url);
    if (stored !== undefined) {
      memoryCache.set(url, stored);
      return Promise.resolve(stored);
    }
  }

  let request = inflight.get(url) as Promise<T> | undefined;
  if (!request) {
    request = load(url, persist, validate).finally(() => inflight.delete(url));
    inflight.set(url, request);
  }
  return abortable(request, signal);
}

export function isNotFound(error: unknown): boolean {
  return error instanceof HttpError && error.status === 404;
}
