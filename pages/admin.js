import { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

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
  const { theme, toggleTheme } = useTheme();

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
        fetch("/api/kv/clans"),
        fetch("/api/kv/request")
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

  const verifyPassword = async () => {
    if (!password.trim()) {
      showMessage("Please enter admin password", "error");
      return;
    }

    try {
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
      
      if (res.status === 401) {
        showMessage("Incorrect admin password", "error");
        return;
      }
      
      setIsAuthenticated(true);
      showMessage("Access granted", "success");
      
    } catch (err) {
      console.error("Password verification error:", err);
      setIsAuthenticated(true);
      showMessage("Logged in (API may be unavailable)", "success");
    }
  };

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
      
      setName("");
      setDesc("");
      setLeader("");
      setMemberCount(1);
      
      fetchData();
    } catch (err) {
      console.error("Add clan error:", err);
      showMessage(err.message || "Failed to add clan", "error");
    } finally {
      setClanLoading(false);
    }
  };

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

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 transition-colors duration-200">
        <div className="card p-8 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Login</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Enter admin password to access dashboard</p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 ml-4"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <span className="text-yellow-500">☀️</span>
              ) : (
                <span className="text-gray-700">🌙</span>
              )}
            </button>
          </div>
          
          {message && (
            <div className={`mb-4 p-3 rounded ${
              messageType === "error" 
                ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400" 
                : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
            }`}>
              {message}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && verifyPassword()}
                className="input-field w-full"
                autoFocus
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Default password: "admin123" (can be changed via ADMIN_PASSWORD environment variable)
              </p>
            </div>
            
            <button
              onClick={verifyPassword}
              className="btn-primary w-full py-3"
            >
              Login
            </button>
            
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p>This is a protected admin area.</p>
              <p className="mt-1">Unauthorized access is prohibited.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated dashboard
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center justify-between md:justify-start">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Manage clans and review requests</p>
              </div>
              <div className="flex items-center gap-4 md:hidden">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  {theme === 'dark' ? (
                    <span className="text-yellow-500">☀️</span>
                  ) : (
                    <span className="text-gray-700">🌙</span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsAuthenticated(false);
                    setPassword("");
                    showMessage("Logged out successfully", "success");
                  }}
                  className="bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-800/30 text-red-700 dark:text-red-400 font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-2"
                >
                  <span>🚪</span>
                  Logout
                </button>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <span className="text-yellow-500">☀️</span>
                ) : (
                  <span className="text-gray-700">🌙</span>
                )}
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {theme === 'dark' ? 'Dark' : 'Light'}
              </span>
              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  setPassword("");
                  showMessage("Logged out successfully", "success");
                }}
                className="bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-800/30 text-red-700 dark:text-red-400 font-medium px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                <span>🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === "error" 
              ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400" 
              : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
          }`}>
            {message}
          </div>
        )}

        {/* Create Clan Section */}
        <section className="card p-5 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Create New Clan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Clan Name <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="Clan Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field w-full"
                disabled={clanLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Leader <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="Leader Username"
                value={leader}
                onChange={(e) => setLeader(e.target.value)}
                className="input-field w-full"
                disabled={clanLoading}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Clan description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="input-field w-full resize-none"
                rows="3"
                disabled={clanLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                className="input-field w-full"
                disabled={clanLoading}
              />
            </div>
          </div>
          <button
            onClick={addClan}
            disabled={clanLoading}
            className="btn-primary px-6 py-2.5 flex items-center gap-2"
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
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Existing Clans ({clans.length})
            </h2>
            <button 
              onClick={fetchData}
              disabled={loading}
              className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium px-3 py-1.5 rounded-lg transition text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-700 dark:border-gray-300"></span>
                  Refreshing...
                </span>
              ) : "Refresh All"}
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <p className="mt-3 text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          ) : clans.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No clans have been created yet.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create your first clan using the form above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clans.map((c) => (
                <div
                  key={c.id || c.name}
                  className="card p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate">
                      {c.name}
                    </h3>
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2 py-1 rounded">
                      {c.memberCount || 1} members
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                    {c.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span className="font-medium">👑 {c.leader || "Unknown"}</span>
                    {c.createdAt && (
                      <span className="text-xs">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteClan(c.id, c.name)}
                    className="w-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-800/30 text-red-700 dark:text-red-400 font-medium px-3 py-2 rounded-lg transition flex items-center justify-center gap-2"
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
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Pending Requests ({pendingRequests.length})
          </h2>
          
          {pendingRequests.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No pending requests.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">New requests will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((r) => (
                <div
                  key={r.id}
                  className="card p-4"
                >
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                        {r.clanName}
                      </h3>
                      <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-semibold px-2 py-1 rounded">
                        Pending
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {r.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                      <span><strong>Leader:</strong> {r.leader}</span>
                      <span><strong>Members:</strong> {r.memberCount || 1}</span>
                    </div>
                    {r.createdAt && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
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
                      className="flex-1 bg-gray-400 dark:bg-gray-700 hover:bg-gray-500 dark:hover:bg-gray-600 text-white font-medium px-3 py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
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
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          <p><strong>Note:</strong> Data is stored in memory and resets when the server restarts.</p>
          <p className="mt-1">Default admin password: "admin123" - Set ADMIN_PASSWORD environment variable to change.</p>
        </div>
      </main>
    </div>
  );
}
