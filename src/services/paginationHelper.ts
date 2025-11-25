export interface PaginationMeta {
  currentPage: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  from: number;
  to: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}

export const calculatePagination = (
  params: PaginationParams
): PaginationMeta => {
  const { page, limit, total } = params;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;

  return {
    currentPage: page,
    perPage: limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    from: total === 0 ? 0 : offset + 1,
    to: Math.min(offset + limit, total),
  };
};

export const calculateOffset = (page: number, limit: number): number => {
  return (page - 1) * limit;
};
