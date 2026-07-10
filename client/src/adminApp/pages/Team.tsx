import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, X, Phone, Mail, Instagram, Camera } from 'lucide-react';

type TeamMember = {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  instagram: string;
  bio: string;
  photoUrl: string;
  joinedDate: string;
  status: 'Active' | 'Inactive';
};

const ROLES = ['Event Manager', 'Coordinator', 'Photographer', 'Videographer', 'Decorator', 'Makeup Artist', 'Catering Manager', 'Driver', 'Support Staff'];

const COLORS = ['from-amber-400 to-yellow-600', 'from-violet-400 to-purple-600', 'from-blue-400 to-indigo-600', 'from-green-400 to-emerald-600', 'from-pink-400 to-rose-600', 'from-red-400 to-orange-600'];

const seed: TeamMember[] = [
  { id: 'TM-001', name: 'Kavitha Raj', role: 'Event Manager', phone: '+91 9876543210', email: 'kavitha@yazhievents.com', instagram: '@kavitha_events', bio: '8 years of experience in luxury Tamil weddings.', photoUrl: '', joinedDate: '2020-01-15', status: 'Active' },
  { id: 'TM-002', name: 'Suresh Kumar', role: 'Photographer', phone: '+91 8765432109', email: 'suresh@yazhievents.com', instagram: '@suresh_lens', bio: 'Award-winning wedding photographer.', photoUrl: '', joinedDate: '2021-06-01', status: 'Active' },
  { id: 'TM-003', name: 'Meena Devi', role: 'Decorator', phone: '+91 7654321098', email: 'meena@yazhievents.com', instagram: '@meena_decor', bio: 'Specialist in floral and stage design.', photoUrl: '', joinedDate: '2022-03-10', status: 'Active' },
  { id: 'TM-004', name: 'Rajan P', role: 'Coordinator', phone: '+91 6543210987', email: 'rajan@yazhievents.com', instagram: '', bio: 'Expert in logistics and vendor coordination.', photoUrl: '', joinedDate: '2023-01-20', status: 'Inactive' },
];

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>(seed);
  const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<Omit<TeamMember, 'id' | 'joinedDate'>>();

  const openCreate = () => {
    setSelected(null);
    reset({ name: '', role: 'Event Manager', phone: '', email: '', instagram: '', bio: '', photoUrl: '', status: 'Active' });
    setModal('create');
  };

  const openEdit = (m: TeamMember) => {
    setSelected(m);
    Object.entries(m).forEach(([k, v]) => { if (k !== 'id' && k !== 'joinedDate') setValue(k as any, v); });
    setModal('edit');
  };

  const onSubmit = (data: Omit<TeamMember, 'id' | 'joinedDate'>) => {
    if (modal === 'create') {
      setMembers(ms => [...ms, { ...data, id: 'TM-' + String(ms.length + 1).padStart(3, '0'), joinedDate: new Date().toISOString().split('T')[0] }]);
    } else if (modal === 'edit' && selected) {
      setMembers(ms => ms.map(m => m.id === selected.id ? { ...m, ...data } : m));
    }
    setModal(null);
  };

  const handleDelete = () => {
    if (selected) setMembers(ms => ms.filter(m => m.id !== selected.id));
    setModal(null);
  };

  const inp = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30 focus:border-[#C89B3C] bg-white';
  const lbl = 'block text-xs font-semibold text-gray-600 mb-1.5';

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-sm text-gray-500 mt-1">{members.filter(m => m.status === 'Active').length} active · {members.length} total</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus size={15} /> Add Member
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {members.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
            {/* Color Header */}
            <div className={`h-20 bg-gradient-to-br ${COLORS[i % COLORS.length]} relative`}>
              <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${m.status === 'Active' ? 'bg-white/20 text-white' : 'bg-black/20 text-white/70'}`}>
                {m.status}
              </span>
            </div>

            <div className="px-5 pb-5 -mt-10">
              {/* Avatar */}
              <div className={`w-16 h-16 rounded-2xl border-4 border-white bg-gradient-to-br ${COLORS[i % COLORS.length]} flex items-center justify-center text-white text-2xl font-extrabold shadow-md mb-4`}>
                {m.name.charAt(0)}
              </div>

              <h3 className="text-base font-bold text-gray-900 leading-tight">{m.name}</h3>
              <p className="text-xs text-[#C89B3C] font-semibold mt-0.5">{m.role}</p>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2">{m.bio}</p>

              <div className="mt-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone size={11} className="text-gray-400" /> {m.phone}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
                  <Mail size={11} className="text-gray-400" /> {m.email}
                </div>
                {m.instagram && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Instagram size={11} className="text-pink-400" /> {m.instagram}
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2 pt-4 border-t border-gray-100">
                <button onClick={() => openEdit(m)}
                  className="flex-1 py-2 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5">
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => { setSelected(m); setModal('delete'); }}
                  className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {(modal === 'create' || modal === 'edit') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">{modal === 'create' ? 'Add Team Member' : 'Edit Team Member'}</h2>
                <button onClick={() => setModal(null)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                {/* Photo Upload */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
                    <Camera size={20} />
                  </div>
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 cursor-pointer transition-colors">
                    Upload Photo <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className={lbl}>Full Name *</label><input {...register('name', { required: true })} className={inp} placeholder="Kavitha Raj" /></div>
                  <div><label className={lbl}>Role *</label>
                    <select {...register('role')} className={inp}>{ROLES.map(r => <option key={r}>{r}</option>)}</select>
                  </div>
                  <div><label className={lbl}>Status</label>
                    <select {...register('status')} className={inp}><option>Active</option><option>Inactive</option></select>
                  </div>
                  <div><label className={lbl}>Phone</label><input {...register('phone')} className={inp} placeholder="+91 XXXXX XXXXX" /></div>
                  <div><label className={lbl}>Email</label><input {...register('email')} className={inp} placeholder="team@yazhievents.com" /></div>
                  <div className="col-span-2"><label className={lbl}>Instagram Handle</label><input {...register('instagram')} className={inp} placeholder="@username" /></div>
                  <div className="col-span-2"><label className={lbl}>Bio</label><textarea {...register('bio')} rows={3} className={`${inp} resize-none`} placeholder="Brief description about this team member..." /></div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors">
                    {modal === 'create' ? 'Add Member' : 'Save Changes'}
                  </button>
                </div>
              </form>
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
              <h3 className="text-lg font-bold text-gray-900 mb-1">Remove Team Member?</h3>
              <p className="text-sm text-gray-500 mb-6"><strong>{selected.name}</strong> will be permanently removed from the team.</p>
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors">Remove</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
