import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Plus, Search, Eye, Edit2, Trash2, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

type Booking = {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  venue: string;
  packageName: string;
  amount: number;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled' | 'Rescheduled';
  notes: string;
  createdAt: string;
};

const EVENT_TYPES = ['Wedding', 'Birthday', 'Corporate', 'Valaikappu', 'Engagement', 'Anniversary', 'Other'];
const PACKAGES = ['Silver', 'Gold', 'Platinum', 'Custom'];
const STATUSES: Booking['status'][] = ['Confirmed', 'Pending', 'Completed', 'Cancelled', 'Rescheduled'];

const STATUS_STYLES: Record<string, string> = {
  Confirmed:   'bg-green-100 text-green-700',
  Pending:     'bg-yellow-100 text-yellow-700',
  Completed:   'bg-blue-100 text-blue-700',
  Cancelled:   'bg-red-100 text-red-700',
  Rescheduled: 'bg-purple-100 text-purple-700',
};

const seed: Booking[] = [
  { id: 'BK-001', clientName: 'Arun Kumar', email: 'arun@example.com', phone: '+91 9876543210', eventType: 'Wedding', eventDate: '2026-10-15', venue: 'Sri Mahal, Tiruppur', packageName: 'Gold', amount: 150000, status: 'Confirmed', notes: 'Outdoor ceremony preferred.', createdAt: '2026-07-01' },
  { id: 'BK-002', clientName: 'Priya Raj', email: 'priya@example.com', phone: '+91 8765432109', eventType: 'Birthday', eventDate: '2026-08-20', venue: 'Home, Coimbatore', packageName: 'Silver', amount: 75000, status: 'Pending', notes: '', createdAt: '2026-07-03' },
  { id: 'BK-003', clientName: 'Karthik S', email: 'karthik@example.com', phone: '+91 7654321098', eventType: 'Corporate', eventDate: '2026-09-05', venue: 'Hotel Ritz, Chennai', packageName: 'Platinum', amount: 300000, status: 'Completed', notes: 'Full AV setup needed.', createdAt: '2026-06-15' },
  { id: 'BK-004', clientName: 'Divya M', email: 'divya@example.com', phone: '+91 6543210987', eventType: 'Valaikappu', eventDate: '2026-07-25', venue: 'Community Hall, Tiruppur', packageName: 'Gold', amount: 120000, status: 'Rescheduled', notes: '', createdAt: '2026-07-05' },
  { id: 'BK-005', clientName: 'Ramesh V', email: 'ramesh@example.com', phone: '+91 5432109876', eventType: 'Wedding', eventDate: '2026-11-12', venue: 'Grand Palace, Erode', packageName: 'Platinum', amount: 300000, status: 'Cancelled', notes: 'Client cancelled due to personal reasons.', createdAt: '2026-07-08' },
];

const PAGE_SIZE = 5;

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>(seed);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<'create' | 'edit' | 'view' | 'delete' | null>(null);
  const [selected, setSelected] = useState<Booking | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Omit<Booking, 'id' | 'createdAt'>>();

  const filtered = bookings.filter(b =>
    (statusFilter === 'All' || b.status === statusFilter) &&
    (b.clientName.toLowerCase().includes(search.toLowerCase()) ||
      b.eventType.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    setSelected(null);
    reset({ clientName: '', email: '', phone: '', eventType: 'Wedding', eventDate: '', venue: '', packageName: 'Gold', amount: 0, status: 'Pending', notes: '' });
    setModal('create');
  };

  const openEdit = (b: Booking) => {
    setSelected(b);
    Object.entries(b).forEach(([k, v]) => {
      if (k !== 'id' && k !== 'createdAt') setValue(k as any, v);
    });
    setModal('edit');
  };

  const onSubmit = (data: Omit<Booking, 'id' | 'createdAt'>) => {
    if (modal === 'create') {
      const newId = 'BK-' + String(bookings.length + 1).padStart(3, '0');
      setBookings(bs => [...bs, { ...data, id: newId, createdAt: new Date().toISOString().split('T')[0] }]);
    } else if (modal === 'edit' && selected) {
      setBookings(bs => bs.map(b => b.id === selected.id ? { ...b, ...data } : b));
    }
    setModal(null);
  };

  const handleDelete = () => {
    if (selected) setBookings(bs => bs.filter(b => b.id !== selected.id));
    setModal(null);
  };

  const inp = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30 focus:border-[#C89B3C] bg-white';
  const lbl = 'block text-xs font-semibold text-gray-600 mb-1.5';

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">{bookings.length} total bookings</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus size={15} /> New Booking
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by client, event type or ID..."
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['All', ...STATUSES].map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === s ? 'bg-[#18181B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Booking ID', 'Client', 'Event', 'Date', 'Package', 'Amount', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No bookings found.</td></tr>
              ) : paginated.map((b, i) => (
                <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-4 text-xs font-bold text-gray-400">{b.id}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-gray-900">{b.clientName}</p>
                    <p className="text-xs text-gray-400">{b.phone}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">{b.eventType}</td>
                  <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">{new Date(b.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{b.packageName}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900">₹{b.amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setSelected(b); setModal('view'); }} className="p-1.5 text-gray-400 hover:text-[#C89B3C] hover:bg-amber-50 rounded-lg transition-colors" title="View"><Eye size={14} /></button>
                      <button onClick={() => openEdit(b)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit2 size={14} /></button>
                      <button onClick={() => { setSelected(b); setModal('delete'); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 text-gray-600"><ChevronLeft size={14} /></button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i + 1} onClick={() => setPage(i + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold ${page === i + 1 ? 'bg-[#18181B] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 text-gray-600"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {(modal === 'create' || modal === 'edit') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">{modal === 'create' ? 'New Booking' : 'Edit Booking'}</h2>
                <button onClick={() => setModal(null)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={lbl}>Client Name *</label><input {...register('clientName', { required: true })} className={inp} placeholder="Full name" /></div>
                  <div><label className={lbl}>Email *</label><input {...register('email', { required: true })} className={inp} placeholder="client@email.com" /></div>
                  <div><label className={lbl}>Phone *</label><input {...register('phone', { required: true })} className={inp} placeholder="+91 XXXXX XXXXX" /></div>
                  <div><label className={lbl}>Event Type *</label>
                    <select {...register('eventType')} className={inp}>
                      {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div><label className={lbl}>Event Date *</label><input type="date" {...register('eventDate', { required: true })} className={inp} /></div>
                  <div><label className={lbl}>Venue</label><input {...register('venue')} className={inp} placeholder="Venue name & city" /></div>
                  <div><label className={lbl}>Package</label>
                    <select {...register('packageName')} className={inp}>
                      {PACKAGES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div><label className={lbl}>Amount (₹) *</label><input type="number" {...register('amount', { required: true, min: 0 })} className={inp} placeholder="150000" /></div>
                  <div><label className={lbl}>Status</label>
                    <select {...register('status')} className={inp}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div><label className={lbl}>Notes</label>
                  <textarea {...register('notes')} rows={3} className={`${inp} resize-none`} placeholder="Any special requirements or notes..." />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors">
                    {modal === 'create' ? 'Create Booking' : 'Save Changes'}
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
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selected.clientName}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{selected.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[selected.status]}`}>{selected.status}</span>
                  <button onClick={() => setModal(null)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {[
                  ['Event Type', selected.eventType], ['Event Date', new Date(selected.eventDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
                  ['Venue', selected.venue || '—'], ['Package', selected.packageName],
                  ['Amount', `₹${selected.amount.toLocaleString('en-IN')}`],
                  ['Email', selected.email], ['Phone', selected.phone],
                  ['Created', selected.createdAt], ['Notes', selected.notes || '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{k}</span>
                    <span className="text-sm text-gray-800 font-medium text-right max-w-[60%]">{v}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100 flex gap-2">
                <button onClick={() => openEdit(selected)} className="flex-1 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors">Edit Booking</button>
                <button onClick={() => setModal(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {modal === 'delete' && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-500" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Booking?</h3>
              <p className="text-sm text-gray-500 mb-6">Booking <strong>{selected.id}</strong> for <strong>{selected.clientName}</strong> will be permanently removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
