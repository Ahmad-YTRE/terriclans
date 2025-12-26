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

  const fetchData = async () => {
    try {
      const [clanRes, reqRes] = await Promise.all([
        fetch("/api/clans"),
        fetch("/api/request")
      ]);
      
      if (!clanRes.ok) throw new Error("Failed to fetch clans");
      if (!reqRes.ok) throw new Error("Failed to fetch requests");
      
      setClans(await clanRes.json());
      setRequests(await reqRes.json());
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add new clan
  const addClan = async () => {
    if (!password || !name || !desc || !leader) {
      alert("Please fill all required fields");
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch("/api/clans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          password, 
          name, 
          description: desc,
          leader,
          memberCount: parseInt(memberCount) || 1
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add clan");
      }

      alert("Clan added successfully!");
      setName("");
      setDesc("");
      setLeader("");
      setMemberCount(1);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to add clan");
    } finally {
      setLoading(false);
    }
  };

  // Delete clan
  const deleteClan = async (id, clanName) => {
    if (!password) {
      alert("Enter admin password first");
      return;
    }
    
    if (!confirm(`Are you sure you want to delete "${clanName}"?`)) {
      return;
    }

    try {
      const res = await fetch("/api/clans", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, id }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete clan");
      }
      
      alert("Clan deleted successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete clan");
    }
  };

  // Approve/Reject request
  const handleRequest = async (id, action, clanName) => {
    if (!password) {
      alert("Enter admin password first");
      return;
    }
    
    const actionText = action === "approve" ? "approve" : "reject";
    if (!confirm(`Are you sure you want to ${actionText} "${clanName}"?`)) {
      return;
    }

    try {
      const res = await fetch("/api/request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, id, action }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update request");
      }
      
      alert(`Request ${actionText}d successfully!`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update request");
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>

      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">Admin Password</label>
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />
      </div>

      {/* Add Clan Section */}
      <section className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Create New Clan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Clan Name *</label>
            <input
              placeholder="Clan Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Leader *</label>
            <input
              placeholder="Leader Username"
              value={leader}
              onChange={(e) => setLeader(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              placeholder="Clan description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="border p-2 rounded w-full"
              rows="3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Member Count</label>
            <input
              type="number"
              min="1"
              value={memberCount}
              onChange={(e) => setMemberCount(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>
        <button
          onClick={addClan}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Clan"}
        </button>
      </section>

      {/* Existing Clans */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Existing Clans ({clans.length})</h2>
        {clans.length === 0 ? (
          <p className="text-gray-500">No clans yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clans.map((c) => (
              <div
                key={c.id}
                className="bg-white p-4 rounded shadow flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-lg">{c.name}</h3>
                  <p className="text-gray-700 my-2">{c.description}</p>
                  <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span><strong>Leader:</strong> {c.leader}</span>
                    <span><strong>Members:</strong> {c.memberCount}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteClan(c.id, c.name)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 self-end"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending Requests */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Pending Requests ({pendingRequests.length})
        </h2>
        {pendingRequests.length === 0 ? (
          <p className="text-gray-500">No pending requests.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((r) => (
              <div
                key={r.id}
                className="bg-white p-4 rounded shadow"
              >
                <div className="mb-3">
                  <h3 className="font-bold text-lg">{r.clanName}</h3>
                  <p className="text-gray-700 my-2">{r.description}</p>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span><strong>Leader:</strong> {r.leader}</span>
                    <span><strong>Members:</strong> {r.memberCount}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRequest(r.id, "approve", r.clanName)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex-1"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRequest(r.id, "reject", r.clanName)}
                    className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 flex-1"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
