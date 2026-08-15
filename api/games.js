export default async function handler(req, res) {
  // Enable CORS so your index.html can query this route
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { keyword } = req.query;
  const targetUrl = keyword
    ? `https://games.roblox.com/v1/games/list?keyword=${encodeURIComponent(keyword)}&limit=30`
    : `https://games.roblox.com/v1/games/list?sortFilter=1&limit=40`;

  try {
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    if (!response.ok) {
      throw new Error(`Roblox API responded with ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message, games: [] });
  }
}
