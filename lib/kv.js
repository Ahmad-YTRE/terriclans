// KV helper functions
export const kvHelpers = {
  // Get all clans from KV
  getClans: async () => {
    try {
      // We'll fetch from API instead of direct KV access
      const res = await fetch('/api/kv/clans')
      if (res.ok) {
        return await res.json()
      }
      return []
    } catch (error) {
      console.error('Error fetching clans:', error)
      return []
    }
  },

  // Add a clan to KV
  addClan: async (clan) => {
    try {
      const res = await fetch('/api/kv/clans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clan)
      })
      return await res.json()
    } catch (error) {
      console.error('Error adding clan:', error)
      return { success: false, error: error.message }
    }
  },

  // Delete a clan from KV
  deleteClan: async (id) => {
    try {
      const res = await fetch('/api/kv/clans', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      return await res.json()
    } catch (error) {
      console.error('Error deleting clan:', error)
      return { success: false, error: error.message }
    }
  },

  // Get all requests from KV
  getRequests: async () => {
    try {
      const res = await fetch('/api/kv/requests')
      if (res.ok) {
        return await res.json()
      }
      return []
    } catch (error) {
      console.error('Error fetching requests:', error)
      return []
    }
  },

  // Add a request to KV
  addRequest: async (request) => {
    try {
      const res = await fetch('/api/kv/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })
      return await res.json()
    } catch (error) {
      console.error('Error adding request:', error)
      return { success: false, error: error.message }
    }
  },

  // Update request status in KV
  updateRequestStatus: async (id, status) => {
    try {
      const res = await fetch('/api/kv/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      return await res.json()
    } catch (error) {
      console.error('Error updating request:', error)
      return { success: false, error: error.message }
    }
  }
}
