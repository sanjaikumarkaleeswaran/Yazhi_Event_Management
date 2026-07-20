import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, Search, Eye, Edit2, Trash2, X, ChevronLeft, ChevronRight, 
  Download, Calendar, Users, FileText, CheckSquare, MessageCircle, Send, Printer
} from 'lucide-react';
import { 
  useBookings, useCreateBooking, useUpdateBooking, useDeleteBooking, 
  useBulkUpdateBookings, useBulkDeleteBookings, type BookingData 
} from '../../shared/hooks/useBookings';
import { useVendors } from '../../shared/hooks/useVendors';
import { useTeam } from '../../shared/hooks/useTeam';
import { useDocuments } from '../../shared/hooks/useDocuments';
import { useCommunication } from '../../shared/hooks/useCommunication';

const PAGE_SIZE = 10;
const EVENT_TYPES = ['Wedding', 'Birthday', 'Corporate', 'Valaikappu', 'Engagement', 'Anniversary', 'Other'];
const STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled'];
const PAYMENT_STATUSES = ['Pending', 'Partially Paid', 'Paid', 'Refunded'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const STATUS_STYLES: Record<string, string> = {
  Confirmed: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-700',
  Rescheduled: 'bg-purple-100 text-purple-700',
  'Partially Paid': 'bg-orange-100 text-orange-700',
  Paid: 'bg-emerald-100 text-emerald-700',
  Refunded: 'bg-gray-100 text-gray-700'
};

const bookingSchema = z.object({
  clientName: z.string().min(1, 'Client Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  eventType: z.string().min(1, 'Event Type is required'),
  eventDate: z.string().min(1, 'Event Date is required'),
  venue: z.string().optional(),
  packageName: z.string().optional(),
  amount: z.coerce.number().min(0, 'Amount must be positive'),
  guestCount: z.coerce.number().optional(),
  eventBudget: z.coerce.number().optional(),
  status: z.enum(['Confirmed', 'Pending', 'Completed', 'Cancelled', 'Rescheduled']),
  paymentStatus: z.enum(['Pending', 'Partially Paid', 'Paid', 'Refunded']),
  eventPriority: z.enum(['Low', 'Medium', 'High']),
  notes: z.string().optional(),
  internalNotes: z.string().optional()
});

type FormData = z.infer<typeof bookingSchema>;

export default function Bookings() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const { data: response, isLoading } = useBookings({
    page,
    limit: PAGE_SIZE,
    search,
    status: statusFilter === 'All' ? undefined : statusFilter,
  });
  
  const bookings = response?.data || [];
  const meta = (response as any)?.meta || { total: 0, totalPages: 1, page: 1 };

  const createBookingMutation = useCreateBooking();
  const updateBookingMutation = useUpdateBooking();
  const deleteBookingMutation = useDeleteBooking();
  const bulkUpdateMutation = useBulkUpdateBookings();
  const bulkDeleteMutation = useBulkDeleteBookings();

  const [modal, setModal] = useState<'create' | 'edit' | 'drawer' | 'delete' | null>(null);
  const [selected, setSelected] = useState<BookingData | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [assigningVendor, setAssigningVendor] = useState(false);
  const [assigningTeam, setAssigningTeam] = useState(false);
  const [messagingStatus, setMessagingStatus] = useState<string | null>(null);

  const { data: vendorsResponse } = useVendors({ limit: 100 });
  const allVendors = vendorsResponse?.data || [];
  const { data: teamResponse } = useTeam({ limit: 100 });
  const allTeam = teamResponse?.data || [];

  const { openDocument, getInvoiceUrl, getContractUrl } = useDocuments();
  const { sendWhatsApp, sendSMS } = useCommunication();

  const handleSendWhatsAppAlert = (b: BookingData) => {
    sendWhatsApp.mutate({
      recipientPhone: b.phone,
      recipientName: b.clientName,
      title: 'Booking Update',
      body: `Hello ${b.clientName}, your booking #${b.bookingNumber} for ${b.eventType} is currently ${b.status}. Total Amount: ₹${b.amount.toLocaleString('en-IN')}. - Yazhi Events`,
    }, {
      onSuccess: () => {
        setMessagingStatus('WhatsApp notification sent successfully!');
        setTimeout(() => setMessagingStatus(null), 4000);
      }
    });
  };

  const handleSendSMSAlert = (b: BookingData) => {
    sendSMS.mutate({
      recipientPhone: b.phone,
      recipientName: b.clientName,
      title: 'Yazhi Alert',
      body: `Yazhi Events: ${b.clientName}, your ${b.eventType} event on ${new Date(b.eventDate).toLocaleDateString()} is confirmed. Contact us for updates.`,
    }, {
      onSuccess: () => {
        setMessagingStatus('SMS alert dispatched!');
        setTimeout(() => setMessagingStatus(null), 4000);
      }
    });
  };

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(bookingSchema) as any
  });

  const openCreate = () => {
    setSelected(null);
    reset({ 
      clientName: '', email: '', phone: '', eventType: 'Wedding', eventDate: '', venue: '', 
      packageName: 'Gold', amount: 0, guestCount: 100, eventBudget: 0,
      status: 'Pending', paymentStatus: 'Pending', eventPriority: 'Medium', notes: '', internalNotes: '' 
    });
    setModal('create');
  };

  const openEdit = (b: BookingData) => {
    setSelected(b);
    Object.entries(b).forEach(([k, v]) => {
      if (k === 'eventDate' && v) setValue(k as any, new Date(v as string).toISOString().split('T')[0]);
      else setValue(k as any, v);
    });
    setModal('edit');
  };

  const onSubmit = (data: FormData) => {
    if (modal === 'create') {
      createBookingMutation.mutate(data);
    } else if (modal === 'edit' && selected) {
      updateBookingMutation.mutate({ id: selected._id!, data });
    }
    setModal(null);
  };

  const handleAssignVendor = (vendorId: string) => {
    if (!selected) return;
    const currentVendors = selected.assignedVendors || [];
    const currentIds = currentVendors.map((v: any) => v._id || v);
    if (!currentIds.includes(vendorId)) {
      updateBookingMutation.mutate({ 
        id: selected._id!, 
        data: { assignedVendors: [...currentIds, vendorId] } as any 
      }, {
        onSuccess: (res: any) => setSelected(res.data)
      });
    }
    setAssigningVendor(false);
  };

  const handleRemoveVendor = (vendorId: string) => {
    if (!selected || !window.confirm('Remove vendor from this booking?')) return;
    const currentVendors = selected.assignedVendors || [];
    const currentIds = currentVendors.map((v: any) => v._id || v);
    updateBookingMutation.mutate({ 
      id: selected._id!, 
      data: { assignedVendors: currentIds.filter((id: string) => id !== vendorId) } as any 
    }, {
      onSuccess: (res: any) => setSelected(res.data)
    });
  };

  const handleAssignTeam = (memberId: string) => {
    if (!selected) return;
    const currentTeam = selected.assignedTeam || [];
    const currentIds = currentTeam.map((t: any) => t._id || t);
    if (!currentIds.includes(memberId)) {
      updateBookingMutation.mutate({ 
        id: selected._id!, 
        data: { assignedTeam: [...currentIds, memberId] } as any 
      }, {
        onSuccess: (res: any) => setSelected(res.data)
      });
    }
    setAssigningTeam(false);
  };

  const handleRemoveTeam = (memberId: string) => {
    if (!selected || !window.confirm('Remove team member from this booking?')) return;
    const currentTeam = selected.assignedTeam || [];
    const currentIds = currentTeam.map((t: any) => t._id || t);
    updateBookingMutation.mutate({ 
      id: selected._id!, 
      data: { assignedTeam: currentIds.filter((id: string) => id !== memberId) } as any 
    }, {
      onSuccess: (res: any) => setSelected(res.data)
    });
  };

  const handleDelete = () => {
    if (selected?._id) deleteBookingMutation.mutate(selected._id);
    setModal(null);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} bookings?`)) {
      bulkDeleteMutation.mutate({ ids: selectedIds });
      setSelectedIds([]);
    }
  };

  const handleBulkStatusUpdate = (status: any) => {
    if (window.confirm(`Update status to ${status} for ${selectedIds.length} bookings?`)) {
      bulkUpdateMutation.mutate({ ids: selectedIds, updateData: { status } });
      setSelectedIds([]);
    }
  };

  const exportCSV = () => {
    const headers = ['Booking Number', 'Client', 'Phone', 'Event', 'Date', 'Status', 'Payment', 'Amount'];
    const rows = bookings.map((b: any) => [
      b.bookingNumber || b._id, b.clientName, b.phone, b.eventType, 
      new Date(b.eventDate).toLocaleDateString(), b.status, b.paymentStatus || 'Pending', b.amount
    ]);
    const csv = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Yazhi_Bookings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === bookings.length) setSelectedIds([]);
    else setSelectedIds(bookings.map((b: any) => b._id!));
  };

  const inp = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30 focus:border-[#C89B3C] bg-white';
  const lbl = 'block text-xs font-semibold text-gray-600 mb-1.5';
  const err = 'text-xs text-red-500 mt-1';

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-sm text-gray-500 mt-1">{meta.total} total bookings found</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <Download size={15} /> Export
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <Plus size={15} /> New Booking
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 min-w-0 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by ID, Name, Phone, Email, Venue..."
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30" />
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 mr-4 border-r border-gray-200 pr-4">
                <span className="text-xs font-semibold text-gray-600">{selectedIds.length} selected</span>
                <select onChange={(e) => handleBulkStatusUpdate(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none">
                  <option value="">Update Status...</option>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={handleBulkDelete} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
              </div>
            )}
            <div className="flex gap-1.5">
              {['All', ...STATUSES].map(s => (
                <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === s ? 'bg-[#18181B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading bookings...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3"><input type="checkbox" checked={selectedIds.length === bookings.length && bookings.length > 0} onChange={toggleSelectAll} className="rounded text-[#C89B3C] focus:ring-[#C89B3C]" /></th>
                  {['Booking Ref', 'Client Info', 'Event Details', 'Package/Amount', 'Payment', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No bookings found matching criteria.</td></tr>
                ) : bookings.map((b: any, i: number) => (
                  <motion.tr key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className={`hover:bg-gray-50 transition-colors group ${selectedIds.includes(b._id) ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-4 py-4"><input type="checkbox" checked={selectedIds.includes(b._id)} onChange={() => toggleSelect(b._id)} className="rounded text-[#C89B3C] focus:ring-[#C89B3C]" /></td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-500">{b.bookingNumber}</td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-gray-900">{b.clientName}</p>
                      <p className="text-xs text-gray-500">{b.phone}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-gray-800">{b.eventType}</p>
                      <p className="text-xs text-gray-500">{new Date(b.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-gray-800">{b.packageName || 'Custom'}</p>
                      <p className="text-xs font-bold text-gray-900">₹{b.amount.toLocaleString('en-IN')}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[b.paymentStatus || 'Pending']}`}>{b.paymentStatus || 'Pending'}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setSelected(b); setModal('drawer'); }} className="p-1.5 text-gray-400 hover:text-[#C89B3C] hover:bg-amber-50 rounded-lg transition-colors" title="View"><Eye size={16} /></button>
                        <button onClick={() => openEdit(b)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => { setSelected(b); setModal('delete'); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">Showing page {meta.page} of {meta.totalPages}</p>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 text-gray-600"><ChevronLeft size={14} /></button>
            <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}
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
              className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold text-gray-900">{modal === 'create' ? 'New Event Booking' : 'Edit Booking'}</h2>
                <button type="button" onClick={() => setModal(null)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                
                <div>
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Client Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label className={lbl}>Full Name *</label><input {...register('clientName')} className={inp} placeholder="Client name" />{errors.clientName && <p className={err}>{errors.clientName.message}</p>}</div>
                    <div><label className={lbl}>Email *</label><input {...register('email')} className={inp} placeholder="email@domain.com" />{errors.email && <p className={err}>{errors.email.message}</p>}</div>
                    <div><label className={lbl}>Phone *</label><input {...register('phone')} className={inp} placeholder="+91..." />{errors.phone && <p className={err}>{errors.phone.message}</p>}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Event Configuration</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label className={lbl}>Event Type *</label>
                      <select {...register('eventType')} className={inp}>{EVENT_TYPES.map(t => <option key={t}>{t}</option>)}</select>
                    </div>
                    <div><label className={lbl}>Event Date *</label><input type="date" {...register('eventDate')} className={inp} />{errors.eventDate && <p className={err}>{errors.eventDate.message}</p>}</div>
                    <div><label className={lbl}>Venue</label><input {...register('venue')} className={inp} placeholder="Venue name & location" /></div>
                    <div><label className={lbl}>Package</label><input {...register('packageName')} className={inp} placeholder="e.g. Gold Package" /></div>
                    <div><label className={lbl}>Expected Guests</label><input type="number" {...register('guestCount')} className={inp} placeholder="100" /></div>
                    <div><label className={lbl}>Event Priority</label>
                      <select {...register('eventPriority')} className={inp}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Financials & Status</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label className={lbl}>Amount (₹) *</label><input type="number" {...register('amount')} className={inp} />{errors.amount && <p className={err}>{errors.amount.message}</p>}</div>
                    <div><label className={lbl}>Booking Status</label>
                      <select {...register('status')} className={inp}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
                    </div>
                    <div><label className={lbl}>Payment Status</label>
                      <select {...register('paymentStatus')} className={inp}>{PAYMENT_STATUSES.map(s => <option key={s}>{s}</option>)}</select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={lbl}>Public Notes (Visible to Client)</label>
                    <textarea {...register('notes')} rows={3} className={`${inp} resize-none`} placeholder="Special requirements..." />
                  </div>
                  <div><label className={lbl}>Internal Notes (Admin Only)</label>
                    <textarea {...register('internalNotes')} rows={3} className={`${inp} resize-none bg-amber-50/30`} placeholder="Private team notes..." />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-gray-100">
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

      {/* Booking Details Drawer */}
      <AnimatePresence>
        {modal === 'drawer' && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50 flex justify-end backdrop-blur-sm">
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col">
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{selected.clientName}</h2>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[selected.status]}`}>{selected.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono">{selected.bookingNumber}</p>
                  </div>
                  <button onClick={() => setModal(null)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {['Overview', 'Timeline', 'Team & Vendors', 'Documents'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-[#18181B] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'Overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2"><Calendar size={14} /> <span className="text-xs font-semibold uppercase">Event Info</span></div>
                        <p className="text-sm font-semibold text-gray-900">{selected.eventType}</p>
                        <p className="text-sm text-gray-600 mt-1">{new Date(selected.eventDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="text-sm text-gray-600 mt-1">{selected.venue || 'Venue TBD'}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2"><Users size={14} /> <span className="text-xs font-semibold uppercase">Client Contact</span></div>
                        <p className="text-sm font-semibold text-gray-900">{selected.phone}</p>
                        <p className="text-sm text-gray-600 mt-1 truncate">{selected.email}</p>
                        <p className="text-sm text-gray-600 mt-1">Guests: {selected.guestCount || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="p-5 rounded-xl bg-amber-50/50 border border-amber-100/50">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-gray-900">Financial Overview</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[selected.paymentStatus || 'Pending']}`}>{selected.paymentStatus || 'Pending'}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Package: {selected.packageName || 'Custom'}</p>
                          <p className="text-2xl font-bold text-gray-900">₹{selected.amount.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>

                    {selected.notes && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-2">Public Notes</h3>
                        <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap">{selected.notes}</p>
                      </div>
                    )}
                    {selected.internalNotes && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-2">Internal Notes (Admin Only)</h3>
                        <p className="text-sm text-gray-700 bg-amber-50/30 p-4 rounded-xl border border-amber-100/50 whitespace-pre-wrap">{selected.internalNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'Timeline' && (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                    {selected.timeline?.slice().reverse().map((t: any, idx: number) => (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-gray-100 text-gray-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                          <CheckSquare size={16} />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-sm text-gray-900">{t.action}</h4>
                            <time className="text-[10px] text-gray-400 font-mono">{new Date(t.date).toLocaleString('en-IN')}</time>
                          </div>
                          <p className="text-xs text-gray-600">{t.description}</p>
                        </div>
                      </div>
                    )) || <p className="text-sm text-gray-400 text-center py-10">No timeline events found.</p>}
                  </div>
                )}

                {activeTab === 'Team & Vendors' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Team Assignment Panel */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-gray-900">Assigned Team</h3>
                          <button onClick={() => setAssigningTeam(!assigningTeam)} className="px-3 py-1.5 bg-[#C89B3C] text-white rounded-lg text-xs font-semibold hover:bg-[#b08630] transition-colors">
                            {assigningTeam ? 'Cancel' : '+ Assign Staff'}
                          </button>
                        </div>

                        {assigningTeam && (
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <label className={lbl}>Select available staff to assign</label>
                            <select 
                              className={inp} 
                              onChange={(e) => {
                                if (e.target.value) handleAssignTeam(e.target.value);
                              }}
                              defaultValue=""
                            >
                              <option value="" disabled>Select Staff...</option>
                              {allTeam
                                .filter((m: any) => !(selected.assignedTeam || []).map((t: any) => t._id || t).includes(m._id))
                                .map((m: any) => (
                                  <option key={m._id} value={m._id}>{m.firstName} {m.lastName} - {m.designation} ({m.availabilityStatus})</option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="space-y-2">
                          {(selected.assignedTeam?.length || 0) === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-xl">No team members assigned.</p>
                          ) : (
                            selected.assignedTeam?.map((m: any) => (
                              <div key={m._id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl bg-white shadow-xs">
                                <div>
                                  <h4 className="font-bold text-xs text-gray-900">{m.firstName} {m.lastName}</h4>
                                  <p className="text-[10px] text-gray-500">{m.designation} · {m.department}</p>
                                </div>
                                <button onClick={() => handleRemoveTeam(m._id)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg">
                                  <X size={14} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Vendor Assignment Panel */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-gray-900">Assigned Vendors</h3>
                          <button onClick={() => setAssigningVendor(!assigningVendor)} className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors">
                            {assigningVendor ? 'Cancel' : '+ Assign Vendor'}
                          </button>
                        </div>

                        {assigningVendor && (
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <label className={lbl}>Select a vendor to assign</label>
                            <select 
                              className={inp} 
                              onChange={(e) => {
                                if (e.target.value) handleAssignVendor(e.target.value);
                              }}
                              defaultValue=""
                            >
                              <option value="" disabled>Select Vendor...</option>
                              {allVendors
                                .filter((v: any) => !(selected.assignedVendors || []).map((av: any) => av._id || av).includes(v._id))
                                .map((v: any) => (
                                  <option key={v._id} value={v._id}>{v.businessName} - {v.category} ({v.availabilityStatus})</option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="space-y-2">
                          {(selected.assignedVendors?.length || 0) === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-xl">No vendors assigned yet.</p>
                          ) : (
                            selected.assignedVendors?.map((v: any) => (
                              <div key={v._id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl bg-white shadow-xs">
                                <div>
                                  <h4 className="font-bold text-xs text-gray-900">{v.businessName}</h4>
                                  <p className="text-[10px] text-gray-500">{v.category} • {v.primaryContact || 'N/A'}</p>
                                </div>
                                <button onClick={() => handleRemoveVendor(v._id)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg">
                                  <X size={14} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {activeTab === 'Documents' && (
                  <div className="space-y-6">
                    {messagingStatus && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl animate-fade-in">
                        {messagingStatus}
                      </div>
                    )}
                    
                    {/* PDF Generation Hub */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Automated Document Generator (PDF)</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => openDocument(getInvoiceUrl(selected._id!))}
                          className="flex items-center justify-center gap-2 p-3 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
                        >
                          <FileText size={15} /> Download Invoice PDF
                        </button>
                        <button
                          onClick={() => openDocument(getContractUrl(selected._id!))}
                          className="flex items-center justify-center gap-2 p-3 bg-burgundy-700 bg-rose-900 text-white rounded-xl text-xs font-semibold hover:bg-rose-800 transition-colors shadow-xs"
                        >
                          <Printer size={15} /> Download Contract PDF
                        </button>
                      </div>
                    </div>

                    {/* Dispatch Messaging Hub */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Automated CRM Communication Alerts</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleSendWhatsAppAlert(selected)}
                          className="flex items-center justify-center gap-2 p-3 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
                        >
                          <MessageCircle size={15} /> Send WhatsApp Alert
                        </button>
                        <button
                          onClick={() => handleSendSMSAlert(selected)}
                          className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
                        >
                          <Send size={15} /> Send SMS Alert
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <button className="w-full py-6 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-[#C89B3C]/50 transition-colors">
                        <FileText size={20} className="mb-1 text-gray-400" />
                        <span className="text-xs font-semibold">Upload Additional Documents / Contracts</span>
                        <span className="text-[10px] text-gray-400">PDF, JPG, PNG up to 10MB</span>
                      </button>
                    </div>

                    {selected.documents?.length ? (
                      <div className="space-y-2">
                        {selected.documents.map((d: any, i: number) => (
                          <div key={i} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl">
                            <span className="text-sm font-medium">{d.name}</span>
                            <a href={d.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#C89B3C] hover:underline">View</a>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}

              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button onClick={() => openEdit(selected)} className="flex-1 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors">Edit Booking</button>
                <button onClick={() => setModal(null)} className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100">Close</button>
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
              <p className="text-sm text-gray-500 mb-6">Booking <strong>{selected.bookingNumber}</strong> will be permanently removed. This action cannot be undone.</p>
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
