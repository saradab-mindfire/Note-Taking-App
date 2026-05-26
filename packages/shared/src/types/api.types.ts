/** Standard API success response envelope */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/** Standard API error response envelope */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
