import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Header.module.css';

interface Props {
  usage?: { count: number; plan: string } | null;
}

const FREE_LIMIT = 10;

export default function Header({ usage }: Props) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <header className={styles.header}>
      <Link to={user ? '/dashboard' : '/'} className={styles.logo}>
        Deep<em>Account</em>
      </Link>

      <div className={styles.right}>
        {usage && (
          <div className={styles.usage}>
            {usage.plan === 'free'
              ? <><span className={styles.usageCount}>{usage.count}/{FREE_LIMIT}</span> free</>
              : <span className={styles.proBadge}>Pro</span>
            }
          </div>
        )}
        {user ? (
          <div className={styles.userMenu}>
            <Link to="/settings" className={styles.settingsBtn}>Settings</Link>
            <button className={styles.signOutBtn} onClick={handleSignOut}>Sign out</button>
          </div>
        ) : (
          <Link to="/login" className={styles.loginBtn}>Sign in</Link>
        )}
      </div>
    </header>
  );
}
