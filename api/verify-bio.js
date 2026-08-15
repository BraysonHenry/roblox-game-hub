export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  try {
    // 1. Fetch User ID directly from Roblox official API
    const idResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
    });
    
    const idData = await idResponse.json();
    let userId = idData.data?.[0]?.id;

    // Search fallback if username search returned empty
    if (!userId) {
      const searchResponse = await fetch(`https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(username)}&limit=10`);
      const searchData = await searchResponse.json();
      const matched = searchData.data?.find(u => 
        u.name.toLowerCase() === username.toLowerCase() || 
        u.displayName.toLowerCase() === username.toLowerCase()
      );
      if (matched) userId = matched.id;
    }

    if (!userId) {
      return res.status(404).json({ error: 'Roblox user not found' });
    }

    // 2. Fetch User Profile Bio
    const profileResponse = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    const profileData = await profileResponse.json();

    return res.status(200).json({
      userId: userId,
      description: profileData.description || ''
    });

  } catch (error) {
    return res.status(500).json({ error: 'Failed to contact Roblox API' });
  }
}
