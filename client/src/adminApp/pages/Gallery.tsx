import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Search, Trash2, Grid, List, X, ZoomIn, Edit2, Check, Image as ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';

const CATEGORIES = ['All', 'Weddings', 'Birthday', 'Corporate', 'Valaikappu', 'Engagement'];

type GalleryItem = {
  id: string;
  url: string;
  title: string;
  category: string;
  tags: string[];
  uploadedAt: string;
  size?: string;
};

type UploadingFile = {
  id: string;
  name: string;
  progress: number;
  done: boolean;
  url: string;
};

const mockImages: GalleryItem[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80', title: 'Wedding Stage Decor', category: 'Weddings', tags: ['decor', 'stage'], uploadedAt: '2026-07-01', size: '2.4 MB' },
  { id: '2', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80', title: 'Reception Hall', category: 'Weddings', tags: ['hall', 'reception'], uploadedAt: '2026-07-03', size: '3.1 MB' },
  { id: '3', url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80', title: 'Birthday Celebration', category: 'Birthday', tags: ['birthday', 'celebration'], uploadedAt: '2026-07-05', size: '1.8 MB' },
  { id: '4', url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&q=80', title: 'Floral Entrance', category: 'Weddings', tags: ['floral', 'entrance'], uploadedAt: '2026-07-06', size: '2.9 MB' },
  { id: '5', url: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&q=80', title: 'Corporate Event', category: 'Corporate', tags: ['corporate', 'stage'], uploadedAt: '2026-07-07', size: '1.5 MB' },
  { id: '6', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80', title: 'Bride Portrait', category: 'Weddings', tags: ['portrait', 'bride'], uploadedAt: '2026-07-08', size: '3.8 MB' },
];

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>(mockImages);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<GalleryItem | null>(null);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);

  const { register, handleSubmit, reset } = useForm<{ title: string; category: string }>();

  // Filter
  const filtered = items.filter(i =>
    (category === 'All' || i.category === category) &&
    (i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
  );

  const toggleSelect = (id: string) => {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const deleteSelected = () => {
    setItems(prev => prev.filter(i => !selected.has(i.id)));
    setSelected(new Set());
  };

  // Simulate upload with progress
  const processFiles = useCallback((files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (!imageFiles.length) return;

    const newUploads: UploadingFile[] = imageFiles.map((f, i) => ({
      id: Date.now().toString() + i,
      name: f.name,
      progress: 0,
      done: false,
      url: URL.createObjectURL(f),
    }));

    setUploading(prev => [...prev, ...newUploads]);

    newUploads.forEach((upload) => {
      // Simulate progress
      let prog = 0;
      const interval = setInterval(() => {
        prog += Math.random() * 25 + 10;
        if (prog >= 100) {
          prog = 100;
          clearInterval(interval);
          // Mark done
          setUploading(prev => prev.map(u => u.id === upload.id ? { ...u, progress: 100, done: true } : u));
          // Add to gallery
          const file = imageFiles[newUploads.indexOf(upload)];
          const newItem: GalleryItem = {
            id: upload.id,
            url: upload.url,
            title: file.name.replace(/\.[^.]+$/, ''),
            category: 'Weddings',
            tags: [],
            uploadedAt: new Date().toISOString().split('T')[0],
            size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
          };
          setItems(prev => [newItem, ...prev]);
          // Remove from uploading after delay
          setTimeout(() => setUploading(prev => prev.filter(u => u.id !== upload.id)), 2000);
        } else {
          setUploading(prev => prev.map(u => u.id === upload.id ? { ...u, progress: Math.round(prog) } : u));
        }
      }, 150);
    });
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    processFiles(Array.from(e.target.files));
    e.target.value = ''; // reset
  };

  const openEdit = (item: GalleryItem) => {
    setEditItem(item);
    setEditTags([...item.tags]);
    reset({ title: item.title, category: item.category });
  };

  const saveEdit = (data: { title: string; category: string }) => {
    if (!editItem) return;
    setItems(prev => prev.map(i => i.id === editItem.id ? { ...i, ...data, tags: editTags } : i));
    setEditItem(null);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !editTags.includes(t)) setEditTags(prev => [...prev, t]);
    setTagInput('');
  };

  // Image fallback
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = `https://ui-avatars.com/api/?name=Photo&background=f3f4f6&color=9ca3af&size=400`;
  };

  const inp = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30 focus:border-[#C89B3C] bg-white';
  const lbl = 'block text-xs font-semibold text-gray-600 mb-1.5';

  return (
    <div className="space-y-5" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} images · Manage your event photography</p>
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <button onClick={deleteSelected}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold border border-red-200 transition-colors">
              <Trash2 size={14} /> Delete ({selected.size})
            </button>
          )}
          <label className="flex items-center gap-2 px-4 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold cursor-pointer transition-colors shadow-sm">
            <Upload size={14} /> Upload Photos
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileInput} />
          </label>
        </div>
      </div>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploading.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Upload size={14} className="text-[#C89B3C]" /> Uploading {uploading.length} file{uploading.length > 1 ? 's' : ''}...
            </p>
            {uploading.map(u => (
              <div key={u.id} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 truncate max-w-[70%]">{u.name}</span>
                  <span className="text-xs font-semibold text-gray-500">
                    {u.done ? <span className="text-emerald-600 flex items-center gap-1"><Check size={11} /> Done</span> : `${u.progress}%`}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div className={`h-full rounded-full ${u.done ? 'bg-emerald-500' : 'bg-[#C89B3C]'}`}
                    initial={{ width: 0 }} animate={{ width: `${u.progress}%` }} transition={{ duration: 0.2 }} />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag & Drop Zone */}
      <motion.label
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        animate={{ borderColor: isDragging ? '#C89B3C' : '#E5E7EB', backgroundColor: isDragging ? '#FFFBF0' : '#FAFAFA', scale: isDragging ? 1.01 : 1 }}
        className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer block transition-all">
        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileInput} />
        <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${isDragging ? 'bg-[#C89B3C]/10' : 'bg-gray-100'}`}>
          <Upload size={22} className={isDragging ? 'text-[#C89B3C]' : 'text-gray-400'} />
        </div>
        <p className={`text-sm font-semibold ${isDragging ? 'text-[#C89B3C]' : 'text-gray-600'}`}>
          {isDragging ? 'Drop images here!' : 'Drag & drop images, or click to browse'}
        </p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP supported · Multiple files at once</p>
      </motion.label>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or tag..."
            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${category === c ? 'bg-[#C89B3C] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex border border-gray-200 rounded-xl overflow-hidden ml-auto">
          <button onClick={() => setView('grid')} className={`p-2.5 transition-colors ${view === 'grid' ? 'bg-[#18181B] text-white' : 'text-gray-400 hover:bg-gray-50'}`}><Grid size={15} /></button>
          <button onClick={() => setView('list')} className={`p-2.5 transition-colors ${view === 'list' ? 'bg-[#18181B] text-white' : 'text-gray-400 hover:bg-gray-50'}`}><List size={15} /></button>
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className={`group relative rounded-2xl overflow-hidden aspect-square bg-gray-100 ${selected.has(item.id) ? 'ring-2 ring-[#C89B3C] ring-offset-2' : ''}`}>

              <img src={item.url} alt={item.title} onError={handleImgError}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-all duration-200" />

              {/* Checkbox */}
              <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)}
                className="absolute top-2.5 left-2.5 w-4 h-4 rounded border-2 border-white text-[#C89B3C] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10" />

              {/* Action buttons */}
              <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => setPreview(item)}
                  className="p-1.5 bg-white/90 hover:bg-white rounded-lg text-gray-700 transition-colors" title="Preview">
                  <ZoomIn size={13} />
                </button>
                <button onClick={() => openEdit(item)}
                  className="p-1.5 bg-white/90 hover:bg-white rounded-lg text-gray-700 transition-colors" title="Edit">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => setItems(prev => prev.filter(p => p.id !== item.id))}
                  className="p-1.5 bg-red-500/90 hover:bg-red-500 rounded-lg text-white transition-colors" title="Delete">
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-200 z-10">
                <p className="text-white text-xs font-semibold truncate">{item.title}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-white/60 text-[10px]">{item.category}</p>
                  {item.size && <p className="text-white/60 text-[10px]">{item.size}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-50">
            {filtered.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 group transition-colors">
                <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)}
                  className="w-4 h-4 rounded border-gray-300 text-[#C89B3C] cursor-pointer shrink-0" />
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <img src={item.url} alt={item.title} onError={handleImgError} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">{item.category}</span>
                    {item.tags.map(t => <span key={t} className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">#{t}</span>)}
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-400">{item.uploadedAt}</p>
                  {item.size && <p className="text-xs text-gray-400 mt-0.5">{item.size}</p>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setPreview(item)} className="p-2 text-gray-400 hover:text-[#C89B3C] hover:bg-amber-50 rounded-xl transition-colors"><ZoomIn size={14} /></button>
                  <button onClick={() => openEdit(item)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => setItems(prev => prev.filter(p => p.id !== item.id))} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={14} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <ImageIcon size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No images found</p>
          <p className="text-sm mt-1">Try a different search or upload new images</p>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              {/* Preview */}
              <div className="h-48 bg-gray-100 relative">
                <img src={editItem.url} alt={editItem.title} onError={handleImgError} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <button onClick={() => setEditItem(null)} className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 rounded-lg text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit(saveEdit)} className="p-5 space-y-4">
                <div>
                  <label className={lbl}>Image Title</label>
                  <input {...register('title', { required: true })} className={inp} placeholder="e.g. Wedding Stage Decor" />
                </div>
                <div>
                  <label className={lbl}>Category</label>
                  <select {...register('category')} className={inp}>
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                      placeholder="Type tag and press Enter..."
                      className={`${inp} flex-1`} />
                    <button type="button" onClick={addTag}
                      className="px-3 py-2 bg-[#C89B3C] text-white rounded-xl text-sm font-semibold hover:bg-[#b08630] transition-colors">Add</button>
                  </div>
                  {editTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {editTags.map(t => (
                        <span key={t} className="flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-100">
                          #{t}
                          <button type="button" onClick={() => setEditTags(prev => prev.filter(p => p !== t))} className="text-amber-400 hover:text-amber-700 ml-0.5">
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setEditItem(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold transition-colors">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
            className="fixed inset-0 bg-black/92 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="relative max-w-4xl w-full">
              <button onClick={() => setPreview(null)} className="absolute -top-11 right-0 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
              <img src={preview.url} alt={preview.title} onError={handleImgError} className="w-full rounded-2xl max-h-[80vh] object-contain" />
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{preview.title}</p>
                  <p className="text-white/50 text-sm mt-0.5">{preview.category} · {preview.uploadedAt} {preview.size && `· ${preview.size}`}</p>
                  {preview.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-2">
                      {preview.tags.map(t => <span key={t} className="text-[11px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full">#{t}</span>)}
                    </div>
                  )}
                </div>
                <button onClick={() => { openEdit(preview); setPreview(null); }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition-colors">
                  <Edit2 size={14} /> Edit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
