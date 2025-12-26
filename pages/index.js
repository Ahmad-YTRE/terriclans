import { useEffect, useState } from "react";

export default function Home() {
  const [clans, setClans] = useState([]);
  const [clanName, setClanName] = useState("");
  const [description, setDescription] = useState("");
  const [leader, setLeader] = useState("");
  const [memberCount, setMemberCount] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch all clans
  const fetchClans = async () => {
    try {
      const res = await fetch("/api/clans");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setClans(data);
    } catch (err) {
      console.error("Failed to fetch clans:", err);
      setClans([]);
    }
  };

  useEffect(() => {
    fetchClans();
  }, []);

  // Submit a clan request
  const sendRequest = async () => {
    if (!clanName || !description || !leader) {
      alert("Please fill all required fields");
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          clanName, 
          description, 
          leader,
          memberCount: parseInt(memberCount) || 1
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to send request");
      }

      alert("Clan request sent successfully!");
      setClanName("");
      setDescription("");
      setLeader("");
      setMemberCount(1);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Terriclans</h1>

      {clans.length === 0 ? (
        <p className="text-center text-gray-500 mb-8">No clans created yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {clans.map((c) => (
            <div
              key={c.id}
              className="bg-white p-4 rounded shadow hover:shadow-lg transition"
            >
              <h3 className="font-bold text-lg mb-2">{c.name}</h3>
              <p className="text-gray-700 mb-3">{c.description}</p>
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  <strong>Leader:</strong> {c.leader}
                </span>
                <span>
                  <strong>Members:</strong> {c.memberCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Request a New Clan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Clan Name *</label>
            <input
              type="text"
              placeholder="Enter clan name"
              value={clanName}
              onChange={(e) => setClanName(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Leader *</label>
            <input
              type="text"
              placeholder="Your username"
              value={leader}
              onChange={(e) => setLeader(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              placeholder="Describe your clan's purpose, rules, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 rounded w-full"
              rows="3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Initial Member Count</label>
            <input
              type="number"
              min="1"
              max="100"
              value={memberCount}
              onChange={(e) => setMemberCount(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>
        <button
          onClick={sendRequest}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Sending Request..." : "Submit Clan Request"}
        </button>
        <p className="text-sm text-gray-500 mt-2">
          * Required fields. Your request will be reviewed by an admin.
        </p>
      </div>
    </div>
  );
}
