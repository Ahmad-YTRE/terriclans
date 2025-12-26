import { useEffect, useState } from "react";

export default function Home() {
  const [clans, setClans] = useState([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all clans from API
  const fetchClans = async () => {
    try {
      const res = await fetch("/api/clans");
      if (!res.ok) throw new Error("Failed to fetch clans");
      const data = await res.json();
      setClans(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClans();
  }, []);

  // Send a clan request
  const sendRequest = async () => {
    if (!name || !desc) return alert("Please fill all fields");

    setLoading(true);
    try {
      const res = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clanName: name, description: desc }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      alert("Request sent successfully!");
      setName("");
      setDesc("");
    } catch (err) {
      console.error(err);
      alert("Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Clans</h1>

      {clans.length === 0 ? (
        <p className="text-center text-gray-500 mb-8">No clans yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {clans.map((c) => (
            <div
              key={c.id}
              className="bg-white p-4 rounded shadow hover:shadow-lg transition"
            >
              <h3 className="font-bold text-lg">{c.name}</h3>
              <p className="text-gray-700">{c.description}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-4">Request a Clan</h2>
      <div className="flex flex-col md:flex-row gap-2">
        <input
          type="text"
          placeholder="Clan name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <input
          type="text"
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={sendRequest}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

      </div>
    </div>
  );
}
