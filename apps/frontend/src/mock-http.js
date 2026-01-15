export function createMockReq({
  method = 'GET',
  url,
  headers = {},
  body = null,
} = {}) {
  return {
    method,
    url,
    headers,
    body,
  };
}

export function createMockRes() {
  let statusCode = 200;
  const headers = {};
  let chunks = [];

  const res = {
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
      if (typeof chunk !== 'string') {
        chunk = String(chunk);
      }
      chunks.push(chunk);
    },

    end(chunk) {
      res.write(chunk);
    },

    // --- Helpers for inspection ---
    _getStatusCode() {
      return statusCode;
    },
    _getHeaders() {
      return { ...headers };
    },
    _getBody() {
      return chunks.join('');
    },
  };

  return res;
}
