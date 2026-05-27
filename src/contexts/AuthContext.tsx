import { useUser, useClerk, useAuth as useClerkAuth } from '@clerk/clerk-react';

export function useAuth() {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut }                   = useClerk();
  const { getToken }                  = useClerkAuth();

  const user = clerkUser
    ? { id: clerkUser.id, email: clerkUser.primaryEmailAddress?.emailAddress ?? '' }
    : null;

  return { user, loading: !isLoaded, signOut: () => signOut(), getToken };
}
