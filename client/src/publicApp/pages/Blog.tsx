import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Eye, ThumbsUp, ChevronRight, Search } from 'lucide-react';
import { useBlogPosts, useCategories } from '../../shared/hooks/useBlog';
import { SEO } from '../../shared/components/SEO';

export default function PublicBlog() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filters for query
  const filters = {
    search: search || undefined,
    category: selectedCategory !== 'All' ? selectedCategory : undefined,
    status: 'Published'
  };

  const { data: postsResp, isLoading: loadPosts } = useBlogPosts(filters);
  const { data: categoriesResp } = useCategories();

  const posts = postsResp?.data || [];
  const categories = categoriesResp?.data || [];

  // Identify featured post
  const featuredPost = posts.find((p: any) => p.featured);
  const regularPosts = featuredPost ? posts.filter((p: any) => p._id !== featuredPost._id) : posts;

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-10" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
      <SEO
        title="Blog & Event Inspiration"
        description="Read the latest articles, wedding planning tips, stage decoration guides, and event management inspiration from Yazhi Events."
        canonicalUrl="/blog"
      />

      {/* Hero Header */}
      <div className="max-w-7xl mx-auto px-4 mb-10 text-center space-y-3">
        <span className="text-xs uppercase font-extrabold text-[#C89B3C] tracking-widest bg-[#C89B3C]/10 px-3.5 py-1.5 rounded-full">
          Inspiration Board
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1C1917] tracking-tight">
          Stories, Tips & Trend Reports
        </h1>
        <p className="max-w-2xl mx-auto text-base text-gray-500 font-medium">
          Your master resource for luxury Tamil weddings, corporate galas, and bespoke event coordination guides.
        </p>
      </div>

      {/* Toolbar & Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 mb-8 space-y-4">
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          {/* Categories Tab */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none flex-wrap">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                selectedCategory === 'All'
                  ? 'bg-[#C89B3C] text-white shadow-sm'
                  : 'bg-[#FAF9F6] text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Articles
            </button>
            {categories.map((cat: any) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-4.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  selectedCategory === cat._id
                    ? 'bg-[#C89B3C] text-white shadow-sm'
                    : 'bg-[#FAF9F6] text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative max-w-sm w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search guides, stages, decoration..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FAF9F6] border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/20 focus:border-[#C89B3C]"
            />
          </div>
        </div>
      </div>

      {/* Featured post (Render only if no filters active to simulate frontpage layout) */}
      {!search && selectedCategory === 'All' && featuredPost && (
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-150 shadow-sm hover:shadow-md transition duration-300 grid grid-cols-1 lg:grid-cols-2">
            <div className="h-64 lg:h-full relative overflow-hidden bg-gray-100">
              <img
                src={featuredPost.coverImage}
                alt={featuredPost.title}
                className="w-full h-full object-cover hover:scale-102 transition duration-500"
              />
              <span className="absolute top-4 left-4 bg-amber-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Featured post
              </span>
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center space-y-4">
              {featuredPost.category && (
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#C89B3C]">
                  {featuredPost.category.name}
                </span>
              )}
              <h3
                onClick={() => navigate(`/blog/${featuredPost.slug}`)}
                className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight hover:text-[#C89B3C] cursor-pointer transition"
              >
                {featuredPost.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
                <span className="flex items-center gap-1"><Calendar size={13} /> {new Date(featuredPost.publishedAt || featuredPost.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Clock size={13} /> {featuredPost.readingTime || 2} min read</span>
              </div>
              <button
                onClick={() => navigate(`/blog/${featuredPost.slug}`)}
                className="pt-2 flex items-center gap-1 text-[#C89B3C] hover:text-[#b08732] font-bold text-xs group"
              >
                Read Full Article
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid of articles */}
      <div className="max-w-7xl mx-auto px-4">
        {loadPosts ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm animate-pulse space-y-4 pb-6">
                <div className="h-48 bg-gray-200" />
                <div className="px-6 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : regularPosts.length === 0 ? (
          <div className="bg-white rounded-3xl py-20 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-400 font-semibold">No articles match your selection.</p>
            <p className="text-xs text-gray-400 mt-1">Try expanding your search parameters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post: any) => (
              <div
                key={post._id}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-300 flex flex-col"
              >
                <div className="h-48 relative overflow-hidden bg-gray-50">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  {post.category && (
                    <span
                      className="absolute top-4 left-4 text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border shadow-sm"
                      style={{
                        backgroundColor: 'white',
                        color: post.category.color || '#C89B3C',
                        borderColor: `${post.category.color || '#C89B3C'}20`
                      }}
                    >
                      {post.category.name}
                    </span>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4
                      onClick={() => navigate(`/blog/${post.slug}`)}
                      className="font-extrabold text-gray-950 text-base leading-snug hover:text-[#C89B3C] cursor-pointer line-clamp-2 transition"
                    >
                      {post.title}
                    </h4>
                    <p className="text-gray-500 text-xs leading-relaxed font-medium line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                      <span className="flex items-center gap-0.5"><Calendar size={11} /> {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-0.5"><Clock size={11} /> {post.readingTime || 1}m read</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-[10px] font-bold text-gray-400">
                      <span className="flex items-center gap-0.5"><Eye size={11} /> {post.views}</span>
                      <span className="flex items-center gap-0.5"><ThumbsUp size={11} /> {post.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
