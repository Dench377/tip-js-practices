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

// Создаёт URL относительно baseUrl и добавляет непустые параметры query
export function buildUrl(baseUrl, path, query = {}) {
  if (typeof baseUrl !== "string") {
    throw new TypeError("baseUrl должен быть строкой");
  }

  let parsedBase;
  try {
    parsedBase = new URL(baseUrl);
  } catch {
    throw new TypeError("baseUrl должен быть валидным абсолютным URL");
  }

  if (parsedBase.protocol !== "http:" && parsedBase.protocol !== "https:") {
    throw new TypeError("baseUrl должен использовать протокол http или https");
  }

  if (parsedBase.search !== "" || parsedBase.hash !== "") {
    throw new TypeError("baseUrl не должен содержать query-параметры или hash");
  }

  if (typeof path !== "string" || path.trim() === "") {
    throw new TypeError("path должен быть непустой строкой");
  }

  if (query !== null && typeof query !== "object") {
    throw new TypeError("query должен быть объектом");
  }

  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = new URL(cleanBase + cleanPath);

  if (query && typeof query === "object") {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") {
        continue;
      }
      fullUrl.searchParams.set(key, String(value));
    }
  }

  return fullUrl.toString();
}

// Фабрика клиента для выполнения HTTP JSON-запросов
export function createApiClient({
  baseUrl,
  fetchFn = globalThis.fetch,
  timeoutMs = 2000,
} = {}) {
  if (typeof baseUrl !== "string") {
    throw new TypeError("baseUrl обязателен и должен быть строкой");
  }

  let parsedBase;
  try {
    parsedBase = new URL(baseUrl);
  } catch {
    throw new TypeError("baseUrl должен быть валидным URL");
  }

  if (parsedBase.protocol !== "http:" && parsedBase.protocol !== "https:") {
    throw new TypeError("baseUrl должен использовать протокол http или https");
  }

  if (parsedBase.search !== "" || parsedBase.hash !== "") {
    throw new TypeError("baseUrl не должен содержать query-параметры или hash");
  }

  if (typeof fetchFn !== "function") {
    throw new TypeError("fetchFn должна быть функцией");
  }

  if (typeof timeoutMs !== "number" || !Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError("timeoutMs должно быть положительным целым числом");
  }

  return {
    async requestJson(path, { query, signal, timeoutMs: reqTimeout } = {}) {
      const url = buildUrl(baseUrl, path, query);
      const effectiveTimeout =
        typeof reqTimeout === "number" && Number.isSafeInteger(reqTimeout) && reqTimeout > 0
          ? reqTimeout
          : timeoutMs;

      const timeoutSignal = AbortSignal.timeout(effectiveTimeout);
      const combinedSignal = signal instanceof AbortSignal
        ? AbortSignal.any([timeoutSignal, signal])
        : timeoutSignal;

      let response;
      try {
        response = await fetchFn(url, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: combinedSignal,
        });
      } catch (error) {
        if (signal?.aborted) {
          throw new ApiError("Запрос отменён вызывающим кодом.", {
            kind: "aborted",
            url,
            cause: error,
          });
        }
        if (timeoutSignal.aborted) {
          throw new ApiError("Превышено допустимое время ожидания запроса.", {
            kind: "timeout",
            url,
            cause: error,
          });
        }
        throw new ApiError(`Сетевая ошибка при обращении к ${url}: ${error.message}`, {
          kind: "network",
          url,
          cause: error,
        });
      }

      if (!response || typeof response !== "object" || typeof response.status !== "number") {
        throw new ApiError("Неверный ответ от сервера: ожидался объект Response.", {
          kind: "invalid-response",
          url,
        });
      }

      // Обработка HTTP-ошибок (статусы вне диапазона 200–299)
      if (!response.ok) {
        let code = null;
        let message = `HTTP ошибка ${response.status}`;
        let details = null;

        const contentType = response.headers?.get?.("content-type") ?? "";
        if (contentType.includes("application/json")) {
          try {
            const errorPayload = await response.json();
            if (errorPayload?.error) {
              code = errorPayload.error.code ?? null;
              message = errorPayload.error.message ?? message;
              details = errorPayload.error.details ?? null;
            }
          } catch {
            // Игнорируем ошибку парсинга тела при наличии статус-кода ошибки
          }
        }

        throw new ApiError(message, {
          kind: "http",
          status: response.status,
          code,
          details,
          url,
        });
      }

      // Статус 204 No Content
      if (response.status === 204) {
        return null;
      }

      const contentType = response.headers?.get?.("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new ApiError("Ожидался заголовок Content-Type: application/json.", {
          kind: "invalid-response",
          status: response.status,
          url,
        });
      }

      try {
        return await response.json();
      } catch (error) {
        throw new ApiError("Ошибка разбора JSON-тела ответа.", {
          kind: "invalid-response",
          status: response.status,
          url,
          cause: error,
        });
      }
    },
  };
}
