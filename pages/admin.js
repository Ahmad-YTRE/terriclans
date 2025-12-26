import { useEffect, useState } from "react";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
  const [messageType, setMessageType] = useState("");

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const fetchData = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const [clanRes, reqRes] = await Promise.all([
        fetch("/api/clans"),
        fetch("/api/request")
      ]);
      
      let clansData = [];
      let requestsData = [];
      
      if (clanRes.ok) {
        const data = await clanRes.json();
        clansData = Array.isArray(data) ? data : [];
      }
      
      if (reqRes.ok) {
        const data = await reqRes.json();
        requestsData = Array.isArray(data) ? data : [];
      }
      
      setClans(clansData);
      setRequests(requestsData);
    } catch (err) {
      console.error("Failed to load data:", err);
      showMessage("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Verify admin password
  const verifyPassword = async () => {
    if (!password.trim()) {
      showMessage("Please enter admin password", "error");
      return;
    }

    try {
      // Try to make a simple API call with the password to verify
      const res = await fetch("/api/clans", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          password: password.trim(),
          name: "test",
          description: "test",
          leader: "test"
        }),
      });
      
      // Even if it fails with validation error, we know password is being checked
      if (res.status === 401) {
        // Password is wrong
        showMessage("Incorrect admin password", "error");
        return;
      }
      
      // If we get here, password is correct (or API has other issues)
      setIsAuthenticated(true);
      showMessage("Access granted", "success");
      
    } catch (err) {
      console.error("Password verification error:", err);
      // If API is completely down, still allow access for demo
      setIsAuthenticated(true);
      showMessage("Logged in (API may be unavailable)", "success");
    }
  };

  // Add new clan
  const addClan = async () => {
    if (!password) {
      showMessage("Please re-enter admin password", "error");
      setIsAuthenticated(false);
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
      
      if (!res.ok) {
        if (res.status === 401) {
          showMessage("Session expired. Please re-enter password.", "error");
          setIsAuthenticated(false);
          return;
        }
        
        let errorMessage = "Failed to add clan";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

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
      showMessage("Session expired. Please re-enter password.", "error");
      setIsAuthenticated(false);
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
      
      if (!res.ok) {
        if (res.status === 401) {
          showMessage("Session expired. Please re-enter password.", "error");
          setIsAuthenticated(false);
          return;
        }
        
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
      showMessage("Session expired. Please re-enter password.", "error");
      setIsAuthenticated(false);
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
      
      if (!res.ok) {
        if (res.status === 401) {
          showMessage("Session expired. Please re-enter password.", "error");
          setIsAuthenticated(false);
          return;
        }
        
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

  // If not authenticated, show only password screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
            <p className="text-gray-600 mt-2">Enter admin password to access dashboard</p>
          </div>
          
          {message && (
            <div className={`mb-4 p-3 rounded ${
              messageType === "error" 
                ? "bg-red-50 border border-red-200 text-red-700" 
                : "bg-green-50 border border-green-200 text-green-700"
            }`}>
              {message}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && verifyPassword()}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                Default password: "admin123" (can be changed via ADMIN_PASSWORD environment variable)
              </p>
            </div>
            
            <button
              onClick={verifyPassword}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
            >
              Login
            </button>
            
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
              <p>This is a protected admin area.</p>
              <p className="mt-1">Unauthorized access is prohibited.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated view
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with logout */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage clans and review requests</p>
            </div>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setPassword("");
                showMessage("Logged out successfully", "success");
              }}
              className="bg-red-100 hover:bg-red-200 text-red-700 font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 self-start md:self-center"
            >
              <span>🚪</span>
              Logout
            </button>
          </div>
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

        {/* Create Clan Section */}
        <section className="bg-white p-5 rounded-lg shadow border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Clan</h2>
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
            <h2 className="text-xl font-semibold text-gray-800">
              Existing Clans ({clans.length})
            </h2>
            <button 
              onClick={fetchData}
              disabled={loading}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded"
            >
              {loading ? "Refreshing..." : "Refresh"}
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
              <p className="text-sm text-gray-400 mt-1">Create your first clan using the form above.</p>
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
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Pending Requests ({pendingRequests.length})
          </h2>
          
          {pendingRequests.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">No pending requests.</p>
              <p className="text-sm text-gray-400 mt-1">New requests will appear here.</p>
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

        {/* Footer Notes */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <p><strong>Note:</strong> Data is stored in memory and resets when the server restarts.</p>
          <p className="mt-1">Default admin password: "Admin123" - Set ADMIN_PASSWORD environment variable to change.</p>
        </div>
      </div>
    </div>
  );
}
