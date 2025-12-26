export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // In-memory storage
  let requests = [];
  
  try {
    // GET - Return all requests
    if (req.method === 'GET') {
      return res.status(200).json(requests);
    }
    
    // POST - Create new request
    if (req.method === 'POST') {
      const body = req.body;
      const { clanName, description, leader, memberCount } = body;
      
      // Validate required fields
      if (!clanName || !description || !leader) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Create new request
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
    }
    
    // PATCH - Update request status
    if (req.method === 'PATCH') {
      const body = req.body;
      const { password, id, action } = body;
      
      // Get admin password
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
      
      // Verify admin
      if (!password || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Find request
      const requestIndex = requests.findIndex(r => r.id === id);
      if (requestIndex === -1) {
        return res.status(404).json({ error: 'Request not found' });
      }
      
      // Update request
      requests[requestIndex].status = action === 'approve' ? 'approved' : 'rejected';
      requests[requestIndex].processedAt = new Date().toISOString();
      
      return res.status(200).json({ 
        success: true, 
        request: requests[requestIndex] 
      });
    }
    
    // If method not supported
    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'OPTIONS']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
