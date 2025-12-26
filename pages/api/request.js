// In-memory storage (resets on server restart)
let requests = [];

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // GET all requests
  if (req.method === 'GET') {
    return res.status(200).json(requests);
  }
  
  // POST new request
  if (req.method === 'POST') {
    try {
      const { clanName, description, leader, memberCount } = req.body;
      
      if (!clanName || !description || !leader) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const newRequest = {
        id: Date.now(),
        clanName,
        description,
        leader,
        memberCount: parseInt(memberCount) || 1,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      requests.push(newRequest);
      return res.status(200).json({ success: true, request: newRequest });
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
  
  // PATCH update request (admin)
  if (req.method === 'PATCH') {
    try {
      const { password, id, action } = req.body;
      
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
      
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const requestIndex = requests.findIndex(r => r.id === id);
      if (requestIndex === -1) {
        return res.status(404).json({ error: 'Request not found' });
      }
      
      const request = requests[requestIndex];
      request.status = action === 'approve' ? 'approved' : 'rejected';
      request.processedAt = new Date().toISOString();
      
      // If approved, add to clans
      if (action === 'approve') {
        // We'll add to clans array (in a real app, we would import clans)
        // For now, the admin will need to manually create the clan
      }
      
      return res.status(200).json({ success: true, request: requests[requestIndex] });
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
  
  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'OPTIONS']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
