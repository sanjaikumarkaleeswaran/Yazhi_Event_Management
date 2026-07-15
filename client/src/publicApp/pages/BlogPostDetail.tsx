import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Eye, Share2, ArrowLeft, Heart, Check } from 'lucide-react';
import { useBlogPost, useLikePost, useSharePost } from '../../shared/hooks/useBlog';
import { SEO } from '../../shared/components/SEO';

export default function BlogPostDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: postResp, isLoading, isError } = useBlogPost(slug || '');
  const likeMutation = useLikePost();
  const shareMutation = useSharePost();

  const post = postResp?.data;

  const handleLike = async () => {
    if (!post || hasLiked) return;
    try {
      await likeMutation.mutateAsync(post._id);
      setHasLiked(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    if (!post) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      await shareMutation.mutateAsync(post._id);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto" />
        <div className="h-10 bg-gray-200 rounded w-3/4 mx-auto" />
        <div className="h-96 bg-gray-200 rounded-3xl w-full" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h3 className="text-xl font-extrabold text-gray-900">Article not found</h3>
        <p className="text-sm text-gray-500">The guide you are looking for might have been moved or archived.</p>
        <button
          onClick={() => navigate('/blog')}
          className="px-6 py-2.5 bg-[#C89B3C] text-white hover:bg-[#b08732] rounded-xl text-xs font-semibold transition"
        >
          Back to Blog
        </button>
      </div>
    );
  }

  // Compile JSON-LD schema dynamically
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": post.schemaType || "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": [post.coverImage],
    "datePublished": post.publishedAt || post.createdAt,
    "dateModified": post.updatedAt,
    "author": [{
      "@type": "Person",
      "name": post.author ? `${post.author.firstName} ${post.author.lastName}` : "Yazhi Events Team"
    }],
    "publisher": {
      "@type": "Organization",
      "name": "Yazhi Event Management",
      "logo": {
        "@type": "ImageObject",
        "url": "https://yazhievents.com/logo.png"
      }
    }
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-10" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
      <SEO
        title={post.seoTitle || post.title}
        description={post.seoDescription || post.excerpt}
        canonicalUrl={post.canonicalUrl || `/blog/${post.slug}`}
        keywords={post.tags?.join(', ')}
        schema={articleSchema}
      />

      <div className="max-w-4xl mx-auto px-4">
        {/* Back Link */}
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition mb-6"
        >
          <ArrowLeft size={14} />
          Back to Inspiration Board
        </button>

        {/* Article Meta Header */}
        <div className="space-y-4 mb-8">
          {post.category && (
            <span
              className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border bg-white"
              style={{ color: post.category.color, borderColor: `${post.category.color}20` }}
            >
              {post.category.name}
            </span>
          )}
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#1C1917] tracking-tight leading-tight">
            {post.title}
          </h1>
          <p className="text-gray-500 font-medium text-base leading-relaxed italic border-l-4 border-[#C89B3C] pl-4 py-1">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-b border-gray-150 pb-6">
            <div className="flex items-center gap-3">
              {post.author?.photo ? (
                <img
                  src={post.author.photo}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#C89B3C]/10 text-[#C89B3C] flex items-center justify-center font-bold text-sm">
                  {post.author ? post.author.firstName[0] : 'Y'}
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-gray-900">
                  By {post.author ? `${post.author.firstName} ${post.author.lastName}` : 'Yazhi Events Editor'}
                </p>
                <p className="text-[10px] text-gray-400 font-semibold">{post.author?.role || 'Editorial Team'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
              <span className="flex items-center gap-1"><Calendar size={13} /> {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><Clock size={13} /> {post.readingTime || 1} min read</span>
              <span className="flex items-center gap-1"><Eye size={13} /> {post.views} views</span>
            </div>
          </div>
        </div>

        {/* Cover image banner */}
        <div className="mb-10 rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-gray-100 aspect-video max-h-[500px]">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content canvas & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3 space-y-8">
            {/* HTML Article content */}
            <article className="prose max-w-none text-gray-800 leading-relaxed text-sm space-y-5">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>

            {/* Tags footer */}
            {post.tags?.length > 0 && (
              <div className="border-t border-gray-150 pt-6">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2.5">Tagged under</p>
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((t: string) => (
                    <span key={t} className="bg-white border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky interaction widget sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm sticky top-6 space-y-4 text-center">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Enjoyed this article?</p>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleLike}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition ${
                    hasLiked
                      ? 'bg-rose-50 border-rose-100 text-rose-600'
                      : 'bg-gray-50 border-gray-100 hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {hasLiked ? <Heart size={20} className="fill-rose-500 text-rose-500" /> : <Heart size={20} />}
                  <span className="text-[10px] font-bold mt-1.5">{post.likes + (hasLiked ? 1 : 0)} Likes</span>
                </button>

                <button
                  onClick={handleShare}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition ${
                    copied
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                      : 'bg-gray-50 border-gray-100 hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {copied ? <Check size={20} className="text-emerald-600" /> : <Share2 size={20} />}
                  <span className="text-[10px] font-bold mt-1.5">{copied ? 'Copied' : `${post.shares} Shares`}</span>
                </button>
              </div>

              <div className="border-t border-gray-50 pt-4 text-left">
                <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider text-center">Share to social media</p>
                <div className="flex justify-center gap-2 mt-3">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border border-gray-100 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-600 text-xs font-semibold transition"
                  >
                    Twitter
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border border-gray-100 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-600 text-xs font-semibold transition"
                  >
                    Facebook
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' - ' + window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border border-gray-100 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-600 text-xs font-semibold transition"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
