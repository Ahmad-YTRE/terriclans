import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data/clans.json");

export default function handler(req, res) {
  const data = JSON.parse(fs.readFileSync(filePath));

  if (req.method === "GET") return res.status(200).json(data);

  if (req.method === "POST") {
    const { password, name, description } = req.body;
    if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: "Unauthorized" });

    data.push({ id: Date.now(), name, description });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return res.status(200).json({ success: true });
  }

  if (req.method === "DELETE") {
    const { password, id } = req.body;
    if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: "Unauthorized" });

    const updated = data.filter(c => c.id !== id);
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
