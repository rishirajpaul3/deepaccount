import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import AnalysisForm from '../components/AnalysisForm';
import ResultsView from '../components/ResultsView';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Analysis, UserUsage } from '../lib/supabase';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [usage, setUsage]           = useState<UserUsage | null>(null);
  const [history, setHistory]       = useState<Analysis[]>([]);
  const [activeResult, setActive]   = useState<Analysis | null>(null);
  const [running, setRunning]       = useState(false);
  const [view, setView]             = useState<'new' | 'history'>('new');

  // load usage + history
  useEffect(() => {
    if (!user) return;
    loadUsage();
    loadHistory();
  }, [user]);

  async function loadUsage() {
    const { data } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', user!.id)
      .single();
    if (data) setUsage(data);
  }

  async function loadHistory() {
    const { data } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setHistory(data);
  }

  async function handleAnalysis(url: string, icp: string, anthropicKey: string) {
    if (!user) return;

    const plan = usage?.plan ?? 'free';
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
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const scrapeData = await scrapeRes.json();
      if (!scrapeData.success) throw new Error('Could not scrape that URL. Try the homepage.');
      const markdown = scrapeData.data?.markdown ?? '';

      // 2. Contacts
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
      const [champTitle, dmTitle] = parseIcpTitles(icp);
      const contactsRes = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, champTitle, dmTitle }),
      });
      const contactsData = await contactsRes.json();
      const contacts = contactsData.contacts ?? [];

      // 3. Claude
      const prompt = buildPrompt(url, icp, markdown, contacts);
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!claudeRes.ok) {
        const err = await claudeRes.json();
        throw new Error(err.error?.message ?? 'Claude API error');
      }
      const claudeData = await claudeRes.json();
      const raw = claudeData.content?.[0]?.text ?? '';
      const result = parseClaudeResponse(raw);

      // 4. Save to Supabase
      const { data: saved, error } = await supabase
        .from('analyses')
        .insert({
          user_id: user.id,
          company_url: url,
          icp: icp,
          result: { ...result, contacts },
          company_name: result.company_name ?? domain,
        })
        .select()
        .single();

      if (error) throw error;

      // 5. Increment usage
      await supabase.rpc('increment_usage', { uid: user.id });
      loadUsage();

      setActive(saved);
      setHistory(prev => [saved, ...prev]);
      setView('new');
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
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <button
            className={`${styles.newBtn} ${view === 'new' && !activeResult ? styles.newBtnActive : ''}`}
            onClick={() => { setView('new'); setActive(null); }}
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
                  onClick={() => { setActive(h); setView('history'); }}
                >
                  <span className={styles.historyDomain}>{getDomain(h.company_url)}</span>
                  <span className={styles.historyDate}>{formatDate(h.created_at)}</span>
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Main */}
        <main className={styles.main}>
          {activeResult ? (
            <ResultsView
              analysis={activeResult}
              onBack={() => { setActive(null); setView('new'); }}
            />
          ) : (
            <AnalysisForm onSubmit={handleAnalysis} loading={running} />
          )}
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
  let champ = 'Sales Manager';
  let dm    = 'VP Sales';
  if (lower.includes('engineer') || lower.includes('developer') || lower.includes('cto')) {
    champ = 'Software Engineer'; dm = 'CTO';
  } else if (lower.includes('market')) {
    champ = 'Marketing Manager'; dm = 'CMO';
  } else if (lower.includes('hr') || lower.includes('people')) {
    champ = 'HR Manager'; dm = 'Chief People Officer';
  } else if (lower.includes('finance') || lower.includes('cfo')) {
    champ = 'Finance Manager'; dm = 'CFO';
  }
  return [champ, dm];
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
  } catch {
    return {};
  }
}
