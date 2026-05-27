import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import styles from './Landing.module.css';

const FEATURES = [
  { label: 'Fit Score', desc: '0–100 score with green/red flags showing exactly where the gap is.' },
  { label: 'Real Contacts', desc: 'Named people at the company — champion and decision maker — with LinkedIn links.' },
  { label: 'First Line', desc: 'One personalized cold outreach opener, ready to copy.' },
  { label: 'Shareable', desc: 'Every brief gets a URL. Send it to your manager before a call.' },
  { label: 'History', desc: 'Every analysis saved to your account. Accessible anywhere.' },
  { label: 'Fast', desc: 'Results in under 30 seconds. No waitlist, no setup.' },
];

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    sub: 'forever',
    features: ['10 analyses / month', 'Full account brief', 'Contact discovery', 'Shareable links'],
    cta: 'Get started',
    href: '/login',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$19',
    sub: '/ month',
    features: ['Unlimited analyses', 'Everything in Free', 'Priority processing', 'Early access to new features'],
    cta: 'Start Pro',
    href: '/login?plan=pro',
    highlight: true,
  },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  return (
    <div className={styles.page}>
      {/* Nav */}
      <header className={styles.nav}>
        <div className={`${styles.logo} serif`}>Deep<em>Account</em></div>
        <div className={styles.navRight}>
          <a href="#pricing" className={styles.navLink}>Pricing</a>
          <Link to="/login" className={styles.navCta}>Sign in →</Link>
        </div>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.badge}>B2B Account Intelligence</div>
        <h1 className={`${styles.h1} serif`}>
          Know your account<br />before the first call
        </h1>
        <p className={styles.sub}>
          Drop in a company URL and your ICP. Get fit score, real buyer contacts,
          and a personalized first line in under 30 seconds.
        </p>
        <div className={styles.heroCtas}>
          <Link to="/login" className={styles.primaryCta}>Get started free →</Link>
          <span className={styles.heroNote}>10 free analyses/month · No credit card</span>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.sectionLabel}>What you get</div>
        <div className={styles.featureGrid}>
          {FEATURES.map(f => (
            <div key={f.label} className={styles.featureCard}>
              <div className={styles.featureName}>{f.label}</div>
              <div className={styles.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.pricing} id="pricing">
        <div className={styles.sectionLabel}>Pricing</div>
        <h2 className={`${styles.h2} serif`}>Simple, honest pricing</h2>
        <div className={styles.pricingGrid}>
          {PRICING.map(p => (
            <div key={p.name} className={`${styles.pricingCard} ${p.highlight ? styles.pricingHighlight : ''}`}>
              <div className={styles.planName}>{p.name}</div>
              <div className={styles.planPrice}>
                {p.price}<span className={styles.planSub}>{p.sub}</span>
              </div>
              <ul className={styles.planFeatures}>
                {p.features.map(f => (
                  <li key={f} className={styles.planFeature}>
                    <span className={styles.checkmark}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link to={p.href} className={`${styles.planCta} ${p.highlight ? styles.planCtaHighlight : ''}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLeft}>
          Built by <strong>Rishiraj Paul</strong> · Powered by Claude + Firecrawl + Apollo
        </div>
        <a href="https://github.com/rishirajpaul3/deepaccount" target="_blank" rel="noopener" className={styles.footerLink}>
          GitHub
        </a>
      </footer>
    </div>
  );
}
