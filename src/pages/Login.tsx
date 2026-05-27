import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useSignIn } from '@clerk/clerk-react';
import styles from './Login.module.css';

export default function Login() {
  const { isSignedIn } = useUser();
  const { signIn, isLoaded } = useSignIn();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) navigate('/dashboard', { replace: true });
  }, [isSignedIn, navigate]);

  const params = new URLSearchParams(window.location.search);
  const plan = params.get('plan');

  async function handleGoogle() {
    if (!isLoaded || !signIn) return;
    await signIn.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: `${window.location.origin}/sso-callback`,
      redirectUrlComplete: '/dashboard',
    });
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={`${styles.logo} serif`}>Deep<em>Account</em></div>
        <h1 className={styles.heading}>
          {plan === 'pro' ? 'Start your Pro trial' : 'Sign in to DeepAccount'}
        </h1>
        <p className={styles.sub}>
          {plan === 'pro'
            ? 'Create your account to continue to Pro checkout.'
            : 'Get fit scores, buyer contacts, and first lines in 30 seconds.'}
        </p>
        <button className={styles.googleBtn} onClick={handleGoogle} disabled={!isLoaded}>
          <GoogleIcon />
          Continue with Google
        </button>
        <p className={styles.legal}>
          By signing in you agree to our{' '}
          <a href="/terms" className={styles.legalLink}>Terms</a> and{' '}
          <a href="/privacy" className={styles.legalLink}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
