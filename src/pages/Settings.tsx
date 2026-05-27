import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { UserUsage } from '../lib/supabase';
import styles from './Settings.module.css';

const FREE_LIMIT = 10;

export default function Settings() {
  const { user } = useAuth();
  const [usage, setUsage]   = useState<UserUsage | null>(null);
  const [key, setKey]       = useState(() => localStorage.getItem('da_anthropic_key') ?? '');
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => { if (data) setUsage(data); });
  }, [user]);

  function saveKey() {
    localStorage.setItem('da_anthropic_key', key.trim());
    toast.success('API key saved');
  }

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ plan: 'pro' }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      toast.error('Could not start checkout. Try again.');
    } finally {
      setUpgrading(false);
    }
  }

  const isPro = usage?.plan === 'pro';

  return (
    <div className={styles.page}>
      <Header usage={usage ? { count: usage.analyses_this_month, plan: usage.plan } : null} />

      <div className={styles.content}>
        <div className={styles.heading}>
          <div className={styles.label}>Account</div>
          <h1 className={`${styles.h1} serif`}>Settings</h1>
        </div>

        {/* Profile */}
        <Card title="Profile">
          <div className={styles.profileRow}>
            <div className={styles.avatar}>{user?.email?.[0]?.toUpperCase()}</div>
            <div>
              <div className={styles.profileEmail}>{user?.email}</div>
              <div className={styles.profilePlan}>
                {isPro ? <span className={styles.proBadge}>Pro</span> : 'Free plan'}
              </div>
            </div>
          </div>
        </Card>

        {/* Usage */}
        <Card title="Usage this month">
          <div className={styles.usageRow}>
            <span className={styles.usageCount}>
              {usage?.analyses_this_month ?? 0}
              {!isPro && ` / ${FREE_LIMIT}`}
            </span>
            <span className={styles.usageUnit}>analyses</span>
          </div>
          {!isPro && (
            <div className={styles.usageBar}>
              <div
                className={styles.usageFill}
                style={{ width: `${Math.min(100, ((usage?.analyses_this_month ?? 0) / FREE_LIMIT) * 100)}%` }}
              />
            </div>
          )}
        </Card>

        {/* API Key */}
        <Card title="Anthropic API key">
          <p className={styles.cardSub}>
            Used to run analyses. Stored only in your browser.{' '}
            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener" className={styles.link}>
              Get a key →
            </a>
          </p>
          <div className={styles.keyRow}>
            <input
              type="password"
              className={styles.input}
              placeholder="sk-ant-..."
              value={key}
              onChange={e => setKey(e.target.value)}
            />
            <button className={styles.saveBtn} onClick={saveKey}>Save</button>
          </div>
        </Card>

        {/* Billing */}
        {!isPro && (
          <Card title="Upgrade to Pro">
            <p className={styles.cardSub}>Unlimited analyses, priority processing, early access to new features.</p>
            <div className={styles.priceRow}>
              <span className={styles.price}>$19</span>
              <span className={styles.priceSub}> / month</span>
            </div>
            <button className={styles.upgradeBtn} onClick={handleUpgrade} disabled={upgrading}>
              {upgrading ? 'Redirecting…' : 'Upgrade to Pro →'}
            </button>
          </Card>
        )}

        {isPro && (
          <Card title="Billing">
            <p className={styles.cardSub}>You're on the Pro plan. Manage your subscription in the Stripe portal.</p>
            <a href="/api/portal" className={styles.portalBtn}>Manage billing →</a>
          </Card>
        )}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>{title}</div>
      {children}
    </div>
  );
}
