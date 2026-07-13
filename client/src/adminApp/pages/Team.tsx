import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  Plus, Eye, Edit2, Trash2, X, Search, ChevronLeft, ChevronRight, Download, 
  User, CheckCircle, Clock, FileText, Activity
} from 'lucide-react';
import { 
  useTeam, 
  useCreateTeamMember, 
  useUpdateTeamMember, 
  useDeleteTeamMember, 
  useUpdateAvailabilityStatus, 
  useUploadTeamDocument, 
  useDeleteTeamDocument,
  useTeamAvailabilityStats
} from '../../shared/hooks/useTeam';

const DEPARTMENTS = ['Operations', 'Sales', 'Design', 'Catering', 'Logistics', 'Marketing'];
const DESIGNATIONS = ['Lead Event Manager', 'Creative Director', 'Head of Operations', 'Operations Coordinator', 'Sales Manager', 'Catering Lead', 'Marketing Executive'];
const AVAILABILITIES = ['Available', 'Busy', 'On Leave', 'Inactive'];
const EMPLOYMENT_STATUSES = ['Full-time', 'Part-time', 'Contract', 'Intern'];
const PAGE_SIZE = 8;

const AVAILABILITY_STYLES: Record<string, string> = {
  'Available': 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  'Busy': 'bg-rose-50 text-rose-700 border border-rose-100',
  'On Leave': 'bg-amber-50 text-amber-700 border border-amber-100',
  'Inactive': 'bg-gray-50 text-gray-700 border border-gray-100',
};

export default function Team() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [availFilter, setAvailFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'availability' | 'documents' | 'timeline' | 'performance'>('overview');

  const [bulkSelection, setBulkSelection] = useState<string[]>([]);

  // React Query queries
  const { data: teamResp, isLoading } = useTeam({
    page,
    limit: PAGE_SIZE,
    search,
    department: deptFilter === 'All' ? undefined : deptFilter,
    availabilityStatus: availFilter === 'All' ? undefined : availFilter
  });

  const { data: availStats } = useTeamAvailabilityStats();

  // Mutations
  const createMutation = useCreateTeamMember();
  const updateMutation = useUpdateTeamMember();
  const deleteMutation = useDeleteTeamMember();
  const updateAvailMutation = useUpdateAvailabilityStatus();
  const uploadDocMutation = useUploadTeamDocument();
  const deleteDocMutation = useDeleteTeamDocument();

  const { register, handleSubmit, reset, setValue } = useForm();

  const team = teamResp?.data || [];
  const meta = teamResp?.meta || { total: 0, totalPages: 1 };

  // Calculate aggregates
  const totalStaff = teamResp?.meta?.total || 0;
  const availableCount = availStats?.find((s: any) => s._id === 'Available')?.count || 0;
  const busyCount = availStats?.find((s: any) => s._id === 'Busy')?.count || 0;
  const leaveCount = availStats?.find((s: any) => s._id === 'On Leave')?.count || 0;

  const handleCreateOrUpdate = (data: any) => {
    // Parse skills
    const skills = typeof data.skills === 'string' ? data.skills.split(',').map((s: string) => s.trim()) : data.skills;
    const body = { ...data, skills, experience: Number(data.experience) };

    if (modal === 'create') {
      createMutation.mutate(body, {
        onSuccess: () => {
          setModal(null);
          reset();
        }
      });
    } else if (modal === 'edit' && selected) {
      updateMutation.mutate({ id: selected._id, memberData: body }, {
        onSuccess: () => {
          setModal(null);
          reset();
        }
      });
    }
  };

  const handleOpenEdit = (member: any) => {
    setSelected(member);
    setModal('edit');
    // populate form
    setTimeout(() => {
      setValue('firstName', member.firstName);
      setValue('lastName', member.lastName);
      setValue('email', member.email);
      setValue('phone', member.phone);
      setValue('department', member.department);
      setValue('designation', member.designation);
      setValue('experience', member.experience);
      setValue('joiningDate', member.joiningDate ? new Date(member.joiningDate).toISOString().split('T')[0] : '');
      setValue('salary', member.salary);
      setValue('skills', member.skills?.join(', ') || '');
      setValue('availabilityStatus', member.availabilityStatus);
      setValue('employmentStatus', member.employmentStatus);
      setValue('address', member.address || '');
    }, 100);
  };

  const handleDelete = () => {
    if (selected) {
      deleteMutation.mutate(selected._id, {
        onSuccess: () => {
          setModal(null);
        }
      });
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete the ${bulkSelection.length} selected employees?`)) {
      bulkSelection.forEach(id => deleteMutation.mutate(id));
      setBulkSelection([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setBulkSelection(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleUploadDocument = (e: any) => {
    const file = e.target.files[0];
    if (!file || !selected) return;

    // Simulate file upload link for demo purposes
    const mockUrl = `https://yazhi-vault.s3.amazonaws.com/documents/${Date.now()}_${file.name}`;
    uploadDocMutation.mutate({
      id: selected._id,
      document: { name: file.name, url: mockUrl }
    }, {
      onSuccess: (updated) => {
        setSelected(updated.data);
      }
    });
  };

  const handleDeleteDocument = (docId: string) => {
    if (!selected) return;
    deleteDocMutation.mutate({ id: selected._id, documentId: docId }, {
      onSuccess: (updated) => {
        setSelected(updated.data);
      }
    });
  };

  const handleExportCSV = () => {
    if (!team.length) return;
    const headers = ['Employee ID', 'Name', 'Department', 'Designation', 'Phone', 'Email', 'Availability', 'Status'];
    const csvContent = [
      headers.join(','),
      ...team.map((m: any) => [
        m.employeeId,
        m.firstName + ' ' + m.lastName,
        m.department,
        m.designation,
        m.phone,
        m.email,
        m.availabilityStatus,
        m.employmentStatus
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `team_directory_${Date.now()}.csv`;
    link.click();
  };

  const inp = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30 focus:border-[#C89B3C] bg-white';
  const lbl = 'block text-xs font-semibold text-gray-600 mb-1.5';

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workforce & Team</h1>
          <p className="text-sm text-gray-500 mt-1">Manage corporate workforce, tracking schedules, loads, and emergency logs.</p>
        </div>
        <div className="flex gap-2">
          {bulkSelection.length > 0 && (
            <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
              <Trash2 size={14} /> Delete Selected ({bulkSelection.length})
            </button>
          )}
          <button onClick={() => { setSelected(null); reset(); setModal('create'); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <Plus size={15} /> Add Employee
          </button>
        </div>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Workforce', value: totalStaff, color: 'bg-white text-gray-900 border border-gray-100', icon: <User size={20} className="text-gray-500" /> },
          { label: 'Available Now', value: availableCount, color: 'bg-emerald-50 text-emerald-800 border border-emerald-100', icon: <CheckCircle size={20} className="text-emerald-600" /> },
          { label: 'Assigned / Busy', value: busyCount, color: 'bg-rose-50 text-rose-800 border border-rose-100', icon: <Activity size={20} className="text-rose-600" /> },
          { label: 'On Leave', value: leaveCount, color: 'bg-amber-50 text-amber-800 border border-amber-100', icon: <Clock size={20} className="text-amber-600" /> },
        ].map((c, idx) => (
          <div key={idx} className={`p-5 rounded-2xl shadow-sm flex items-center justify-between ${c.color}`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{c.label}</p>
              <h3 className="text-3xl font-extrabold mt-1">{c.value}</h3>
            </div>
            <div className="p-3 bg-white/40 rounded-xl">{c.icon}</div>
          </div>
        ))}
      </div>

      {/* Grid listing and Search/Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-[300px]">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search by ID, name, email..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30"
              />
            </div>
            
            <select 
              value={deptFilter} 
              onChange={e => setDeptFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select 
              value={availFilter} 
              onChange={e => setAvailFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700"
            >
              <option value="All">All Availabilities</option>
              {AVAILABILITIES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
            <Download size={13} /> Export CSV
          </button>
        </div>

        {/* Workforce Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left w-10">
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) setBulkSelection(team.map((m: any) => m._id));
                      else setBulkSelection([]);
                    }}
                    checked={bulkSelection.length === team.length && team.length > 0}
                    className="rounded border-gray-300 focus:ring-[#C89B3C]"
                  />
                </th>
                {['Employee ID', 'Name', 'Department', 'Designation', 'Availability', 'Workload', 'Experience', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="text-center py-12">
                    <Activity className="animate-spin text-gray-300 mx-auto" />
                  </td>
                </tr>
              ) : team.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-400 text-sm">No workforce records found.</td>
                </tr>
              ) : (
                team.map((member: any, i: number) => (
                  <motion.tr 
                    key={member._id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-4 py-4">
                      <input 
                        type="checkbox" 
                        checked={bulkSelection.includes(member._id)}
                        onChange={() => handleToggleSelect(member._id)}
                        className="rounded border-gray-300 focus:ring-[#C89B3C]"
                      />
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-800">{member.employeeId}</td>
                    <td className="px-4 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#C89B3C]/10 text-[#C89B3C] flex items-center justify-center font-bold text-sm">
                        {member.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{member.firstName} {member.lastName}</p>
                        <p className="text-[10px] text-gray-400">{member.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{member.department}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{member.designation}</td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${AVAILABILITY_STYLES[member.availabilityStatus]}`}>
                        {member.availabilityStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              member.assignedBookings?.length > 2 ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, (member.assignedBookings?.length || 0) * 33)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 font-medium">
                          {member.assignedBookings?.length || 0} events
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-500">{member.experience} years</td>
                    <td className="px-4 py-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200 text-gray-700 bg-gray-50">
                        {member.employmentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        <button 
                          onClick={() => { setSelected(member); setDrawerOpen(true); }}
                          className="p-1.5 text-gray-400 hover:text-[#C89B3C] hover:bg-amber-50 rounded-lg"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(member)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => { setSelected(member); setModal('delete'); }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing Page {meta.page} of {meta.totalPages} ({meta.total} records total)
          </p>
          <div className="flex gap-1">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronLeft size={14} />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} 
              disabled={page === meta.totalPages}
              className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Sliding Enterprise Profile Drawer */}
      <AnimatePresence>
        {drawerOpen && selected && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-xs"
            />
            
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#C89B3C] text-white flex items-center justify-center font-bold text-lg rounded-xl shadow-md">
                    {selected.firstName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{selected.firstName} {selected.lastName}</h2>
                    <p className="text-xs text-gray-400">{selected.designation} · {selected.employeeId}</p>
                  </div>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              {/* Tab Selector */}
              <div className="flex border-b border-gray-100 bg-gray-50 px-4 text-xs font-bold text-gray-600">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'assignments', label: 'Assignments' },
                  { id: 'availability', label: 'Availability' },
                  { id: 'documents', label: 'Documents' },
                  { id: 'timeline', label: 'Timeline' },
                ].map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-4 py-3 border-b-2 transition-all ${
                      activeTab === t.id ? 'border-[#C89B3C] text-[#C89B3C]' : 'border-transparent hover:text-gray-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Contacts</p>
                        <p className="text-sm font-semibold text-gray-800 mt-1">{selected.phone}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{selected.email}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Company details</p>
                        <p className="text-sm font-semibold text-gray-800 mt-1">{selected.department} Dept</p>
                        <p className="text-xs text-gray-500 mt-0.5">Joined: {new Date(selected.joiningDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Core Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.skills?.map((s: string) => (
                          <span key={s} className="px-2.5 py-1 bg-[#C89B3C]/10 text-[#C89B3C] rounded-lg text-xs font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {selected.address && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Office Address</p>
                        <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">{selected.address}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'assignments' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Active Schedule</h4>
                    {selected.assignedBookings?.length === 0 ? (
                      <p className="text-xs text-gray-400 bg-gray-50 p-4 rounded-xl text-center">No active bookings assigned.</p>
                    ) : (
                      selected.assignedBookings.map((b: any) => (
                        <div key={b._id} className="p-4 border border-gray-100 rounded-xl flex items-center justify-between hover:shadow-xs transition-shadow">
                          <div>
                            <p className="text-sm font-bold text-gray-900">Event: {b.eventType}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Booking Ref: {b.bookingNumber} · {new Date(b.eventDate).toLocaleDateString()}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {b.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'availability' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Status Override</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {AVAILABILITIES.map(status => (
                        <button 
                          key={status}
                          onClick={() => {
                            updateAvailMutation.mutate({ id: selected._id, availabilityStatus: status }, {
                              onSuccess: (updated) => setSelected(updated.data)
                            });
                          }}
                          className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                            selected.availabilityStatus === status 
                              ? 'border-[#C89B3C] bg-[#C89B3C]/10 text-[#C89B3C]' 
                              : 'border-gray-100 bg-white hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Employment Documents</h4>
                      <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs">
                        <Plus size={12} /> Upload
                        <input type="file" onChange={handleUploadDocument} className="hidden" />
                      </label>
                    </div>

                    {selected.documents?.length === 0 ? (
                      <p className="text-xs text-gray-400 bg-gray-50 p-4 rounded-xl text-center">No documents uploaded.</p>
                    ) : (
                      selected.documents?.map((doc: any) => (
                        <div key={doc._id} className="p-3 border border-gray-100 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <FileText size={16} className="text-gray-400" />
                            <div>
                              <p className="text-xs font-bold text-gray-800">{doc.name}</p>
                              <p className="text-[10px] text-gray-400">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <a href={doc.url} target="_blank" rel="noreferrer" className="p-1 text-gray-400 hover:text-[#C89B3C]">
                              <Eye size={13} />
                            </a>
                            <button onClick={() => handleDeleteDocument(doc._id)} className="p-1 text-gray-400 hover:text-red-500">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Audit Trail</h4>
                    <div className="space-y-4">
                      {selected.timeline?.map((t: any, index: number) => (
                        <div key={index} className="flex gap-3 text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#C89B3C] mt-1.5" />
                          <div>
                            <p className="font-semibold text-gray-800">{t.action}</p>
                            <p className="text-gray-500 mt-0.5">{t.description}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{new Date(t.date).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create / Edit Form Modal */}
      <AnimatePresence>
        {(modal === 'create' || modal === 'edit') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">{modal === 'create' ? 'Add Employee' : 'Edit Employee'}</h2>
                <button onClick={() => setModal(null)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>First Name *</label>
                    <input {...register('firstName', { required: true })} className={inp} placeholder="Sanjay" />
                  </div>
                  <div>
                    <label className={lbl}>Last Name *</label>
                    <input {...register('lastName', { required: true })} className={inp} placeholder="Kumar" />
                  </div>
                  <div>
                    <label className={lbl}>Email Address *</label>
                    <input type="email" {...register('email', { required: true })} className={inp} placeholder="sanjay@yazhievents.com" />
                  </div>
                  <div>
                    <label className={lbl}>Phone Number *</label>
                    <input {...register('phone', { required: true })} className={inp} placeholder="9876543210" />
                  </div>
                  <div>
                    <label className={lbl}>Department *</label>
                    <select {...register('department', { required: true })} className={inp}>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Designation *</label>
                    <select {...register('designation', { required: true })} className={inp}>
                      {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Experience (Years)</label>
                    <input type="number" {...register('experience')} className={inp} placeholder="5" />
                  </div>
                  <div>
                    <label className={lbl}>Salary (INR)</label>
                    <input type="number" {...register('salary')} className={inp} placeholder="45000" />
                  </div>
                  <div>
                    <label className={lbl}>Joining Date *</label>
                    <input type="date" {...register('joiningDate', { required: true })} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Employment Status</label>
                    <select {...register('employmentStatus')} className={inp}>
                      {EMPLOYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={lbl}>Skills (comma separated)</label>
                    <input {...register('skills')} className={inp} placeholder="Logistics, Stage Decor, Catering" />
                  </div>
                  <div className="col-span-2">
                    <label className={lbl}>Office Address</label>
                    <textarea {...register('address')} rows={2} className={`${inp} resize-none`} placeholder="Complete residential address..." />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors">
                    Save Employee
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {modal === 'delete' && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-500" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Employee Profile?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete <strong>{selected.firstName} {selected.lastName}</strong>? This action is permanent.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors">
                  Delete Employee
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
