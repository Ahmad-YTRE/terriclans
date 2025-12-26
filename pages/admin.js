import { useEffect, useState } from "react";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [clans, setClans] = useState([]);
  const [requests, setRequests] = useState([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [clanRes, reqRes] = await Promise.all([
        fetch("/api/clans"),
        fetch("/api/request"),
      ]);
      setClans(await clanRes.json());
      setRequests(await reqRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add new clan
  const addClan = async () => {
    if (!password || !name || !desc) return alert("Fill all fields");

    setLoading(true);
    try {
      const res = await fetch("/api/clans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, name, description: desc }),
      });
      if (!res.ok) throw new Error("Failed to add clan");

      setName("");
      setDesc("");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to add clan");
    } finally {
      setLoading(false);
    }
  };

  // Delete clan
  const deleteClan = async (id) => {
    if (!password) return alert("Enter admin password");

    try {
      const res = await fetch("/api/clans", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, id }),
      });
      if (!res.ok) throw new Error("Failed to delete clan");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete clan");
    }
  };

  // Approve/Reject request
  const handleRequest = async (id, action) => {
    if (!password) return alert("Enter admin password");

    try {
      const res = await fetch("/api/request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, id, action }),
      });
      if (!res.ok) throw new Error("Failed to update request");

      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to update request");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>

      <input
        type="password"
        placeholder="Admin password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 mb-6 rounded w-full md:w-1/3"
      />

      {/* Add Clan */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Add Clan</h2>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            placeholder="Clan Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <input
            placeholder="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <button
            onClick={addClan}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </section>

      {/* Existing Clans */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Existing Clans</h2>
        {clans.length === 0 ? (
          <p>No clans yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clans.map((c) => (
              <div
                key={c.id}
                className="bg-white p-4 rounded shadow flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold">{c.name}</h3>
                  <p>{c.description}</p>
                </div>
                <button
                  onClick={() => deleteClan(c.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
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
        <h2 className="text-2xl font-semibold mb-4">Pending Requests</h2>
        {requests.filter((r) => r.status === "pending").length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests
              .filter((r) => r.status === "pending")
              .map((r) => (
                <div
                  key={r.id}
                  className="bg-white p-4 rounded shadow flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold">{r.clanName}</h3>
                    <p>{r.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRequest(r.id, "approve")}
                      className="bg-green-600 text-white px-2 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRequest(r.id, "reject")}
                      className="bg-gray-400 text-white px-2 py-1 rounded"
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
