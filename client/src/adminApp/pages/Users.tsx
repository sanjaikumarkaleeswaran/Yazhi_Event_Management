import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, X, Search, Shield, Key } from 'lucide-react';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Inactive' | 'Suspended';
  lastLogin: string;
  createdAt: string;
};

const ROLES: User['role'][] = ['Super Admin', 'Admin', 'Editor', 'Viewer'];
const STATUSES: User['status'][] = ['Active', 'Inactive', 'Suspended'];

const ROLE_COLORS: Record<string, string> = {
  'Super Admin': 'bg-red-100 text-red-700',
  Admin:         'bg-violet-100 text-violet-700',
  Editor:        'bg-blue-100 text-blue-700',
  Viewer:        'bg-gray-100 text-gray-600',
};

const STATUS_COLORS: Record<string, string> = {
  Active:    'bg-green-100 text-green-700',
  Inactive:  'bg-gray-100 text-gray-500',
  Suspended: 'bg-red-100 text-red-600',
};

const seed: User[] = [
  { id: 'USR-001', name: 'Kavitha Raj', email: 'kavitha@yazhievents.com', role: 'Super Admin', status: 'Active', lastLogin: '2026-07-10', createdAt: '2020-01-15' },
  { id: 'USR-002', name: 'Suresh Kumar', email: 'suresh@yazhievents.com', role: 'Admin', status: 'Active', lastLogin: '2026-07-09', createdAt: '2021-06-01' },
  { id: 'USR-003', name: 'Meena Devi', email: 'meena@yazhievents.com', role: 'Editor', status: 'Active', lastLogin: '2026-07-08', createdAt: '2022-03-10' },
  { id: 'USR-004', name: 'Rajan P', email: 'rajan@yazhievents.com', role: 'Viewer', status: 'Inactive', lastLogin: '2026-06-01', createdAt: '2023-01-20' },
];

export default function Users() {
  const [users, setUsers] = useState<User[]>(seed);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | 'delete' | 'reset' | null>(null);
  const [selected, setSelected] = useState<User | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<Omit<User, 'id' | 'createdAt' | 'lastLogin'>>();

  const openCreate = () => {
    setSelected(null);
    reset({ name: '', email: '', role: 'Viewer', status: 'Active' });
    setModal('create');
  };
  const openEdit = (u: User) => {
    setSelected(u);
    setValue('name', u.name); setValue('email', u.email); setValue('role', u.role); setValue('status', u.status);
    setModal('edit');
  };

  const onSubmit = (data: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => {
    if (modal === 'create') {
      setUsers(us => [...us, { ...data, id: 'USR-' + String(us.length + 1).padStart(3, '0'), createdAt: new Date().toISOString().split('T')[0], lastLogin: '—' }]);
    } else if (modal === 'edit' && selected) {
      setUsers(us => us.map(u => u.id === selected.id ? { ...u, ...data } : u));
    }
    setModal(null);
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const inp = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30 focus:border-[#C89B3C] bg-white';
  const lbl = 'block text-xs font-semibold text-gray-600 mb-1.5';

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{users.filter(u => u.status === 'Active').length} active users · {users.length} total</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus size={15} /> Add User
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['User', 'Role', 'Status', 'Last Login', 'Member Since', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u, i) => (
                <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#C89B3C] to-[#5A1E1E] flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit ${ROLE_COLORS[u.role]}`}>
                      <Shield size={10} /> {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[u.status]}`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">{u.lastLogin}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{u.createdAt}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(u)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit2 size={14} /></button>
                      <button onClick={() => { setSelected(u); setModal('reset'); }} className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Reset Password"><Key size={14} /></button>
                      <button onClick={() => { setSelected(u); setModal('delete'); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(modal === 'create' || modal === 'edit') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">{modal === 'create' ? 'Add New User' : 'Edit User'}</h2>
                <button onClick={() => setModal(null)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div><label className={lbl}>Full Name *</label><input {...register('name', { required: true })} className={inp} placeholder="Full name" /></div>
                <div><label className={lbl}>Email Address *</label><input type="email" {...register('email', { required: true })} className={inp} placeholder="user@yazhievents.com" /></div>
                {modal === 'create' && <div><label className={lbl}>Password *</label><input type="password" className={inp} placeholder="Minimum 8 characters" /></div>}
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={lbl}>Role</label>
                    <select {...register('role')} className={inp}>{ROLES.map(r => <option key={r}>{r}</option>)}</select>
                  </div>
                  <div><label className={lbl}>Status</label>
                    <select {...register('status')} className={inp}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
                  </div>
                </div>

                {/* Role Permissions Info */}
                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
                  <p className="font-semibold text-gray-700 mb-1">Role Permissions:</p>
                  <p>• <strong>Super Admin</strong> — Full access to all modules</p>
                  <p>• <strong>Admin</strong> — All modules except User Management</p>
                  <p>• <strong>Editor</strong> — Gallery, Blog, Testimonials only</p>
                  <p>• <strong>Viewer</strong> — Read-only access</p>
                </div>

                <div className="flex gap-3 pt-1">
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

      {/* Reset Password */}
      <AnimatePresence>
        {modal === 'reset' && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4"><Key size={20} className="text-amber-500" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Reset Password?</h3>
              <p className="text-sm text-gray-500 mb-2">A password reset link will be sent to:</p>
              <p className="text-sm font-semibold text-gray-800 mb-6">{selected.email}</p>
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={() => setModal(null)} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors">Send Reset Link</button>
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
              <h3 className="text-lg font-bold text-gray-900 mb-1">Delete User?</h3>
              <p className="text-sm text-gray-500 mb-6"><strong>{selected.name}</strong> will lose all admin access immediately.</p>
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={() => { setUsers(us => us.filter(u => u.id !== selected.id)); setModal(null); }}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
