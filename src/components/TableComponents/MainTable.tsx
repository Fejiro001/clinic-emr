import { flexRender, type Table } from "@tanstack/react-table";

const MainTable = ({ table }: { table: Table<unknown> }) => {
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
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-primary-200 nth-[even]:bg-gray-200 nth-[even]:hover:bg-primary-200"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-3 py-2 text-sm text-gray-900 border border-gray-300"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MainTable;
