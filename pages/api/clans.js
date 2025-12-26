// In-memory storage (resets on server restart)
let clans = [];

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // GET all clans
  if (req.method === 'GET') {
    return res.status(200).json(clans);
  }
  
  // POST new clan (admin)
  if (req.method === 'POST') {
    try {
      const { password, name, description, leader, memberCount } = req.body;
      
      // Get admin password from environment or use default
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
      
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      if (!name || !description || !leader) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const newClan = {
        id: Date.now(),
        name,
        description,
        leader: leader || 'Unknown',
        memberCount: parseInt(memberCount) || 1,
        createdAt: new Date().toISOString()
      };
      
      clans.push(newClan);
      return res.status(200).json({ success: true, clan: newClan });
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
  
  // DELETE clan (admin)
  if (req.method === 'DELETE') {
    try {
      const { password, id } = req.body;
      
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
      
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      clans = clans.filter(clan => clan.id !== id);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
  
  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'OPTIONS']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
