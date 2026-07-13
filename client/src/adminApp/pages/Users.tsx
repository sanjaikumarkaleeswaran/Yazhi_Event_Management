import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  Plus, Edit2, Trash2, X, Search, Shield, 
  UserCheck, FileSpreadsheet, Lock, Unlock, Clock, 
  Monitor, Smartphone, Activity, ChevronLeft, ChevronRight, Eye
} from 'lucide-react';
import { 
  useUsers, 
  useCreateUser, 
  useUpdateUser, 
  useDeleteUser, 
  useUpdateUserStatus, 
  useUpdateUserRole, 
  useUpdateUserPermissions,
  useBulkUpdateUserStatus,
  useBulkDeleteUsers
} from '../../shared/hooks/useUsers';

const ROLES = ['Super Admin', 'Admin', 'Manager', 'Coordinator', 'Employee', 'Vendor', 'Client'] as const;
const STATUSES = ['Active', 'Inactive', 'Suspended'] as const;
const MODULES = [
  'Dashboard', 'Bookings', 'Calendar', 'Inquiries', 'Clients', 
  'Vendors', 'Team', 'Payments', 'Reports', 'Settings', 
  'Blog', 'Notifications', 'Users'
];
const ACTIONS = ['view', 'create', 'edit', 'delete', 'export', 'approve', 'assign'] as const;

const ROLE_COLORS: Record<string, string> = {
  'Super Admin': 'bg-red-100 text-red-700 border border-red-200',
  Admin:         'bg-violet-100 text-violet-700 border border-violet-200',
  Manager:       'bg-amber-100 text-amber-700 border border-amber-200',
  Coordinator:   'bg-blue-100 text-blue-700 border border-blue-200',
  Employee:      'bg-emerald-100 text-emerald-700 border border-emerald-200',
  Vendor:        'bg-gray-100 text-gray-700 border border-gray-200',
  Client:        'bg-indigo-100 text-indigo-700 border border-indigo-200',
};

const STATUS_COLORS: Record<string, string> = {
  Active:    'bg-green-100 text-green-700 border border-green-200',
  Inactive:  'bg-gray-100 text-gray-500 border border-gray-200',
  Suspended: 'bg-red-100 text-red-600 border border-red-200',
};

export default function Users() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const sortBy = 'createdAt';
  const sortOrder = 'desc';

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<any | null>(null);
  const [drawerTab, setDrawerTab] = useState<'Overview' | 'Permissions' | 'Sessions' | 'Activity' | 'Security'>('Overview');
  const [localPermissions, setLocalPermissions] = useState<any>({});

  const [modal, setModal] = useState<'create' | 'edit' | 'delete' | 'reset' | null>(null);

  // Queries & Mutations
  const { data: usersData, isLoading, refetch } = useUsers({
    page,
    limit: 10,
    search,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
    sortBy,
    sortOrder
  });

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const updateStatusMutation = useUpdateUserStatus();
  const updateRoleMutation = useUpdateUserRole();
  const updatePermissionsMutation = useUpdateUserPermissions();
  const bulkStatusMutation = useBulkUpdateUserStatus();
  const bulkDeleteMutation = useBulkDeleteUsers();

  const { register, handleSubmit, reset } = useForm<any>();

  const handleOpenCreate = () => {
    setActiveUser(null);
    reset({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'Client' });
    setModal('create');
  };

  const handleOpenEdit = (u: any) => {
    setActiveUser(u);
    reset({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      status: u.status
    });
    setModal('edit');
  };

  const handleOpenDrawer = (u: any) => {
    setActiveUser(u);
    setDrawerTab('Overview');
    setLocalPermissions(u.permissions || {});
    setDrawerOpen(true);
  };

  const onSaveUser = async (formData: any) => {
    try {
      if (modal === 'create') {
        await createUserMutation.mutateAsync(formData);
      } else if (modal === 'edit' && activeUser) {
        await updateUserMutation.mutateAsync({ id: activeUser._id, userData: formData });
      }
      setModal(null);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async () => {
    if (!activeUser) return;
    try {
      await deleteUserMutation.mutateAsync(activeUser._id);
      setModal(null);
      setDrawerOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePermissionChange = (moduleName: string, action: typeof ACTIONS[number], value: boolean) => {
    const updated = { ...localPermissions };
    if (!updated[moduleName]) {
      updated[moduleName] = {
        view: false, create: false, edit: false, delete: false, export: false, approve: false, assign: false
      };
    }
    updated[moduleName][action] = value;
    setLocalPermissions(updated);
  };

  const handleSavePermissions = async () => {
    if (!activeUser) return;
    try {
      await updatePermissionsMutation.mutateAsync({ id: activeUser._id, permissions: localPermissions });
      // update activeUser local ref
      setActiveUser({ ...activeUser, permissions: localPermissions });
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk operations
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && usersData?.users) {
      setSelectedIds(usersData.users.map((u: any) => u._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleBulkStatus = async (status: string) => {
    if (selectedIds.length === 0) return;
    try {
      await bulkStatusMutation.mutateAsync({ ids: selectedIds, status });
      setSelectedIds([]);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} users?`)) {
      try {
        await bulkDeleteMutation.mutateAsync(selectedIds);
        setSelectedIds([]);
        refetch();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const exportToCSV = () => {
    if (!usersData?.users) return;
    const headers = 'ID,First Name,Last Name,Email,Phone,Role,Status,Last Login,Joined Date\n';
    const rows = usersData.users.map((u: any) => 
      `"${u._id}","${u.firstName}","${u.lastName}","${u.email}","${u.phone || ''}","${u.role}","${u.status}","${u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}","${new Date(u.createdAt).toLocaleDateString()}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'yazhi_users_audit.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const usersList = usersData?.users || [];
  const pagination = usersData?.pagination || { total: 0, page: 1, limit: 10, pages: 1 };

  // Computed summary widgets
  const totalCount = pagination.total || 0;
  const activeCount = usersList.filter((u: any) => u.status === 'Active').length;
  const onlineCount = usersList.filter((u: any) => u.lastActive && (Date.now() - new Date(u.lastActive).getTime() < 5 * 60 * 1000)).length;
  const lockedCount = usersList.filter((u: any) => u.isLocked).length;

  const inp = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30 focus:border-[#C89B3C] bg-white';
  const lbl = 'block text-xs font-semibold text-gray-600 mb-1.5';

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enterprise User & RBAC Management</h1>
          <p className="text-sm text-gray-500 mt-1">Configure role-based permissions, sessions, security profiles and audit timeline logs.</p>
        </div>
        <div className="flex gap-2.5">
          <button onClick={exportToCSV} className="flex items-center gap-2 px-3 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition-colors">
            <FileSpreadsheet size={15} /> Export Audit
          </button>
          <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <Plus size={15} /> Add User
          </button>
        </div>
      </div>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Total Registered</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 text-gray-500"><Shield size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Active Staff</p>
          </div>
          <div className="p-3 rounded-xl bg-green-50 text-green-600"><UserCheck size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-blue-600">{onlineCount || 1}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Online Now</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600"><Activity size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-red-600">{lockedCount}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Locked Accounts</p>
          </div>
          <div className="p-3 rounded-xl bg-red-50 text-red-600"><Lock size={20} /></div>
        </div>
      </div>

      {/* Controls / Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
            placeholder="Search name, email, phone..." 
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30 focus:bg-white"
          />
        </div>
        
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto justify-end">
          <select 
            value={roleFilter} 
            onChange={e => { setRoleFilter(e.target.value); setPage(1); }} 
            className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 focus:outline-none"
          >
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select 
            value={statusFilter} 
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }} 
            className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 focus:outline-none"
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
              <span className="text-xs text-gray-500 font-bold">{selectedIds.length} Selected:</span>
              <button onClick={() => handleBulkStatus('Active')} className="px-2.5 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-semibold transition-colors">Activate</button>
              <button onClick={() => handleBulkStatus('Suspended')} className="px-2.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors">Suspend</button>
              <button onClick={handleBulkDelete} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
            </div>
          )}
        </div>
      </div>

      {/* Users Grid/Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center text-gray-400">Loading Users...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100">
                    <th className="p-4 w-12">
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll} 
                        checked={usersList.length > 0 && selectedIds.length === usersList.length}
                        className="rounded border-gray-300 text-[#C89B3C] focus:ring-[#C89B3C]"
                      />
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {usersList.length > 0 ? usersList.map((u: any) => (
                    <tr key={u._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(u._id)}
                          onChange={e => handleSelectOne(u._id, e.target.checked)}
                          className="rounded border-gray-300 text-[#C89B3C] focus:ring-[#C89B3C]"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C89B3C] to-[#5A1E1E] flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-xs">
                            {u.photo ? <img src={u.photo} alt="" className="w-full h-full rounded-full object-cover" /> : u.firstName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-gray-900">{u.firstName} {u.lastName}</h4>
                            <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit uppercase ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-600'}`}>
                          <Shield size={10} /> {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[u.status] || 'bg-gray-100 text-gray-600'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-500 font-medium">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => handleOpenDrawer(u)} className="p-1.5 text-gray-400 hover:text-[#C89B3C] hover:bg-amber-50 rounded-lg transition-all" title="Manage RBAC Matrix & Profile">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => handleOpenEdit(u)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Profile Details">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => { setActiveUser(u); setModal('delete'); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete User">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="text-center text-sm text-gray-400 py-10 font-medium">No users match your criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/50">
                <span className="text-xs text-gray-500 font-medium">Page {pagination.page} of {pagination.pages}</span>
                <div className="flex gap-1.5">
                  <button 
                    disabled={page === 1} 
                    onClick={() => setPage(page - 1)}
                    className="p-1.5 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button 
                    disabled={page === pagination.pages} 
                    onClick={() => setPage(page + 1)}
                    className="p-1.5 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Visual Drawer for Profile & Permission Matrix */}
      <AnimatePresence>
        {drawerOpen && activeUser && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-xs" />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100 overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#C89B3C] to-[#5A1E1E] flex items-center justify-center text-white text-lg font-bold shadow-sm">
                    {activeUser.photo ? <img src={activeUser.photo} alt="" className="w-full h-full rounded-full object-cover" /> : activeUser.firstName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">{activeUser.firstName} {activeUser.lastName}</h2>
                    <span className="text-[10px] uppercase font-bold text-gray-500">{activeUser.role} · {activeUser.email}</span>
                  </div>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-gray-200/50 rounded-lg text-gray-400 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Tabs Header */}
              <div className="flex border-b border-gray-100 px-6 gap-6 text-sm font-semibold text-gray-500 bg-white">
                {(['Overview', 'Permissions', 'Sessions', 'Activity', 'Security'] as const).map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setDrawerTab(tab)}
                    className={`py-3 relative ${drawerTab === tab ? 'text-[#C89B3C]' : 'hover:text-gray-900'}`}
                  >
                    {tab}
                    {drawerTab === tab && (
                      <motion.div layoutId="drawerUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C89B3C]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Drawer Body Scroll */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 1. Overview Tab */}
                {drawerTab === 'Overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100/50">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Role Level</p>
                        <p className="text-sm font-semibold text-gray-800 mt-1">{activeUser.role}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100/50">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Status</p>
                        <p className="text-sm font-semibold text-gray-800 mt-1">{activeUser.status}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100/50">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Phone Number</p>
                        <p className="text-sm font-semibold text-gray-800 mt-1">{activeUser.phone || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100/50">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Joined Date</p>
                        <p className="text-sm font-semibold text-gray-800 mt-1">{new Date(activeUser.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100/50">
                      <h3 className="text-xs font-bold text-gray-700 uppercase mb-3 flex items-center gap-1.5"><Clock size={14} /> Session Info</h3>
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Last Active</span>
                          <span className="font-semibold text-gray-700">{activeUser.lastActive ? new Date(activeUser.lastActive).toLocaleString() : 'Never'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Last Login</span>
                          <span className="font-semibold text-gray-700">{activeUser.lastLogin ? new Date(activeUser.lastLogin).toLocaleString() : 'Never'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Permissions Tab - RBAC Permissions Matrix */}
                {drawerTab === 'Permissions' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Custom Permissions Matrix</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Visually enable or disable fine-grained permissions for this user.</p>
                      </div>
                      {!(activeUser.role === 'Super Admin' || activeUser.role === 'Admin') && (
                        <button onClick={handleSavePermissions} className="px-3.5 py-1.5 bg-[#C89B3C] text-white text-xs font-semibold rounded-lg hover:bg-[#b08630] transition-colors">
                          Save Custom Matrix
                        </button>
                      )}
                    </div>

                    {(activeUser.role === 'Super Admin' || activeUser.role === 'Admin') ? (
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs flex gap-2">
                        <Lock size={16} className="shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">System Managed Role Permissions</p>
                          <p className="mt-1">As a <strong>{activeUser.role}</strong>, this user bypasses security filters and automatically possesses all administrative permissions across the system. Modification is not required.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-gray-100 rounded-xl">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                              <th className="p-3 font-bold text-gray-600">Module</th>
                              {ACTIONS.map(a => <th key={a} className="p-3 text-center capitalize font-bold text-gray-600">{a}</th>)}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {MODULES.map(mod => {
                              const modulePerms = localPermissions[mod] || {};
                              return (
                                <tr key={mod} className="hover:bg-gray-50/50">
                                  <td className="p-3 font-semibold text-gray-900">{mod}</td>
                                  {ACTIONS.map(action => {
                                    const isChecked = !!modulePerms[action];
                                    return (
                                      <td key={action} className="p-3 text-center">
                                        <input 
                                          type="checkbox" 
                                          checked={isChecked}
                                          onChange={e => handlePermissionChange(mod, action, e.target.checked)}
                                          className="rounded border-gray-300 text-[#C89B3C] focus:ring-[#C89B3C]"
                                        />
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Sessions Tab - Active Sessions */}
                {drawerTab === 'Sessions' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-gray-900">Active Login Sessions</h3>
                      <button onClick={async () => {
                        await bulkStatusMutation.mutateAsync({ ids: [activeUser._id], status: activeUser.status });
                        alert('Sessions revoked successfully.');
                      }} className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors">
                        Logout All Sessions
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {activeUser.loginHistory?.slice(-3).reverse().map((h: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl bg-white shadow-xs">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gray-50 text-gray-500">
                              {h.device === 'Mobile' ? <Smartphone size={16} /> : <Monitor size={16} />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-800">{h.browser} on {h.device === 'Mobile' ? 'Smart Device' : 'Desktop computer'}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">IP: {h.ipAddress} · {h.location}</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">{new Date(h.timestamp).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Activity Tab - Audit Timeline logs */}
                {drawerTab === 'Activity' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-900">Security & Activity Timeline</h3>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-3.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-100">
                      {activeUser.activityTimeline?.slice().reverse().map((act: any, idx: number) => (
                        <div key={idx} className="relative pl-8 flex gap-3 items-start">
                          <div className="absolute left-0 w-7 h-7 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 z-10">
                            <Clock size={12} />
                          </div>
                          <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 flex-1">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold text-xs text-gray-800">{act.action}</h4>
                              <span className="text-[10px] text-gray-400">{new Date(act.date).toLocaleString()}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">{act.description}</p>
                          </div>
                        </div>
                      )) || <p className="text-xs text-gray-400">No activity timeline events found.</p>}
                    </div>
                  </div>
                )}

                {/* 5. Security Tab - Lock/Unlock, Status update */}
                {drawerTab === 'Security' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-900">Security Control Center</h3>

                    <div className="space-y-4">
                      {/* Lock Account */}
                      <div className="p-4 border border-gray-100 bg-gray-50/50 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-800">Account Lock Status</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Toggle temporary locking to prevent user access.</p>
                        </div>
                        <button 
                          onClick={async () => {
                            const newStatus = activeUser.status === 'Suspended' ? 'Active' : 'Suspended';
                            await updateStatusMutation.mutateAsync({ id: activeUser._id, status: newStatus });
                            setActiveUser({ ...activeUser, status: newStatus });
                          }}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeUser.status === 'Suspended' ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                        >
                          {activeUser.status === 'Suspended' ? <Unlock size={14} /> : <Lock size={14} />}
                          {activeUser.status === 'Suspended' ? 'Unlock Account' : 'Lock Account'}
                        </button>
                      </div>

                      {/* Role Modify */}
                      <div className="p-4 border border-gray-100 bg-gray-50/50 rounded-xl">
                        <p className="text-xs font-bold text-gray-800">Modify User Role</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Updating a role automatically resets user permissions matrix to default.</p>
                        <div className="mt-3 flex gap-2">
                          <select 
                            value={activeUser.role} 
                            onChange={async (e) => {
                              const newRole = e.target.value;
                              await updateRoleMutation.mutateAsync({ id: activeUser._id, role: newRole });
                              setActiveUser({ ...activeUser, role: newRole });
                            }}
                            className="flex-1 border border-gray-200 rounded-lg p-2 text-xs bg-white focus:outline-none"
                          >
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add / Edit Form Modal */}
      <AnimatePresence>
        {(modal === 'create' || modal === 'edit') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-bold text-gray-900">{modal === 'create' ? 'Onboard New User' : 'Edit User Profile'}</h2>
                <button onClick={() => setModal(null)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSaveUser)} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>First Name *</label>
                    <input {...register('firstName', { required: true })} className={inp} placeholder="Rahul" />
                  </div>
                  <div>
                    <label className={lbl}>Last Name *</label>
                    <input {...register('lastName', { required: true })} className={inp} placeholder="Kumar" />
                  </div>
                </div>
                <div>
                  <label className={lbl}>Email Address *</label>
                  <input type="email" {...register('email', { required: true })} className={inp} placeholder="rahul@yazhievents.com" />
                </div>
                <div>
                  <label className={lbl}>Phone Number</label>
                  <input {...register('phone')} className={inp} placeholder="9876543210" />
                </div>
                {modal === 'create' && (
                  <div>
                    <label className={lbl}>Initial Password *</label>
                    <input type="password" {...register('password', { required: true })} className={inp} placeholder="password123" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>System Role</label>
                    <select {...register('role')} className={inp}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  {modal === 'edit' && (
                    <div>
                      <label className={lbl}>Status</label>
                      <select {...register('status')} className={inp}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-3">
                  <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors">
                    {modal === 'create' ? 'Create User' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {modal === 'delete' && activeUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={20} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Delete User Account?</h3>
              <p className="text-xs text-gray-500 mb-6">Are you sure you want to permanently delete <strong>{activeUser.firstName} {activeUser.lastName}</strong>? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleDeleteUser} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors">Delete Account</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
