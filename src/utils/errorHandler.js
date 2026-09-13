const ERROR_DEBOUNCE_MS = 3000;
const recentlyShownErrors = new Set();

/**
 * Normalizes an error object into a standard format.
 * @param {Error|any} error - The error object to normalize.
 * @returns {{ type: 'network' | 'client' | 'server' | 'unknown', message: string, statusCode?: number }}
 */
function normalizeError(error) {
  let statusCode = error?.response?.status || error?.status || error?.code || error?.statusCode;
  let message = error?.message || "An unexpected error occurred.";
  let type = "unknown";

  // Attempt to extract status code from message string if missing (e.g. Gemini API "[503 ]")
  if (!statusCode && typeof message === 'string') {
    const match = message.match(/\[\s*(\d{3})\s*\]/);
    if (match) statusCode = parseInt(match[1], 10);
  }

  // Appwrite specific error codes or HTTP response codes
  if (typeof statusCode === 'number') {
    if (statusCode >= 400 && statusCode < 500) {
      type = "client";
      if (statusCode === 401) message = "Unauthorized. Please login.";
      else if (statusCode === 403) message = "Access denied.";
      else if (statusCode === 404) message = "Requested resource not found.";
      else message = error?.message || "Request failed. Please check your input or try again.";
    } else if (statusCode >= 500) {
      type = "server";
      if (statusCode === 503) message = "Service temporarily unavailable. Try again shortly.";
      else message = error?.message || "Server is currently unavailable. Please try again later.";
    }
  }

  // Network errors (e.g., fetch failure where no response is available)
  if (
    error?.name === 'TypeError' && message.toLowerCase().includes('fetch') ||
    message.toLowerCase().includes('network') ||
    error?.message === 'Failed to fetch' ||
    !navigator.onLine
  ) {
    type = "network";
    message = "Network error. Check your internet connection.";
  }

  // Fallback for unknown errors without a status code
  if (type === "unknown" && !statusCode) {
    if (message.includes("Unexpected token")) {
      message = "Data parsing error.";
    }
  }

  return { type, message, statusCode };
}

/**
 * Centralized error handler.
 * @param {Error|any} error - The error thrown or rejected.
 * @param {Object} [context] - Optional context { silent?: boolean, action?: string }
 */
export function handleError(error, context = {}) {
  // Normalize the error into standard format
  const normalizedError = normalizeError(error);
  
  // Override message if a custom one is provided in context
  if (context.customMessage) {
    normalizedError.message = context.customMessage;
  }
  
  // Log to console for debugging (with context if provided)
  console.error(`[ErrorHandler] ${context.action ? `Failed during: ${context.action}` : ''}`, {
    originalError: error,
    normalized: normalizedError
  });

  // If the error should be handled silently (e.g., inline form validation), do not show a toast
  if (context.silent) {
    return normalizedError;
  }

  // Deduplication: prevent the exact same error message from spamming within a short timeframe
  const debounceKey = `${normalizedError.type}:${normalizedError.message}`;
  if (recentlyShownErrors.has(debounceKey)) {
    return normalizedError; // Skip showing toast
  }

  // Add to recently shown to debounce
  recentlyShownErrors.add(debounceKey);
  setTimeout(() => {
    recentlyShownErrors.delete(debounceKey);
  }, ERROR_DEBOUNCE_MS);

  // Dispatch global custom event for the ToastContainer
  const toastEvent = new CustomEvent('show-toast', {
    detail: {
      type: normalizedError.type,
      message: normalizedError.message,
      statusCode: normalizedError.statusCode
    }
  });
  window.dispatchEvent(toastEvent);

  return normalizedError;
}
