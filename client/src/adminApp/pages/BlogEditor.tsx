import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Eye, Edit3,
  Sparkles, AlertCircle, CheckCircle,
  Bold, Italic, Heading2, Heading3, Quote, Link, List, ListOrdered, Code
} from 'lucide-react';
import {
  useCreateBlogPost,
  useUpdateBlogPost,
  useCategories,
  useTags
} from '../../shared/hooks/useBlog';

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEditMode = !!id;

  // Form States
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('Draft');
  const [scheduledAt, setScheduledAt] = useState('');
  const [featured, setFeatured] = useState(false);
  const [featuredOrder, setFeaturedOrder] = useState(0);

  // SEO States
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [schemaType, setSchemaType] = useState('Article');
  const [metaRobots, setMetaRobots] = useState('index, follow');

  // Selected tag names
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState('');

  // UI States
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [seoScore, setSeoScore] = useState(0);
  const [seoLogs, setSeoLogs] = useState<Array<{ text: string; passed: boolean; tip?: string }>>([]);

  // Fetch Hooks
  const { data: categoriesResp } = useCategories();
  const { data: tagsResp } = useTags();
  
  // Queries
  const categories = categoriesResp?.data || [];
  const tags = tagsResp?.data || [];

  // Mutations
  const createMutation = useCreateBlogPost();
  const updateMutation = useUpdateBlogPost();

  // Load post details if editing
  useEffect(() => {
    if (isEditMode) {
      // Find the post by ID in the admin posts cache or refetch.
      // Wait, we can fetch by slug if we pass the ID to slug and the backend supports ID lookup. Let's assume the backend resolves it.
      const fetchPostData = async () => {
        try {
          const res = await apiGetPost(id);
          if (res) {
            setTitle(res.title);
            setSlug(res.slug);
            setExcerpt(res.excerpt);
            setContent(res.content);
            setCoverImage(res.coverImage);
            setCategory(res.category?._id || res.category || '');
            setStatus(res.status);
            setFeatured(res.featured);
            setFeaturedOrder(res.featuredOrder || 0);
            if (res.scheduledAt) {
              setScheduledAt(new Date(res.scheduledAt).toISOString().slice(0, 16));
            }
            setSelectedTags(res.tags || []);
            setSeoTitle(res.seoTitle || '');
            setSeoDescription(res.seoDescription || '');
            setFocusKeyword(res.focusKeyword || '');
            setCanonicalUrl(res.canonicalUrl || '');
            setSchemaType(res.schemaType || 'Article');
            setMetaRobots(res.metaRobots || 'index, follow');
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchPostData();
    }
  }, [id, isEditMode]);

  // Helper directly calling axios to get by ID
  const apiGetPost = async (postId: string) => {
    // We can fetch from backend `/api/blog/slug/${postId}` which will resolve by ID
    const importAxios = await import('../../shared/api/axios');
    const response: any = await importAxios.default.get(`/blog/slug/${postId}`);
    return response.data.data;
  };

  // SEO Realtime Grading Engine
  useEffect(() => {
    const logs: Array<{ text: string; passed: boolean; tip?: string }> = [];
    let score = 0;

    // 1. Title Length
    if (title.length >= 40 && title.length <= 70) {
      score += 20;
      logs.push({ text: 'SEO Title length is optimal (40-70 chars).', passed: true });
    } else {
      logs.push({
        text: `SEO Title is ${title.length} chars. Optimal is 40-70.`,
        passed: false,
        tip: 'Write a catchy, descriptive title that fits perfectly in search engine snippets.'
      });
    }

    // 2. Excerpt / Description Length
    if (excerpt.length >= 120 && excerpt.length <= 160) {
      score += 20;
      logs.push({ text: 'Meta description length is optimal (120-160 chars).', passed: true });
    } else {
      logs.push({
        text: `Meta description is ${excerpt.length} chars. Optimal is 120-160.`,
        passed: false,
        tip: 'Summarize the post concisely to capture searcher attention.'
      });
    }

    // 3. Focus Keyword in Title
    if (focusKeyword && title.toLowerCase().includes(focusKeyword.toLowerCase())) {
      score += 20;
      logs.push({ text: `Focus keyword "${focusKeyword}" found in Title.`, passed: true });
    } else {
      logs.push({
        text: 'Focus keyword not found in Title.',
        passed: false,
        tip: 'Insert your focus keyword naturally near the beginning of your title.'
      });
    }

    // 4. Focus Keyword in Content
    const cleanContent = content.replace(/<[^>]*>/g, '').trim();
    if (focusKeyword && cleanContent.toLowerCase().slice(0, 500).includes(focusKeyword.toLowerCase())) {
      score += 20;
      logs.push({ text: `Focus keyword "${focusKeyword}" found in introduction.`, passed: true });
    } else {
      logs.push({
        text: 'Focus keyword not found in introductory paragraph.',
        passed: false,
        tip: 'Use your focus keyword in the first 1-2 sentences of your article.'
      });
    }

    // 5. Content Word Count
    const words = cleanContent.split(/\s+/).filter(w => w.length > 0);
    if (words.length >= 300) {
      score += 20;
      logs.push({ text: `Article word count is good (${words.length} words).`, passed: true });
    } else {
      logs.push({
        text: `Article is short (${words.length} words). Target at least 300 words.`,
        passed: false,
        tip: 'Add more details, headers, or structure to make your article complete.'
      });
    }

    setSeoScore(score);
    setSeoLogs(logs);
  }, [title, excerpt, content, focusKeyword]);

  // Insert Rich Text Formatting tags
  const handleInsertTag = (startTag: string, endTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = textarea.value.substring(start, end);
    const replacement = startTag + selection + endTag;

    const newContent = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setContent(newContent);

    // refocus and select
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + startTag.length, start + startTag.length + selection.length);
    }, 50);
  };

  // Submit post
  const handleSave = async () => {
    if (!title || !excerpt || !content || !category) {
      alert('Please fill in Title, Excerpt, Content, and Category.');
      return;
    }

    const payload = {
      title,
      slug: slug || undefined,
      excerpt,
      content,
      coverImage,
      category,
      tags: selectedTags,
      status,
      scheduledAt: status === 'Scheduled' && scheduledAt ? new Date(scheduledAt) : undefined,
      featured,
      featuredOrder: Number(featuredOrder) || 0,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt,
      focusKeyword,
      canonicalUrl,
      schemaType,
      metaRobots,
      ogImage: coverImage
    };

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: id!, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      navigate('/admin/blog');
    } catch (err) {
      console.error(err);
      alert('Error saving post. Check console details.');
    }
  };

  // Tag helper
  const handleToggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(t => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const filteredTags = tags.filter((t: any) =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase()) && !selectedTags.includes(t.name)
  );

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Editor Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/blog')}
            className="p-2 border border-gray-100 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-700 transition"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="font-bold text-gray-950 text-lg">{isEditMode ? 'Edit Article Workspace' : 'Compose New Article'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Author: You (Logged-in admin)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none bg-white"
          >
            <option value="Draft">Draft</option>
            <option value="Published">Publish Immediately</option>
            <option value="Scheduled">Schedule Publication</option>
            <option value="Archived">Archive</option>
          </select>
          <button
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="flex items-center gap-1.5 px-4.5 py-2 bg-[#C89B3C] text-white hover:bg-[#b08732] rounded-xl text-xs font-semibold transition shadow-sm disabled:opacity-50"
          >
            <Save size={14} />
            {isEditMode ? 'Save Edits' : 'Publish Article'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Editor Main Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[70vh]">
            {/* Tab Bar */}
            <div className="px-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex gap-1.5 py-2">
                <button
                  onClick={() => setActiveTab('write')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'write' ? 'bg-white text-[#C89B3C] shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Edit3 size={13} className="inline mr-1" />
                  Compose
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'preview' ? 'bg-white text-[#C89B3C] shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Eye size={13} className="inline mr-1" />
                  Preview
                </button>
              </div>
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Article Editor Canvas
              </div>
            </div>

            {/* Editor Input / Preview area */}
            {activeTab === 'write' ? (
              <div className="flex-1 flex flex-col p-5 space-y-4">
                {/* Formatting Toolbar */}
                <div className="flex flex-wrap gap-1 p-1 bg-gray-50 border border-gray-150 rounded-xl">
                  <button type="button" onClick={() => handleInsertTag('<strong>', '</strong>')} title="Bold" className="p-2 hover:bg-gray-200 text-gray-600 rounded-lg transition"><Bold size={14} /></button>
                  <button type="button" onClick={() => handleInsertTag('<em>', '</em>')} title="Italic" className="p-2 hover:bg-gray-200 text-gray-600 rounded-lg transition"><Italic size={14} /></button>
                  <button type="button" onClick={() => handleInsertTag('<h2>', '</h2>')} title="Header 2" className="p-2 hover:bg-gray-200 text-gray-600 rounded-lg transition"><Heading2 size={14} /></button>
                  <button type="button" onClick={() => handleInsertTag('<h3>', '</h3>')} title="Header 3" className="p-2 hover:bg-gray-200 text-gray-600 rounded-lg transition"><Heading3 size={14} /></button>
                  <button type="button" onClick={() => handleInsertTag('<blockquote>', '</blockquote>')} title="Blockquote" className="p-2 hover:bg-gray-200 text-gray-600 rounded-lg transition"><Quote size={14} /></button>
                  <button type="button" onClick={() => handleInsertTag('<a href="https://">', '</a>')} title="Link" className="p-2 hover:bg-gray-200 text-gray-600 rounded-lg transition"><Link size={14} /></button>
                  <button type="button" onClick={() => handleInsertTag('<ul>\n  <li>', '</li>\n</ul>')} title="Bullet List" className="p-2 hover:bg-gray-200 text-gray-600 rounded-lg transition"><List size={14} /></button>
                  <button type="button" onClick={() => handleInsertTag('<ol>\n  <li>', '</li>\n</ol>')} title="Numbered List" className="p-2 hover:bg-gray-200 text-gray-600 rounded-lg transition"><ListOrdered size={14} /></button>
                  <button type="button" onClick={() => handleInsertTag('<pre><code>', '</code></pre>')} title="Code block" className="p-2 hover:bg-gray-200 text-gray-600 rounded-lg transition"><Code size={14} /></button>
                </div>

                <input
                  type="text"
                  placeholder="Enter Title..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full text-2xl font-bold text-gray-900 border-b border-gray-150 py-2 focus:outline-none focus:border-[#C89B3C] placeholder-gray-300"
                />

                <input
                  type="text"
                  placeholder="Custom slug (e.g. customized-article-link)"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  className="w-full text-xs font-mono text-gray-500 py-1 border-b border-gray-100 focus:outline-none focus:border-[#C89B3C]"
                />

                <textarea
                  placeholder="Provide an engaging short excerpt (120-160 characters summary)..."
                  value={excerpt}
                  onChange={e => setExcerpt(e.target.value)}
                  rows={2}
                  className="w-full text-sm text-gray-600 border-b border-gray-150 py-2 focus:outline-none focus:border-[#C89B3C] resize-none placeholder-gray-300"
                />

                <textarea
                  ref={textareaRef}
                  placeholder="Write your article in HTML/rich-text here..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full flex-1 text-sm text-gray-700 focus:outline-none resize-none font-sans min-h-[40vh] placeholder-gray-300"
                />
              </div>
            ) : (
              /* Preview Mode */
              <div className="flex-1 p-8 overflow-y-auto max-h-[70vh] bg-[#FAFAFA]">
                <article className="prose max-w-none space-y-6">
                  {coverImage && (
                    <img
                      src={coverImage}
                      alt="Cover image"
                      className="w-full h-80 object-cover rounded-2xl border border-gray-200 shadow-sm"
                    />
                  )}
                  <h1 className="text-3xl font-extrabold text-gray-950 mt-4 leading-tight">{title || 'Untitled Post'}</h1>
                  {excerpt && <p className="text-lg text-gray-500 font-medium italic border-l-4 border-[#C89B3C] pl-4 py-1">{excerpt}</p>}
                  <div
                    className="text-gray-800 leading-relaxed text-sm space-y-4 pt-4"
                    dangerouslySetInnerHTML={{ __html: content || '<p className="text-gray-400">No content composed yet.</p>' }}
                  />
                </article>
              </div>
            )}
          </div>

          {/* Real-time SEO optimization panel */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#C89B3C]" />
                <h3 className="font-bold text-gray-900">SEO Content Audit</h3>
              </div>
              <div className="flex items-center gap-1.5 bg-[#C89B3C]/10 border border-[#C89B3C]/20 px-3 py-1 rounded-full">
                <span className="text-xs font-bold text-[#C89B3C]">SEO Grade: {seoScore}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">SEO Title (Overrides main title)</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={e => setSeoTitle(e.target.value)}
                  placeholder={title || 'Optimal length: 40-70 characters'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/20 focus:border-[#C89B3C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Focus Keyword *</label>
                <input
                  type="text"
                  value={focusKeyword}
                  onChange={e => setFocusKeyword(e.target.value)}
                  placeholder="e.g. Stage Decoration"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/20 focus:border-[#C89B3C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Canonical URL</label>
                <input
                  type="text"
                  value={canonicalUrl}
                  onChange={e => setCanonicalUrl(e.target.value)}
                  placeholder="https://yazhievents.in/blog/slug"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/20 focus:border-[#C89B3C]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Schema Type</label>
                <select
                  value={schemaType}
                  onChange={e => setSchemaType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/20 focus:border-[#C89B3C] bg-white"
                >
                  <option value="Article">Article</option>
                  <option value="NewsArticle">NewsArticle</option>
                  <option value="BlogPosting">BlogPosting</option>
                  <option value="Event">Event Summary</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Meta Robots</label>
                <input
                  type="text"
                  value={metaRobots}
                  onChange={e => setMetaRobots(e.target.value)}
                  placeholder="index, follow"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/20 focus:border-[#C89B3C]"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">SEO Recommendations</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {seoLogs.map((log, idx) => (
                  <div key={idx} className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                    log.passed ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50/50 border-rose-100 text-rose-800'
                  }`}>
                    {log.passed ? (
                      <CheckCircle size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={15} className="text-rose-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-bold">{log.text}</p>
                      {!log.passed && log.tip && <p className="text-[10px] text-rose-600 mt-0.5 font-medium">{log.tip}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Side Parameters Panel */}
        <div className="space-y-4">
          {/* Metadata Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">Article Details</h3>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/20 focus:border-[#C89B3C] bg-white"
              >
                <option value="">Select Category</option>
                {categories.map((c: any) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Publication Schedule date picker (conditional) */}
            {status === 'Scheduled' && (
              <div>
                <label className="block text-xs font-bold text-blue-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Scheduled Release Date
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-200 bg-blue-50/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            )}

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={e => setFeatured(e.target.checked)}
                  className="rounded border-gray-300 text-[#C89B3C] focus:ring-[#C89B3C]"
                />
                Featured Article
              </label>

              {featured && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Order:</span>
                  <input
                    type="number"
                    value={featuredOrder}
                    onChange={e => setFeaturedOrder(Number(e.target.value))}
                    className="w-14 px-2 py-0.5 border border-gray-200 rounded text-center text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Cover Image upload selector */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">Cover Image</h3>

            {coverImage && (
              <img
                src={coverImage}
                alt="Selected cover preview"
                className="w-full h-32 object-cover rounded-xl border border-gray-200 bg-gray-50"
              />
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Image URL</label>
              <input
                type="text"
                value={coverImage}
                onChange={e => setCoverImage(e.target.value)}
                placeholder="Enter image URL from library..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/20 focus:border-[#C89B3C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Preset Templates</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Wedding', url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80' },
                  { name: 'Corporate', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80' },
                  { name: 'Birthday', url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80' }
                ].map(img => (
                  <button
                    key={img.name}
                    type="button"
                    onClick={() => setCoverImage(img.url)}
                    className="p-1.5 border border-gray-150 hover:border-[#C89B3C] rounded-lg text-[10px] font-semibold text-gray-600 hover:text-[#C89B3C] transition bg-gray-50/50"
                  >
                    {img.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags Pool Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">Article Tags</h3>

            {/* Selected Tags list */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedTags.map(t => (
                  <span
                    key={t}
                    onClick={() => handleToggleTag(t)}
                    className="cursor-pointer bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-100 transition"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Search tag */}
            <div className="relative">
              <input
                type="text"
                value={tagSearch}
                onChange={e => setTagSearch(e.target.value)}
                placeholder="Search/Select Tags..."
                className="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none"
              />
            </div>

            {/* Tag Selection Pool */}
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
              {filteredTags.map((tag: any) => (
                <button
                  key={tag._id}
                  type="button"
                  onClick={() => handleToggleTag(tag.name)}
                  className="w-full text-left px-2 py-1.5 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex justify-between items-center rounded-lg border border-transparent hover:border-gray-100 transition"
                >
                  <span>#{tag.name}</span>
                  {tag.isTrending && <span className="text-[8px] uppercase font-bold text-purple-500">Trending</span>}
                </button>
              ))}
              {filteredTags.length === 0 && (
                <p className="text-[10px] text-gray-400 text-center py-4">No matching tag options found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
