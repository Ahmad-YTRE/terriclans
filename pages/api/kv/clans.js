export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  try {
    // GET all clans
    if (req.method === 'GET') {
      // In a real implementation, this would fetch from Vercel KV
      // For now, we'll use a simple in-memory store
      const clans = []
      return res.status(200).json(clans)
    }
    
    // POST new clan
    if (req.method === 'POST') {
      const { password, name, description, leader, memberCount } = req.body
      
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
      
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
      
      if (!name || !description || !leader) {
        return res.status(400).json({ error: 'Missing required fields' })
      }
      
      const newClan = {
        id: Date.now(),
        name,
        description,
        leader,
        memberCount: parseInt(memberCount) || 1,
        createdAt: new Date().toISOString()
      }
      
      // In real implementation: await kv.set(`clan:${newClan.id}`, newClan)
      
      return res.status(200).json({ success: true, clan: newClan })
    }
    
    // DELETE clan
    if (req.method === 'DELETE') {
      const { password, id } = req.body
      
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
      
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
      
      // In real implementation: await kv.del(`clan:${id}`)
      
      return res.status(200).json({ success: true })
    }
    
    return res.status(405).json({ error: 'Method not allowed' })
    
  } catch (error) {
    console.error('KV API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
