import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Plus, Eye, Edit2, Trash2, X, Search, ChevronLeft, ChevronRight, Download } from 'lucide-react';

type Payment = {
  id: string;
  invoiceNo: string;
  clientName: string;
  bookingId: string;
  amount: number;
  paid: number;
  due: number;
  method: 'Razorpay' | 'Cash' | 'Bank Transfer' | 'UPI';
  status: 'Paid' | 'Pending' | 'Partial' | 'Refunded' | 'Overdue';
  dueDate: string;
  paidDate: string;
  notes: string;
};

const METHODS: Payment['method'][] = ['Razorpay', 'Cash', 'Bank Transfer', 'UPI'];
const STATUSES: Payment['status'][] = ['Paid', 'Pending', 'Partial', 'Refunded', 'Overdue'];
const PAGE_SIZE = 5;

const STATUS_STYLES: Record<string, string> = {
  Paid:      'bg-green-100 text-green-700',
  Pending:   'bg-yellow-100 text-yellow-700',
  Partial:   'bg-blue-100 text-blue-700',
  Refunded:  'bg-purple-100 text-purple-700',
  Overdue:   'bg-red-100 text-red-700',
};

const seed: Payment[] = [
  { id: 'PAY-001', invoiceNo: 'INV-2026-001', clientName: 'Arun Kumar', bookingId: 'BK-001', amount: 150000, paid: 150000, due: 0, method: 'Razorpay', status: 'Paid', dueDate: '2026-09-15', paidDate: '2026-07-01', notes: '' },
  { id: 'PAY-002', invoiceNo: 'INV-2026-002', clientName: 'Priya Raj', bookingId: 'BK-002', amount: 75000, paid: 37500, due: 37500, method: 'UPI', status: 'Partial', dueDate: '2026-08-01', paidDate: '2026-07-03', notes: 'Balance due before event' },
  { id: 'PAY-003', invoiceNo: 'INV-2026-003', clientName: 'Karthik S', bookingId: 'BK-003', amount: 300000, paid: 300000, due: 0, method: 'Bank Transfer', status: 'Paid', dueDate: '2026-08-05', paidDate: '2026-06-20', notes: '' },
  { id: 'PAY-004', invoiceNo: 'INV-2026-004', clientName: 'Divya M', bookingId: 'BK-004', amount: 120000, paid: 0, due: 120000, method: 'Cash', status: 'Pending', dueDate: '2026-07-20', paidDate: '', notes: '' },
  { id: 'PAY-005', invoiceNo: 'INV-2026-005', clientName: 'Ramesh V', bookingId: 'BK-005', amount: 300000, paid: 50000, due: 250000, method: 'Razorpay', status: 'Overdue', dueDate: '2026-07-01', paidDate: '2026-06-15', notes: 'Booking cancelled — refund pending' },
];

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>(seed);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<'create' | 'edit' | 'view' | 'delete' | null>(null);
  const [selected, setSelected] = useState<Payment | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<Omit<Payment, 'id' | 'invoiceNo' | 'due'>>();

  const filtered = payments.filter(p =>
    (statusFilter === 'All' || p.status === statusFilter) &&
    (p.clientName.toLowerCase().includes(search.toLowerCase()) || p.invoiceNo.includes(search))
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totals = {
    total: payments.reduce((s, p) => s + p.amount, 0),
    collected: payments.reduce((s, p) => s + p.paid, 0),
    pending: payments.reduce((s, p) => s + p.due, 0),
  };

  const openCreate = () => {
    setSelected(null);
    reset({ clientName: '', bookingId: '', amount: 0, paid: 0, method: 'Razorpay', status: 'Pending', dueDate: '', paidDate: '', notes: '' });
    setModal('create');
  };
  const openEdit = (p: Payment) => {
    setSelected(p);
    Object.entries(p).forEach(([k, v]) => { if (!['id', 'invoiceNo', 'due'].includes(k)) setValue(k as any, v); });
    setModal('edit');
  };

  const onSubmit = (data: Omit<Payment, 'id' | 'invoiceNo' | 'due'>) => {
    const record = { ...data, due: data.amount - data.paid };
    if (modal === 'create') {
      const newId = 'PAY-' + String(payments.length + 1).padStart(3, '0');
      const inv = 'INV-2026-' + String(payments.length + 1).padStart(3, '0');
      setPayments(ps => [...ps, { ...record, id: newId, invoiceNo: inv }]);
    } else if (modal === 'edit' && selected) {
      setPayments(ps => ps.map(p => p.id === selected.id ? { ...p, ...record } : p));
    }
    setModal(null);
  };

  const inp = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30 focus:border-[#C89B3C] bg-white';
  const lbl = 'block text-xs font-semibold text-gray-600 mb-1.5';

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">{payments.length} transactions</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus size={15} /> Add Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Invoiced', value: totals.total, color: 'bg-gray-900 text-white' },
          { label: 'Collected', value: totals.collected, color: 'bg-emerald-500 text-white' },
          { label: 'Pending', value: totals.pending, color: 'bg-amber-50 text-amber-700' },
        ].map(c => (
          <div key={c.label} className={`rounded-2xl p-5 ${c.color}`}>
            <p className="text-xs font-semibold opacity-70 mb-1">{c.label}</p>
            <p className="text-2xl font-extrabold">₹{(c.value / 1000).toFixed(0)}k</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by client or invoice..."
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['All', ...STATUSES].map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === s ? 'bg-[#18181B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
            ))}
          </div>
          <button className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
            <Download size={13} /> Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Invoice', 'Client', 'Amount', 'Paid', 'Due', 'Method', 'Status', 'Due Date', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm">No payments found.</td></tr>
              ) : paginated.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-4 text-xs font-bold text-gray-400">{p.invoiceNo}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900">{p.clientName}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900">₹{p.amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-4 text-sm text-emerald-600 font-semibold">₹{p.paid.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-4 text-sm text-red-500 font-semibold">{p.due > 0 ? `₹${p.due.toLocaleString('en-IN')}` : '—'}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{p.method}</td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{p.dueDate}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setSelected(p); setModal('view'); }} className="p-1.5 text-gray-400 hover:text-[#C89B3C] hover:bg-amber-50 rounded-lg"><Eye size={14} /></button>
                      <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={14} /></button>
                      <button onClick={() => { setSelected(p); setModal('delete'); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"><ChevronLeft size={14} /></button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold ${page === i + 1 ? 'bg-[#18181B] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(modal === 'create' || modal === 'edit') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">{modal === 'create' ? 'New Payment' : 'Edit Payment'}</h2>
                <button onClick={() => setModal(null)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className={lbl}>Client Name *</label><input {...register('clientName', { required: true })} className={inp} placeholder="Client name" /></div>
                  <div><label className={lbl}>Booking ID</label><input {...register('bookingId')} className={inp} placeholder="BK-001" /></div>
                  <div><label className={lbl}>Payment Method</label>
                    <select {...register('method')} className={inp}>{METHODS.map(m => <option key={m}>{m}</option>)}</select>
                  </div>
                  <div><label className={lbl}>Total Amount (₹) *</label><input type="number" {...register('amount', { required: true })} className={inp} /></div>
                  <div><label className={lbl}>Amount Paid (₹)</label><input type="number" {...register('paid')} className={inp} /></div>
                  <div><label className={lbl}>Status</label>
                    <select {...register('status')} className={inp}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
                  </div>
                  <div><label className={lbl}>Due Date</label><input type="date" {...register('dueDate')} className={inp} /></div>
                  <div className="col-span-2"><label className={lbl}>Notes</label><textarea {...register('notes')} rows={2} className={`${inp} resize-none`} /></div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors">
                    {modal === 'create' ? 'Create Payment' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {modal === 'view' && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-start p-6 border-b border-gray-100">
                <div>
                  <h2 className="font-bold text-gray-900">{selected.invoiceNo}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{selected.clientName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[selected.status]}`}>{selected.status}</span>
                  <button onClick={() => setModal(null)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {[
                  ['Total Amount', `₹${selected.amount.toLocaleString('en-IN')}`],
                  ['Amount Paid', `₹${selected.paid.toLocaleString('en-IN')}`],
                  ['Balance Due', selected.due > 0 ? `₹${selected.due.toLocaleString('en-IN')}` : 'Fully Paid ✓'],
                  ['Method', selected.method],
                  ['Due Date', selected.dueDate],
                  ['Booking ID', selected.bookingId || '—'],
                  ['Notes', selected.notes || '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{k}</span>
                    <span className="text-sm text-gray-800 font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100 flex gap-2">
                <button onClick={() => openEdit(selected)} className="flex-1 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors">Edit</button>
                <button onClick={() => setModal(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete */}
      <AnimatePresence>
        {modal === 'delete' && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-500" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Payment Record?</h3>
              <p className="text-sm text-gray-500 mb-6"><strong>{selected.invoiceNo}</strong> will be permanently deleted.</p>
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={() => { setPayments(ps => ps.filter(p => p.id !== selected.id)); setModal(null); }} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
