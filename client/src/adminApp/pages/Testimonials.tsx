import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Eye, Trash2, ThumbsUp, ThumbsDown, Search } from 'lucide-react';

type Testimonial = {
  id: string;
  clientName: string;
  eventType: string;
  rating: number;
  message: string;
  photoUrl: string;
  status: 'Pending' | 'Published' | 'Rejected';
  submittedAt: string;
};

const seed: Testimonial[] = [
  { id: 'T-001', clientName: 'Arun & Priya Kumar', eventType: 'Wedding', rating: 5, message: 'Yazhi Events made our wedding absolutely magical! Every detail was perfect — from the stunning floral decor to the smooth coordination. We couldn\'t have asked for a better team.', photoUrl: '', status: 'Published', submittedAt: '2026-06-20' },
  { id: 'T-002', clientName: 'Karthik Selvam', eventType: 'Corporate', rating: 4, message: 'Excellent coordination and professional service. The team handled our annual company event flawlessly. Highly recommended!', photoUrl: '', status: 'Published', submittedAt: '2026-07-01' },
  { id: 'T-003', clientName: 'Divya Mohan', eventType: 'Valaikappu', rating: 5, message: 'The valaikappu ceremony was beautifully organized. Traditional elements blended perfectly with modern aesthetics. Thank you so much!', photoUrl: '', status: 'Pending', submittedAt: '2026-07-08' },
  { id: 'T-004', clientName: 'Ramesh V', eventType: 'Birthday', rating: 3, message: 'Good service overall. A few minor hiccups with the timing but the team handled it well.', photoUrl: '', status: 'Pending', submittedAt: '2026-07-09' },
  { id: 'T-005', clientName: 'Anitha P', eventType: 'Engagement', rating: 5, message: 'Stunning decor and amazing photographs. Our family was blown away by how beautiful everything turned out!', photoUrl: '', status: 'Rejected', submittedAt: '2026-07-05' },
];

const STATUS_STYLES: Record<string, string> = {
  Published: 'bg-green-100 text-green-700',
  Pending:   'bg-yellow-100 text-yellow-700',
  Rejected:  'bg-red-100 text-red-700',
};

export default function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>(seed);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<Testimonial | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const updateStatus = (id: string, status: Testimonial['status']) => {
    setItems(ts => ts.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleDelete = () => {
    if (deleteId) setItems(ts => ts.filter(t => t.id !== deleteId));
    setDeleteId(null);
  };

  const filtered = items.filter(t =>
    (filter === 'All' || t.status === filter) &&
    (t.clientName.toLowerCase().includes(search.toLowerCase()) || t.eventType.toLowerCase().includes(search.toLowerCase()))
  );

  const renderStars = (n: number) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={13} className={i < n ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
  ));

  const counts = { All: items.length, Pending: items.filter(t => t.status === 'Pending').length, Published: items.filter(t => t.status === 'Published').length, Rejected: items.filter(t => t.status === 'Rejected').length };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
        <p className="text-sm text-gray-500 mt-1">Review and approve client testimonials.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', count: counts.All, color: 'bg-gray-50 text-gray-700' },
          { label: 'Pending', count: counts.Pending, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Published', count: counts.Published, color: 'bg-green-50 text-green-700' },
          { label: 'Rejected', count: counts.Rejected, color: 'bg-red-50 text-red-700' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
            <p className="text-2xl font-extrabold">{s.count}</p>
            <p className="text-xs font-semibold mt-0.5 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or event..."
            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30" />
        </div>
        <div className="flex gap-1.5">
          {['All', 'Pending', 'Published', 'Rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f ? 'bg-[#18181B] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">No testimonials found.</div>
        ) : filtered.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row gap-4">

            {/* Avatar */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#C89B3C] to-[#5A1E1E] flex items-center justify-center text-white font-bold text-lg shrink-0">
              {t.clientName.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-gray-900">{t.clientName}</h3>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500">{t.eventType}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[t.status]}`}>{t.status}</span>
              </div>
              <div className="flex items-center gap-1 mb-2">{renderStars(t.rating)}</div>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{t.message}</p>
              <p className="text-xs text-gray-400 mt-2">Submitted {t.submittedAt}</p>
            </div>

            {/* Actions */}
            <div className="flex sm:flex-col gap-2 shrink-0">
              {t.status !== 'Published' && (
                <button onClick={() => updateStatus(t.id, 'Published')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-xs font-semibold transition-colors">
                  <ThumbsUp size={13} /> Approve
                </button>
              )}
              {t.status !== 'Rejected' && (
                <button onClick={() => updateStatus(t.id, 'Rejected')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition-colors">
                  <ThumbsDown size={13} /> Reject
                </button>
              )}
              <button onClick={() => setViewing(t)}
                className="p-2 text-gray-400 hover:text-[#C89B3C] hover:bg-amber-50 rounded-xl transition-colors">
                <Eye size={15} />
              </button>
              <button onClick={() => setDeleteId(t.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View Full */}
      <AnimatePresence>
        {viewing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{viewing.clientName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-0.5">{renderStars(viewing.rating)}</div>
                    <span className="text-xs text-gray-400">{viewing.eventType}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[viewing.status]}`}>{viewing.status}</span>
                  </div>
                </div>
                <button onClick={() => setViewing(null)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{viewing.message}</p>
              <p className="text-xs text-gray-400 mt-4">Submitted: {viewing.submittedAt}</p>
              <div className="flex gap-2 mt-5">
                {viewing.status !== 'Published' && <button onClick={() => { updateStatus(viewing.id, 'Published'); setViewing(null); }} className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors">Publish</button>}
                {viewing.status !== 'Rejected' && <button onClick={() => { updateStatus(viewing.id, 'Rejected'); setViewing(null); }} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors">Reject</button>}
                <button onClick={() => setViewing(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-500" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Testimonial?</h3>
              <p className="text-sm text-gray-500 mb-6">This testimonial will be permanently deleted.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
