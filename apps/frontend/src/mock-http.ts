type HeaderMap = Partial<Record<string, string>>;

type CreateMockRequestOptions = {
  url: string;
  headers?: HeaderMap;
} & (
  | {
      method: "GET";
    }
  | {
      method: "POST";
      body: unknown;
    }
);

type CreateMockRequestResult = {
  url: string;
  headers: HeaderMap;
} & (
  | {
      method: "GET";
    }
  | {
      method: "POST";
      body: unknown;
    }
);

export function createMockRequest(
  options: CreateMockRequestOptions,
): CreateMockRequestResult {
  const { headers = {}, ...rest } = options;

  return { ...rest, headers };
}

interface CreateMockResponseResult {
  statusCode: number;
  chunks: Array<unknown>;

  setHeader(name: string, value: string): void;
  getHeader(name: string): string | undefined;
  getHeaders(): HeaderMap;

  write(chunk: unknown): void;
  end(chunk: unknown): void;

  // --- Helpers for inspection ---
  _getStatusCode(): number;
  _getHeaders(): HeaderMap;
  _getBody(): unknown;
}

export function createMockResponse(): CreateMockResponseResult {
  const statusCode = 200;
  const headers: HeaderMap = {};
  const chunks: Array<unknown> = [];

  const res: CreateMockResponseResult = {
    statusCode,
    chunks,

    setHeader(name, value) {
      headers[name.toLowerCase()] = value;
    },
    getHeader(name) {
      return headers[name.toLowerCase()];
    },
    getHeaders() {
      return { ...headers };
    },

    write(chunk) {
      if (typeof chunk !== "string") {
        chunk = String(chunk);
      }
      chunks.push(chunk);
    },

    end(chunk) {
      res.write(chunk);
    },

    _getStatusCode() {
      return statusCode;
    },
    _getHeaders() {
      return { ...headers };
    },
    _getBody() {
      return chunks.join("");
    },
  };

  return res;
}
