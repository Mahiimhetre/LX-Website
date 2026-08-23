/**
 * LX-Website Error Handling Specification & Utility
 *
 * Implements a 4-Tier Error Message Priority Hierarchy:
 * 1. Error Code / User-Safe Backend Message
 * 2. HTTP Status-Aware Message / Timeout / Network Error
 * 3. Card-Level Contextual Fallback ("{Action} failed. Please try again.")
 * 4. Global Fallback ("An error occurred. Please try again.")
 */

// Error Code Map for Auth & System Operations
export const ERROR_CODE_MAP = {
    AUTH_INVALID_CREDENTIALS: 'Incorrect email or password',
    AUTH_USER_EXISTS: 'An account with this email already exists',
    AUTH_UNVERIFIED_EMAIL: 'Email address is not verified',
    AUTH_TOKEN_EXPIRED: 'Reset token has expired. Please request a new link',
    AUTH_TOKEN_INVALID: 'Invalid or missing reset token',
    AUTH_LOCKED_OUT: 'Account temporarily locked out. Please try again later',
    AUTH_RATE_LIMITED: 'Too many attempts. Please wait a moment and try again',
    AUTH_CAPTCHA_REQUIRED: 'Security check required. Please complete the CAPTCHA',
    AUTH_CAPTCHA_INVALID: 'Incorrect CAPTCHA code. Please try again',
    NETWORK_TIMEOUT: 'Request timed out. Please check your connection and try again',
    NETWORK_OFFLINE: 'Unable to connect to server. Please check your internet connection',
    SERVER_ERROR: 'Server error. Please try again later',
};

// Patterns that indicate internal/unsafe system errors that should be masked in production
const UNSAFE_PATTERNS = [
    /sql/i,
    /sequelize/i,
    /database/i,
    /deadlock/i,
    /syntaxerror/i,
    /typeerror/i,
    /nullpointer/i,
    /undefined/i,
    /at\s+[\w\.\/\\\:]+\:\d+/i,
    /internal server/i,
    /stack trace/i,
    /mongod/i,
    /postgres/i,
    /er_dup_entry/i
];

/**
 * Checks whether a given backend error message is safe to present to end-users.
 */
export function isSafeUserMessage(msg) {
    if (typeof msg !== 'string' || !msg.trim()) return false;
    return !UNSAFE_PATTERNS.some((pattern) => pattern.test(msg));
}

/**
 * Parses any error (Axios error, API response object, or JS Error)
 * into a standardized, safe, user-friendly error object.
 *
 * @param {Error|Object} error - The caught error or API response object
 * @param {string} contextualFallback - Contextual fallback message if no specific error can be determined
 * @returns {{ code: string, message: string, status: number }}
 */
export function handleApiError(error, contextualFallback = 'An error occurred. Please try again.') {
    const safeFallback = contextualFallback || 'An error occurred. Please try again.';

    // Case 1: Timeout error
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
        return {
            code: 'NETWORK_TIMEOUT',
            message: ERROR_CODE_MAP.NETWORK_TIMEOUT,
            status: 408
        };
    }

    // Case 2: Network / Offline error (no response object received from server)
    if (error?.code === 'ERR_NETWORK' || (error?.isAxiosError && !error?.response)) {
        return {
            code: 'NETWORK_OFFLINE',
            message: ERROR_CODE_MAP.NETWORK_OFFLINE,
            status: 0
        };
    }

    const response = error?.response;
    const status = response?.status;
    const data = response?.data || (typeof error === 'object' && !error.isAxiosError ? error : null);

    const errorCode = data?.code;
    const rawMessage = data?.message || data?.error || data?.msg;

    // Tier 1: Explicit Error Code Mapping
    if (errorCode && ERROR_CODE_MAP[errorCode]) {
        return {
            code: errorCode,
            message: ERROR_CODE_MAP[errorCode],
            status: status || 400
        };
    }

    // Tier 1: User-Safe Backend Message
    if (rawMessage && isSafeUserMessage(rawMessage)) {
        return {
            code: errorCode || 'API_ERROR',
            message: rawMessage,
            status: status || 400
        };
    }

    // Tier 2: HTTP Status-Aware Handling
    if (status) {
        switch (status) {
            case 400:
            case 422:
                return {
                    code: 'VALIDATION_ERROR',
                    message: isSafeUserMessage(rawMessage) ? rawMessage : 'Invalid request data. Please check your input.',
                    status
                };
            case 401:
                return {
                    code: 'UNAUTHORIZED',
                    message: 'Incorrect email or password',
                    status
                };
            case 403:
                return {
                    code: 'FORBIDDEN',
                    message: isSafeUserMessage(rawMessage) ? rawMessage : 'Access denied. Please verify your account or credentials.',
                    status
                };
            case 404:
                return {
                    code: 'NOT_FOUND',
                    message: isSafeUserMessage(rawMessage) ? rawMessage : 'Requested resource was not found.',
                    status
                };
            case 409:
                return {
                    code: 'CONFLICT',
                    message: isSafeUserMessage(rawMessage) ? rawMessage : 'An account with these details already exists.',
                    status
                };
            case 429:
                return {
                    code: 'TOO_MANY_REQUESTS',
                    message: ERROR_CODE_MAP.AUTH_RATE_LIMITED,
                    status
                };
            case 500:
            case 502:
            case 503:
            case 504:
                return {
                    code: 'SERVER_ERROR',
                    message: ERROR_CODE_MAP.SERVER_ERROR,
                    status
                };
            default:
                break;
        }
    }

    // Tier 3 & Tier 4: Contextual or Global Fallback
    return {
        code: 'UNKNOWN_ERROR',
        message: safeFallback,
        status: status || 500
    };
}
