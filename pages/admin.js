import { useEffect, useState } from "react";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [clans, setClans] = useState([]);
  const [requests, setRequests] = useState([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [leader, setLeader] = useState("");
  const [memberCount, setMemberCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clanLoading, setClanLoading] = useState(false);
  const [requestActionLoading, setRequestActionLoading] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clanRes, reqRes] = await Promise.all([
        fetch("/api/clans"),
        fetch("/api/request")
      ]);
      
      let clansData = [];
      let requestsData = [];
      
      // Handle clans response
      if (clanRes.status === 405) {
        console.warn("Clans API returned 405");
        clansData = [];
      } else if (clanRes.ok) {
        const data = await clanRes.json();
        clansData = Array.isArray(data) ? data : [];
      }
      
      // Handle requests response
      if (reqRes.status === 405) {
        console.warn("Requests API returned 405");
        requestsData = [];
      } else if (reqRes.ok) {
        const data = await reqRes.json();
        requestsData = Array.isArray(data) ? data : [];
      }
      
      setClans(clansData);
      setRequests(requestsData);
    } catch (err) {
      console.error("Failed to load data:", err);
      showMessage("Failed to load data. Check console for details.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add new clan
  const addClan = async () => {
    // Validation
    if (!password) {
      showMessage("Please enter admin password", "error");
      return;
    }
    if (!name.trim()) {
      showMessage("Please enter clan name", "error");
      return;
    }
    if (!desc.trim()) {
      showMessage("Please enter description", "error");
      return;
    }
    if (!leader.trim()) {
      showMessage("Please enter leader name", "error");
      return;
    }
    
    setClanLoading(true);

    try {
      const res = await fetch("/api/clans", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          password, 
          name: name.trim(), 
          description: desc.trim(),
          leader: leader.trim(),
          memberCount: parseInt(memberCount) || 1
        }),
      });
      
      console.log("Add clan response status:", res.status);
      
      if (!res.ok) {
        let errorMessage = "Failed to add clan";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await res.json();
      showMessage("Clan added successfully!");
      
      // Reset form
      setName("");
      setDesc("");
      setLeader("");
      setMemberCount(1);
      
      // Refresh data
      fetchData();
    } catch (err) {
      console.error("Add clan error:", err);
      showMessage(err.message || "Failed to add clan", "error");
    } finally {
      setClanLoading(false);
    }
  };

  // Delete clan
  const deleteClan = async (id, clanName) => {
    if (!password) {
      showMessage("Please enter admin password first", "error");
      return;
    }
    
    if (!confirm(`Are you sure you want to delete clan "${clanName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch("/api/clans", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, id }),
      });
      
      console.log("Delete clan response status:", res.status);
      
      if (!res.ok) {
        let errorMessage = "Failed to delete clan";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      showMessage(`Clan "${clanName}" deleted successfully!`);
      fetchData();
    } catch (err) {
      console.error("Delete clan error:", err);
      showMessage(err.message || "Failed to delete clan", "error");
    }
  };

  // Approve/Reject request
  const handleRequest = async (id, action, clanName) => {
    if (!password) {
      showMessage("Please enter admin password first", "error");
      return;
    }
    
    const actionText = action === "approve" ? "approve" : "reject";
    if (!confirm(`Are you sure you want to ${actionText} the request for "${clanName}"?`)) {
      return;
    }

    setRequestActionLoading(id);

    try {
      const res = await fetch("/api/request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, id, action }),
      });
      
      console.log("Request action response status:", res.status);
      
      if (!res.ok) {
        let errorMessage = `Failed to ${action} request`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      showMessage(`Request ${action === "approve" ? "approved" : "rejected"} successfully!`);
      fetchData();
    } catch (err) {
      console.error("Request action error:", err);
      showMessage(err.message || `Failed to ${action} request`, "error");
    } finally {
      setRequestActionLoading(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const approvedRequests = requests.filter((r) => r.status === "approved");
  const rejectedRequests = requests.filter((r) => r.status === "rejected");

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage clans and review requests</p>
      </header>

      {/* Message Display */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          messageType === "error" 
            ? "bg-red-50 border border-red-200 text-red-700" 
            : "bg-green-50 border border-green-200 text-green-700"
        }`}>
          {message}
        </div>
      )}

      {/* Admin Password */}
      <div className="bg-white p-5 rounded-lg shadow border border-gray-200 mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Admin Password <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2.5 w-full md:w-1/3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <p className="text-sm text-gray-500 mt-2">
          Password is required for admin actions. Default: "admin123" (set ADMIN_PASSWORD in Vercel to change)
        </p>
      </div>

      {/* Create Clan Section */}
      <section className="bg-white p-5 rounded-lg shadow border border-gray-200 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Create New Clan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clan Name <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="Clan Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={clanLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leader <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="Leader Username"
              value={leader}
              onChange={(e) => setLeader(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={clanLoading}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Clan description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              rows="3"
              disabled={clanLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Member Count
            </label>
            <input
              type="number"
              min="1"
              value={memberCount}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 1) setMemberCount(val);
              }}
              className="border border-gray-300 rounded-lg px-4 py-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={clanLoading}
            />
          </div>
        </div>
        <button
          onClick={addClan}
          disabled={clanLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {clanLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating...
            </>
          ) : (
            "Create Clan"
          )}
        </button>
      </section>

      {/* Existing Clans Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Existing Clans ({clans.length})
          </h2>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded"
          >
            {loading ? "Refreshing..." : "Refresh All"}
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : clans.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">No clans have been created yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clans.map((c) => (
              <div
                key={c.id || c.name}
                className="bg-white p-4 rounded-lg shadow border border-gray-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-gray-800 truncate">{c.name}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                    {c.memberCount || 1} members
                  </span>
                </div>
                <p className="text-gray-700 mb-4 line-clamp-3">{c.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                  <span className="font-medium">👑 {c.leader || "Unknown"}</span>
                  {c.createdAt && (
                    <span className="text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteClan(c.id, c.name)}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-medium px-3 py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <span>🗑️</span>
                  Delete Clan
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending Requests Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Pending Requests ({pendingRequests.length})
        </h2>
        
        {pendingRequests.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">No pending requests.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((r) => (
              <div
                key={r.id}
                className="bg-white p-4 rounded-lg shadow border border-gray-200"
              >
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800">{r.clanName}</h3>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                      Pending
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{r.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span><strong>Leader:</strong> {r.leader}</span>
                    <span><strong>Members:</strong> {r.memberCount || 1}</span>
                  </div>
                  {r.createdAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      Submitted: {new Date(r.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRequest(r.id, "approve", r.clanName)}
                    disabled={requestActionLoading === r.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {requestActionLoading === r.id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span>✓</span>
                        Approve
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleRequest(r.id, "reject", r.clanName)}
                    disabled={requestActionLoading === r.id}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-medium px-3 py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {requestActionLoading === r.id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span>✗</span>
                        Reject
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Request History Section */}
      {(approvedRequests.length > 0 || rejectedRequests.length > 0) && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Request History</h2>
          
          <div className="space-y-3">
            {approvedRequests.map((r) => (
              <div key={r.id} className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <span className="font-medium text-green-800">{r.clanName}</span>
                  <span className="text-green-600 ml-2">✓ Approved</span>
                  <p className="text-sm text-gray-600 truncate">{r.description}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {r.processedAt ? new Date(r.processedAt).toLocaleDateString() : ""}
                </span>
              </div>
            ))}
            
            {rejectedRequests.map((r) => (
              <div key={r.id} className="bg-red-50 border border-red-200 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <span className="font-medium text-red-800">{r.clanName}</span>
                  <span className="text-red-600 ml-2">✗ Rejected</span>
                  <p className="text-sm text-gray-600 truncate">{r.description}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {r.processedAt ? new Date(r.processedAt).toLocaleDateString() : ""}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer Notes */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
        <p><strong>Note:</strong> Data is stored in memory and resets when the server restarts.</p>
        <p className="mt-1">For permanent storage, consider adding a database like Vercel KV or Supabase.</p>
      </div>
    </div>
  );
}
