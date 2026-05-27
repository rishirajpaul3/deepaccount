export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { domain, championTitle, dmTitle } = req.body || {};
  if (!domain) return res.status(400).json({ error: 'domain required' });

  const key = process.env.APOLLO_API_KEY;
  if (!key) return res.status(503).json({ error: 'Contact search not configured' });

  async function searchPeople(titleKeyword) {
    const r = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        q_organization_domains_list: [domain],
        person_titles: [titleKeyword],
        per_page: 3,
        page: 1,
      }),
    });
    if (!r.ok) return [];
    const data = await r.json();
    return (data.people || []).map(p => ({
      name:         p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim(),
      title:        p.title || '',
      linkedin_url: p.linkedin_url || null,
      photo_url:    p.photo_url || null,
    })).filter(p => p.name);
  }

  try {
    const [champion, decisionMaker] = await Promise.all([
      championTitle ? searchPeople(championTitle) : Promise.resolve([]),
      dmTitle       ? searchPeople(dmTitle)       : Promise.resolve([]),
    ]);
    res.status(200).json({ champion, decisionMaker });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
