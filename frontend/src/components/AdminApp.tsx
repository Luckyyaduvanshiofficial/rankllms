import { useState, useEffect } from 'react';

interface Model {
  id: string;
  name: string;
  provider: string;
  slug: string;
  context_window: number;
  input_cost: number;
  output_cost: number;
  speed: number;
  latency: number | null;
  scores: { coding: number; reasoning: number; math: number; multilingual: number; visual: number; overall: number };
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  read_time: number;
  published_at: string;
  is_published: boolean;
  image_url?: string;
  content?: string;
}

const EMPTY_MODEL: Partial<Model> & { scores: Model['scores'] } = {
  name: '', provider: '', slug: '', context_window: 128000,
  input_cost: 1.0, output_cost: 4.0, speed: 100, latency: 1.0,
  scores: { coding: 80, reasoning: 80, math: 80, multilingual: 80, visual: 0, overall: 80 }
};

const EMPTY_POST: Partial<BlogPost> = {
  title: '', slug: '', excerpt: '', content: '',
  category: 'Guides', author: 'RankLLMs Team', read_time: 5,
  published_at: new Date().toISOString().slice(0, 10), is_published: true, image_url: ''
};

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function Input({ label, value, onChange, type = 'text', required = false, testId = '' }: any) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: '#a1a1aa' }}>{label}{required && <span style={{ color: '#f26e2a' }}> *</span>}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        data-testid={testId}
        className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
        style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)' }}
      />
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 3, testId = '' }: any) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: '#a1a1aa' }}>{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        data-testid={testId}
        className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none resize-vertical"
        style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)' }}
      />
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: '#71717a' }} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = '#71717a')} data-testid="modal-close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function LoginForm({ apiUrl, onLogin }: { apiUrl: string; onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('admin@rankllms.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const { access_token } = await res.json();
        localStorage.setItem('rankllms_token', access_token);
        onLogin(access_token);
      } else {
        setError('Invalid email or password');
      }
    } catch { setError('Connection error. Please try again.'); }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #f26e2a, #14b8a6)' }}>R</div>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-sm mt-1" style={{ color: '#71717a' }}>RankLLMs Dashboard</p>
        </div>
        <form onSubmit={submit} className="rounded-2xl p-6 space-y-4" style={{ background: '#222', border: '1px solid rgba(255,255,255,0.08)' }} data-testid="admin-login-form">
          <Input label="Email" value={email} onChange={(e: any) => setEmail(e.target.value)} type="email" required testId="login-email" />
          <Input label="Password" value={password} onChange={(e: any) => setPassword(e.target.value)} type="password" required testId="login-password" />
          {error && <p className="text-sm text-red-400" data-testid="login-error">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-white transition-opacity disabled:opacity-60" style={{ background: '#f26e2a' }} data-testid="login-submit-btn">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-xs mt-4" style={{ color: '#52525b' }}>Contact your administrator for access credentials</p>
      </div>
    </div>
  );
}

function ModelsTab({ apiUrl, token }: { apiUrl: string; token: string }) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Model> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const load = async () => {
    const res = await fetch(`${apiUrl}/api/models`);
    if (res.ok) setModels(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const url = isNew ? `${apiUrl}/api/admin/models` : `${apiUrl}/api/admin/models/${editing.id}`;
    const method = isNew ? 'POST' : 'PUT';
    const res = await fetch(url, { method, headers, body: JSON.stringify(editing) });
    if (res.ok) { setEditing(null); load(); }
    else alert('Error saving model');
  };

  const del = async (id: string) => {
    if (!confirm('Delete this model?')) return;
    await fetch(`${apiUrl}/api/admin/models/${id}`, { method: 'DELETE', headers });
    load();
  };

  const set = (field: string, val: any) => {
    setEditing(prev => {
      if (!prev) return prev;
      if (field.startsWith('scores.')) {
        const k = field.split('.')[1];
        return { ...prev, scores: { ...prev.scores, [k]: Number(val) } as Model['scores'] };
      }
      return { ...prev, [field]: val };
    });
  };

  return (
    <div data-testid="models-admin-tab">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">LLM Models ({models.length})</h2>
        <button onClick={() => { setEditing({ ...EMPTY_MODEL } as any); setIsNew(true); }} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#f26e2a' }} data-testid="add-model-btn">
          + Add Model
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12" style={{ color: '#71717a' }}>Loading...</div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="admin-models-table">
              <thead style={{ background: '#1e1e1e', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <tr>
                  {['Model', 'Provider', 'Context', 'Input $', 'Output $', 'Overall', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#71717a', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {models.map((m, i) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }} data-testid={`admin-model-row-${m.slug}`}>
                    <td className="px-4 py-3 font-medium text-white">{m.name}</td>
                    <td className="px-4 py-3" style={{ color: '#a1a1aa' }}>{m.provider}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#a1a1aa' }}>{(m.context_window / 1000).toFixed(0)}K</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#a1a1aa' }}>${m.input_cost}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#a1a1aa' }}>${m.output_cost}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: '#f26e2a' }}>{m.scores.overall}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditing({ ...m }); setIsNew(false); }} className="px-3 py-1 rounded-md text-xs transition-colors" style={{ background: 'rgba(255,255,255,0.08)', color: '#a1a1aa' }} data-testid={`edit-model-${m.id}`}>Edit</button>
                        <button onClick={() => del(m.id)} className="px-3 py-1 rounded-md text-xs transition-colors" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }} data-testid={`delete-model-${m.id}`}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && (
        <Modal title={isNew ? 'Add Model' : 'Edit Model'} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Name" value={editing.name || ''} onChange={(e: any) => set('name', e.target.value)} required testId="model-name-input" />
              <Input label="Provider" value={editing.provider || ''} onChange={(e: any) => set('provider', e.target.value)} required testId="model-provider-input" />
            </div>
            <Input label="Slug" value={editing.slug || ''} onChange={(e: any) => set('slug', e.target.value)} testId="model-slug-input" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Context Window" value={editing.context_window || ''} onChange={(e: any) => set('context_window', Number(e.target.value))} type="number" />
              <Input label="Speed (t/s)" value={editing.speed || ''} onChange={(e: any) => set('speed', Number(e.target.value))} type="number" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Input Cost ($/1M)" value={editing.input_cost || ''} onChange={(e: any) => set('input_cost', Number(e.target.value))} type="number" />
              <Input label="Output Cost ($/1M)" value={editing.output_cost || ''} onChange={(e: any) => set('output_cost', Number(e.target.value))} type="number" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#71717a' }}>Scores (0–100)</p>
            <div className="grid grid-cols-3 gap-3">
              {(['coding', 'reasoning', 'math', 'multilingual', 'visual', 'overall'] as const).map(k => (
                <Input key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={(editing.scores as any)?.[k] || ''} onChange={(e: any) => set(`scores.${k}`, e.target.value)} type="number" testId={`score-${k}`} />
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={save} className="flex-1 py-2.5 rounded-xl font-semibold text-white text-sm" style={{ background: '#f26e2a' }} data-testid="save-model-btn">Save</button>
              <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.08)', color: '#a1a1aa' }}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function BlogTab({ apiUrl, token }: { apiUrl: string; token: string }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const load = async () => {
    const res = await fetch(`${apiUrl}/api/admin/blog`, { headers });
    if (res.ok) setPosts(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const url = isNew ? `${apiUrl}/api/admin/blog` : `${apiUrl}/api/admin/blog/${editing.id}`;
    const method = isNew ? 'POST' : 'PUT';
    const res = await fetch(url, { method, headers, body: JSON.stringify(editing) });
    if (res.ok) { setEditing(null); load(); }
    else alert('Error saving post');
  };

  const del = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await fetch(`${apiUrl}/api/admin/blog/${id}`, { method: 'DELETE', headers });
    load();
  };

  const set = (field: string, val: any) => setEditing(prev => prev ? { ...prev, [field]: val } : prev);

  return (
    <div data-testid="blog-admin-tab">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Blog Posts ({posts.length})</h2>
        <button onClick={() => { setEditing({ ...EMPTY_POST }); setIsNew(true); }} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#f26e2a' }} data-testid="add-post-btn">
          + New Post
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12" style={{ color: '#71717a' }}>Loading...</div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="admin-blog-table">
              <thead style={{ background: '#1e1e1e', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <tr>
                  {['Title', 'Category', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#71717a', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }} data-testid={`admin-post-row-${p.slug}`}>
                    <td className="px-4 py-3 font-medium text-white max-w-xs truncate">{p.title}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(242,110,42,0.1)', color: '#f26e2a' }}>{p.category}</span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#a1a1aa' }}>{p.published_at}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs" style={p.is_published ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e' } : { background: 'rgba(161,161,170,0.1)', color: '#71717a' }}>
                        {p.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditing({ ...p }); setIsNew(false); }} className="px-3 py-1 rounded-md text-xs" style={{ background: 'rgba(255,255,255,0.08)', color: '#a1a1aa' }} data-testid={`edit-post-${p.id}`}>Edit</button>
                        <button onClick={() => del(p.id)} className="px-3 py-1 rounded-md text-xs" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }} data-testid={`delete-post-${p.id}`}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && (
        <Modal title={isNew ? 'New Post' : 'Edit Post'} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <Input label="Title" value={editing.title || ''} onChange={(e: any) => { set('title', e.target.value); if (isNew) set('slug', slugify(e.target.value)); }} required testId="post-title-input" />
            <Input label="Slug" value={editing.slug || ''} onChange={(e: any) => set('slug', e.target.value)} testId="post-slug-input" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#a1a1aa' }}>Category</label>
                <select value={editing.category || 'Guides'} onChange={(e: any) => set('category', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none" style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)' }} data-testid="post-category-select">
                  {['Comparisons', 'News', 'Guides', 'LLM Basics'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Input label="Read Time (min)" value={editing.read_time || ''} onChange={(e: any) => set('read_time', Number(e.target.value))} type="number" />
            </div>
            <Input label="Image URL" value={editing.image_url || ''} onChange={(e: any) => set('image_url', e.target.value)} testId="post-image-input" />
            <Textarea label="Excerpt" value={editing.excerpt || ''} onChange={(e: any) => set('excerpt', e.target.value)} rows={2} testId="post-excerpt-input" />
            <Textarea label="Content (HTML)" value={editing.content || ''} onChange={(e: any) => set('content', e.target.value)} rows={8} testId="post-content-input" />
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={editing.is_published || false} onChange={e => set('is_published', e.target.checked)} id="published-check" className="w-4 h-4 rounded" data-testid="post-published-checkbox" />
              <label htmlFor="published-check" className="text-sm text-white">Published</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={save} className="flex-1 py-2.5 rounded-xl font-semibold text-white text-sm" style={{ background: '#f26e2a' }} data-testid="save-post-btn">Save</button>
              <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.08)', color: '#a1a1aa' }}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function AdminApp({ apiUrl }: { apiUrl: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<'models' | 'blog'>('models');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('rankllms_token');
    if (saved) {
      fetch(`${apiUrl}/api/auth/me`, { headers: { Authorization: `Bearer ${saved}` } })
        .then(r => { if (r.ok) setToken(saved); setChecking(false); })
        .catch(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, [apiUrl]);

  if (checking) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#f26e2a', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!token) return <LoginForm apiUrl={apiUrl} onLogin={setToken} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="admin-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: '#71717a' }}>Manage leaderboard data and blog content</p>
        </div>
        <button
          onClick={() => { localStorage.removeItem('rankllms_token'); setToken(null); }}
          className="px-4 py-2 rounded-lg text-sm transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#a1a1aa' }}
          data-testid="admin-logout-btn"
        >
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 rounded-xl" style={{ background: '#222', width: 'fit-content' }}>
        {(['models', 'blog'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all capitalize"
            style={tab === t ? { background: '#f26e2a', color: '#fff' } : { color: '#a1a1aa' }}
            data-testid={`admin-tab-${t}`}
          >
            {t === 'models' ? 'LLM Models' : 'Blog Posts'}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'models' ? <ModelsTab apiUrl={apiUrl} token={token} /> : <BlogTab apiUrl={apiUrl} token={token} />}
    </div>
  );
}
