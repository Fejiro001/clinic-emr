import type { PaginationMeta } from "../../services/paginationHelper";

interface PaginationProps {
  pagination: PaginationMeta;
  onNextPage: () => void;
  onPrevPage: () => void;
  onGoToPage: (page: number) => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  maxPageButtons?: number;
}

const Pagination = ({
  pagination,
  onNextPage,
  onPrevPage,
  onGoToPage,
  onFirstPage,
  onLastPage,
  maxPageButtons = 3,
}: PaginationProps) => {
  const generatePageNumbers = (): number[] => {
    const { currentPage, totalPages } = pagination;
    const pages: number[] = [];

    if (totalPages <= maxPageButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
      let endPage = startPage + maxPageButtons - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPageButtons + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex flex-col gap-3 mt-4 items-center">
      <span className="text-sm text-gray-700">
        Showing {pagination.from} to {pagination.to} of {pagination.total}{" "}
        results
      </span>

      <nav
        className="flex justify-between items-center gap-2"
        aria-labelledby="pagination"
      >
        <h3 id="pagination" className="hidden">
          Pagination
        </h3>
        <div className="flex items-center gap-2">
          <button
            className="pagination_btn"
            disabled={!pagination.hasPrevPage}
            onClick={onFirstPage}
            title="First page"
          >
            First
          </button>

          <button
            disabled={!pagination.hasPrevPage}
            className="pagination_btn"
            onClick={onPrevPage}
            title="Previous page"
          >
            ← Prev
          </button>
        </div>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers[0] > 1 && (
            <>
              <button
                className="page_number"
                onClick={() => {
                  onGoToPage(1);
                }}
              >
                1
              </button>
              {pageNumbers[0] > 2 && (
                <span className="px-2 text-gray-500">...</span>
              )}
            </>
          )}

          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => {
                onGoToPage(pageNum);
              }}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${
                pageNum === pagination.currentPage
                  ? "bg-blue-800 text-white"
                  : "border border-gray-400 text-gray-700 hover:border-blue-700"
              }`}
            >
              {pageNum}
            </button>
          ))}

          {pageNumbers[pageNumbers.length - 1] < pagination.totalPages && (
            <>
              {/* Ellipsis for extra pages */}
              {pageNumbers[pageNumbers.length - 1] <
                pagination.totalPages - 1 && (
                <span className="px-2 text-gray-500">...</span>
              )}

              {/* Last page */}
              <button
                className="page_number"
                onClick={() => {
                  onGoToPage(pagination.totalPages);
                }}
              >
                {pagination.totalPages}
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={!pagination.hasNextPage}
            className="pagination_btn"
            onClick={onNextPage}
            title="Next page"
          >
            Next →
          </button>

          <button
            className="pagination_btn"
            disabled={!pagination.hasNextPage}
            onClick={onLastPage}
            title="Last page"
          >
            Last
          </button>
        </div>
      </nav>

      <span className="text-center text-sm text-gray-600">
        Page {pagination.currentPage} of {pagination.totalPages}
      </span>
    </div>
  );
};

export default Pagination;
