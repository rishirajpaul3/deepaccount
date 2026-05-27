import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Analysis } from '../lib/supabase';
import styles from './ResultsView.module.css';

interface Props {
  analysis: Analysis;
  onBack?: () => void;
}

export default function ResultsView({ analysis, onBack }: Props) {
  const r = analysis.result as any;
  const contacts: any[] = r.contacts ?? [];
  const score: number = r.fit_score ?? 0;

  const shareUrl = `${window.location.origin}/share/${analysis.id}`;

  function copyFirstLine() {
    navigator.clipboard.writeText(r.first_line ?? '');
    toast.success('Copied to clipboard');
  }

  function copyShareLink() {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied');
  }

  return (
    <div className={styles.wrap}>
      {/* Top bar */}
      <div className={styles.topBar}>
        {onBack && (
          <button className={styles.backBtn} onClick={onBack}>← Back</button>
        )}
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={copyShareLink}>Share</button>
          <button className={styles.actionBtnPrimary} onClick={copyFirstLine}>Copy first line</button>
        </div>
      </div>

      {/* Company header */}
      <div className={styles.companyHeader}>
        <div>
          <h1 className={`${styles.companyName} serif`}>{r.company_name ?? analysis.company_url}</h1>
          <div className={styles.meta}>
            <span>{r.industry}</span>
            {r.company_size && <><span className={styles.dot}>·</span><span>{r.company_size}</span></>}
          </div>
        </div>
        <FitScore score={score} />
      </div>

      {/* Summary */}
      {r.fit_summary && (
        <div className={styles.summary}>{r.fit_summary}</div>
      )}

      {/* Flags row */}
      <div className={styles.flagsRow}>
        <FlagBox title="Green flags" items={r.green_flags ?? []} variant="green" />
        <FlagBox title="Red flags" items={r.red_flags ?? []} variant="red" />
      </div>

      {/* Pain points */}
      {r.pain_points?.length > 0 && (
        <Section title="Pain points">
          <ul className={styles.list}>
            {r.pain_points.map((p: string, i: number) => (
              <li key={i} className={styles.listItem}>{p}</li>
            ))}
          </ul>
        </Section>
      )}

      {/* Value prop */}
      {r.value_prop && (
        <Section title="Your angle">
          <p className={styles.valueProp}>{r.value_prop}</p>
        </Section>
      )}

      {/* First line */}
      {r.first_line && (
        <Section title="First line" action={<button className={styles.copyBtn} onClick={copyFirstLine}>Copy</button>}>
          <div className={styles.firstLine}>{r.first_line}</div>
        </Section>
      )}

      {/* Contacts */}
      {contacts.length > 0 && (
        <Section title="Buyer contacts">
          <div className={styles.contactGrid}>
            {contacts.map((c, i) => (
              <ContactCard key={i} contact={c} />
            ))}
          </div>
        </Section>
      )}

      {/* Tech signals */}
      {r.tech_signals?.length > 0 && (
        <Section title="Tech signals">
          <div className={styles.tagRow}>
            {r.tech_signals.map((t: string, i: number) => (
              <span key={i} className={styles.tag}>{t}</span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function FitScore({ score }: { score: number }) {
  const color = score >= 70 ? 'var(--green)' : score >= 45 ? 'var(--accent)' : 'var(--red)';
  return (
    <div className={styles.scoreWrap}>
      <div className={styles.score} style={{ color }}>{score}</div>
      <div className={styles.scoreLabel}>Fit score</div>
    </div>
  );
}

function FlagBox({ title, items, variant }: { title: string; items: string[]; variant: 'green' | 'red' }) {
  if (!items.length) return null;
  return (
    <div className={`${styles.flagBox} ${variant === 'green' ? styles.flagGreen : styles.flagRed}`}>
      <div className={styles.flagTitle}>{title}</div>
      <ul className={styles.flagList}>
        {items.map((f, i) => <li key={i}>{f}</li>)}
      </ul>
    </div>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <div className={styles.sectionTitle}>{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

function ContactCard({ contact }: { contact: any }) {
  return (
    <div className={styles.contactCard}>
      {contact.photo_url && (
        <img src={contact.photo_url} alt={contact.name} className={styles.contactPhoto} />
      )}
      <div className={styles.contactInfo}>
        <div className={styles.contactName}>{contact.name}</div>
        <div className={styles.contactTitle}>{contact.title}</div>
      </div>
      {contact.linkedin_url && (
        <a href={contact.linkedin_url} target="_blank" rel="noopener" className={styles.liBtn}>
          LinkedIn →
        </a>
      )}
    </div>
  );
}
