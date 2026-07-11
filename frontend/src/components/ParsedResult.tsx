'use client';
import { useMemo, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CRMRecord } from '@/types';

interface ParsedResultProps {
  records: CRMRecord[];
  imported: number;
  skipped: number;
  errors: string[];
  onReset: () => void;
}

const CRM_FIELD_LABELS: Record<keyof CRMRecord, string> = {
  created_at: 'Created At',
  name: 'Name',
  email: 'Email',
  country_code: 'Code',
  mobile_without_country_code: 'Mobile',
  company: 'Company',
  city: 'City',
  state: 'State',
  country: 'Country',
  lead_owner: 'Lead Owner',
  crm_status: 'Status',
  crm_note: 'Notes',
  data_source: 'Source',
  possession_time: 'Possession Time',
  description: 'Description',
};

function getStatusColor(status: string | null): string {
  switch (status) {
    case 'GOOD_LEAD_FOLLOW_UP':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'DID_NOT_CONNECT':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'BAD_LEAD':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'SALE_DONE':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
}

export default function ParsedResult({ records, imported, skipped, errors, onReset }: ParsedResultProps) {
  const data = useMemo(() => records, [records]);

  const columns = useMemo<ColumnDef<CRMRecord>[]>(() => {
    const fields = Object.keys(CRM_FIELD_LABELS) as (keyof CRMRecord)[];
    return fields.map((field) => ({
      id: field,
      header: CRM_FIELD_LABELS[field],
      accessorKey: field,
      cell: (info) => {
        const value = info.getValue() as string | null;
        if (field === 'crm_status') {
          return value ? (
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
              {value.replace(/_/g, ' ')}
            </span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">-</span>
          );
        }
        return (
          <span className="text-sm text-gray-700 dark:text-gray-300 block truncate max-w-[200px]" title={value || ''}>
            {value || '-'}
          </span>
        );
      },
    }));
  }, []);

  const table = useReactTable({
    data,
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
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">{imported}</p>
          <p className="text-sm text-green-600 dark:text-green-500">Imported</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{skipped}</p>
          <p className="text-sm text-yellow-600 dark:text-yellow-500">Skipped</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{records.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Records</p>
        </div>
      </div>

      {errors.length > 0 && (
        <details className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <summary className="text-sm font-medium text-red-700 dark:text-red-400 cursor-pointer">
            {errors.length} warning{errors.length !== 1 ? 's' : ''}
          </summary>
          <ul className="mt-2 space-y-1">
            {errors.map((err, i) => (
              <li key={i} className="text-xs text-red-600 dark:text-red-400">
                {err}
              </li>
            ))}
          </ul>
        </details>
      )}

      {records.length > 0 && (
        <div
          ref={tableContainerRef}
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-auto max-h-[500px]"
        >
          <div style={{ minWidth: columns.length * 160 }}>
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
      )}

      <div className="flex justify-center">
        <button
          onClick={onReset}
          className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
        >
          Import another file
        </button>
      </div>
    </div>
  );
}
