'use client';
import { useMemo, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CSVRow } from '@/types';

interface CSVPreviewProps {
  headers: string[];
  rows: CSVRow[];
}

export default function CSVPreview({ headers, rows }: CSVPreviewProps) {
  const columns = useMemo<ColumnDef<CSVRow>[]>(
    () =>
      headers.map((h) => ({
        id: h,
        header: h,
        accessorKey: h,
        cell: (info) => (
          <span className="text-sm text-gray-700 dark:text-gray-300 block truncate max-w-[250px]" title={info.getValue() as string}>
            {(info.getValue() as string) || '-'}
          </span>
        ),
      })),
    [headers]
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 44,
    overscan: 10,
  });

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing {rows.length} row{rows.length !== 1 ? 's' : ''} with {headers.length} columns
      </p>
      <div
        ref={tableContainerRef}
        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-auto max-h-[500px]"
      >
        <div style={{ minWidth: headers.length * 160 }}>
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id}>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap bg-gray-50 dark:bg-gray-800">
                    #
                  </th>
                  {group.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap bg-gray-50 dark:bg-gray-800"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody
              style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const row = table.getRowModel().rows[virtualRow.index];
                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      virtualRow.index % 2 === 0
                        ? 'bg-white dark:bg-gray-900'
                        : 'bg-gray-50/50 dark:bg-gray-800/30'
                    }`}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                    }}
                  >
                    <td className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800 whitespace-nowrap">
                      {virtualRow.index + 1}
                    </td>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 whitespace-nowrap"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
