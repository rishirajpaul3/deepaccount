type TokenGetter = () => Promise<string | null>;

async function request(path: string, options: RequestInit, getToken: TokenGetter) {
  const token = await getToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json();
}

export const apiGet  = (path: string, getToken: TokenGetter) =>
  request(path, { method: 'GET' }, getToken);

export const apiPost = (path: string, body: unknown, getToken: TokenGetter) =>
  request(path, { method: 'POST', body: JSON.stringify(body) }, getToken);
