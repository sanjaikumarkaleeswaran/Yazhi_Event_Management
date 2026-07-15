import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Eye, ThumbsUp, Share2,
  FileText, CheckCircle2, Clock, Calendar, BarChart3,
  ChevronLeft, ChevronRight, FolderPlus, Tags, RefreshCw,
  MoreVertical, Copy, RotateCcw, X, Folder, AlertTriangle, Download
} from 'lucide-react';
import {
  useAdminBlogPosts,
  useBlogStats,
  useBlogReports,
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  useDuplicateBlogPost,
  useRestoreBlogPost,
  useSoftDeleteBlogPost,
  usePermanentDeleteBlogPost
} from '../../shared/hooks/useBlog';

export default function Blog() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [showTrash, setShowTrash] = useState(false);

  const [showCatModal, setShowCatModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Categories form state
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catColor, setCatColor] = useState('#C89B3C');
  const [catIcon, setCatIcon] = useState('Folder');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Tags form state
  const [tagName, setTagName] = useState('');
  const [tagSlug, setTagSlug] = useState('');
  const [tagIsPopular, setTagIsPopular] = useState(false);
  const [tagIsTrending, setTagIsTrending] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  // Fetch Hooks
  const filters = {
    page,
    limit: 10,
    search: search || undefined,
    status: status !== 'All' ? status : undefined,
    category: category !== 'All' ? category : undefined,
    isDeleted: showTrash ? 'true' : 'false'
  };

  const { data: postsResp, isLoading: loadPosts, refetch: refetchPosts } = useAdminBlogPosts(filters);
  const { data: statsResp, isLoading: loadStats } = useBlogStats();
  const { data: reportsResp } = useBlogReports();
  const { data: categoriesResp } = useCategories();
  const { data: tagsResp } = useTags();

  // Mutation Hooks
  const duplicateMutation = useDuplicateBlogPost();
  const restoreMutation = useRestoreBlogPost();
  const softDeleteMutation = useSoftDeleteBlogPost();
  const permanentDeleteMutation = usePermanentDeleteBlogPost();

  const createCatMutation = useCreateCategory();
  const updateCatMutation = useUpdateCategory();
  const deleteCatMutation = useDeleteCategory();

  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();

  const posts = postsResp?.data || [];
  const meta = postsResp?.meta || { total: 0, totalPages: 1 };
  const stats = statsResp?.data || { totalArticles: 0, drafts: 0, published: 0, scheduled: 0, views: 0 };
  const categories = categoriesResp?.data || [];
  const tags = tagsResp?.data || [];

  const handleDuplicate = async (id: string) => {
    if (confirm('Are you sure you want to duplicate this article?')) {
      await duplicateMutation.mutateAsync(id);
      setActiveDropdown(null);
    }
  };

  const handleSoftDelete = async (id: string) => {
    if (confirm('Move this article to trash?')) {
      await softDeleteMutation.mutateAsync(id);
      setActiveDropdown(null);
    }
  };

  const handleRestore = async (id: string) => {
    await restoreMutation.mutateAsync(id);
    setActiveDropdown(null);
  };

  const handlePermanentDelete = async (id: string) => {
    if (confirm('PERMANENTLY delete this article? This cannot be undone.')) {
      await permanentDeleteMutation.mutateAsync(id);
      setActiveDropdown(null);
    }
  };

  // Export CMS Data as CSV
  const handleExportCSV = () => {
    const reportData = reportsResp?.data || [];
    if (!reportData.length) return alert('No report data compiled yet.');
    const headers = Object.keys(reportData[0]);
    const csvContent = [
      headers.join(','),
      ...reportData.map((row: any) => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `blog_cms_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Category CRUD handler
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;
    const payload = { name: catName, slug: catSlug || undefined, color: catColor, icon: catIcon };
    if (editingCatId) {
      await updateCatMutation.mutateAsync({ id: editingCatId, data: payload });
    } else {
      await createCatMutation.mutateAsync(payload);
    }
    // reset
    setCatName('');
    setCatSlug('');
    setCatColor('#C89B3C');
    setCatIcon('Folder');
    setEditingCatId(null);
  };

  const handleEditCategory = (cat: any) => {
    setEditingCatId(cat._id);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatColor(cat.color || '#C89B3C');
    setCatIcon(cat.icon || 'Folder');
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Delete this category? Posts attached to it might need re-categorization.')) {
      await deleteCatMutation.mutateAsync(id);
    }
  };

  // Tag CRUD handler
  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName) return;
    const payload = { name: tagName, slug: tagSlug || undefined, isPopular: tagIsPopular, isTrending: tagIsTrending };
    if (editingTagId) {
      await updateTagMutation.mutateAsync({ id: editingTagId, data: payload });
    } else {
      await createTagMutation.mutateAsync(payload);
    }
    setTagName('');
    setTagSlug('');
    setTagIsPopular(false);
    setTagIsTrending(false);
    setEditingTagId(null);
  };

  const handleEditTag = (tag: any) => {
    setEditingTagId(tag._id);
    setTagName(tag.name);
    setTagSlug(tag.slug);
    setTagIsPopular(tag.isPopular);
    setTagIsTrending(tag.isTrending);
  };

  const handleDeleteTag = async (id: string) => {
    if (confirm('Delete this tag?')) {
      await deleteTagMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog CMS & Article Editor</h1>
          <p className="text-sm text-gray-500 mt-1">Manage web announcements, articles, categories, and SEO schemas.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCatModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 transition shadow-sm"
          >
            <FolderPlus size={14} className="text-gray-400" />
            Categories
          </button>
          <button
            onClick={() => setShowTagModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 transition shadow-sm"
          >
            <Tags size={14} className="text-gray-400" />
            Tags
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 transition shadow-sm"
          >
            <Download size={14} className="text-gray-400" />
            Export CSV
          </button>
          <button
            onClick={() => navigate('/admin/blog/new')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#C89B3C] text-white hover:bg-[#b08732] rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <Plus size={15} />
            New Article
          </button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-gray-50 text-gray-700 rounded-xl">
            <FileText size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Posts</p>
            <h3 className="text-xl font-bold text-gray-900 mt-0.5">{loadStats ? '...' : stats.totalArticles}</h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Published</p>
            <h3 className="text-xl font-bold text-gray-900 mt-0.5">{loadStats ? '...' : stats.published}</h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Scheduled</p>
            <h3 className="text-xl font-bold text-gray-900 mt-0.5">{loadStats ? '...' : stats.scheduled}</h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Calendar size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Drafts</p>
            <h3 className="text-xl font-bold text-gray-900 mt-0.5">{loadStats ? '...' : stats.drafts}</h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
            <BarChart3 size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Views</p>
            <h3 className="text-xl font-bold text-gray-900 mt-0.5">{loadStats ? '...' : stats.views}</h3>
          </div>
        </div>
      </div>

      {/* Filters & Control bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search title, content, or tags..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/20 focus:border-[#C89B3C]"
            />
          </div>

          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/20 bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            value={category}
            onChange={e => { setCategory(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/20 bg-white"
          >
            <option value="All">All Categories</option>
            {categories.map((c: any) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowTrash(!showTrash); setPage(1); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition border ${
              showTrash
                ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Trash2 size={13} />
            {showTrash ? 'View Active Posts' : 'View Trash'}
          </button>
          <button
            onClick={() => refetchPosts()}
            className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loadPosts ? (
          <div className="py-20 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="animate-spin text-[#C89B3C]" size={24} />
            <p className="text-sm font-medium">Loading article records...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-24 text-center">
            <AlertTriangle className="mx-auto text-gray-300 mb-3" size={40} />
            <h3 className="font-bold text-gray-700 text-lg">No articles found</h3>
            <p className="text-sm text-gray-400 mt-1">Try relaxing filters or create a new post to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Article</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-center">Stats</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                {posts.map((post: any) => (
                  <tr key={post._id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-4 max-w-sm">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.coverImage || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=200'}
                          alt={post.title}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-100 bg-gray-50 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 truncate hover:text-[#C89B3C] cursor-pointer" onClick={() => navigate(`/admin/blog/edit/${post._id}`)}>
                            {post.title}
                          </h4>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{post.excerpt}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-semibold">{post.readingTime || 1} min read</span>
                            {post.featured && <span className="text-[10px] text-[#C89B3C] bg-amber-50 px-1.5 py-0.5 rounded font-bold border border-amber-100">Featured</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {post.category ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                          style={{
                            backgroundColor: `${post.category.color}10`,
                            color: post.category.color,
                            borderColor: `${post.category.color}25`
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: post.category.color }} />
                          {post.category.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-gray-700">
                      {post.author ? `${post.author.firstName} ${post.author.lastName}` : 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      {post.status === 'Published' ? (
                        <div>
                          <p className="text-xs font-semibold text-gray-700">{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Published</p>
                        </div>
                      ) : post.status === 'Scheduled' ? (
                        <div>
                          <p className="text-xs font-semibold text-blue-600">{new Date(post.scheduledAt).toLocaleDateString()}</p>
                          <p className="text-[10px] text-blue-400 mt-0.5">{new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-semibold text-gray-500">{new Date(post.updatedAt).toLocaleDateString()}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Updated</p>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-3 text-xs text-gray-400 font-semibold">
                        <span className="flex items-center gap-1"><Eye size={12} /> {post.views}</span>
                        <span className="flex items-center gap-1"><ThumbsUp size={12} /> {post.likes}</span>
                        <span className="flex items-center gap-1"><Share2 size={12} /> {post.shares}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        post.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        post.status === 'Scheduled' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        post.status === 'Archived' ? 'bg-gray-100 text-gray-700 border border-gray-200' :
                        'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right relative">
                      <div className="flex items-center justify-end gap-1.5">
                        {showTrash ? (
                          <>
                            <button
                              onClick={() => handleRestore(post._id)}
                              title="Restore"
                              className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition"
                            >
                              <RotateCcw size={14} />
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(post._id)}
                              title="Delete Permanently"
                              className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => navigate(`/admin/blog/edit/${post._id}`)}
                              title="Edit Article"
                              className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:bg-amber-50 hover:text-[#C89B3C] hover:border-amber-200 transition"
                            >
                              <Edit2 size={14} />
                            </button>
                            <div className="relative">
                              <button
                                onClick={() => setActiveDropdown(activeDropdown === post._id ? null : post._id)}
                                className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                              >
                                <MoreVertical size={14} />
                              </button>
                              {activeDropdown === post._id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                                  <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-20 text-left">
                                    <button
                                      onClick={() => handleDuplicate(post._id)}
                                      className="w-full px-3 py-1.5 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-2"
                                    >
                                      <Copy size={13} className="text-gray-400" />
                                      Duplicate
                                    </button>
                                    <button
                                      onClick={() => handleSoftDelete(post._id)}
                                      className="w-full px-3 py-1.5 hover:bg-rose-50 text-xs font-semibold text-rose-600 flex items-center gap-2"
                                    >
                                      <Trash2 size={13} className="text-rose-400" />
                                      Trash
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {meta.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400 font-semibold">Showing {posts.length} of {meta.total} records</p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="text-sm font-bold text-gray-700 px-2">Page {page} of {meta.totalPages}</span>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category Manager Modal */}
      <AnimatePresence>
        {showCatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden border border-gray-100 shadow-2xl flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#C89B3C]/10 text-[#C89B3C] rounded-xl"><Folder size={16} /></div>
                  <div>
                    <h3 className="font-bold text-gray-900">Manage Categories</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Define content pools for article distribution.</p>
                  </div>
                </div>
                <button onClick={() => { setShowCatModal(false); setEditingCatId(null); setCatName(''); setCatSlug(''); }} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition">
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form */}
                <div>
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-400 mb-4">{editingCatId ? 'Edit Category' : 'Create Category'}</h4>
                  <form onSubmit={handleSaveCategory} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Category Name *</label>
                      <input
                        type="text"
                        required
                        value={catName}
                        onChange={e => setCatName(e.target.value)}
                        placeholder="e.g. Corporate Events"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/20 focus:border-[#C89B3C]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Slug (Auto-generated if empty)</label>
                      <input
                        type="text"
                        value={catSlug}
                        onChange={e => setCatSlug(e.target.value)}
                        placeholder="e.g. corporate-events"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/20 focus:border-[#C89B3C]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Color Theme</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={catColor}
                          onChange={e => setCatColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200"
                        />
                        <input
                          type="text"
                          value={catColor}
                          onChange={e => setCatColor(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-[#C89B3C] text-white hover:bg-[#b08732] rounded-xl text-xs font-semibold transition"
                      >
                        {editingCatId ? 'Update' : 'Create'}
                      </button>
                      {editingCatId && (
                        <button
                          type="button"
                          onClick={() => { setEditingCatId(null); setCatName(''); setCatSlug(''); setCatColor('#C89B3C'); }}
                          className="py-2 px-3 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl text-xs font-semibold transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* List */}
                <div className="border-l border-gray-100 pl-0 md:pl-6 max-h-[45vh] overflow-y-auto">
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-400 mb-4">Existing Categories</h4>
                  <div className="space-y-2">
                    {categories.map((cat: any) => (
                      <div key={cat._id} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                          <div>
                            <p className="font-bold text-gray-800 text-xs">{cat.name}</p>
                            <p className="text-[10px] text-gray-400">/{cat.slug}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditCategory(cat)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat._id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {categories.length === 0 && <p className="text-xs text-gray-400 text-center py-10">No categories created yet.</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tag Manager Modal */}
      <AnimatePresence>
        {showTagModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden border border-gray-100 shadow-2xl flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Tags size={16} /></div>
                  <div>
                    <h3 className="font-bold text-gray-900">Manage Tags</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Add, edit, or filter content keywords.</p>
                  </div>
                </div>
                <button onClick={() => { setShowTagModal(false); setEditingTagId(null); setTagName(''); setTagSlug(''); }} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition">
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form */}
                <div>
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-400 mb-4">{editingTagId ? 'Edit Tag' : 'Create Tag'}</h4>
                  <form onSubmit={handleSaveTag} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Tag Name *</label>
                      <input
                        type="text"
                        required
                        value={tagName}
                        onChange={e => setTagName(e.target.value)}
                        placeholder="e.g. WeddingPlanning"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/20 focus:border-[#C89B3C]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Slug (Auto-generated if empty)</label>
                      <input
                        type="text"
                        value={tagSlug}
                        onChange={e => setTagSlug(e.target.value)}
                        placeholder="e.g. wedding-planning"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/20 focus:border-[#C89B3C]"
                      />
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-600">
                        <input
                          type="checkbox"
                          checked={tagIsPopular}
                          onChange={e => setTagIsPopular(e.target.checked)}
                          className="rounded border-gray-300 text-[#C89B3C] focus:ring-[#C89B3C]"
                        />
                        Popular
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-600">
                        <input
                          type="checkbox"
                          checked={tagIsTrending}
                          onChange={e => setTagIsTrending(e.target.checked)}
                          className="rounded border-gray-300 text-[#C89B3C] focus:ring-[#C89B3C]"
                        />
                        Trending
                      </label>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-[#C89B3C] text-white hover:bg-[#b08732] rounded-xl text-xs font-semibold transition"
                      >
                        {editingTagId ? 'Update' : 'Create'}
                      </button>
                      {editingTagId && (
                        <button
                          type="button"
                          onClick={() => { setEditingTagId(null); setTagName(''); setTagSlug(''); setTagIsPopular(false); setTagIsTrending(false); }}
                          className="py-2 px-3 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl text-xs font-semibold transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* List */}
                <div className="border-l border-gray-100 pl-0 md:pl-6 max-h-[45vh] overflow-y-auto">
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-400 mb-4">Existing Tags</h4>
                  <div className="space-y-2">
                    {tags.map((tag: any) => (
                      <div key={tag._id} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition">
                        <div>
                          <p className="font-bold text-gray-800 text-xs">#{tag.name}</p>
                          <div className="flex gap-2 mt-1">
                            {tag.isPopular && <span className="text-[8px] bg-amber-50 text-amber-700 px-1 rounded border border-amber-100 font-bold">Popular</span>}
                            {tag.isTrending && <span className="text-[8px] bg-purple-50 text-purple-700 px-1 rounded border border-purple-100 font-bold">Trending</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditTag(tag)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteTag(tag._id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {tags.length === 0 && <p className="text-xs text-gray-400 text-center py-10">No tags created yet.</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
