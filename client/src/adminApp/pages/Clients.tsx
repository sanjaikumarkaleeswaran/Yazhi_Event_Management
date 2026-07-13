import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, Search, Trash2, Eye, Edit, X, Phone, Mail, MapPin, Download, Activity, Calendar as CalIcon, ChevronLeft, ChevronRight, Star 
} from 'lucide-react';
import { 
  useClients, useCreateClient, useUpdateClient, useDeleteClient, 
  useBulkUpdateClients, useBulkDeleteClients, useClient, type ClientData 
} from '../../shared/hooks/useClients';


const PAGE_SIZE = 10;
const STATUSES = ['Active', 'Inactive', 'Lead'];
const CONTACT_METHODS = ['Email', 'Phone', 'WhatsApp'];
const LANGUAGES = ['English', 'Tamil', 'Hindi', 'Malayalam', 'Telugu'];

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Inactive: 'bg-gray-100 text-gray-700',
  Lead: 'bg-amber-100 text-amber-700',
};

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone is required'),
  alternatePhone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  company: z.string().optional(),
  preferredLanguage: z.string().optional(),
  preferredContactMethod: z.enum(['Email', 'Phone', 'WhatsApp']).optional(),
  isVIP: z.boolean().optional(),
  status: z.enum(['Active', 'Inactive', 'Lead']).optional(),
  notes: z.string().optional(),
  dob: z.string().optional().nullable(),
  anniversary: z.string().optional().nullable(),
});

type FormData = z.infer<typeof clientSchema>;

export default function Clients() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [vipFilter, setVipFilter] = useState('All');
  
  const { data: response, isLoading } = useClients({
    page,
    limit: PAGE_SIZE,
    search,
    status: statusFilter === 'All' ? undefined : statusFilter,
    isVIP: vipFilter === 'All' ? undefined : vipFilter === 'VIP' ? true : false,
  });
  
  const clients = response?.data || [];
  const meta = (response as any)?.meta || { total: 0, totalPages: 1, page: 1 };

  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const deleteMutation = useDeleteClient();
  const bulkUpdateMutation = useBulkUpdateClients();
  const bulkDeleteMutation = useBulkDeleteClients();

  const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('Overview');

  // Fetch full client details (with bookings and inquiries) when drawer opens
  const { data: selectedClientData, isLoading: isClientLoading } = useClient(drawerOpen && selectedId ? selectedId : '');
  const selectedClient = selectedClientData?.data;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(clientSchema)
  });

  const openCreate = () => {
    setSelectedId(null);
    reset({ 
      name: '', email: '', phone: '', city: '', status: 'Active', preferredContactMethod: 'Phone', preferredLanguage: 'English', isVIP: false 
    });
    setModal('create');
  };

  const openEdit = (client: ClientData) => {
    setSelectedId(client._id!);
    reset({
      name: client.name, email: client.email || '', phone: client.phone, alternatePhone: client.alternatePhone || '',
      city: client.city || '', state: client.state || '', pincode: client.pincode || '', company: client.company || '',
      preferredLanguage: client.preferredLanguage || 'English', preferredContactMethod: client.preferredContactMethod || 'Phone',
      isVIP: client.isVIP || false, status: client.status || 'Active', notes: client.notes || '',
      dob: client.dob ? new Date(client.dob).toISOString().split('T')[0] : '',
      anniversary: client.anniversary ? new Date(client.anniversary).toISOString().split('T')[0] : ''
    });
    setModal('edit');
  };

  const onSubmit = (data: FormData) => {
    if (modal === 'create') {
      createMutation.mutate(data as any);
    } else if (modal === 'edit' && selectedId) {
      updateMutation.mutate({ id: selectedId, data: data as any });
    }
    setModal(null);
  };


  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedIds.length} clients permanently?`)) {
      bulkDeleteMutation.mutate({ ids: selectedIds });
      setSelectedIds([]);
    }
  };

  const handleBulkStatusUpdate = (status: any) => {
    if (window.confirm(`Update status to ${status} for ${selectedIds.length} clients?`)) {
      bulkUpdateMutation.mutate({ ids: selectedIds, updateData: { status } });
      setSelectedIds([]);
    }
  };

  const exportCSV = () => {
    const headers = ['Client ID', 'Name', 'Phone', 'Email', 'City', 'Status', 'VIP', 'Customer Since'];
    const rows = clients.map((c: any) => [
      c.clientCode, c.name, c.phone, c.email || 'N/A', c.city || 'N/A', c.status, c.isVIP ? 'Yes' : 'No', 
      new Date(c.customerSince).toLocaleDateString()
    ]);
    const csv = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Yazhi_CRM_Clients_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelectedIds(selectedIds.length === clients.length ? [] : clients.map((c: any) => c._id!));

  const inp = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30 focus:border-[#C89B3C] bg-white';
  const lbl = 'block text-xs font-semibold text-gray-600 mb-1.5';
  const err = 'text-xs text-red-500 mt-1';

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client CRM</h1>
          <p className="text-sm text-gray-500 mt-1">{meta.total} clients in database</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <Download size={15} /> Export
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <Plus size={15} /> New Client
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 min-w-0 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by ID, Name, Phone, Email, City..."
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
            <select value={vipFilter} onChange={e => { setVipFilter(e.target.value); setPage(1); }} className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none">
              <option value="All">All Types</option>
              <option value="VIP">VIP Only</option>
              <option value="Standard">Standard</option>
            </select>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none">
              <option value="All">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading clients...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3"><input type="checkbox" checked={selectedIds.length === clients.length && clients.length > 0} onChange={toggleSelectAll} className="rounded text-[#C89B3C] focus:ring-[#C89B3C]" /></th>
                  {['Client Details', 'Contact Info', 'Location', 'Status', 'Joined', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clients.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No clients found matching criteria.</td></tr>
                ) : clients.map((c: any, idx: number) => (
                  <motion.tr key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                    className={`hover:bg-gray-50 transition-colors group ${selectedIds.includes(c._id) ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-4 py-4"><input type="checkbox" checked={selectedIds.includes(c._id)} onChange={() => toggleSelect(c._id)} className="rounded text-[#C89B3C] focus:ring-[#C89B3C]" /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C89B3C] to-[#5A1E1E] flex items-center justify-center text-white text-sm font-bold shrink-0 relative">
                          {c.name.charAt(0)}
                          {c.isVIP && <Star className="absolute -top-1 -right-1 text-yellow-400 fill-yellow-400 drop-shadow-md" size={14} />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">{c.clientCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-800">{c.phone}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{c.email || '—'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-800">{c.city || '—'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[c.status]}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(c.customerSince).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button onClick={() => { setSelectedId(c._id); setDrawerOpen(true); }} className="p-1.5 text-gray-400 hover:text-[#C89B3C] hover:bg-amber-50 rounded-lg"><Eye size={16} /></button>
                        <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">Showing page {meta.page} of {meta.totalPages}</p>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 text-gray-600"><ChevronLeft size={14} /></button>
            <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 text-gray-600"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(modal === 'create' || modal === 'edit') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold text-gray-900">{modal === 'create' ? 'New CRM Client' : 'Edit Client Profile'}</h2>
                <button type="button" onClick={() => setModal(null)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Personal Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label className={lbl}>Full Name *</label><input {...register('name')} className={inp} />{errors.name && <p className={err}>{errors.name.message}</p>}</div>
                    <div><label className={lbl}>Email Address</label><input {...register('email')} type="email" className={inp} />{errors.email && <p className={err}>{errors.email.message}</p>}</div>
                    <div><label className={lbl}>Primary Phone *</label><input {...register('phone')} className={inp} />{errors.phone && <p className={err}>{errors.phone.message}</p>}</div>
                    <div><label className={lbl}>Date of Birth</label><input type="date" {...register('dob')} className={inp} /></div>
                    <div><label className={lbl}>Anniversary</label><input type="date" {...register('anniversary')} className={inp} /></div>
                    <div className="flex items-center gap-2 mt-6">
                      <input type="checkbox" id="isVIP" {...register('isVIP')} className="w-4 h-4 text-[#C89B3C] rounded focus:ring-[#C89B3C]" />
                      <label htmlFor="isVIP" className="text-sm font-bold text-yellow-600 flex items-center gap-1"><Star size={14} className="fill-yellow-600" /> Mark as VIP Client</label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Location & Logistics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label className={lbl}>City</label><input {...register('city')} className={inp} /></div>
                    <div><label className={lbl}>State</label><input {...register('state')} className={inp} /></div>
                    <div><label className={lbl}>Pincode</label><input {...register('pincode')} className={inp} /></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">CRM Settings</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label className={lbl}>Status</label><select {...register('status')} className={inp}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
                    <div><label className={lbl}>Contact Method</label><select {...register('preferredContactMethod')} className={inp}>{CONTACT_METHODS.map(s => <option key={s}>{s}</option>)}</select></div>
                    <div><label className={lbl}>Language</label><select {...register('preferredLanguage')} className={inp}>{LANGUAGES.map(s => <option key={s}>{s}</option>)}</select></div>
                  </div>
                </div>

                <div>
                  <label className={lbl}>Internal Notes</label>
                  <textarea {...register('notes')} rows={3} className={`${inp} resize-none bg-amber-50/30`} placeholder="Add any specific preferences, family details, or CRM notes..." />
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors">Save Client</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CRM Profile Drawer */}
      <AnimatePresence>
        {drawerOpen && selectedClient && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-50 flex justify-end backdrop-blur-sm">
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="bg-white w-full max-w-3xl h-full shadow-2xl flex flex-col">
              
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#C89B3C] to-[#5A1E1E] flex items-center justify-center text-white text-2xl font-bold relative">
                      {selectedClient.name.charAt(0)}
                      {selectedClient.isVIP && <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md"><Star className="text-yellow-400 fill-yellow-400" size={16} /></div>}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedClient.name}</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-gray-500 font-mono">{selectedClient.clientCode}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[selectedClient.status]}`}>{selectedClient.status}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setDrawerOpen(false)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
                </div>
                
                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {['Overview', 'Bookings', 'Inquiries', 'Activity Log'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-[#18181B] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-white">
                {isClientLoading ? (
                  <div className="flex justify-center py-20 text-gray-400"><Activity className="animate-pulse" /></div>
                ) : (
                  <>
                    {activeTab === 'Overview' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Total Bookings</p>
                            <p className="text-2xl font-bold text-gray-900">{selectedClient.bookings?.length || 0}</p>
                          </div>
                          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Inquiries</p>
                            <p className="text-2xl font-bold text-gray-900">{selectedClient.inquiries?.length || 0}</p>
                          </div>
                          <div className="p-4 rounded-xl bg-green-50 border border-green-100 sm:col-span-2">
                            <p className="text-xs text-green-700 font-semibold uppercase mb-1">Total Revenue</p>
                            <p className="text-2xl font-bold text-green-700">₹{(selectedClient.bookings?.reduce((acc: number, b: any) => acc + (b.amount || 0), 0) || 0).toLocaleString('en-IN')}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Contact Information</h3>
                            <ul className="space-y-3 text-sm">
                              <li className="flex items-center gap-3 text-gray-600"><Phone size={16} className="text-gray-400" /> {selectedClient.phone}</li>
                              {selectedClient.email && <li className="flex items-center gap-3 text-gray-600"><Mail size={16} className="text-gray-400" /> {selectedClient.email}</li>}
                              {selectedClient.city && <li className="flex items-center gap-3 text-gray-600"><MapPin size={16} className="text-gray-400" /> {selectedClient.city}{selectedClient.state ? `, ${selectedClient.state}` : ''}</li>}
                            </ul>
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Preferences</h3>
                            <ul className="space-y-3 text-sm">
                              <li className="text-gray-600">Language: <span className="font-semibold">{selectedClient.preferredLanguage}</span></li>
                              <li className="text-gray-600">Contact Method: <span className="font-semibold">{selectedClient.preferredContactMethod}</span></li>
                              <li className="text-gray-600">Customer Since: <span className="font-semibold">{new Date(selectedClient.customerSince).toLocaleDateString()}</span></li>
                            </ul>
                          </div>
                        </div>

                        {selectedClient.notes && (
                          <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-2">CRM Notes</h3>
                            <p className="text-sm text-gray-700 bg-amber-50/30 p-4 rounded-xl border border-amber-100/50 whitespace-pre-wrap">{selectedClient.notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'Bookings' && (
                      <div className="space-y-4">
                        {selectedClient.bookings?.length === 0 ? (
                          <p className="text-sm text-gray-400 py-10 text-center">No bookings found for this client.</p>
                        ) : (
                          selectedClient.bookings?.map((b: any) => (
                            <div key={b._id} className="p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
                              <div>
                                <h4 className="font-bold text-sm text-gray-900">{b.eventType} <span className="text-gray-400 font-normal">({b.bookingNumber})</span></h4>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><CalIcon size={12} /> {new Date(b.eventDate).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-gray-900 mb-1">₹{(b.amount || 0).toLocaleString('en-IN')}</p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{b.status}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === 'Inquiries' && (
                      <div className="space-y-4">
                        {selectedClient.inquiries?.length === 0 ? (
                          <p className="text-sm text-gray-400 py-10 text-center">No inquiries found for this client.</p>
                        ) : (
                          selectedClient.inquiries?.map((i: any) => (
                            <div key={i._id} className="p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
                              <div>
                                <h4 className="font-bold text-sm text-gray-900">{i.eventType} Lead</h4>
                                <p className="text-xs text-gray-500 mt-1">Source: {i.source}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-400 mb-1">{new Date(i.createdAt).toLocaleDateString()}</p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${i.status === 'Converted' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{i.status}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === 'Activity Log' && (
                      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                        {selectedClient.timeline?.slice().reverse().map((t: any, idx: number) => (
                          <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-gray-100 text-gray-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                              <Activity size={16} />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-bold text-sm text-gray-900">{t.action}</h4>
                                <time className="text-[10px] text-gray-400 font-mono">{new Date(t.date).toLocaleString('en-IN')}</time>
                              </div>
                              <p className="text-xs text-gray-600">{t.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button onClick={() => { setDrawerOpen(false); openEdit(selectedClient); }} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white transition-colors">Edit Profile</button>
                <button onClick={() => {
                  if (window.confirm('Delete this client?')) {
                    deleteMutation.mutate(selectedId!);
                    setDrawerOpen(false);
                  }
                }} className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18} /></button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
