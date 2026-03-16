const API_KEY = 'fgsiapi-2974320d-6d';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const q = req.query.q || (req.body && req.body.q) || '';
  if (!q) return res.status(400).json({ error: 'Parameter q diperlukan' });

  const urls = [
    `https://fgsi.dpdns.org/api/ai/gemini?q=${encodeURIComponent(q)}&apikey=${API_KEY}`,
    `https://fgsi.dpdns.org/api/ai/gemini?q=${encodeURIComponent(q)}&key=${API_KEY}`,
    `https://fgsi.dpdns.org/api/ai/gemini?q=${encodeURIComponent(q)}`,
  ];

  const headers = {
    'User-Agent': 'Mozilla/5.0',
    'Accept': 'application/json',
    'x-api-key': API_KEY,
    'Authorization': `Bearer ${API_KEY}`,
  };

  let lastErr;
  for (const url of urls) {
    try {
      const response = await fetch(url, { headers });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { result: text }; }

      const reply =
        data?.result ?? data?.response ?? data?.answer ??
        data?.text   ?? data?.message  ?? data?.content ?? null;

      if (reply) return res.status(200).json({ result: reply });
      lastErr = new Error(data?.error || `HTTP ${response.status} - Respons kosong`);
    } catch (err) {
      lastErr = err;
    }
  }

  return res.status(500).json({ error: lastErr?.message || 'Gagal menghubungi API' });
};
