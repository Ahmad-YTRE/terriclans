export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // In-memory storage (for Vercel - resets on cold start)
  let clans = [];
  
  try {
    // GET - Return all clans
    if (req.method === 'GET') {
      return res.status(200).json(clans);
    }
    
    // POST - Create new clan
    if (req.method === 'POST') {
      const body = req.body;
      const { password, name, description, leader, memberCount } = body;
      
      // Get admin password
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
      
      // Verify admin password
      if (!password || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Validate required fields
      if (!name || !description || !leader) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Create new clan
      const newClan = {
        id: Date.now(),
        name,
        description,
        leader,
        memberCount: parseInt(memberCount) || 1,
        createdAt: new Date().toISOString()
      };
      
      clans.push(newClan);
      return res.status(200).json({ success: true, clan: newClan });
    }
    
    // DELETE - Remove clan
    if (req.method === 'DELETE') {
      const body = req.body;
      const { password, id } = body;
      
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
      
      if (!password || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Filter out the clan to delete
      const filteredClans = clans.filter(clan => clan.id !== id);
      clans = filteredClans;
      
      return res.status(200).json({ success: true });
    }
    
    // If method not supported
    res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'OPTIONS']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
