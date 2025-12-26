import { useEffect, useState } from "react";

export default function Home() {
  const [clans, setClans] = useState([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    fetch("/api/clans").then(res => res.json()).then(setClans);
  }, []);

  const sendRequest = async () => {
    if (!name || !desc) return alert("Fill all fields");
    await fetch("/api/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clanName: name, description: desc }),
    });
    alert("Request sent!");
    setName(""); setDesc("");
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Clans</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {clans.map(c => (
          <div key={c.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold text-lg">{c.name}</h3>
            <p>{c.description}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold mb-2">Request a Clan</h2>
      <div className="flex flex-col md:flex-row gap-2">
        <input
          className="border p-2 rounded flex-1"
          placeholder="Clan name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          className="border p-2 rounded flex-1"
          placeholder="Description"
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />
        <button onClick={sendRequest} className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
      </div>
    </div>
  );
}