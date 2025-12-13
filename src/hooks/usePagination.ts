import { useCallback, useEffect, useState } from "react";
import {
  calculatePagination,
  type PaginationMeta,
} from "../services/paginationHelper";

interface QueryParams {
  limit: number;
  offset: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  [key: string]: unknown; // Allow any additional filters
}

export interface UsePaginationOptions<T> {
  queryFn: (params: QueryParams) => Promise<T[]>;
  countFn: (filters?: Partial<QueryParams>) => Promise<number>;
  search?: string;
  gender?: string;
  ward?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  initialLimit?: number;
  initialPage?: number;
}

export interface UsePaginationReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: PaginationMeta;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  firstPage: () => void;
  lastPage: () => void;
  setPageSize: (size: number) => void;
  refresh: () => Promise<void>;
  page: number;
  initialLimit: number;
}

const usePagination = <T>({
  queryFn,
  countFn,
  search,
  gender,
  ward,
  sortBy,
  sortOrder,
  initialLimit = 50,
  initialPage = 1,
}: UsePaginationOptions<T>): UsePaginationReturn<T> => {
  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState<T[]>([]);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate pagination metadata
  const pagination = calculatePagination({ page, limit, total });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const offset = (page - 1) * limit;
      const filters = { search, gender, ward, sortBy, sortOrder };

      const [items, count] = await Promise.all([
        queryFn({ limit, offset, ...filters }),
        countFn(filters),
      ]);

      setData(items);
      setTotal(count);
    } catch (err) {
      console.error("Pagination fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [countFn, gender, limit, page, queryFn, search, sortBy, sortOrder, ward]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const nextPage = useCallback(() => {
    if (page < pagination.totalPages) {
      setPage((p) => p + 1);
    }
  }, [page, pagination.totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  }, [page]);

  const goToPage = useCallback(
    (newPage: number) => {
      const totalPages = Math.ceil(total / limit);

      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [total, limit]
  );

  const firstPage = useCallback(() => {
    setPage(1);
  }, []);

  const lastPage = useCallback(() => {
    const totalPages = Math.ceil(total / limit);
    setPage(totalPages);
  }, [total, limit]);

  const setPageSize = useCallback((size: number) => {
    setLimit(size);
    setPage(1); // Reset to first page when page size changes
  }, []);

  const refresh = useCallback(async () => {
    const offset = (page - 1) * limit;
    try {
      setLoading(true);
      setError(null);

      const filters = { search, gender, ward, sortBy, sortOrder };

      const [items, count] = await Promise.all([
        queryFn({ limit, offset, ...filters }),
        countFn(filters),
      ]);

      setData(items);
      setTotal(count);
    } catch (err) {
      console.error("Pagination refresh error:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh data");
    } finally {
      setLoading(false);
    }
  }, [page, limit, queryFn, search, gender, ward, sortBy, sortOrder, countFn]);

  return {
    data,
    loading,
    error,
    pagination,
    nextPage,
    prevPage,
    goToPage,
    firstPage,
    lastPage,
    setPageSize,
    refresh,
    page,
    initialLimit,
  };
};

export default usePagination;
