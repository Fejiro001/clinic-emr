import { useCallback, useEffect, useState } from "react";
import {
  calculatePagination,
  type PaginationMeta,
} from "../services/paginationHelper";

export interface UsePaginationOptions<T> {
  fetchFn: (limit: number, offset: number) => Promise<T[]>;
  countFn: () => Promise<number>;
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
}

const usePagination = <T>({
  fetchFn,
  countFn,
  initialLimit = 50,
  initialPage = 1,
}: UsePaginationOptions<T>): UsePaginationReturn<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  // Calculate pagination metadata
  const pagination = calculatePagination({ page, limit, total });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const offset = (page - 1) * limit;

      const [items, count] = await Promise.all([
        fetchFn(limit, offset),
        countFn(),
      ]);

      setData(items);
      setTotal(count);
    } catch (err) {
      console.error("Pagination fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    void fetchData();
  }, [page, limit, fetchFn, countFn]);

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

      const [items, count] = await Promise.all([
        fetchFn(limit, offset),
        countFn(),
      ]);

      setData(items);
      setTotal(count);
    } catch (err) {
      console.error("Pagination refresh error:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh data");
    } finally {
      setLoading(false);
    }
  }, [fetchFn, countFn, page, limit]);

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
  };
};

export default usePagination;
