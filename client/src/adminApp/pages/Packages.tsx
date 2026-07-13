import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, Star, Check } from 'lucide-react';

type Package = {
  id: string;
  name: string;
  tier: 'Silver' | 'Gold' | 'Platinum';
  price: number;
  description: string;
  features: string[];
  popular: boolean;
};

const initialPackages: Package[] = [
  {
    id: '1', name: 'Silver', tier: 'Silver', price: 75000,
    description: 'Perfect for intimate gatherings and small events.',
    features: ['Event Planning', 'Basic Decor', 'Photography (4hrs)', 'Coordination Team', 'Guest Management', 'Post-event Report'],
    popular: false
  },
  {
    id: '2', name: 'Gold', tier: 'Gold', price: 150000,
    description: 'Our most popular package for mid-sized celebrations.',
    features: ['Premium Event Planning', 'Luxury Decor', 'Photography + Video (8hrs)', 'Dedicated Coordinator', 'Catering Arrangement', 'Guest Management', 'Floral Arrangements', 'Post-event Report'],
    popular: true
  },
  {
    id: '3', name: 'Platinum', tier: 'Platinum', price: 300000,
    description: 'The ultimate luxury experience — no compromises.',
    features: ['Complete Event Design', 'Ultra-Premium Decor', 'Full-Day Coverage', 'Cinematography Team', 'Catering + Bar', 'Transport Arrangement', 'Dedicated Event Manager', 'Live Streaming', 'Photo Book', '1-Year Anniversary Gift'],
    popular: false
  },
];

const tierColors = {
  Silver: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', badge: 'bg-gray-200 text-gray-700', gradient: 'from-gray-300 to-gray-500' },
  Gold: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800', gradient: 'from-amber-400 to-yellow-600' },
  Platinum: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-800', gradient: 'from-violet-500 to-purple-700' },
};

export default function Packages() {
  const [packages, setPackages] = useState<Package[]>(initialPackages);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>([]);

  const { register, handleSubmit, reset } = useForm<Omit<Package, 'id' | 'features'>>();

  const openCreate = () => {
    setEditingPackage(null);
    setFeatures([]);
    reset({ name: '', tier: 'Silver', price: 0, description: '', popular: false });
    setShowModal(true);
  };

  const openEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFeatures([...pkg.features]);
    reset({ name: pkg.name, tier: pkg.tier, price: pkg.price, description: pkg.description, popular: pkg.popular });
    setShowModal(true);
  };

  const onSubmit = (data: Omit<Package, 'id' | 'features'>) => {
    if (editingPackage) {
      setPackages(ps => ps.map(p => p.id === editingPackage.id ? { ...p, ...data, features } : p));
    } else {
      setPackages(ps => [...ps, { ...data, id: Date.now().toString(), features }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setPackages(ps => ps.filter(p => p.id !== id));
    setDeleteId(null);
  };

  const togglePopular = (id: string) => {
    setPackages(ps => ps.map(p => ({ ...p, popular: p.id === id ? !p.popular : p.popular })));
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFeatures(f => [...f, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const removeFeature = (i: number) => setFeatures(f => f.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Packages</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your event packages and pricing tiers.</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus size={16} /> Add Package
        </button>
      </div>

      {/* Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg, i) => {
          const colors = tierColors[pkg.tier];
          return (
            <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-white rounded-2xl border-2 ${colors.border} overflow-hidden shadow-sm hover:shadow-lg transition-shadow`}>

              {pkg.popular && (
                <div className="absolute top-4 right-4">
                  <span className="flex items-center gap-1 bg-[#C89B3C] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    <Star size={10} fill="white" /> Most Popular
                  </span>
                </div>
              )}

              <div className={`h-2 bg-gradient-to-r ${colors.gradient}`} />

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${colors.bg} ${colors.text}`}>
                    {pkg.tier[0]}
                  </div>
                  <div>
                    <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${colors.badge} mb-0.5`}>{pkg.tier}</span>
                    <h3 className="text-lg font-bold text-gray-900 leading-none">{pkg.name}</h3>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-gray-900">₹{(pkg.price / 1000).toFixed(0)}k</span>
                  <span className="text-gray-400 text-sm ml-1">/ event</span>
                </div>

                <p className="text-sm text-gray-500 mb-5 leading-relaxed">{pkg.description}</p>

                <div className="space-y-2 mb-6">
                  {pkg.features.map((f, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check size={14} className={`${colors.text} mt-0.5 shrink-0`} strokeWidth={2.5} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button onClick={() => togglePopular(pkg.id)}
                    className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${pkg.popular ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {pkg.popular ? '★ Featured' : 'Set Featured'}
                  </button>
                  <button onClick={() => openEdit(pkg)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => setDeleteId(pkg.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">{editingPackage ? 'Edit Package' : 'New Package'}</h2>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Package Name</label>
                    <input {...register('name', { required: true })} placeholder="e.g. Gold Premium"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30 focus:border-[#C89B3C]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tier</label>
                    <select {...register('tier')} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30">
                      <option>Silver</option><option>Gold</option><option>Platinum</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Price (₹)</label>
                  <input type="number" {...register('price', { required: true, min: 0 })} placeholder="150000"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea {...register('description')} rows={2} placeholder="Brief package description..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Features</label>
                  <div className="flex gap-2 mb-2">
                    <input value={featureInput} onChange={e => setFeatureInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      placeholder="Type feature and press Enter..."
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30" />
                    <button type="button" onClick={addFeature}
                      className="px-3 py-2 bg-[#C89B3C] text-white rounded-xl text-sm font-semibold">Add</button>
                  </div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {features.map((f, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5">
                        <span className="text-xs text-gray-700">{f}</span>
                        <button type="button" onClick={() => removeFeature(i)} className="text-gray-400 hover:text-red-500 ml-2">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('popular')} className="rounded border-gray-300 text-[#C89B3C] focus:ring-[#C89B3C]" />
                  <span className="text-sm text-gray-700">Mark as Most Popular</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors">
                    {editingPackage ? 'Save Changes' : 'Create Package'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={20} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Package?</h3>
              <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
