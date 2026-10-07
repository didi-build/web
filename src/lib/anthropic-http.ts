const MAX_ERROR_MESSAGE_CHARS = 200;

type AnthropicErrorBody = {
  type?: string;
  error?: { type?: string; message?: string };
};

export class AnthropicHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AnthropicHttpError";
    this.status = status;
  }
}

function truncateMessage(message: string): string {
  if (message.length <= MAX_ERROR_MESSAGE_CHARS) {
    return message;
  }
  return `${message.slice(0, MAX_ERROR_MESSAGE_CHARS)}…`;
}

export function formatAnthropicHttpError(status: number, bodyText: string): AnthropicHttpError {
  try {
    const parsed = JSON.parse(bodyText) as AnthropicErrorBody;
    if (parsed.type === "error" && parsed.error?.message) {
      const errType = parsed.error.type ?? "error";
      const msg = truncateMessage(parsed.error.message);
      return new AnthropicHttpError(status, `anthropic_http_${status} ${errType}: ${msg}`);
    }
  } catch {
    // ignore parse errors
  }
  return new AnthropicHttpError(status, `anthropic_http_${status}`);
}

export function isRetryableAnthropicError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return true;
  }
  if (error instanceof AnthropicHttpError) {
    return error.status === 429 || error.status >= 500;
  }
  if (error instanceof Error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return true;
    }
    const match = /^anthropic_http_(\d+)/.exec(error.message);
    if (match) {
      const status = Number.parseInt(match[1], 10);
      if (status === 429) {
        return true;
      }
      if (status >= 500) {
        return true;
      }
      return false;
    }
  }
  return false;
}
