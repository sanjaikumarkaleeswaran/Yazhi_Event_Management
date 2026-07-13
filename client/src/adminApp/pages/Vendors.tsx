import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Store, Phone, Mail, MapPin, Plus, Eye, Edit, Trash2, Search, X, 
  Download, Activity, Calendar as CalIcon, ChevronLeft, ChevronRight, Star, Truck 
} from 'lucide-react';
import { 
  useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor, 
  useBulkUpdateVendors, useBulkDeleteVendors, useVendor, type VendorData 
} from '../../shared/hooks/useVendors';

const PAGE_SIZE = 10;
const STATUSES = ['Active', 'Inactive', 'Blacklisted'];
const AVAILABILITIES = ['Available', 'Busy', 'Unavailable'];
const CATEGORIES = [
  'Photographer', 'Videographer', 'Decorator', 'Catering', 'Makeup Artist', 
  'Mehendi Artist', 'DJ', 'Music Band', 'Stage Decoration', 'Flower Decoration', 
  'Priest', 'Lighting', 'Sound System', 'Travel', 'Accommodation', 'Security', 
  'Cleaning', 'Printing', 'Other'
];

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Inactive: 'bg-gray-100 text-gray-700',
  Blacklisted: 'bg-red-100 text-red-700',
};

const AVAILABILITY_STYLES: Record<string, string> = {
  Available: 'bg-blue-100 text-blue-700',
  Busy: 'bg-orange-100 text-orange-700',
  Unavailable: 'bg-red-100 text-red-700',
};

const vendorSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  category: z.string().min(1, 'Category is required'),
  primaryContact: z.string().min(1, 'Primary contact is required'),
  secondaryContact: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  gstNumber: z.string().optional(),
  experienceYears: z.coerce.number().min(0).optional(),
  availabilityStatus: z.enum(['Available', 'Busy', 'Unavailable']).optional(),
  status: z.enum(['Active', 'Inactive', 'Blacklisted']).optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof vendorSchema>;

export default function Vendors() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  
  const { data: response, isLoading } = useVendors({
    page,
    limit: PAGE_SIZE,
    search,
    status: statusFilter === 'All' ? undefined : statusFilter,
    category: categoryFilter === 'All' ? undefined : categoryFilter,
    availabilityStatus: availabilityFilter === 'All' ? undefined : availabilityFilter,
  });
  
  const vendors = (response as any)?.data || [];
  const meta = (response as any)?.meta || { total: 0, totalPages: 1, page: 1 };

  const createMutation = useCreateVendor();
  const updateMutation = useUpdateVendor();
  const deleteMutation = useDeleteVendor();
  const bulkUpdateMutation = useBulkUpdateVendors();
  const bulkDeleteMutation = useBulkDeleteVendors();

  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('Overview');

  const { data: selectedVendorData, isLoading: isVendorLoading } = useVendor(drawerOpen && selectedId ? selectedId : '');
  const selectedVendor = selectedVendorData?.data;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(vendorSchema) as any
  });

  const openCreate = () => {
    setSelectedId(null);
    reset({ 
      businessName: '', ownerName: '', category: 'Decorator', primaryContact: '', city: '',
      status: 'Active', availabilityStatus: 'Available', experienceYears: 0
    });
    setModal('create');
  };

  const openEdit = (v: VendorData) => {
    setSelectedId(v._id!);
    reset({
      businessName: v.businessName, ownerName: v.ownerName, category: v.category,
      primaryContact: v.primaryContact, secondaryContact: v.secondaryContact || '',
      email: v.email || '', address: v.address || '', city: v.city, state: v.state || '',
      gstNumber: v.gstNumber || '', experienceYears: v.experienceYears || 0,
      availabilityStatus: v.availabilityStatus || 'Available', status: v.status || 'Active',
      notes: v.notes || ''
    });
    setModal('edit');
  };

  const onSubmit = (data: FormData) => {
    if (modal === 'create') {
      createMutation.mutate(data);
    } else if (modal === 'edit' && selectedId) {
      updateMutation.mutate({ id: selectedId, data });
    }
    setModal(null);
  };

  const handleDelete = () => {
    if (selectedId) {
      deleteMutation.mutate(selectedId, {
        onSuccess: () => {
          setModal(null);
          setDrawerOpen(false);
        },
        onError: (err: any) => {
          alert(err.response?.data?.message || 'Failed to delete vendor');
        }
      });
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedIds.length} vendors permanently?`)) {
      bulkDeleteMutation.mutate({ ids: selectedIds });
      setSelectedIds([]);
    }
  };

  const handleBulkStatusUpdate = (status: any) => {
    if (window.confirm(`Update status to ${status} for ${selectedIds.length} vendors?`)) {
      bulkUpdateMutation.mutate({ ids: selectedIds, updateData: { status } });
      setSelectedIds([]);
    }
  };

  const exportCSV = () => {
    const headers = ['Vendor Code', 'Business Name', 'Owner', 'Category', 'Phone', 'City', 'Status', 'Availability'];
    const rows = vendors.map((v: any) => [
      v.vendorCode, v.businessName, v.ownerName, v.category, v.primaryContact, v.city, v.status, v.availabilityStatus
    ]);
    const csv = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Yazhi_Vendors_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelectedIds(selectedIds.length === vendors.length ? [] : vendors.map((v: any) => v._id!));

  const inp = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30 focus:border-[#C89B3C] bg-white';
  const lbl = 'block text-xs font-semibold text-gray-600 mb-1.5';
  const err = 'text-xs text-red-500 mt-1';

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-sm text-gray-500 mt-1">{meta.total} resources across {CATEGORIES.length} categories</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <Download size={15} /> Export
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <Plus size={15} /> Add Vendor
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 min-w-0 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by Code, Business, Name, Phone..."
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
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none">
              <option value="All">Any Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none">
              <option value="All">All Categories</option>
              {CATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={availabilityFilter} onChange={e => { setAvailabilityFilter(e.target.value); setPage(1); }} className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none">
              <option value="All">Any Availability</option>
              {AVAILABILITIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading vendors...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3"><input type="checkbox" checked={selectedIds.length === vendors.length && vendors.length > 0} onChange={toggleSelectAll} className="rounded text-[#C89B3C] focus:ring-[#C89B3C]" /></th>
                  {['Vendor Details', 'Category & Location', 'Contact', 'Availability', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vendors.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No vendors found.</td></tr>
                ) : vendors.map((v: any, idx: number) => (
                  <motion.tr key={v._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                    className={`hover:bg-gray-50 transition-colors group ${selectedIds.includes(v._id) ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-4 py-4"><input type="checkbox" checked={selectedIds.includes(v._id)} onChange={() => toggleSelect(v._id)} className="rounded text-[#C89B3C] focus:ring-[#C89B3C]" /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#18181B] to-[#3f3f46] flex items-center justify-center text-white text-sm font-bold shrink-0">
                          <Store size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{v.businessName}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">{v.vendorCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-gray-800">{v.category}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{v.city}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-800">{v.primaryContact}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{v.ownerName}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${AVAILABILITY_STYLES[v.availabilityStatus]}`}>{v.availabilityStatus}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[v.status]}`}>{v.status}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button onClick={() => { setSelectedId(v._id); setDrawerOpen(true); }} className="p-1.5 text-gray-400 hover:text-[#C89B3C] hover:bg-amber-50 rounded-lg"><Eye size={16} /></button>
                        <button onClick={() => openEdit(v)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
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
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold text-gray-900">{modal === 'create' ? 'New Vendor' : 'Edit Vendor Profile'}</h2>
                <button type="button" onClick={() => setModal(null)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
                
                <div>
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Business Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label className={lbl}>Business Name *</label><input {...register('businessName')} className={inp} />{errors.businessName && <p className={err}>{errors.businessName.message}</p>}</div>
                    <div><label className={lbl}>Category *</label><select {...register('category')} className={inp}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>{errors.category && <p className={err}>{errors.category.message}</p>}</div>
                    <div><label className={lbl}>Owner Name *</label><input {...register('ownerName')} className={inp} />{errors.ownerName && <p className={err}>{errors.ownerName.message}</p>}</div>
                    <div><label className={lbl}>Years of Experience</label><input type="number" {...register('experienceYears')} className={inp} /></div>
                    <div><label className={lbl}>GST Number</label><input {...register('gstNumber')} className={inp} /></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Contact & Location</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label className={lbl}>Primary Contact *</label><input {...register('primaryContact')} className={inp} />{errors.primaryContact && <p className={err}>{errors.primaryContact.message}</p>}</div>
                    <div><label className={lbl}>Secondary Contact</label><input {...register('secondaryContact')} className={inp} /></div>
                    <div><label className={lbl}>Email Address</label><input {...register('email')} type="email" className={inp} />{errors.email && <p className={err}>{errors.email.message}</p>}</div>
                    <div className="sm:col-span-2"><label className={lbl}>Address</label><input {...register('address')} className={inp} /></div>
                    <div><label className={lbl}>City *</label><input {...register('city')} className={inp} />{errors.city && <p className={err}>{errors.city.message}</p>}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Operational Status</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={lbl}>Availability</label><select {...register('availabilityStatus')} className={inp}>{AVAILABILITIES.map(s => <option key={s}>{s}</option>)}</select></div>
                    <div><label className={lbl}>Vendor Status</label><select {...register('status')} className={inp}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
                    <div className="sm:col-span-2"><label className={lbl}>Internal Notes</label><textarea {...register('notes')} rows={2} className={`${inp} resize-none bg-amber-50/30`} placeholder="Add specific requirements, working hours, pricing notes..." /></div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors">Save Vendor</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vendor Profile Drawer */}
      <AnimatePresence>
        {drawerOpen && selectedVendor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-50 flex justify-end backdrop-blur-sm">
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="bg-white w-full max-w-3xl h-full shadow-2xl flex flex-col">
              
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#18181B] to-[#3f3f46] flex items-center justify-center text-white relative shadow-md">
                      <Store size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedVendor.businessName}</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-gray-500 font-mono">{selectedVendor.vendorCode}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${AVAILABILITY_STYLES[selectedVendor.availabilityStatus]}`}>{selectedVendor.availabilityStatus}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setDrawerOpen(false)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
                </div>
                
                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {['Overview', 'Active Bookings', 'Documents & Payments', 'Activity Log'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-[#18181B] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-white">
                {isVendorLoading ? (
                  <div className="flex justify-center py-20 text-gray-400"><Activity className="animate-pulse" /></div>
                ) : (
                  <>
                    {activeTab === 'Overview' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Category</p>
                            <p className="text-lg font-bold text-gray-900">{selectedVendor.category}</p>
                          </div>
                          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Total Assignments</p>
                            <p className="text-lg font-bold text-gray-900">{selectedVendor.bookings?.length || 0}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Business Details</h3>
                            <ul className="space-y-3 text-sm">
                              <li className="flex items-center gap-3 text-gray-600"><Star size={16} className="text-gray-400" /> Owner: <span className="font-semibold text-gray-900">{selectedVendor.ownerName}</span></li>
                              {selectedVendor.experienceYears > 0 && <li className="flex items-center gap-3 text-gray-600"><Activity size={16} className="text-gray-400" /> {selectedVendor.experienceYears} Years Experience</li>}
                              {selectedVendor.gstNumber && <li className="flex items-center gap-3 text-gray-600"><span className="font-semibold">GST:</span> {selectedVendor.gstNumber}</li>}
                              <li className="text-gray-600">Status: <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLES[selectedVendor.status]}`}>{selectedVendor.status}</span></li>
                            </ul>
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Contact</h3>
                            <ul className="space-y-3 text-sm">
                              <li className="flex items-center gap-3 text-gray-600"><Phone size={16} className="text-gray-400" /> {selectedVendor.primaryContact}</li>
                              {selectedVendor.secondaryContact && <li className="flex items-center gap-3 text-gray-600"><Phone size={16} className="text-gray-400" /> {selectedVendor.secondaryContact} (Alt)</li>}
                              {selectedVendor.email && <li className="flex items-center gap-3 text-gray-600"><Mail size={16} className="text-gray-400" /> {selectedVendor.email}</li>}
                              {selectedVendor.city && <li className="flex items-center gap-3 text-gray-600"><MapPin size={16} className="text-gray-400" /> {selectedVendor.address ? `${selectedVendor.address}, ` : ''}{selectedVendor.city}</li>}
                            </ul>
                          </div>
                        </div>

                        {selectedVendor.notes && (
                          <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-2">Vendor Notes</h3>
                            <p className="text-sm text-gray-700 bg-amber-50/30 p-4 rounded-xl border border-amber-100/50 whitespace-pre-wrap">{selectedVendor.notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'Active Bookings' && (
                      <div className="space-y-4">
                        {selectedVendor.bookings?.length === 0 ? (
                          <div className="text-center py-16">
                            <CalIcon size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-sm text-gray-500 font-medium">No bookings assigned to this vendor yet.</p>
                            <p className="text-xs text-gray-400 mt-1">Assign them from the Booking Management dashboard.</p>
                          </div>
                        ) : (
                          selectedVendor.bookings?.map((b: any) => (
                            <div key={b._id} className="p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
                              <div>
                                <h4 className="font-bold text-sm text-gray-900">{b.eventType} <span className="text-gray-400 font-normal">({b.bookingNumber})</span></h4>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><CalIcon size={12} /> {new Date(b.eventDate).toLocaleDateString()}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin size={12} /> {b.venue || 'TBA'}</p>
                              </div>
                              <div className="text-right">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{b.status}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === 'Documents & Payments' && (
                      <div className="text-center py-20">
                        <Truck size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-sm text-gray-500 font-medium">Document & Payment features will be integrated</p>
                        <p className="text-xs text-gray-400 mt-1">when cloud storage configuration is finalized.</p>
                      </div>
                    )}

                    {activeTab === 'Activity Log' && (
                      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                        {selectedVendor.timeline?.slice().reverse().map((t: any, idx: number) => (
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
                <button onClick={() => { setDrawerOpen(false); openEdit(selectedVendor); }} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white transition-colors">Edit Profile</button>
                <button onClick={handleDelete} className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18} /></button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
