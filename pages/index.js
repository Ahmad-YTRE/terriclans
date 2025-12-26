import { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

export default function Home() {
  const [clans, setClans] = useState([]);
  const [clanName, setClanName] = useState("");
  const [description, setDescription] = useState("");
  const [leader, setLeader] = useState("");
  const [memberCount, setMemberCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [error, setError] = useState("");
  const { theme, toggleTheme } = useTheme();

  // Fetch all clans
  const fetchClans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clans");
      
      if (res.status === 405) {
        console.warn("API returned 405 - using fallback data");
        setClans([]);
        return;
      }
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      if (Array.isArray(data)) {
        setClans(data);
      } else if (data && data.clans) {
        setClans(data.clans);
      } else {
        setClans([]);
      }
    } catch (err) {
      console.error("Failed to fetch clans:", err);
      setClans([]);
      setError("Unable to load clans. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClans();
  }, []);

  // Submit a clan request
  const sendRequest = async () => {
    if (!clanName.trim()) {
      alert("Please enter a clan name");
      return;
    }
    if (!description.trim()) {
      alert("Please enter a description");
      return;
    }
    if (!leader.trim()) {
      alert("Please enter a leader name");
      return;
    }
    
    setRequestLoading(true);
    setError("");

    try {
      const res = await fetch("/api/request", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          clanName: clanName.trim(), 
          description: description.trim(), 
          leader: leader.trim(),
          memberCount: parseInt(memberCount) || 1
        }),
      });
      
      if (!res.ok) {
        let errorMessage = "Failed to send request";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await res.json();
      alert("Clan request sent successfully!");
      
      setClanName("");
      setDescription("");
      setLeader("");
      setMemberCount(1);
      
      if (result.success) {
        fetchClans();
      }
    } catch (err) {
      console.error("Request error:", err);
      alert(err.message || "Failed to send request. Please try again.");
      setError(err.message);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !requestLoading) {
      sendRequest();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header with theme toggle */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Terriclans</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Join or create gaming clans</p>
            </div>
            <div className="flex items-center gap-4">
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
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Clans Display Section */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">
              Existing Clans
            </h2>
            <button 
              onClick={fetchClans}
              disabled={loading}
              className="btn-secondary"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-700 dark:border-gray-300"></span>
                  Refreshing...
                </span>
              ) : "Refresh"}
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <p className="mt-3 text-gray-600 dark:text-gray-400">Loading clans...</p>
            </div>
          ) : clans.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No clans have been created yet.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Be the first to request a clan!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clans.map((clan) => (
                <div
                  key={clan.id || clan.name}
                  className="card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate">
                      {clan.name}
                    </h3>
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2 py-1 rounded">
                      {clan.memberCount || 1} members
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
                    {clan.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span className="font-medium">👑 {clan.leader || "Unknown"}</span>
                    <span className="text-xs">
                      {clan.createdAt ? new Date(clan.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Request Form Section */}
        <section className="card p-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            Request a New Clan
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Fill out the form below to submit a clan request for admin approval.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Clan Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Dragon Warriors"
                value={clanName}
                onChange={(e) => setClanName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input-field w-full"
                disabled={requestLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Leader Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Your username"
                value={leader}
                onChange={(e) => setLeader(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input-field w-full"
                disabled={requestLoading}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Describe your clan's purpose, focus (PvE, PvP, social), rules, requirements, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="input-field w-full resize-none"
                disabled={requestLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Initial Member Count
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={memberCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1) {
                    setMemberCount(val);
                  }
                }}
                className="input-field w-full"
                disabled={requestLoading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                How many members will start in the clan?
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>All requests are reviewed by administrators.</p>
              <p>You'll be notified when your request is approved or rejected.</p>
            </div>
            
            <button
              onClick={sendRequest}
              disabled={requestLoading}
              className="btn-primary px-6 py-3 flex items-center gap-2"
            >
              {requestLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending Request...
                </>
              ) : (
                "Submit Clan Request"
              )}
            </button>
          </div>
        </section>
        
        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Having issues? Check the console for error details or contact support.</p>
          <p className="mt-1">Note: Data resets on server restart (development mode).</p>
        </div>
      </main>

      <style jsx>{`
        .btn-secondary {
          @apply bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium px-3 py-1.5 rounded-lg transition-colors duration-200 text-sm;
        }
      `}</style>
    </div>
  );
}
