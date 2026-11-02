export class ApiError extends Error {
  constructor(message, {
    kind,
    status = null,
    code = null,
    details = null,
    url = null,
    cause,
  } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}

const ALLOWED_METHODS = new Set(["GET", "POST", "PATCH", "DELETE"]);

// Соединяет абсолютный baseUrl, путь и непустые query-параметры.
export function buildUrl(baseUrl, path, query = {}) {
  if (typeof baseUrl !== "string" || baseUrl.trim() === "") {
    throw new TypeError("baseUrl должен быть непустой строкой.");
  }
  const baseClean = baseUrl.replace(/\/+$/, "");
  const pathClean = String(path).replace(/^\/+/, "");
  const url = new URL(baseClean + "/" + pathClean);

  if (query && typeof query === "object") {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.href;
}

// requestJson(path, { method, query, body, signal, timeoutMs } = {})
// поддерживает GET, POST, PATCH и DELETE; ответ 204 преобразуется в null.
export function createApiClient({
  baseUrl,
  fetchFn = globalThis.fetch,
  timeoutMs = 3000,
} = {}) {
  if (typeof baseUrl !== "string" || !baseUrl) {
    throw new TypeError("baseUrl должен быть непустой строкой.");
  }
  let parsedUrl;
  try {
    parsedUrl = new URL(baseUrl);
  } catch (error) {
    throw new TypeError("Некорректный baseUrl.", { cause: error });
  }
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new TypeError("Протокол baseUrl должен быть http: или https:.");
  }
  if (parsedUrl.search || parsedUrl.hash) {
    throw new TypeError("baseUrl не должен содержать query или hash.");
  }
  if (typeof fetchFn !== "function") {
    throw new TypeError("fetchFn должен быть функцией.");
  }
  if (typeof timeoutMs !== "number" || !Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError("timeoutMs должен быть положительным числом.");
  }

  async function requestJson(path, {
    method = "GET",
    query = {},
    body,
    signal,
    timeoutMs: reqTimeoutMs,
  } = {}) {
    const normalizedMethod = typeof method === "string" ? method.toUpperCase() : "";
    if (!ALLOWED_METHODS.has(normalizedMethod)) {
      throw new TypeError(`Неподдерживаемый HTTP-метод: ${method}`);
    }
    if (normalizedMethod === "GET" && body !== undefined) {
      throw new TypeError("GET-запрос не должен содержать тело.");
    }

    const requestUrl = buildUrl(baseUrl, path, query);
    const headers = new Headers();
    headers.set("Accept", "application/json");

    let serializedBody;
    if (body !== undefined && body !== null) {
      headers.set("Content-Type", "application/json");
      serializedBody = JSON.stringify(body);
    }

    const effectiveTimeout = reqTimeoutMs ?? timeoutMs;
    const timeoutSignal = AbortSignal.timeout(effectiveTimeout);
    const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

    let response;
    try {
      response = await fetchFn(requestUrl, {
        method: normalizedMethod,
        headers,
        body: serializedBody,
        signal: combinedSignal,
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (signal?.aborted) {
        throw new ApiError("Запрос отменён.", {
          kind: "aborted",
          url: requestUrl,
          cause: error,
        });
      }
      if (timeoutSignal.aborted || error?.name === "TimeoutError") {
        throw new ApiError("Время ожидания ответа истекло.", {
          kind: "timeout",
          url: requestUrl,
          cause: error,
        });
      }
      if (error?.name === "AbortError") {
        throw new ApiError("Запрос отменён.", {
          kind: "aborted",
          url: requestUrl,
          cause: error,
        });
      }
      throw new ApiError("Сетевая ошибка при обращении к серверу.", {
        kind: "network",
        url: requestUrl,
        cause: error,
      });
    }

    if (!response.ok) {
      let errorData = null;
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        try {
          errorData = await response.json();
        } catch {
          // Игнорируем ошибку парсинга при неуспешном статусе
        }
      }
      const code = errorData?.error?.code ?? null;
      const message = errorData?.error?.message ?? `Сервер вернул ошибку ${response.status}.`;
      const details = errorData?.error?.details ?? null;
      throw new ApiError(message, {
        kind: "http",
        status: response.status,
        code,
        details,
        url: requestUrl,
      });
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      throw new ApiError("Сервер вернул ответ неожиданного типа (ожидался application/json).", {
        kind: "invalid-response",
        status: response.status,
        url: requestUrl,
      });
    }

    try {
      return await response.json();
    } catch (error) {
      throw new ApiError("Не удалось разобрать JSON-ответ сервера.", {
        kind: "invalid-response",
        status: response.status,
        url: requestUrl,
        cause: error,
      });
    }
  }

  return {
    requestJson,
    baseUrl,
  };
}
