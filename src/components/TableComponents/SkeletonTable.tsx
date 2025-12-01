import { flexRender, type Table } from "@tanstack/react-table";

interface SkeletonTableProps {
  table: Table<unknown>;
  rowCount?: number;
  message?: string;
}

const SkeletonTable = ({
  table,
  rowCount = 5,
  message = "Loading data...",
}: SkeletonTableProps) => {
  const headers = table.getHeaderGroups()[0]?.headers;

  const getSkeletonWidth = (colIndex: number) => {
    const widths = ["w-3/4", "w-4/5", "w-2/3", "w-5/6", "w-full"];
    return widths[colIndex % widths.length];
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="bg-white ring-1 ring-gray-400 rounded-lg w-full min-w-max">
        <thead className="bg-primary-800 text-white">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider border border-gray-300"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {Array.from({ length: rowCount }).map((_, index) => (
            <tr
              key={index}
              className="hover:bg-primary-200 nth-[even]:bg-gray-100 nth-[even]:hover:bg-primary-200"
            >
              {headers.map((_, colIndex) => (
                <td
                  key={`skeleton-cell-${String(index)}-${String(colIndex)}`}
                  className="px-3 py-2 text-sm text-gray-900 border border-gray-300"
                >
                  <div className="relative overflow-hidden">
                    <div
                      className={`h-4 bg-gray-300 rounded ${getSkeletonWidth(colIndex)}`}
                    />
                    <div
                      className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent"
                      style={{
                        animationDelay: `${String(index * 0.1 + colIndex * 0.05)}s`,
                      }}
                    />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Loading indicator */}
      <div className="flex items-center justify-center py-6 gap-3 bg-white/80 backdrop-blur-sm">
        <div className="flex gap-1">
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
        <span className="text-sm font-medium text-gray-600">{message}</span>
      </div>
    </div>
  );
};

export default SkeletonTable;
