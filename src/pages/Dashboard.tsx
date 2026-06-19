import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import AnalysisForm from '../components/AnalysisForm';
import ResultsView from '../components/ResultsView';
import { useAuth } from '../contexts/AuthContext';
import { apiGet, apiPost } from '../lib/api';
import type { Analysis, UserUsage } from '../lib/types';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [usage, setUsage]         = useState<UserUsage | null>(null);
  const [history, setHistory]     = useState<Analysis[]>([]);
  const [activeResult, setActive] = useState<Analysis | null>(null);
  const [running, setRunning]     = useState(false);

  useEffect(() => {
    loadUsage();
    loadHistory();
  }, []);

  async function loadUsage() {
    try {
      const data = await apiGet('/api/usage', getToken);
      setUsage(data);
    } catch { /* silently ignore on first load */ }
  }

  async function loadHistory() {
    try {
      const data = await apiGet('/api/analyses', getToken);
      setHistory(data);
    } catch { /* silently ignore */ }
  }

  async function handleAnalysis(url: string, icp: string, anthropicKey: string) {
    const plan  = usage?.plan ?? 'free';
    const count = usage?.analyses_this_month ?? 0;
    if (plan === 'free' && count >= 10) {
      toast.error('Free limit reached. Upgrade to Pro for unlimited analyses.');
      navigate('/settings');
      return;
    }

    setRunning(true);
    setActive(null);

    try {
      // 1. Scrape
      const scrapeData = await apiPost('/api/scrape', { url }, getToken);
      if (!scrapeData.success) throw new Error('Could not scrape that URL. Try the homepage.');
      const markdown = scrapeData.data?.markdown ?? '';

      // 2. Contacts
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
      const [champTitle, dmTitle] = parseIcpTitles(icp);
      const contactsData = await apiPost('/api/people', { domain, championTitle: champTitle, dmTitle }, getToken);
      const contacts = [...(contactsData.champion ?? []), ...(contactsData.decisionMaker ?? [])];

      // 3. Claude
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1500,
          messages: [{ role: 'user', content: buildPrompt(url, icp, markdown, contacts) }],
        }),
      });
      if (!claudeRes.ok) {
        const err = await claudeRes.json();
        throw new Error(err.error?.message ?? 'Claude API error');
      }
      const claudeData = await claudeRes.json();
      const result = parseClaudeResponse(claudeData.content?.[0]?.text ?? '');

      // 4. Save via API (also increments usage)
      const saved = await apiPost('/api/analyses', {
        company_url: url,
        company_name: result.company_name ?? domain,
        icp,
        result: { ...result, contacts },
      }, getToken);

      setUsage(prev => prev ? { ...prev, analyses_this_month: prev.analyses_this_month + 1 } : prev);
      setActive(saved);
      setHistory(prev => [saved, ...prev]);
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong.');
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className={styles.page}>
      <Header usage={usage ? { count: usage.analyses_this_month, plan: usage.plan } : null} />

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <button
            className={`${styles.newBtn} ${!activeResult ? styles.newBtnActive : ''}`}
            onClick={() => setActive(null)}
          >
            + New analysis
          </button>

          {history.length > 0 && (
            <div className={styles.historyList}>
              <div className={styles.historyLabel}>Recent</div>
              {history.map(h => (
                <button
                  key={h.id}
                  className={`${styles.historyItem} ${activeResult?.id === h.id ? styles.historyItemActive : ''}`}
                  onClick={() => setActive(h)}
                >
                  <span className={styles.historyDomain}>{getDomain(h.company_url)}</span>
                  <span className={styles.historyDate}>{formatDate(h.created_at)}</span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <main className={styles.main}>
          {activeResult
            ? <ResultsView analysis={activeResult} onBack={() => setActive(null)} />
            : <AnalysisForm onSubmit={handleAnalysis} loading={running} />
          }
        </main>
      </div>
    </div>
  );
}

// ── helpers ────────────────────────────────────────────────────────────────

function getDomain(url: string) {
  try { return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', ''); }
  catch { return url; }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function parseIcpTitles(icp: string): [string, string] {
  const lower = icp.toLowerCase();
  if (lower.includes('engineer') || lower.includes('developer') || lower.includes('cto'))
    return ['Software Engineer', 'CTO'];
  if (lower.includes('market'))
    return ['Marketing Manager', 'CMO'];
  if (lower.includes('hr') || lower.includes('people'))
    return ['HR Manager', 'Chief People Officer'];
  if (lower.includes('finance') || lower.includes('cfo'))
    return ['Finance Manager', 'CFO'];
  return ['Sales Manager', 'VP Sales'];
}

function buildPrompt(url: string, icp: string, content: string, contacts: any[]) {
  const contactStr = contacts.length
    ? contacts.map(c => `- ${c.name} (${c.title})`).join('\n')
    : 'No contacts found via Apollo.';

  return `You are a B2B account intelligence assistant. Analyze this company and return a JSON brief.

Company URL: ${url}
Seller's ICP: ${icp}
Contacts found:
${contactStr}

Website content (truncated):
${content.slice(0, 6000)}

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "company_name": "...",
  "fit_score": 72,
  "fit_summary": "One sentence why this score.",
  "green_flags": ["flag1", "flag2", "flag3"],
  "red_flags": ["flag1"],
  "pain_points": ["point1", "point2"],
  "value_prop": "One sentence on your best angle.",
  "first_line": "Personalized cold outreach opener (1-2 sentences, no subject line).",
  "company_size": "...",
  "industry": "...",
  "tech_signals": ["signal1", "signal2"]
}`;
}

function parseClaudeResponse(raw: string): Record<string, any> {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : {};
  } catch { return {}; }
}
