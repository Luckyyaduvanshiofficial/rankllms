import { useState, useEffect, useMemo } from 'react';

interface Scores {
  coding: number;
  reasoning: number;
  math: number;
  multilingual: number;
  visual: number;
  overall: number;
}

interface LLMModel {
  id: string;
  name: string;
  provider: string;
  slug: string;
  context_window: number;
  input_cost: number;
  output_cost: number;
  speed: number;
  latency: number | null;
  release_date: string | null;
  description: string | null;
  scores: Scores;
}

interface Props {
  apiUrl: string;
}

const PROVIDER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Anthropic': { bg: 'rgba(204,120,92,0.15)', text: '#cc785c', border: 'rgba(204,120,92,0.3)' },
  'OpenAI': { bg: 'rgba(16,163,127,0.15)', text: '#10a37f', border: 'rgba(16,163,127,0.3)' },
  'Google': { bg: 'rgba(66,133,244,0.15)', text: '#4285f4', border: 'rgba(66,133,244,0.3)' },
  'Meta': { bg: 'rgba(59,89,152,0.15)', text: '#5b8dee', border: 'rgba(59,89,152,0.3)' },
  'DeepSeek': { bg: 'rgba(0,188,212,0.15)', text: '#00bcd4', border: 'rgba(0,188,212,0.3)' },
  'Mistral': { bg: 'rgba(255,112,67,0.15)', text: '#ff7043', border: 'rgba(255,112,67,0.3)' },
  'xAI': { bg: 'rgba(255,255,255,0.08)', text: '#e4e4e7', border: 'rgba(255,255,255,0.15)' },
};

const CHART_COLORS = ['#f26e2a', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];

const TASK_CARDS = [
  { metric: 'coding' as keyof Scores, title: 'Best in Coding', subtitle: 'SWE-bench Verified' },
  { metric: 'reasoning' as keyof Scores, title: 'Best in Reasoning', subtitle: 'GPQA Diamond' },
  { metric: 'math' as keyof Scores, title: 'Best in Math', subtitle: 'AIME 2025' },
  { metric: 'overall' as keyof Scores, title: 'Best Overall', subtitle: "Humanity's Last Exam" },
  { metric: 'multilingual' as keyof Scores, title: 'Best Multilingual', subtitle: 'MMLU' },
  { metric: 'visual' as keyof Scores, title: 'Best Visual', subtitle: 'ARC-AGI 2' },
];

const BENCHMARKS = [
  { name: 'GPQA Diamond', desc: "Graduate-level scientific reasoning. Tests PhD-level physics, chemistry, and biology. Scores above 80% are considered expert-level." },
  { name: 'AIME 2025', desc: "American Invitational Mathematics Examination. Requires multi-step mathematical reasoning. The gold standard for math evaluation." },
  { name: 'SWE-bench', desc: "Real GitHub issues requiring code fixes. The gold standard for coding ability. Tests real-world software engineering tasks." },
  { name: "Humanity's Last Exam", desc: "Extremely hard multi-subject reasoning benchmark. Designed to challenge frontier AI with questions no human can easily answer." },
  { name: 'MMLU', desc: "Massive Multitask Language Understanding. 57 academic subjects testing breadth of knowledge and multilingual capability." },
  { name: 'ARC-AGI 2', desc: "Abstract visual pattern reasoning. Measures fluid intelligence and out-of-distribution generalization in visual tasks." },
];

function formatCtx(n: number): string {
  if (n >= 10_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function formatCost(n: number): string {
  if (n === 0) return 'Free';
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 1) return `$${n.toFixed(3)}`;
  return `$${n.toFixed(2)}`;
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#22c55e';
  if (score >= 80) return '#f26e2a';
  if (score >= 65) return '#eab308';
  return '#71717a';
}

function ProviderBadge({ provider }: { provider: string }) {
  const c = PROVIDER_COLORS[provider] || { bg: 'rgba(161,161,170,0.15)', text: '#a1a1aa', border: 'rgba(161,161,170,0.3)' };
  return (
    <span
      style={{ backgroundColor: c.bg, color: c.text, borderColor: c.border, border: `1px solid ${c.border}` }}
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold flex-shrink-0"
      title={provider}
    >
      {provider[0]}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  if (!score || score === 0) return <span style={{ color: '#52525b' }} className="text-xs font-mono">N/A</span>;
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }} className="h-full rounded-full" />
      </div>
      <span style={{ color: getScoreColor(score) }} className="text-xs font-mono tabular-nums w-7 text-right">{score}</span>
    </div>
  );
}

function MiniBarChart({ title, subtitle, models, metric }: { title: string; subtitle: string; models: LLMModel[]; metric: keyof Scores }) {
  const top = useMemo(() =>
    [...models].filter(m => m.scores[metric] > 0).sort((a, b) => b.scores[metric] - a.scores[metric]).slice(0, 5)
  , [models, metric]);

  const maxScore = top.length > 0 ? top[0].scores[metric] : 100;

  return (
    <div className="rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 cursor-default" style={{ background: '#222', borderColor: 'rgba(255,255,255,0.08)' }} data-testid={`task-card-${metric}`}>
      <p className="text-[11px] mb-0.5 font-mono" style={{ color: '#71717a' }}>{subtitle}</p>
      <h3 className="text-sm font-semibold text-white mb-4 leading-tight">{title}</h3>
      <div className="flex items-end gap-1.5" style={{ height: '64px' }}>
        {top.map((m, i) => (
          <div key={m.id} className="flex flex-col items-center flex-1 min-w-0">
            <span className="text-[9px] font-mono mb-0.5 leading-none" style={{ color: '#a1a1aa' }}>{m.scores[metric]}</span>
            <div style={{ height: `${(m.scores[metric] / maxScore) * 100}%`, backgroundColor: CHART_COLORS[i], minHeight: '4px' }} className="w-full rounded-sm" />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-2">
        {top.map(m => (
          <div key={m.id} className="flex-1 min-w-0 text-center">
            <span className="block truncate text-[9px]" style={{ color: '#52525b' }}>{m.name.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpeedCostSection({ models }: { models: LLMModel[] }) {
  const fastest = [...models].sort((a, b) => b.speed - a.speed).slice(0, 5);
  const cheapest = [...models].sort((a, b) => a.input_cost - b.input_cost).slice(0, 5);
  const lowestLatency = [...models].filter(m => m.latency).sort((a, b) => (a.latency || 999) - (b.latency || 999)).slice(0, 5);

  const Card = ({ title, items, unit, valueKey, color }: { title: string; items: LLMModel[]; unit: string; valueKey: 'speed' | 'input_cost' | 'latency'; color: string }) => (
    <div className="rounded-2xl p-6 border" style={{ background: '#222', borderColor: 'rgba(255,255,255,0.08)' }} data-testid={`speed-cost-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((m, i) => {
          const val = valueKey === 'speed' ? `${m.speed} t/s` : valueKey === 'input_cost' ? `$${m.input_cost.toFixed(3)}/1M` : `${m.latency}s`;
          return (
            <div key={m.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono tabular-nums w-4 text-right flex-shrink-0" style={{ color: '#52525b' }}>{i + 1}</span>
                <span className="text-sm truncate" style={{ color: '#d4d4d8' }}>{m.name}</span>
              </div>
              <span className="text-sm font-mono font-semibold flex-shrink-0 ml-2" style={{ color }}>{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="font-heading font-bold text-white mb-6" style={{ fontSize: '1.5rem' }} data-testid="speed-cost-section-title">
        Fastest &amp; most affordable models
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Fastest Models (tokens/sec)" items={fastest} unit="t/s" valueKey="speed" color="#14b8a6" />
        <Card title="Lowest Latency (TTFT)" items={lowestLatency} unit="s" valueKey="latency" color="#3b82f6" />
        <Card title="Cheapest (input per 1M tokens)" items={cheapest} unit="/1M" valueKey="input_cost" color="#f26e2a" />
      </div>
    </div>
  );
}

function CompareSection({ models }: { models: LLMModel[] }) {
  const [idA, setIdA] = useState('');
  const [idB, setIdB] = useState('');

  useEffect(() => {
    if (models.length >= 2 && !idA) {
      setIdA(models[0].id);
      setIdB(models[1].id);
    }
  }, [models]);

  const modelA = models.find(m => m.id === idA);
  const modelB = models.find(m => m.id === idB);

  const metrics: { key: keyof Scores; label: string }[] = [
    { key: 'overall', label: 'Overall Score' },
    { key: 'coding', label: 'Coding' },
    { key: 'reasoning', label: 'Reasoning' },
    { key: 'math', label: 'Math' },
    { key: 'multilingual', label: 'Multilingual' },
    { key: 'visual', label: 'Visual' },
  ];

  return (
    <div id="compare" data-testid="compare-section">
      <h2 className="font-heading font-bold text-white mb-6" style={{ fontSize: '1.5rem' }}>Compare models</h2>

      {/* Selectors */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-xs mb-2 font-medium" style={{ color: '#a1a1aa' }}>Model A</label>
          <select
            value={idA}
            onChange={e => setIdA(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm text-white"
            style={{ background: '#222', border: '1px solid rgba(255,255,255,0.12)', outline: 'none' }}
            data-testid="compare-model-a-select"
          >
            {models.map(m => <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>)}
          </select>
        </div>
        <div className="hidden sm:flex items-end pb-3">
          <span className="text-sm font-semibold px-4" style={{ color: '#52525b' }}>VS</span>
        </div>
        <div className="flex-1">
          <label className="block text-xs mb-2 font-medium" style={{ color: '#a1a1aa' }}>Model B</label>
          <select
            value={idB}
            onChange={e => setIdB(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm text-white"
            style={{ background: '#222', border: '1px solid rgba(255,255,255,0.12)', outline: 'none' }}
            data-testid="compare-model-b-select"
          >
            {models.map(m => <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>)}
          </select>
        </div>
      </div>

      {modelA && modelB && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Stats table */}
          <div className="rounded-2xl p-6 border" style={{ background: '#222', borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[modelA, modelB].map((m, i) => (
                <div key={m.id} className="text-center p-4 rounded-xl" style={{ background: i === 0 ? 'rgba(242,110,42,0.08)' : 'rgba(20,184,166,0.08)', border: `1px solid ${i === 0 ? 'rgba(242,110,42,0.2)' : 'rgba(20,184,166,0.2)'}` }}>
                  <ProviderBadge provider={m.provider} />
                  <p className="text-sm font-semibold text-white mt-2 leading-tight">{m.name}</p>
                  <p className="text-xs mt-1" style={{ color: '#71717a' }}>{m.provider}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Context', valA: formatCtx(modelA.context_window), valB: formatCtx(modelB.context_window) },
                { label: 'Input Cost', valA: `$${modelA.input_cost}/1M`, valB: `$${modelB.input_cost}/1M` },
                { label: 'Output Cost', valA: `$${modelA.output_cost}/1M`, valB: `$${modelB.output_cost}/1M` },
                { label: 'Speed', valA: `${modelA.speed} t/s`, valB: `${modelB.speed} t/s` },
                { label: 'Latency', valA: modelA.latency ? `${modelA.latency}s` : 'N/A', valB: modelB.latency ? `${modelB.latency}s` : 'N/A' },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#a1a1aa' }}>{row.label}</span>
                  <div className="flex gap-8">
                    <span className="font-mono text-xs font-semibold" style={{ color: '#f26e2a' }}>{row.valA}</span>
                    <span className="font-mono text-xs font-semibold" style={{ color: '#14b8a6' }}>{row.valB}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Bar charts */}
          <div className="rounded-2xl p-6 border" style={{ background: '#222', borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-4 mb-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: '#f26e2a' }} />
                <span style={{ color: '#a1a1aa' }}>{modelA.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: '#14b8a6' }} />
                <span style={{ color: '#a1a1aa' }}>{modelB.name}</span>
              </div>
            </div>
            <div className="space-y-4">
              {metrics.map(({ key, label }) => {
                const vA = modelA.scores[key];
                const vB = modelB.scores[key];
                if (!vA && !vB) return null;
                return (
                  <div key={key} data-testid={`compare-metric-${key}`}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs" style={{ color: '#a1a1aa' }}>{label}</span>
                      <div className="flex gap-3 text-xs font-mono">
                        <span style={{ color: '#f26e2a' }}>{vA || 'N/A'}</span>
                        <span style={{ color: '#14b8a6' }}>{vB || 'N/A'}</span>
                      </div>
                    </div>
                    {vA > 0 && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 rounded-full h-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div style={{ width: `${vA}%`, background: '#f26e2a' }} className="h-full rounded-full transition-all duration-500" />
                        </div>
                      </div>
                    )}
                    {vB > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 rounded-full h-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div style={{ width: `${vB}%`, background: '#14b8a6' }} className="h-full rounded-full transition-all duration-500" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type SortKey = 'name' | 'provider' | 'context_window' | 'input_cost' | 'output_cost' | 'speed' | 'latency' | 'scores.overall' | 'scores.coding' | 'scores.reasoning' | 'scores.math';

function ModelTable({ models, allModels }: { models: LLMModel[]; allModels: LLMModel[] }) {
  const [sortBy, setSortBy] = useState<SortKey>('scores.overall');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [provider, setProvider] = useState('');

  const providers = useMemo(() => Array.from(new Set(allModels.map(m => m.provider))).sort(), [allModels]);

  const sorted = useMemo(() => {
    let result = [...models];
    if (search) result = result.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.provider.toLowerCase().includes(search.toLowerCase()));
    if (provider) result = result.filter(m => m.provider === provider);
    result.sort((a, b) => {
      const getVal = (m: LLMModel) => {
        if (sortBy.startsWith('scores.')) {
          const k = sortBy.split('.')[1] as keyof Scores;
          return m.scores[k] || 0;
        }
        return (m as any)[sortBy] ?? 0;
      };
      const diff = getVal(a) - getVal(b);
      return sortDir === 'desc' ? -diff : diff;
    });
    return result;
  }, [models, search, provider, sortBy, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(key); setSortDir('desc'); }
  };

  const SortTh = ({ k, children, className = '' }: { k: SortKey; children: React.ReactNode; className?: string }) => (
    <th
      onClick={() => toggleSort(k)}
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer whitespace-nowrap select-none transition-colors ${className}`}
      style={{ color: sortBy === k ? '#f26e2a' : '#71717a' }}
      data-testid={`sort-${k}`}
    >
      <span className="flex items-center gap-1">
        {children}
        {sortBy === k && <span>{sortDir === 'desc' ? '↓' : '↑'}</span>}
      </span>
    </th>
  );

  return (
    <div data-testid="model-table-section">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <h2 className="font-heading font-bold text-white self-center" style={{ fontSize: '1.5rem' }}>Model Comparison</h2>
        <div className="sm:ml-auto flex gap-2 flex-wrap">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search models..."
            className="px-4 py-2 rounded-xl text-sm text-white placeholder-[#52525b] outline-none min-w-[160px]"
            style={{ background: '#222', border: '1px solid rgba(255,255,255,0.1)' }}
            data-testid="model-search-input"
          />
          <select
            value={provider}
            onChange={e => setProvider(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm text-white outline-none"
            style={{ background: '#222', border: '1px solid rgba(255,255,255,0.1)' }}
            data-testid="provider-filter"
          >
            <option value="">All Providers</option>
            {providers.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="model-comparison-table">
            <thead style={{ background: 'rgba(26,26,26,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky left-0" style={{ color: '#71717a', background: '#1e1e1e', minWidth: '200px' }}>Model</th>
                <SortTh k="context_window">Context</SortTh>
                <SortTh k="input_cost">Input $/1M</SortTh>
                <SortTh k="output_cost">Output $/1M</SortTh>
                <SortTh k="speed">Speed</SortTh>
                <SortTh k="scores.overall">Overall</SortTh>
                <SortTh k="scores.coding">Coding</SortTh>
                <SortTh k="scores.reasoning">Reasoning</SortTh>
                <SortTh k="scores.math">Math</SortTh>
              </tr>
            </thead>
            <tbody>
              {sorted.map((m, i) => (
                <tr
                  key={m.id}
                  className="transition-colors cursor-default"
                  style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)')}
                  data-testid={`model-row-${m.slug}`}
                >
                  <td className="px-4 py-3 sticky left-0" style={{ minWidth: '200px', background: 'inherit' }}>
                    <div className="flex items-center gap-3">
                      <ProviderBadge provider={m.provider} />
                      <div className="min-w-0">
                        <p className="font-medium text-white text-sm leading-tight truncate">{m.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>{m.release_date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-right" style={{ color: '#a1a1aa', whiteSpace: 'nowrap' }}>{formatCtx(m.context_window)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-right" style={{ color: '#a1a1aa' }}>{formatCost(m.input_cost)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-right" style={{ color: '#a1a1aa' }}>{formatCost(m.output_cost)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-right" style={{ color: '#14b8a6', whiteSpace: 'nowrap' }}>{m.speed} t/s</td>
                  <td className="px-4 py-3" style={{ minWidth: '100px' }}><ScoreBar score={m.scores.overall} /></td>
                  <td className="px-4 py-3" style={{ minWidth: '100px' }}><ScoreBar score={m.scores.coding} /></td>
                  <td className="px-4 py-3" style={{ minWidth: '100px' }}><ScoreBar score={m.scores.reasoning} /></td>
                  <td className="px-4 py-3" style={{ minWidth: '100px' }}><ScoreBar score={m.scores.math} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-xs" style={{ color: '#52525b', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          Showing {sorted.length} of {allModels.length} models · Scores are normalized 0–100
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage({ apiUrl }: Props) {
  const [models, setModels] = useState<LLMModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${apiUrl}/api/models`)
      .then(r => r.json())
      .then(data => { setModels(data); setLoading(false); })
      .catch(() => { setError('Failed to load data.'); setLoading(false); });
  }, [apiUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent mx-auto mb-4 animate-spin" style={{ borderColor: '#f26e2a', borderTopColor: 'transparent' }} />
          <p style={{ color: '#71717a' }}>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="text-center p-8 rounded-2xl" style={{ background: '#222', border: '1px solid rgba(255,0,0,0.2)' }}>
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg text-white text-sm" style={{ background: '#f26e2a' }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#1a1a1a' }}>
      {/* Hero */}
      <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }} data-testid="leaderboard-hero">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6" style={{ background: 'rgba(242,110,42,0.1)', color: '#f26e2a', border: '1px solid rgba(242,110,42,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Updated Feb 2026 · {models.length} Models Tracked
            </div>
            <h1 className="font-heading font-black text-white tracking-tight mb-4" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', lineHeight: '1.05' }} data-testid="leaderboard-title">
              LLM<br />
              <span style={{ background: 'linear-gradient(90deg, #f26e2a, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Leaderboard
              </span>
            </h1>
            <p className="text-base leading-relaxed" style={{ color: '#a1a1aa', maxWidth: '520px' }}>
              The most comprehensive benchmark for Large Language Models. Real performance data on coding, reasoning, math, and more — updated regularly.
            </p>
          </div>
        </div>
      </section>

      {/* Content sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 py-16">

        {/* Top Models per Task */}
        <section data-testid="top-models-section">
          <h2 className="font-heading font-bold text-white mb-6" style={{ fontSize: '1.5rem' }}>Top models per task</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {TASK_CARDS.map(c => <MiniBarChart key={c.metric} models={models} {...c} />)}
          </div>
        </section>

        {/* Speed & Cost */}
        <section>
          <SpeedCostSection models={models} />
        </section>

        {/* Compare */}
        <section>
          <CompareSection models={models} />
        </section>

        {/* Model Table */}
        <section>
          <ModelTable models={models} allModels={models} />
        </section>

        {/* Benchmark Glossary */}
        <section data-testid="benchmark-glossary">
          <h2 className="font-heading font-bold text-white mb-6" style={{ fontSize: '1.5rem' }}>Benchmark glossary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENCHMARKS.map(b => (
              <div key={b.name} className="rounded-2xl p-5 border" style={{ background: '#222', borderColor: 'rgba(255,255,255,0.08)' }}>
                <h3 className="text-sm font-semibold text-white mb-2">{b.name}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#71717a' }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
