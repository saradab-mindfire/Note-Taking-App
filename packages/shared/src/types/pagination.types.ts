/** Standard paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Standard pagination query params */
export interface PaginationParams {
  page?: number;
  limit?: number;
}
