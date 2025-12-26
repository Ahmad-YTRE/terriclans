import { useEffect, useState } from "react";

export default function Home() {
  const [clans, setClans] = useState([]);
  const [clanName, setClanName] = useState("");
  const [description, setDescription] = useState("");
  const [leader, setLeader] = useState("");
  const [memberCount, setMemberCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all clans
  const fetchClans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clans");
      
      // Check for 405 error specifically
      if (res.status === 405) {
        console.warn("API returned 405 - using fallback data");
        // Use fallback data if API has issues
        setClans([]);
        return;
      }
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      // Handle both array format and object with clans property
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
    // Validate inputs
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

      // Log response for debugging
      console.log("Response status:", res.status);
      
      if (!res.ok) {
        let errorMessage = "Failed to send request";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response isn't JSON, use status text
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await res.json();
      alert("Clan request sent successfully!");
      
      // Reset form
      setClanName("");
      setDescription("");
      setLeader("");
      setMemberCount(1);
      
      // Refresh clans if request was approved (for immediate feedback)
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

  // Handle form submit with Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !requestLoading) {
      sendRequest();
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Terriclans</h1>
        <p className="text-gray-600 mt-2">Join or create gaming clans</p>
      </header>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Clans Display Section */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Existing Clans</h2>
          <button 
            onClick={fetchClans}
            disabled={loading}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading clans...</p>
          </div>
        ) : clans.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No clans have been created yet.</p>
            <p className="text-sm text-gray-400 mt-1">Be the first to request a clan!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clans.map((clan) => (
              <div
                key={clan.id || clan.name}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800 truncate">{clan.name}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                    {clan.memberCount || 1} members
                  </span>
                </div>
                <p className="text-gray-700 mb-3 line-clamp-3">{clan.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-600 pt-3 border-t border-gray-100">
                  <span className="font-medium">👑 {clan.leader || "Unknown"}</span>
                  <span className="text-xs text-gray-400">
                    {clan.createdAt ? new Date(clan.createdAt).toLocaleDateString() : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Request Form Section */}
      <section className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Request a New Clan</h2>
        <p className="text-gray-600 mb-6">Fill out the form below to submit a clan request for admin approval.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clan Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Dragon Warriors"
              value={clanName}
              onChange={(e) => setClanName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              disabled={requestLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leader Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Your username"
              value={leader}
              onChange={(e) => setLeader(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              disabled={requestLoading}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Describe your clan's purpose, focus (PvE, PvP, social), rules, requirements, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
              disabled={requestLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              disabled={requestLoading}
            />
            <p className="text-xs text-gray-500 mt-1">How many members will start in the clan?</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            <p>All requests are reviewed by administrators.</p>
            <p>You'll be notified when your request is approved or rejected.</p>
          </div>
          
          <button
            onClick={sendRequest}
            disabled={requestLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>Having issues? Check the console for error details or contact support.</p>
        <p className="mt-1">Note: Data resets on server restart (development mode).</p>
      </div>
    </div>
  );
}
