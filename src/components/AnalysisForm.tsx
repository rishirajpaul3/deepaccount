import { useState } from 'react';
import styles from './AnalysisForm.module.css';

interface Props {
  onSubmit: (url: string, icp: string, anthropicKey: string) => void;
  loading: boolean;
}

export default function AnalysisForm({ onSubmit, loading }: Props) {
  const [url, setUrl]   = useState('');
  const [icp, setIcp]   = useState('');
  const [key, setKey]   = useState(() => localStorage.getItem('da_anthropic_key') ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || !icp.trim() || !key.trim()) return;
    localStorage.setItem('da_anthropic_key', key);
    onSubmit(url.trim(), icp.trim(), key.trim());
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.heading}>
        <div className={styles.label}>New Analysis</div>
        <h1 className={`${styles.h1} serif`}>Analyze an account</h1>
        <p className={styles.sub}>Drop in a company URL and your ICP to get a full brief.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Company URL</label>
          <input
            className={styles.input}
            type="text"
            placeholder="e.g. salesforce.com"
            value={url}
            onChange={e => setUrl(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Your ICP</label>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            placeholder="e.g. B2B SaaS company, 50–500 employees, sales team of 10+, using Salesforce"
            value={icp}
            onChange={e => setIcp(e.target.value)}
            disabled={loading}
            rows={3}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>
            Anthropic API Key
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener"
              className={styles.keyLink}
            >
              Get key →
            </a>
          </label>
          <input
            className={styles.input}
            type="password"
            placeholder="sk-ant-..."
            value={key}
            onChange={e => setKey(e.target.value)}
            disabled={loading}
            required
          />
          <span className={styles.keyNote}>Stored locally in your browser. Never sent to our servers.</span>
        </div>

        <button className={styles.submitBtn} type="submit" disabled={loading || !url || !icp || !key}>
          {loading ? (
            <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Analyzing…</>
          ) : (
            'Run analysis →'
          )}
        </button>
      </form>

      {loading && (
        <div className={styles.progress}>
          <div className={styles.progressStep}>Scraping website…</div>
          <div className={styles.progressStep}>Finding contacts…</div>
          <div className={styles.progressStep}>Running AI analysis…</div>
        </div>
      )}
    </div>
  );
}
