import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, Search, Eye, Edit2, Trash2, X, ChevronLeft, ChevronRight, 
  Download, Calendar, CheckSquare, Clock, ArrowRightCircle
} from 'lucide-react';
import { 
  useInquiries, useCreateInquiry, useUpdateInquiry, 
  useBulkUpdateInquiries, useBulkDeleteInquiries, useConvertInquiry, type InquiryData 
} from '../../shared/hooks/useInquiries';


const PAGE_SIZE = 10;
const EVENT_TYPES = ['Wedding', 'Birthday', 'Corporate', 'Valaikappu', 'Engagement', 'Anniversary', 'Other'];
const STATUSES = ['New', 'Contacted', 'Qualified', 'Quotation Sent', 'Negotiation', 'Converted', 'Rejected', 'Archived'];
const SOURCES = ['Website', 'WhatsApp', 'Phone', 'Instagram', 'Facebook', 'Referral', 'Walk-in'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const STATUS_STYLES: Record<string, string> = {
  New: 'bg-blue-100 text-blue-700',
  Contacted: 'bg-yellow-100 text-yellow-700',
  Qualified: 'bg-indigo-100 text-indigo-700',
  'Quotation Sent': 'bg-cyan-100 text-cyan-700',
  Negotiation: 'bg-orange-100 text-orange-700',
  Converted: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  Archived: 'bg-gray-100 text-gray-600'
};

const inquirySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  eventType: z.string().min(1, 'Event Type is required'),
  eventDate: z.string().min(1, 'Event Date is required'),
  city: z.string().min(1, 'City is required'),
  location: z.string().optional(),
  message: z.string().optional(),
  budget: z.coerce.number().optional(),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Quotation Sent', 'Negotiation', 'Converted', 'Rejected', 'Archived']),
  source: z.enum(['Website', 'WhatsApp', 'Phone', 'Instagram', 'Facebook', 'Referral', 'Walk-in']),
  priority: z.enum(['Low', 'Medium', 'High']),
  internalNotes: z.string().optional(),
  followUpDate: z.string().optional().nullable()
});

type FormData = z.infer<typeof inquirySchema>;

export default function Inquiries() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  
  const { data: response, isLoading } = useInquiries({
    page,
    limit: PAGE_SIZE,
    search,
    status: statusFilter === 'All' ? undefined : statusFilter,
    source: sourceFilter === 'All' ? undefined : sourceFilter,
  });
  
  const inquiries = response?.data || [];
  const meta = (response as any)?.meta || { total: 0, totalPages: 1, page: 1 };

  const createMutation = useCreateInquiry();
  const updateMutation = useUpdateInquiry();
  const bulkUpdateMutation = useBulkUpdateInquiries();
  const bulkDeleteMutation = useBulkDeleteInquiries();
  const convertMutation = useConvertInquiry();

  const [modal, setModal] = useState<'create' | 'edit' | 'drawer' | 'delete' | null>(null);
  const [selected, setSelected] = useState<InquiryData | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('Overview');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(inquirySchema) as any
  });

  const openCreate = () => {
    setSelected(null);
    reset({ 
      name: '', email: '', phone: '', eventType: 'Wedding', eventDate: '', city: '', location: '',
      message: '', budget: 0, status: 'New', source: 'Website', priority: 'Medium', internalNotes: '', followUpDate: ''
    });
    setModal('create');
  };

  const openEdit = (i: InquiryData) => {
    setSelected(i);
    Object.entries(i).forEach(([k, v]) => {
      if (k === 'eventDate' && v) setValue(k as any, new Date(v as string).toISOString().split('T')[0]);
      else if (k === 'followUpDate' && v) setValue(k as any, new Date(v as string).toISOString().split('T')[0]);
      else setValue(k as any, v);
    });
    setModal('edit');
  };

  const onSubmit = (data: FormData) => {
    if (modal === 'create') {
      createMutation.mutate(data as any);
    } else if (modal === 'edit' && selected) {
      updateMutation.mutate({ id: selected._id!, data: data as any });
    }
    setModal(null);
  };



  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} leads?`)) {
      bulkDeleteMutation.mutate({ ids: selectedIds });
      setSelectedIds([]);
    }
  };

  const handleBulkStatusUpdate = (status: any) => {
    if (window.confirm(`Update status to ${status} for ${selectedIds.length} leads?`)) {
      bulkUpdateMutation.mutate({ ids: selectedIds, updateData: { status } });
      setSelectedIds([]);
    }
  };

  const handleConvert = () => {
    if (!selected?._id) return;
    if (window.confirm(`Convert ${selected.name}'s inquiry to a Confirmed Booking?`)) {
      convertMutation.mutate(selected._id, {
        onSuccess: () => {
          setModal(null);
          alert('Successfully converted to Booking!');
        }
      });
    }
  };

  const exportCSV = () => {
    const headers = ['Inquiry ID', 'Name', 'Phone', 'Event', 'Date', 'Status', 'Source', 'Priority'];
    const rows = inquiries.map((i: any) => [
      i.inquiryNumber || i._id, i.name, i.phone, i.eventType, 
      new Date(i.eventDate).toLocaleDateString(), i.status, i.source || 'Website', i.priority || 'Medium'
    ]);
    const csv = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Yazhi_CRM_Leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === inquiries.length) setSelectedIds([]);
    else setSelectedIds(inquiries.map((i: any) => i._id!));
  };

  const inp = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30 focus:border-[#C89B3C] bg-white';
  const lbl = 'block text-xs font-semibold text-gray-600 mb-1.5';
  const err = 'text-xs text-red-500 mt-1';

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM & Inquiries</h1>
          <p className="text-sm text-gray-500 mt-1">{meta.total} total leads across pipeline</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <Download size={15} /> Export
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <Plus size={15} /> Add Lead
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
              placeholder="Search by ID, Name, Phone, Email..."
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
            <select value={sourceFilter} onChange={e => { setSourceFilter(e.target.value); setPage(1); }} className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none">
              <option value="All">All Sources</option>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none">
              <option value="All">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading leads...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3"><input type="checkbox" checked={selectedIds.length === inquiries.length && inquiries.length > 0} onChange={toggleSelectAll} className="rounded text-[#C89B3C] focus:ring-[#C89B3C]" /></th>
                  {['Inquiry Ref', 'Lead Name', 'Event Type', 'Event Date', 'Follow-up', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {inquiries.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No leads found matching criteria.</td></tr>
                ) : inquiries.map((i: any, idx: number) => (
                  <motion.tr key={i._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                    className={`hover:bg-gray-50 transition-colors group ${selectedIds.includes(i._id) ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-4 py-4"><input type="checkbox" checked={selectedIds.includes(i._id)} onChange={() => toggleSelect(i._id)} className="rounded text-[#C89B3C] focus:ring-[#C89B3C]" /></td>
                    <td className="px-4 py-4">
                      <p className="text-xs font-bold text-gray-500">{i.inquiryNumber}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{i.source}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-gray-900">{i.name}</p>
                      <p className="text-xs text-gray-500">{i.phone}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-gray-800">{i.eventType}</p>
                      <p className="text-xs text-gray-500">{i.city}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-800 font-medium">
                      {new Date(i.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4">
                      {i.followUpDate ? (
                        <span className="flex items-center gap-1 text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-md">
                          <Clock size={12} /> {new Date(i.followUpDate).toLocaleDateString()}
                        </span>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[i.status]}`}>{i.status}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setSelected(i); setModal('drawer'); }} className="p-1.5 text-gray-400 hover:text-[#C89B3C] hover:bg-amber-50 rounded-lg transition-colors" title="View CRM"><Eye size={16} /></button>
                        <button onClick={() => openEdit(i)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit2 size={16} /></button>
                        {i.status !== 'Converted' && (
                          <button onClick={() => { setSelected(i); setModal('delete'); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
                        )}
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
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 text-gray-600"><ChevronLeft size={14} /></button>
            <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 text-gray-600"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {(modal === 'create' || modal === 'edit') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold text-gray-900">{modal === 'create' ? 'New CRM Lead' : 'Edit Lead'}</h2>
                <button type="button" onClick={() => setModal(null)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Lead Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label className={lbl}>Full Name *</label><input {...register('name')} className={inp} placeholder="Name" />{errors.name && <p className={err}>{errors.name.message}</p>}</div>
                    <div><label className={lbl}>Email *</label><input {...register('email')} className={inp} placeholder="Email" />{errors.email && <p className={err}>{errors.email.message}</p>}</div>
                    <div><label className={lbl}>Phone *</label><input {...register('phone')} className={inp} placeholder="Phone" />{errors.phone && <p className={err}>{errors.phone.message}</p>}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Event & Requirements</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label className={lbl}>Event Type *</label><select {...register('eventType')} className={inp}>{EVENT_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                    <div><label className={lbl}>Event Date *</label><input type="date" {...register('eventDate')} className={inp} />{errors.eventDate && <p className={err}>{errors.eventDate.message}</p>}</div>
                    <div><label className={lbl}>City *</label><input {...register('city')} className={inp} placeholder="City" />{errors.city && <p className={err}>{errors.city.message}</p>}</div>
                    <div><label className={lbl}>Location</label><input {...register('location')} className={inp} placeholder="Specific venue" /></div>
                    <div><label className={lbl}>Estimated Budget (₹)</label><input type="number" {...register('budget')} className={inp} /></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">CRM Settings</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div><label className={lbl}>Pipeline Status</label><select {...register('status')} className={inp}>{STATUSES.map(s => <option key={s} disabled={s==='Converted' && modal==='create'}>{s}</option>)}</select></div>
                    <div><label className={lbl}>Lead Source</label><select {...register('source')} className={inp}>{SOURCES.map(s => <option key={s}>{s}</option>)}</select></div>
                    <div><label className={lbl}>Priority</label><select {...register('priority')} className={inp}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select></div>
                    <div><label className={lbl}>Follow-up Date</label><input type="date" {...register('followUpDate')} className={inp} /></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={lbl}>Message / Requirements</label><textarea {...register('message')} rows={3} className={`${inp} resize-none`} placeholder="Client message..." /></div>
                  <div><label className={lbl}>Internal CRM Notes</label><textarea {...register('internalNotes')} rows={3} className={`${inp} resize-none bg-amber-50/30`} placeholder="Sales notes..." /></div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors">{modal === 'create' ? 'Create Lead' : 'Save Changes'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CRM Details Drawer */}
      <AnimatePresence>
        {modal === 'drawer' && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-50 flex justify-end backdrop-blur-sm">
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col">
              
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[selected.status]}`}>{selected.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono">{selected.inquiryNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selected.status !== 'Converted' && (
                      <button onClick={handleConvert} disabled={convertMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                        <ArrowRightCircle size={16} /> Convert to Booking
                      </button>
                    )}
                    <button onClick={() => setModal(null)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
                  </div>
                </div>
                
                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {['Overview', 'Activity Timeline', 'Follow-up'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-[#18181B] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'Overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2"><Calendar size={14} /> <span className="text-xs font-semibold uppercase">Event Requirements</span></div>
                        <p className="text-sm font-semibold text-gray-900">{selected.eventType}</p>
                        <p className="text-sm text-gray-600 mt-1">{new Date(selected.eventDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="text-sm text-gray-600 mt-1">{selected.location || selected.city}</p>
                        {selected.budget && <p className="text-sm font-bold text-gray-900 mt-2">Budget: ₹{selected.budget.toLocaleString('en-IN')}</p>}
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2"><CheckSquare size={14} /> <span className="text-xs font-semibold uppercase">Lead Source</span></div>
                        <p className="text-sm font-semibold text-gray-900">{selected.source}</p>
                        <p className="text-sm text-gray-600 mt-1">Priority: {selected.priority}</p>
                        <p className="text-sm text-gray-600 mt-2">{selected.phone}</p>
                        <p className="text-sm text-gray-600">{selected.email}</p>
                      </div>
                    </div>

                    {selected.message && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-2">Message</h3>
                        <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap">{selected.message}</p>
                      </div>
                    )}
                    {selected.internalNotes && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-2">Internal CRM Notes</h3>
                        <p className="text-sm text-gray-700 bg-amber-50/30 p-4 rounded-xl border border-amber-100/50 whitespace-pre-wrap">{selected.internalNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'Activity Timeline' && (
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
                
                {activeTab === 'Follow-up' && (
                  <div className="text-center py-12 text-gray-500 text-sm">
                    {selected.followUpDate ? (
                      <div>
                        <Clock size={32} className="mx-auto text-amber-500 mb-3" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Follow-up Scheduled</h3>
                        <p>You have a follow-up scheduled for <strong>{new Date(selected.followUpDate).toLocaleDateString()}</strong>.</p>
                      </div>
                    ) : (
                      <p>No follow-up scheduled for this lead.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button onClick={() => openEdit(selected)} className="flex-1 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors">Edit Lead</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
