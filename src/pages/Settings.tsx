import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { apiGet, apiPost } from '../lib/api';
import type { UserUsage } from '../lib/types';
import styles from './Settings.module.css';

const FREE_LIMIT = 10;

export default function Settings() {
  const { getToken } = useAuth();
  const [usage, setUsage]         = useState<UserUsage | null>(null);
  const [key, setKey]             = useState(() => localStorage.getItem('da_anthropic_key') ?? '');
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    apiGet('/api/usage', getToken).then(setUsage).catch(() => {});
  }, []);

  function saveKey() {
    localStorage.setItem('da_anthropic_key', key.trim());
    toast.success('API key saved');
  }

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const { url } = await apiPost('/api/checkout', { plan: 'pro' }, getToken);
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

        <Card title="API key">
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
            <p className={styles.cardSub}>You're on the Pro plan.</p>
            <button className={styles.upgradeBtn} onClick={async () => {
              const { url } = await apiPost('/api/portal', {}, getToken);
              if (url) window.location.href = url;
            }}>
              Manage billing →
            </button>
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
