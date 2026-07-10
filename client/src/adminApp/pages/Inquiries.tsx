import React, { useState, useMemo } from 'react';
import { 
  createColumnHelper, 
  flexRender, 
  getCoreRowModel, 
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable
} from '@tanstack/react-table';

import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Data
type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  date: string;
  status: 'New' | 'Contacted' | 'Confirmed' | 'Completed' | 'Cancelled';
  assignedTo?: string;
};

const mockData: Inquiry[] = [
  { id: 'INQ-001', name: 'Arun Kumar', email: 'arun@example.com', phone: '+91 9876543210', eventType: 'Wedding', date: '2026-10-15', status: 'New' },
  { id: 'INQ-002', name: 'Priya Raj', email: 'priya@example.com', phone: '+91 8765432109', eventType: 'Birthday', date: '2026-08-20', status: 'Contacted', assignedTo: 'Siva' },
  { id: 'INQ-003', name: 'Karthik S', email: 'karthik@example.com', phone: '+91 7654321098', eventType: 'Corporate', date: '2026-09-05', status: 'Confirmed', assignedTo: 'Meena' },
  { id: 'INQ-004', name: 'Divya M', email: 'divya@example.com', phone: '+91 6543210987', eventType: 'Valaikappu', date: '2026-07-25', status: 'Completed', assignedTo: 'Siva' },
  { id: 'INQ-005', name: 'Ramesh V', email: 'ramesh@example.com', phone: '+91 5432109876', eventType: 'Wedding', date: '2026-11-12', status: 'Cancelled' },
  { id: 'INQ-006', name: 'Anita P', email: 'anita@example.com', phone: '+91 4321098765', eventType: 'Engagement', date: '2026-12-01', status: 'New' },
];

const columnHelper = createColumnHelper<Inquiry>();

export default function Inquiries() {
  const [data, setData] = useState(() => [...mockData]);
  const [sorting, setSorting] = useState<any>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New': return <span className="badge badge-blue">New</span>;
      case 'Contacted': return <span className="badge badge-yellow">Contacted</span>;
      case 'Confirmed': return <span className="badge badge-green">Confirmed</span>;
      case 'Completed': return <span className="badge" style={{ backgroundColor: '#10B981', color: 'white' }}>Completed</span>; // Emerald
      case 'Cancelled': return <span className="badge badge-red">Cancelled</span>;
      default: return <span className="badge bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-[#C89B3C] focus:ring-[#C89B3C]"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-[#C89B3C] focus:ring-[#C89B3C]"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    }),
    columnHelper.accessor('id', {
      header: 'ID',
      cell: info => <span className="font-medium text-gray-900">{info.getValue()}</span>,
    }),
    columnHelper.accessor('name', {
      header: 'Client',
      cell: info => (
        <div>
          <div className="font-medium text-gray-900">{info.getValue()}</div>
          <div className="text-gray-500 text-xs">{info.row.original.email}</div>
        </div>
      ),
    }),
    columnHelper.accessor('eventType', {
      header: 'Event Type',
    }),
    columnHelper.accessor('date', {
      header: ({ column }) => {
        return (
          <button
            className="flex items-center space-x-1 hover:text-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>Date</span>
            <ArrowUpDown size={14} />
          </button>
        )
      },
      cell: info => new Date(info.getValue()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => getStatusBadge(info.getValue()),
    }),
    columnHelper.accessor('assignedTo', {
      header: 'Assignee',
      cell: info => info.getValue() ? (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
            {info.getValue()?.charAt(0)}
          </div>
          <span className="text-sm">{info.getValue()}</span>
        </div>
      ) : (
        <span className="text-gray-400 italic text-sm">Unassigned</span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: () => (
        <div className="flex justify-end items-center space-x-2">
          <button className="p-1.5 text-gray-400 hover:text-[#C89B3C] transition-colors rounded-md hover:bg-[#C89B3C]/10" title="View">
            <Eye size={16} />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50" title="Edit">
            <Edit size={16} />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    }),
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track all customer inquiries and event requests.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={16} className="mr-2" />
            Export CSV
          </button>
          <button className="flex items-center px-4 py-2 bg-[#C89B3C] text-white rounded-md text-sm font-medium hover:bg-[#b08630] transition-colors shadow-sm">
            <UserPlus size={16} className="mr-2" />
            New Inquiry
          </button>
        </div>
      </div>

      <div className="admin-card overflow-hidden !p-0">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 bg-white">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search inquiries..." 
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/50"
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 w-full sm:w-auto justify-center">
              <Filter size={16} className="mr-2 text-gray-400" />
              Filters
            </button>
            {Object.keys(rowSelection).length > 0 && (
              <button className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Bulk Actions <MoreHorizontal size={16} className="ml-2 text-gray-400" />
              </button>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="admin-table min-w-full">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12 text-gray-500">
                    No inquiries found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-white">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to <span className="font-medium text-gray-900">{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getPrePaginationRowModel().rows.length)}</span> of <span className="font-medium text-gray-900">{table.getPrePaginationRowModel().rows.length}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-600"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-600"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
