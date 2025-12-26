import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data/clans.json");

// Ensure JSON file exists
if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]");

export default async function handler(req, res) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath));

    if (req.method === "GET") {
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const { password, name, description } = req.body;
      if (password !== process.env.ADMIN_PASSWORD)
        return res.status(401).json({ error: "Unauthorized" });
      if (!name || !description)
        return res.status(400).json({ error: "Missing fields" });

      const newClan = { id: Date.now(), name, description };
      data.push(newClan);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return res.status(200).json({ success: true, clan: newClan });
    }

    if (req.method === "DELETE") {
      const { password, id } = req.body;
      if (password !== process.env.ADMIN_PASSWORD)
        return res.status(401).json({ error: "Unauthorized" });

      const filtered = data.filter((c) => c.id !== id);
      fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2));
      return res.status(200).json({ success: true });
    }

    // Method not allowed
    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
