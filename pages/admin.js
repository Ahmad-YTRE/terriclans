import { useEffect, useState } from "react";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [clans, setClans] = useState([]);
  const [requests, setRequests] = useState([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const fetchData = () => {
    fetch("/api/clans").then(res => res.json()).then(setClans);
    fetch("/api/request").then(res => res.json()).then(setRequests);
  };

  useEffect(fetchData, []);

  const addClan = async () => {
    if (!password || !name || !desc) return alert("Fill all fields");
    await fetch("/api/clans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, name, description: desc }),
    });
    setName(""); setDesc(""); fetchData();
  };

  const deleteClan = async (id) => {
    await fetch("/api/clans", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, id }),
    });
    fetchData();
  };

  const handleRequest = async (id, action) => {
    await fetch("/api/request", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, id, action }),
    });
    if (action === "approve") {
      const reqItem = requests.find(r => r.id === id);
      await fetch("/api/clans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, name: reqItem.clanName, description: reqItem.description }),
      });
    }
    fetchData();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      <input
        type="password"
        placeholder="Admin password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="border p-2 mb-4 rounded w-full md:w-1/3"
      />

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Add Clan</h2>
        <div className="flex flex-col md:flex-row gap-2 mb-2">
          <input
            placeholder="Clan Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <input
            placeholder="Description"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <button onClick={addClan} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Existing Clans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clans.map(c => (
            <div key={c.id} className="border p-4 rounded shadow bg-white flex justify-between items-center">
              <div>
                <h3 className="font-bold">{c.name}</h3>
                <p>{c.description}</p>
              </div>
              <button onClick={() => deleteClan(c.id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Pending Requests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.filter(r => r.status === "pending").map(r => (
            <div key={r.id} className="border p-4 rounded shadow bg-white flex justify-between items-center">
              <div>
                <h3 className="font-bold">{r.clanName}</h3>
                <p>{r.description}</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleRequest(r.id, "approve")} className="bg-green-600 text-white px-2 py-1 rounded">Approve</button>
                <button onClick={() => handleRequest(r.id, "reject")} className="bg-gray-400 text-white px-2 py-1 rounded">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
