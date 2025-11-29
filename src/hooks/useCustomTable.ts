import { useState } from "react";
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useCustomTable = (data: unknown[], columns: ColumnDef<any, string>[]) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
  });

  return { table, sorting };
};

export default useCustomTable;
