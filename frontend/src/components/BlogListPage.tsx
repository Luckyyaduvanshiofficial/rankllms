import { useState, useEffect, useMemo } from 'react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url?: string;
  category: string;
  author: string;
  read_time: number;
  published_at: string;
}

const CATEGORIES = ['All', 'Comparisons', 'News', 'Guides', 'LLM Basics'];
const POSTS_PER_PAGE = 9;

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function BlogCard({ post }: { post: BlogPost }) {
  const categoryColors: Record<string, string> = {
    'Comparisons': '#f26e2a',
    'News': '#3b82f6',
    'Guides': '#8b5cf6',
    'LLM Basics': '#14b8a6',
  };
  const color = categoryColors[post.category] || '#f26e2a';

  return (
    <a
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.07)' }}
      data-testid={`blog-card-${post.slug}`}
    >
      {/* Image */}
      <div className="overflow-hidden" style={{ aspectRatio: '16/9', background: '#F3F4F6' }}>
        {post.image_url ? (
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}20, ${color}40)` }}>
            <span className="text-3xl font-black opacity-30" style={{ color }}>{post.category[0]}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color, background: `${color}12`, border: `1px solid ${color}22` }}>
            {post.category}
          </span>
          <span className="text-xs" style={{ color: '#9CA3AF' }}>{formatDate(post.published_at)}</span>
        </div>

        <h3 className="font-bold text-lg leading-snug mb-2 transition-colors group-hover:text-[#f26e2a]" style={{ color: '#111827', fontFamily: 'Inter, sans-serif' }}>
          {post.title}
        </h3>

        <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color: '#6B7280' }}>
          {post.excerpt.length > 120 ? post.excerpt.slice(0, 117) + '...' : post.excerpt}
        </p>

        <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <span className="text-xs font-medium" style={{ color: '#9CA3AF' }}>{post.author}</span>
          <span className="text-xs" style={{ color: '#9CA3AF' }}>{post.read_time} min read</span>
        </div>
      </div>
    </a>
  );
}

export default function BlogListPage({ apiUrl }: { apiUrl: string }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`${apiUrl}/api/blog`)
      .then(r => r.json())
      .then(data => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [apiUrl]);

  useEffect(() => { setPage(1); }, [category]);

  const filtered = useMemo(() =>
    category === 'All' ? posts : posts.filter(p => p.category === category)
  , [posts, category]);

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <div style={{ background: '#F8F7F4', minHeight: '100vh' }}>
      {/* Hero */}
      <section className="pt-20 pb-12 px-4 sm:px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-black tracking-tight mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#111827', fontFamily: 'Inter, sans-serif', lineHeight: '1.1' }} data-testid="blog-hero-title">
            AI Insights &amp;<br /> LLM Deep Dives
          </h1>
          <p className="text-base leading-relaxed" style={{ color: '#6B7280' }}>
            Practical guides, model comparisons, and the latest AI news to help you navigate the LLM landscape.
          </p>
        </div>
      </section>

      {/* Category Filters */}
      <div className="sticky top-16 z-30 py-3" style={{ background: 'rgba(248,247,244,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150"
              style={category === cat
                ? { background: '#111827', color: '#FFFFFF' }
                : { background: '#FFFFFF', color: '#6B7280', border: '1px solid rgba(0,0,0,0.09)' }
              }
              data-testid={`category-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {cat}
            </button>
          ))}
          <span className="ml-auto flex-shrink-0 text-xs" style={{ color: '#9CA3AF' }}>
            {filtered.length} articles
          </span>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent mx-auto mb-3 animate-spin" style={{ borderColor: '#f26e2a', borderTopColor: 'transparent' }} />
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Loading posts...</p>
            </div>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-lg font-semibold mb-2" style={{ color: '#374151' }}>No posts found</p>
            <p className="text-sm" style={{ color: '#9CA3AF' }}>Try a different category</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="blog-posts-grid">
              {paginated.map(post => <BlogCard key={post.id} post={post} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12" data-testid="blog-pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
                  style={{ background: '#FFFFFF', color: '#374151', border: '1px solid rgba(0,0,0,0.1)' }}
                  data-testid="pagination-prev"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className="w-9 h-9 rounded-lg text-sm font-medium transition-colors"
                    style={page === n
                      ? { background: '#111827', color: '#FFFFFF' }
                      : { background: '#FFFFFF', color: '#6B7280', border: '1px solid rgba(0,0,0,0.09)' }
                    }
                    data-testid={`pagination-page-${n}`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
                  style={{ background: '#FFFFFF', color: '#374151', border: '1px solid rgba(0,0,0,0.1)' }}
                  data-testid="pagination-next"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
