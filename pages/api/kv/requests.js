export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  try {
    // GET all requests
    if (req.method === 'GET') {
      const requests = []
      return res.status(200).json(requests)
    }
    
    // POST new request
    if (req.method === 'POST') {
      const { clanName, description, leader, memberCount } = req.body
      
      if (!clanName || !description || !leader) {
        return res.status(400).json({ error: 'Missing required fields' })
      }
      
      const newRequest = {
        id: Date.now(),
        clanName,
        description,
        leader,
        memberCount: parseInt(memberCount) || 1,
        status: 'pending',
        createdAt: new Date().toISOString()
      }
      
      return res.status(200).json({ success: true, request: newRequest })
    }
    
    // PATCH update request
    if (req.method === 'PATCH') {
      const { password, id, status } = req.body
      
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
      
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
      
      // Update logic here
      
      return res.status(200).json({ success: true })
    }
    
    return res.status(405).json({ error: 'Method not allowed' })
    
  } catch (error) {
    console.error('KV API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
